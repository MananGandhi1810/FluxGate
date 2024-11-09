"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PlusCircle, Box, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

// Mock data for apps
const initialApps = [
    { id: 1, name: "My Blog", domain: "myblog.com" },
    { id: 2, name: "E-commerce Site", domain: "myshop.com" },
    { id: 3, name: "Portfolio", domain: "myportfolio.com" },
];

export default function Homepage() {
    const [apps, setApps] = useState(initialApps);
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [darkMode]);

    const addNewApp = () => {
        const newApp = {
            id: apps.length + 1,
            name: `New App ${apps.length + 1}`,
            domain: `newapp${apps.length + 1}.com`,
        };
        setApps([...apps, newApp]);
    };

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
            <div className="container mx-auto p-4">
                <header className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">My Dashboard</h1>
                    <div className="flex gap-2">
                        <Button onClick={addNewApp} className="gap-2">
                            <PlusCircle className="w-4 h-4" />
                            Add New App
                        </Button>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {apps.map((app) => (
                        <Card
                            key={app.id}
                            className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                        >
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Box className="w-5 h-5" />
                                    {app.name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {app.domain}
                                </p>
                            </CardContent>
                            <CardFooter>
                                <Link href={`/app/${app.id}`} passHref>
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
            </div>
        </div>
    );
}
