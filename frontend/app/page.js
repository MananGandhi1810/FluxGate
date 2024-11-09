"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PlusCircle, Box, Moon, Sun, X, Upload, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import axios from "axios";

export default function Dashboard() {
    const router = useRouter();
    const [projects, setProjects] = useState([]);
    const [darkMode, setDarkMode] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        githubUrl: "",
        framework: "Node",
        envSecrets: [{ key: "", value: "" }],
        envFile: "",
    });

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

    useEffect(() => {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            router.push("/login");
            return;
        }

        const fetchProjects = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:3000/project",
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    },
                );
                setProjects(response.data.data.projects);
                console.log(response.data.data.projects);
            } catch (error) {
                console.error("Failed to fetch projects:", error);
                toast({
                    title: "Error",
                    description: "Failed to fetch projects. Please try again.",
                    variant: "destructive",
                });
            }
        };

        fetchProjects();
    }, [router]);

    useEffect(() => {
        document.documentElement.classList.toggle("dark", darkMode);
    }, [darkMode]);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleEnvSecretChange = (index, field, value) => {
        const updatedSecrets = [...formData.envSecrets];
        updatedSecrets[index][field] = value;
        setFormData({ ...formData, envSecrets: updatedSecrets });
    };

    const addEnvSecret = () => {
        setFormData({
            ...formData,
            envSecrets: [...formData.envSecrets, { key: "", value: "" }],
        });
    };

    const removeEnvSecret = (index) => {
        const updatedSecrets = formData.envSecrets.filter(
            (_, i) => i !== index,
        );
        setFormData({ ...formData, envSecrets: updatedSecrets });
    };

    const handleEnvFileChange = (e) => {
        setFormData({
            ...formData,
            envFile: e.target.value,
        });
    };

    const parseEnvFile = () => {
        const lines = formData.envFile.split("\n");
        const parsedSecrets = lines
            .filter((line) => line.trim() !== "" && !line.startsWith("#"))
            .map((line) => {
                const [key, value] = line.split("=").map((part) => part.trim());
                return { key, value };
            });
        setFormData({
            ...formData,
            envSecrets: parsedSecrets,
            envFile: "",
        });
    };

    const handleCreateProject = async () => {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) return router.push("/login");

        try {
            const response = await axios.post(
                "http://localhost:3000/project/new",
                {
                    ...formData,
                    envSecrets: Object.fromEntries(
                        formData.envSecrets.map(({ key, value }) => [
                            key,
                            value,
                        ]),
                    ),
                },
                { headers: { Authorization: `Bearer ${accessToken}` } },
            );
            setProjects([...projects, response.data.project]);
            setFormData({
                name: "",
                description: "",
                githubUrl: "",
                framework: "Node",
                envSecrets: [{ key: "", value: "" }],
                envFile: "",
            });
            toast({
                title: "Success",
                description: "Project created successfully!",
            });
        } catch (error) {
            console.error("Failed to create new project:", error);
            toast({
                title: "Error",
                description: "Failed to create project. Please try again.",
                variant: "destructive",
            });
        }
    };

    const toggleDarkMode = () => setDarkMode(!darkMode);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
            <div className="container mx-auto p-4">
                <header className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">My Dashboard</h1>
                    <div className="flex gap-2">
                        <Link href="/chat">
                            <Button className="gap-2">
                                <Bot className="w-4 h-4" />
                                Chat and Deploy
                            </Button>
                        </Link>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <PlusCircle className="w-4 h-4" />
                                    Create New Project
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px]">
                                <DialogHeader>
                                    <DialogTitle>
                                        Create New Project
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label
                                            htmlFor="name"
                                            className="text-right"
                                        >
                                            Name
                                        </Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label
                                            htmlFor="description"
                                            className="text-right"
                                        >
                                            Description
                                        </Label>
                                        <Textarea
                                            id="description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label
                                            htmlFor="githubUrl"
                                            className="text-right"
                                        >
                                            GitHub URL
                                        </Label>
                                        <Input
                                            id="githubUrl"
                                            name="githubUrl"
                                            value={formData.githubUrl}
                                            onChange={handleInputChange}
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label
                                            htmlFor="framework"
                                            className="text-right"
                                        >
                                            Framework
                                        </Label>
                                        <Select
                                            name="framework"
                                            value={formData.framework}
                                            onValueChange={(value) =>
                                                setFormData({
                                                    ...formData,
                                                    framework: value,
                                                })
                                            }
                                        >
                                            <SelectTrigger className="col-span-3">
                                                <SelectValue placeholder="Select a framework" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {frameworks.map((fw) => (
                                                    <SelectItem
                                                        key={fw}
                                                        value={fw}
                                                    >
                                                        {fw}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-4 items-start gap-4">
                                        <Label className="text-right mt-2">
                                            Env Secrets
                                        </Label>
                                        <div className="col-span-3">
                                            <Tabs
                                                defaultValue="manual"
                                                className="w-full"
                                            >
                                                <TabsList className="grid w-full grid-cols-2">
                                                    <TabsTrigger value="manual">
                                                        Manual Entry
                                                    </TabsTrigger>
                                                    <TabsTrigger value="file">
                                                        Paste .env File
                                                    </TabsTrigger>
                                                </TabsList>
                                                <TabsContent value="manual">
                                                    <div className="space-y-2">
                                                        {formData.envSecrets.map(
                                                            (secret, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="flex gap-2"
                                                                >
                                                                    <Input
                                                                        placeholder="Key"
                                                                        value={
                                                                            secret.key
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            handleEnvSecretChange(
                                                                                index,
                                                                                "key",
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                    />
                                                                    <Input
                                                                        placeholder="Value"
                                                                        value={
                                                                            secret.value
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            handleEnvSecretChange(
                                                                                index,
                                                                                "value",
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                    />
                                                                    <Button
                                                                        variant="outline"
                                                                        size="icon"
                                                                        onClick={() =>
                                                                            removeEnvSecret(
                                                                                index,
                                                                            )
                                                                        }
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            ),
                                                        )}
                                                        <Button
                                                            variant="outline"
                                                            onClick={
                                                                addEnvSecret
                                                            }
                                                            className="w-full"
                                                        >
                                                            Add Secret
                                                        </Button>
                                                    </div>
                                                </TabsContent>
                                                <TabsContent value="file">
                                                    <div className="space-y-2">
                                                        <Textarea
                                                            placeholder="Paste your .env file content here"
                                                            value={
                                                                formData.envFile
                                                            }
                                                            onChange={
                                                                handleEnvFileChange
                                                            }
                                                            className="min-h-[200px]"
                                                        />
                                                        <Button
                                                            onClick={
                                                                parseEnvFile
                                                            }
                                                            className="w-full"
                                                        >
                                                            <Upload className="w-4 h-4 mr-2" />
                                                            Parse .env File
                                                        </Button>
                                                    </div>
                                                </TabsContent>
                                            </Tabs>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    onClick={handleCreateProject}
                                    className="w-full"
                                >
                                    Create Project
                                </Button>
                            </DialogContent>
                        </Dialog>
                        <Button
                            onClick={toggleDarkMode}
                            variant="outline"
                            size="icon"
                        >
                            {darkMode ? (
                                <Sun className="h-[1.2rem] w-[1.2rem]" />
                            ) : (
                                <Moon className="h-[1.2rem] w-[1.2rem]" />
                            )}
                        </Button>
                    </div>
                </header>

                {projects.length === 0 ? (
                    <div className="text-center text-gray-600 dark:text-gray-400">
                        <p>No projects available. Create one to get started!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {projects.map((project) => (
                            <Card
                                key={project.id}
                                className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                            >
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Box className="w-5 h-5" />
                                        {project.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {project.description ||
                                            "No description provided"}
                                    </p>
                                </CardContent>
                                <CardFooter>
                                    <Link
                                        href={`/projects/${project.id}`}
                                        passHref
                                    >
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                        >
                                            View Details
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
