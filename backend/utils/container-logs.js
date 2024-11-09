import { PrismaClient } from "@prisma/client";
import { sendMessage } from "./socket-service.js";
import Docker from "dockerode";

const prisma = new PrismaClient();
const docker = new Docker();

const logContainerData = async (containerId, projectId) => {
    const container = docker.getContainer(containerId);
    container.logs(
        { stdout: true, stderr: true, follow: true },
        function (err, stream) {
            stream.on("data", (data) => {
                sendMessage(projectId, "log", data.toString());
            });
            stream.on("error", (e) => {
                console.error(e);
            });
            stream.on("end", () => {
                console.log("Process Ended");
            });
        },
    );
};

const logAllContainers = async () => {
    const projects = await prisma.project.findMany({
        where: {
            containerId: {
                not: null,
            },
        },
        select: {
            id: true,
            containerId: true,
        },
    });
    projects.map((project) =>
        logContainerData(project.containerId, project.id),
    );
};

export { logContainerData, logAllContainers };
