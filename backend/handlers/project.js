import { PrismaClient } from "@prisma/client";
import { createWebhook } from "../utils/github-api.js";
import { chatWithAgent } from "../utils/llm-agent.js";
import removeMd from "remove-markdown";
import Docker from "dockerode";

const prisma = new PrismaClient();
const docker = new Docker();

const frameworks = [
    "Node",
    "React",
    "Express",
    "Next",
    "Flask",
    "Django",
    "Docker",
    "Other",
];

const newProjectHandler = async (req, res) => {
    const { name, description, githubUrl, envSecrets, framework } = req.body;

    // Check if required fields are present
    if (!name || !githubUrl || !framework) {
        return res.status(400).json({
            success: false,
            message: "Name, Github URL and Framework are required",
            data: null,
        });
    }

    // Check if framework is valid
    if (!frameworks.includes(framework)) {
        return res.status(400).json({
            success: false,
            message: "Framework not accepted",
            data: null,
        });
    }

    // Process env secrets if present
    let processedEnvSecrets;
    if (envSecrets && Array.isArray(envSecrets)) {
        processedEnvSecrets = envSecrets.map((secret) => {
            if (
                secret == undefined ||
                secret.key == undefined ||
                secret.value == undefined ||
                secret.key.trim() == "" ||
                secret.value.trim() == ""
            ) {
                return;
            }
            return { key: secret.key, value: secret.value };
        });
    } else {
        processedEnvSecrets = [];
    }
    processedEnvSecrets =
        processedEnvSecrets == undefined ? [] : processedEnvSecrets;

    // Generate a unique project id
    let id;
    do {
        id = Math.floor(Math.random() * 1000000).toString();
    } while (
        await prisma.project.findUnique({
            where: {
                id,
            },
        })
    );

    // Create a webhook for the repo
    const webhookRequest = await createWebhook(
        id,
        req.user.ghAccessToken,
        githubUrl,
    );
    console.log(webhookRequest.data);

    // Check if webhook creation was successful
    if (!webhookRequest || webhookRequest.data.id == undefined) {
        return res.status(400).json({
            success: false,
            message: "GitHub Repo is invalid or cannot be accessed",
            data: null,
        });
    }

    // Create the project
    var project;
    try {
        project = await prisma.project.create({
            data: {
                id,
                name,
                description,
                framework,
                githubUrl,
                webhookId: webhookRequest.data.id.toString(),
                userId: req.user.id,
                envSecrets: {
                    create: processedEnvSecrets,
                },
            },
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            success: false,
            message: "Project could not be created",
            data: null,
        });
    }
    return res.json({
        success: true,
        message: "Project created succesfully",
        data: {
            project,
        },
    });
};

const newProjectWithChatHandler = async (req, res) => {
    const { prompt, history } = req.body;
    if (!prompt) {
        return res.status(400).json({
            success: false,
            message: "Prompt is required",
            data: null,
        });
    }
    const processedHistory = history.map((message) => {
        return { role: message.role, parts: message.parts };
    });
    const result = await chatWithAgent(
        req.user.ghAccessToken,
        prompt,
        processedHistory,
    );
    console.log(result.response.text());
    if (!result) {
        return res.status(500).json({
            success: false,
            message: "An error occurred",
            data: null,
        });
    }
    var aiResponse;
    try {
        aiResponse = JSON.parse(removeMd(result.response.text()));
    } catch (e) {
        res.status(500).json({
            success: false,
            message: "An error occurred",
            data: null,
        });
    }
    var projectCreated = false;
    if (aiResponse.systemInfo != null) {
        var project;
        let id;
        do {
            id = Math.floor(Math.random() * 1000000).toString();
        } while (
            await prisma.project.findUnique({
                where: {
                    id,
                },
            })
        );
        const webhookRequest = await createWebhook(
            id,
            req.user.ghAccessToken,
            aiResponse.systemInfo.githubUrl,
        );
        if (!webhookRequest || webhookRequest.data.id == undefined) {
            return res.status(400).json({
                success: false,
                message: "GitHub Repo is invalid or cannot be accessed",
                data: null,
            });
        }
        try {
            project = await prisma.project.create({
                data: {
                    id,
                    name: aiResponse.systemInfo.name,
                    description: aiResponse.systemInfo.description,
                    framework: aiResponse.systemInfo.framework,
                    githubUrl: aiResponse.systemInfo.githubUrl,
                    baseDirectory: aiResponse.systemInfo.baseDirectory,
                    webhookId: webhookRequest.data.id.toString(),
                    userId: req.user.id,
                },
            });
            projectCreated = true;
        } catch (e) {
            console.log(e);
            return res.status(500).json({
                success: false,
                message: "Project could not be created",
                data: null,
            });
        }
    }
    return res.json({
        success: true,
        message: "Chat response received",
        data: {
            projectCreated,
            response: aiResponse.userReply,
        },
    });
};

const getAllProjectsHandler = async (req, res) => {
    const projects = await prisma.project.findMany({
        where: {
            userId: req.user.id,
        },
    });
    res.json({
        success: true,
        message: "Projects fetched succesfully",
        data: {
            projects,
        },
    });
};

const getProjectByIdHandler = async (req, res) => {
    const { projectId } = req.params;
    if (!projectId) {
        return res.status(400).json({
            success: false,
            message: "Project Id is required",
            data: null,
        });
    }
    const project = await prisma.project.findUnique({
        where: {
            id: projectId,
            userId: req.user.id,
        },
        include: {
            envSecrets: true,
        },
    });
    if (!project) {
        return res.status(404).json({
            success: false,
            message: "This project does not exist",
            data: null,
        });
    }
    res.json({
        success: true,
        message: "Project found",
        data: { project },
    });
};

const startProjectHandler = async (req, res) => {
    const { projectId } = req.params;
    if (!projectId) {
        return res.status(400).json({
            success: false,
            message: "Project Id is required",
            data: null,
        });
    }
    const project = await prisma.project.findUnique({
        where: {
            id: projectId,
        },
        select: {
            containerId: true,
        },
    });
    if (!project) {
        return res.status(404).json({
            success: false,
            message: "Project not found",
            data: null,
        });
    }
    try {
        const container = docker.getContainer(project.containerId);
        const containerState = (await container.inspect()).State.Status;
        if (containerState == "running") {
            await container.start();
        }
    } catch (e) {
        return res.status(500).json({
            success: false,
            message: "Could not start project",
            data: null,
        });
    }
    res.json({
        success: true,
        message: "Project started succesfully",
        data: null,
    });
};

const stopProjectHandler = async (req, res) => {
    const { projectId } = req.params;
    if (!projectId) {
        return res.status(400).json({
            success: false,
            message: "Project Id is required",
            data: null,
        });
    }
    const project = await prisma.project.findUnique({
        where: {
            id: projectId,
        },
        select: {
            containerId: true,
        },
    });
    if (!project) {
        return res.status(404).json({
            success: false,
            message: "Project not found",
            data: null,
        });
    }
    try {
        const container = docker.getContainer(project.containerId);
        const containerState = (await container.inspect()).State.Status;
        if (containerState == "running") {
            await container.kill();
        }
    } catch (e) {
        return res.status(500).json({
            success: false,
            message: "Could not stop project",
            data: null,
        });
    }
    res.json({
        success: true,
        message: "Project stopped succesfully",
        data: null,
    });
};

const getProjectStatusHandler = async (req, res) => {
    const { projectId } = req.params;
    if (!projectId) {
        return res.status(400).json({
            success: false,
            message: "Project Id is required",
            data: null,
        });
    }
    const project = await prisma.project.findUnique({
        where: {
            id: projectId,
        },
        select: {
            containerId: true,
        },
    });
    if (!project) {
        return res.status(404).json({
            success: false,
            message: "Project not found",
            data: null,
        });
    }
    var container;
    try {
        container = docker.getContainer(project.containerId);
    } catch (e) {
        return res.status(500).json({
            success: false,
            message: "Could not get project status",
            data: null,
        });
    }
    var containerStatus;
    try {
        containerStatus = (await container.inspect()).State.Status;
        await prisma.project.update({
            where: { id: projectId },
            data: { status: containerStatus },
        });
    } catch (e) {
        return res.status(500).json({
            success: false,
            message: "Could not fetch status",
            data: null,
        });
    }
    res.json({
        success: true,
        message: "Project status fetched succesfully",
        data: {
            status: containerStatus,
        },
    });
};

const getContainerPortHandler = async (req, res) => {
    const { projectId } = req.params;

    if (!projectId) {
        return res.status(400).json({
            success: false,
            message: "Project Id is required",
            data: null,
        });
    }

    const project = await prisma.project.findUnique({
        where: {
            id: projectId,
        },
        select: {
            containerId: true,
        },
    });

    if (!project) {
        return res.status(404).json({
            success: false,
            message: "Project not found",
            data: null,
        });
    }

    const containerPort = project.containerPort;

    res.json({
        success: true,
        message: "Container Port fetched succesfully",
        data: {
            port: containerPort,
        },
    });
};

export {
    newProjectHandler,
    newProjectWithChatHandler,
    getAllProjectsHandler,
    getProjectByIdHandler,
    startProjectHandler,
    stopProjectHandler,
    getProjectStatusHandler,
    getContainerPortHandler,
};
