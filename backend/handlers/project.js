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
    if (!name || !githubUrl || !framework) {
        return res.status(400).json({
            success: false,
            message: "Name, Github URL and Framework are required",
            data: null,
        });
    }
    if (!frameworks.includes(framework)) {
        return res.status(400).json({
            success: false,
            message: "Framework not accepted",
            data: null,
        });
    }
    const processedEnvSecrets = envSecrets.map((secret) => {
        if (
            secret == undefined ||
            secret.key == undefined ||
            secret.value == undefined
        ) {
            return;
        }
        return { key: secret.key, value: secret.value };
    });
    const webhookRequest = await createWebhook(
        req.user.ghAccessToken,
        githubUrl,
    );
    if (!webhookRequest) {
        return res.status(400).json({
            success: false,
            message: "GitHub Repo is invalid or cannot be accessed",
            data: null,
        });
    }
    console.log(webhookRequest.status);
    console.log(webhookRequest.data);
    console.log(webhookRequest.headers);
    const webhookId = webhookRequest.data.id;
    if (webhookRequest.status >= 400) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            data: null,
        });
    }
    var project;
    try {
        project = await prisma.project.create({
            data: {
                name,
                description,
                framework,
                envSecrets: {
                    create: processedEnvSecrets,
                },
                framework,
                githubUrl,
                webhookId,
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
