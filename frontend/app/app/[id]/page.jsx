"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const fetchAppData = (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id,
        name: `App ${id}`,
        domain: `app${id}.com`,
        cpu: Math.random() * 100,
        ram: Math.random() * 16,
      });
    }, 1000);
  });
};

export default function AppDetails( params ) {
  const [appData, setAppData] = useState(null);

  useEffect(() => {
    fetchAppData(params.id).then((data) => setAppData(data));
  }, [params.id]);

  if (!appData) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Link href="/" passHref>
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </Link>
      <h1 className="text-3xl font-bold mb-6">{appData.name}</h1>
      <p className="text-lg text-muted-foreground mb-6">{appData.domain}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="w-5 h-5" />
              CPU Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{appData.cpu.toFixed(2)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              RAM Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{appData.ram.toFixed(2)} GB</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
