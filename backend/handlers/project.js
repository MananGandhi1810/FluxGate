import { PrismaClient } from "@prisma/client";
// import { sendQueueMessage } from "../utils/queue-manager.js";
import { createWebhook } from "../utils/github-api.js";
import { chatWithAgent } from "../utils/llm-agent.js";

const prisma = new PrismaClient();

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
    if (envSecrets && !Array.isArray(envSecrets)) {
        processedEnvSecrets = envSecrets.map((secret) => {
            if (
                secret == undefined ||
                secret.key == undefined ||
                secret.value == undefined
            ) {
                return;
            }
            return { key: secret.key, value: secret.value };
        });
    } else {
        processedEnvSecrets = [];
    }

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
    const result = await chatWithAgent(req.user.ghAccessToken, prompt, history);
    console.log(result);
    if (!result) {
        return res.status(500).json({
            success: false,
            message: "An error occurred",
            data: null,
        });
    }
    console.log(result.response.text());
    return res.json({
        success: true,
        message: "Chat response received",
        data: {
            response: result.response.text(),
        },
    });
};

export { newProjectHandler, newProjectWithChatHandler };
