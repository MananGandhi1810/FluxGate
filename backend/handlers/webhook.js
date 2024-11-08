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

    // Check if branch name matches
    if (req.body.ref.split("/").pop() !== project.branchName) {
        return res.json({
            success: true,
            message: "Webhook received",
            data: null,
        });
    }

    // Check if commit exists
    if (!req.body.commits || req.body.commits.length === 0) {
        return res.json({
            success: true,
            message: "Webhook received",
            data: null,
        });
    }

    // Check if changes are in the base directory
    const changes = req.body.commits
        .map((commit) => commit.added.concat(commit.modified, commit.removed))
        .flat();
    if (!changes.some((change) => change.startsWith(project.baseDirectory))) {
        console.log("Changes", changes);
        return res.json({
            success: true,
            message: "Webhook received",
            data: null,
        });
    }

    // Build the project: Manan TODO - Use Redis Queue to asynchronously build the project?
    console.log("Incoming Webhook for Project", projectId);
    console.log("Changes:", changes);
    console.log("Branch:", req.body.ref.split("/").pop());

    return res.json({
        success: true,
        message: "Webhook received",
        data: null,
    });
};

export { incomingWebhookHandler };