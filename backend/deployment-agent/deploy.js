import { PrismaClient } from "@prisma/client";
import Docker from "dockerode";
import path from "path";
import { logContainerData } from "../utils/container-logs.js";
import { sendMessage } from "../utils/socket-service.js";

const docker = new Docker();
const prisma = new PrismaClient();

const ghRepoRegex =
    /https?:\/\/(www\.)?github.com\/(?<owner>[\w.-]+)\/(?<name>[\w.-]+)/;

const buildContainer = async ({ projectId, branchName, commitHash }) => {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
            User: {
                select: {
                    ghAccessToken: true,
                },
            },
            envSecrets: true,
        },
    });
    const match = project.githubUrl.match(ghRepoRegex);
    if (!match || !(match.groups?.owner && match.groups?.name)) return null;
    const imageTag = `${match.groups.owner}/${match.groups.name}:latest`;
    const buildStream = await docker.buildImage(
        {
            context: path.join(
                process.cwd(),
                "dockerfiles",
                project.framework.toLowerCase(),
            ),
            src: ["Dockerfile"],
        },
        {
            buildargs: {
                repoUrl: `https://${project.User.ghAccessToken}@github.com/${match.groups.owner}/${match.groups.name}`,
                branch: branchName,
                commitHash: commitHash,
                dir: project.baseDirectory,
            },
            t: imageTag,
        },
    );
    try {
        await new Promise((resolve, reject) => {
            buildStream.on("data", (data) => {
                if (!data.toString().trim()) return;
                try {
                    const buildOutput = JSON.parse(data.toString());
                    if (buildOutput.stream) {
                        sendMessage(projectId, "build", data.toString());
                    } else if (buildOutput.error) {
                        console.error("Build Error:", buildOutput.error);
                        reject(buildOutput.error);
                    }
                } catch (e) {}
            });
            buildStream.on("end", () => resolve());
        });
    } catch (e) {
        await prisma.project.update({
            where: { id: projectId },
            data: {
                status: "error",
            },
        });
        return;
    }
    const envSecrets = project.envSecrets.map((v) => `${v.key}=${v.value}`);
    const container = await docker.createContainer({
        Image: imageTag,
        Tty: false,
        Env: envSecrets,
        HostConfig: {
            PortBindings: {
                "3000/tcp": [
                    {
                        HostPort: "0", //Map container to a random unused port.
                    },
                ],
            },
        },
    });
    container.start();
    logContainerData(container.id, project.id);
    const containerInspection = await container.inspect();
    var containerStatus = containerInspection.State.Status;
    const containerDetails = {
        containerId: containerInspection.Id,
        imageName: imageTag,
        deployCommit: commitHash,
        lastDeploy: new Date(),
        status: containerStatus,
    };
    const prevContainer = docker.getContainer(project.containerId);
    if (prevContainer) {
        try {
            await prevContainer.kill();
        } catch (e) {}
        try {
            await prevContainer.remove();
        } catch (e) {}
    }
    const projectState = await prisma.project.update({
        where: { id: projectId },
        data: containerDetails,
    });
};

export { buildContainer };
