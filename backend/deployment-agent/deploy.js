import { PrismaClient } from "@prisma/client";
import Dockerode from "dockerode";
import Docker from "dockerode";
import path from "path";

const docker = new Docker();
const dockerode = new Dockerode();
const prisma = new PrismaClient();

const ghRepoRegex =
    /https?:\/\/(www\.)?github.com\/(?<owner>[\w.-]+)\/(?<name>[\w.-]+)/;

const buildContainer = async ({
    projectId,
    branchName,
    commitHash,
    userId,
}) => {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
            User: {
                select: {
                    ghAccessToken: true,
                },
            },
        },
    });
    const match = project.githubUrl.match(ghRepoRegex);
    if (!match || !(match.groups?.owner && match.groups?.name)) return null;
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
            },
            t: `${match.groups.owner}/${match.groups.name}:latest`,
        },
    );
    await new Promise((resolve, reject) => {
        buildStream.on("data", (data) => {
            console.log(data.toString());
            // const buildOutput = JSON.parse(data.toString());
            // if (buildOutput.stream) {
            //     process.stdout.write(buildOutput.stream); // Feedback of the progress
            // } else if (buildOutput.error) {
            //     console.error("Build Error:", buildOutput.error); // feedback error
            //     reject(buildOutput.error);
            // } else if (buildOutput.end) {
            //     resolve();
            // }
        });
    });
    console.log("Image Built succesfully");
};

export { buildContainer };
