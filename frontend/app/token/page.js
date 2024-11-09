"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function TokenPage() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState(null);
  const [error, setError] = useState(null);
  const [requestToken, setRequestToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAccessToken = async (requestToken) => {
      try {
        const response = await axios.post(
          "http://localhost:3000/auth/get-access-token",
          {},
          {
            headers: {
              Authorization: `Bearer ${requestToken}`,
            },
          }
        );
        const token = response.data.data.accessToken;
        setAccessToken(token);

        localStorage.setItem("accessToken", token);

        router.push("/");
      } catch (err) {
        console.error("Error retrieving access token:", err);
        setError("Failed to retrieve access token");
      } finally {
        setIsLoading(false);
      }
    };

    // Get request token from URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get("requestToken");
    setRequestToken(token);

    if (token) {
      console.log("Request token found:", token); // Debug log
      fetchAccessToken(token);
    } else {
      setError("Missing requestToken in URL");
      setIsLoading(false);
    }
  }, [router]);

  if (error) {
    return (
      <div className="p-4">
        <div className="text-red-500 font-medium">Error: {error}</div>
        {requestToken && (
          <div className="mt-2 text-gray-600">
            Request token used: {requestToken}
          </div>
        )}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">Loading access token...</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Access Token</h1>
      {accessToken ? (
        <div className="bg-gray-100 p-4 rounded-lg">
          <div className="font-medium mb-2">Token received:</div>
          <div className="break-all font-mono bg-white p-2 rounded border">
            {accessToken}
          </div>
        </div>
      ) : (
        <div className="text-gray-600">
          No access token received
          {requestToken && (
            <div className="mt-2">
              <div className="font-medium">Request token used:</div>
              <div className="break-all font-mono bg-white p-2 rounded border mt-1">
                {requestToken}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
