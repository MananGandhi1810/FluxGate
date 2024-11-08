import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const incomingWebhookHandler = async (req, res) => {
    const { projectId } = req.params;
    const hook_id = req.headers["x-github-hook-id"];

    // Fetch project details
    const project = await prisma.project.findUnique({
        where: {
            id: projectId,
        },
    });

    // Check if project exists
    if (!project) {
        return res.status(404).json({
            success: false,
            message: "Project not found",
            data: null,
        });
    }

    // Check if webhook is valid
    if (project.webhookId !== hook_id) {
        return res.status(400).json({
            success: false,
            message: "Invalid webhook",
            data: null,
        });
    }

    // First time webhook which is received on hook registration has a different format
    if (req.body.hook_id !== undefined) {
        console.log("Hook Registration Successful for project", projectId);

        return res.json({
            success: true,
            message: "Hook Registration Successful",
            data: null,
        });
    }

    // Logic to build container: TODO
    
    const commitId = req.body.head_commit.id
    const commitMessage = req.body.head_commit.message
    const committer = req.body.head_commit.committer.name

    console.log("Incoming Webhook for project", projectId);
    console.log("Commit Details");
    console.log("Commit ID", commitId);
    console.log("Commit Message", commitMessage);
    console.log("Committer", committer);

    return res.json({
        success: true,
        message: "Webhook received",
        data: null,
    });
};

export { incomingWebhookHandler };