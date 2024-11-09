"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
    ArrowLeft,
    Github,
    Globe,
    Clock,
    GitBranch,
    Package,
    Server,
    Key,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useParams } from "next/navigation";
import ObscureText from "@/components/custom/ObscureText";

const authToken = localStorage.getItem("accessToken");

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

        if (response.data.success) {
            return response.data.data.project;
        } else {
            throw new Error(
                response.data.message || "Failed to fetch project data",
            );
        }
    } catch (error) {
        console.error("Error fetching project data:", error);
        throw error;
    }
};

// Main ProjectDetails component
export default function ProjectDetails() {
    const params = useParams();
    const projectId = params.id;
    const [projectData, setProjectData] = useState();

    useEffect(() => {
        if (projectId) {
            fetchProjectData(projectId)
                .then((data) => setProjectData(data))
                .catch((error) =>
                    console.error("Error fetching project data:", error),
                );
        }
    }, []);

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
        setTimeout(() => pollForProjectStatus(projectId), 5000);
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
                        projectData.status == "running"
                            ? "bg-green-400"
                            : "bg-red-400"
                    }`}
                >
                    Status: {projectData.status.toLocaleString()}
                </Badge>
            </div>

            <div className="space-y-2">
                <h1 className="text-3xl font-bold">{projectData.name}</h1>
                <p className="text-lg text-muted-foreground">
                    {projectData.description}
                </p>
            </div>

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
                            className="text-blue-500 hover:underline overflow-ellipsis"
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

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        Deployment Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p>
                        <strong>Image Name:</strong> {projectData.imageName}
                    </p>
                    <p>
                        <strong>Deploy Commit:</strong>{" "}
                        {projectData.deployCommit}
                    </p>
                    <p>
                        <strong>Domain Name:</strong>{" "}
                        {projectData.domainName || "Not set"}
                    </p>
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
                    {projectData.envSecrets.length > 0 ? (
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
        </div>
    );
}
