"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send } from "lucide-react";
import axios from "axios";
import { redirect } from "next/navigation";

export default function DeployChatbot() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        const accessToken = localStorage.getItem("accessToken");

        e.preventDefault();
        if (loading) return;
        const message = input;
        setMessages((prev) => [
            ...prev,
            {
                id: new Date().toISOString(),
                role: "user",
                parts: [
                    {
                        text: input,
                    },
                ],
            },
        ]);
        setInput("");
        setLoading(true);
        try {
            const response = await axios.post(
                "http://localhost:3000/project/newWithChat",
                {
                    prompt: message,
                    history: [...messages.slice(0, -1)],
                },
                {
                    headers: {
                        authorization: `Bearer ${accessToken}`,
                    },
                    validateStatus: false,
                },
            );
            console.log(response.data);
            if (response.data.data.projectCreated) {
                setTimeout(() => {
                    redirect("/");
                }, 3000);
            }
            setMessages((prev) => [
                ...prev,
                {
                    id: new Date().toISOString(),
                    role: "model",
                    parts: [
                        {
                            text: response.data.data.response,
                        },
                    ],
                },
            ]);
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="flex flex-col h-screen bg-background">
            <Card className="flex-grow flex flex-col h-full rounded-none border-x-0 border-t-0">
                <CardHeader className="border-b">
                    <CardTitle>Deploy Chatbot</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow overflow-hidden p-0">
                    {messages.length > 0 ? (
                        <ScrollArea className="h-full p-4">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`mb-4 p-3 rounded-lg ${
                                        message.role === "user"
                                            ? "bg-primary text-primary-foreground ml-auto max-w-[80%] w-auto"
                                            : "bg-muted max-w-[80%] w-auto"
                                    }`}
                                >
                                    <p className="text-sm">
                                        {message.parts[0].text}
                                    </p>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </ScrollArea>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center gap-2">
                            Chat with AI and deploy your project
                        </div>
                    )}
                </CardContent>
                <CardFooter className="border-t p-4">
                    <form
                        onSubmit={handleSubmit}
                        className="flex w-full space-x-2"
                    >
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message here..."
                            className="flex-grow"
                        />
                        <Button type="submit" size="icon">
                            <Send className="h-4 w-4" />
                            <span className="sr-only">Send message</span>
                        </Button>
                    </form>
                </CardFooter>
            </Card>
        </div>
    );
}
