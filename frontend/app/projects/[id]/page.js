"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Pusher from "pusher-js";
import {
    ArrowLeft,
    Github,
    Clock,
    GitBranch,
    Package,
    Server,
    Key,
    Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useParams } from "next/navigation";
import stripAnsi from "strip-ansi";
import ObscureText from "@/components/custom/ObscureText";

const authToken =
    typeof window !== "undefined" && localStorage.getItem("accessToken");

// Fetch project data function
const fetchProjectData = async (projectId) => {
    try {
        const response = await axios.get(
            `http://localhost:3000/project/${projectId}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
                validateStatus: false,
            },
        );
        return response.data.success ? response.data.data.project : null;
    } catch (error) {
        console.error("Error fetching project data:", error);
    }
};

// Main ProjectDetails component
export default function ProjectDetails() {
    const params = useParams();
    const projectId = params.id;
    const [projectData, setProjectData] = useState();
    const [buildLogs, setBuildLogs] = useState([]);
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        if (projectId) {
            fetchProjectData(projectId)
                .then((data) => setProjectData(data))
                .catch((error) =>
                    console.error("Error fetching project data:", error),
                );
        }
    }, [projectId]);

    useEffect(() => {
        pollForProjectStatus(projectId);
    }, []);

    const pollForProjectStatus = async (projectId) => {
        const result = await axios.get(
            `http://localhost:3000/project/${projectId}/status`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
                validateStatus: false,
            },
        );
        if (result.data.success) {
            setProjectData((prev) => {
                return { ...prev, status: result.data.data.status };
            });
        }
        setTimeout(() => pollForProjectStatus(projectId), 3000);
    };

    useEffect(() => {
        const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
            cluster: "ap2",
        });

        const channel = pusher.subscribe(projectId);

        channel.bind("build", (data) => {
            console.log(data);
            setBuildLogs((prevLogs) => [
                ...prevLogs,
                data.message.replace(
                    /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
                    "",
                ),
            ]);
        });

        channel.bind("log", (data) => {
            console.log(data);
            setLogs((prevLogs) => [
                ...prevLogs,
                data.message.replace(
                    /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
                    "",
                ),
            ]);
        });
    }, []);

    // Start and Stop project handlers
    const handleStartProject = async () => {
        try {
            await axios.post(
                `http://localhost:3000/project/${projectId}/start`,
                {},
                {
                    headers: { Authorization: `Bearer ${authToken}` },
                    validateStatus: false,
                },
            );
        } catch (error) {
            console.error("Error starting project:", error);
        }
    };

    const handleStopProject = async () => {
        try {
            await axios.post(
                `http://localhost:3000/project/${projectId}/stop`,
                {},
                {
                    headers: { Authorization: `Bearer ${authToken}` },
                },
            );
        } catch (error) {
            console.error("Error stopping project:", error);
        }
    };

    if (!projectData) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-lg">Loading project details...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 space-y-6">
            <div className="flex justify-between items-center">
                <Link href="/" passHref>
                    <Button variant="ghost" className="mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Button>
                </Link>
                <Badge
                    variant="outline"
                    className={`text-sm capitalize ${
                        projectData.status === "running"
                            ? "bg-green-400"
                            : "bg-red-400"
                    }`}
                >
                    Status: {projectData.status}
                </Badge>
            </div>

            <div className="flex space-x-4">
                <Button
                    onClick={handleStartProject}
                    className="bg-green-500 text-white"
                >
                    <Play className="w-4 h-4 mr-2" /> Start Project
                </Button>
                <Button
                    onClick={handleStopProject}
                    className="bg-red-500 text-white"
                >
                    Stop Project
                </Button>
            </div>

            <div className="space-y-2 mt-4">
                <h1 className="text-3xl font-bold">{projectData.name}</h1>
                <p className="text-lg text-muted-foreground">
                    {projectData.description}
                </p>
                <a
                    href={`http://localhost:${projectData.containerPort}/`}
                    className="text-blue-500 flex flex-row"
                >
                    localhost:{projectData.containerPort}{" "}
                </a>
            </div>

            {/* Project Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Github className="w-5 h-5" />
                            Repository
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <a
                            href={projectData.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                        >
                            {projectData.githubUrl}
                        </a>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="w-5 h-5" />
                            Framework
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{projectData.framework}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <GitBranch className="w-5 h-5" />
                            Branch
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{projectData.branchName}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            Created At
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>
                            {new Date(projectData.createdAt).toLocaleString()}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            Last Deployed
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>
                            {new Date(projectData.lastDeploy).toLocaleString()}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Server className="w-5 h-5" />
                            Container ID
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm break-all">
                            {projectData.containerId}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle> Logs</CardTitle>
                </CardHeader>
                <CardContent className="h-64 overflow-y-scroll">
                    {logs.length > 0 ? (
                        logs.map((log, index) => (
                            <div key={index} className="text-sm text-gray-700">
                                {log}
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500">
                            No logs available.
                        </p>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Key className="w-5 h-5" />
                        Environment Variables
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {projectData &&
                    projectData.envSecrets &&
                    projectData.envSecrets.length > 0 ? (
                        <ul className="list-disc list-inside">
                            {projectData.envSecrets.map((secret, index) => (
                                <li key={index}>
                                    {secret.key}:{" "}
                                    <span>
                                        <ObscureText text={secret.value} />
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No environment variables set</p>
                    )}
                </CardContent>
            </Card>
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Build Logs</CardTitle>
                </CardHeader>
                <CardContent className="h-64 overflow-y-scroll">
                    {buildLogs.length > 0 ? (
                        buildLogs.map((log, index) => (
                            <div key={index} className="text-sm text-blue-500">
                                {stripAnsi(log)}
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500">
                            No build logs available.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
