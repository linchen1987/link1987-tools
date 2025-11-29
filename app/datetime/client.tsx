"use client";

import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

export default function DateTimestampClient() {
    const [input, setInput] = useState("");
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [currentTimestamp, setCurrentTimestamp] = useState<number>(
        Math.floor(Date.now() / 1000)
    );

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTimestamp(Math.floor(Date.now() / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleConvert = () => {
        setError(null);
        setResult(null);

        if (!input.trim()) {
            return;
        }

        let timestamp = Number(input.trim());

        if (isNaN(timestamp)) {
            setError("Invalid timestamp format");
            return;
        }

        // Guess if it's seconds or milliseconds
        // If it's less than 10000000000, assume seconds (valid until 2286)
        if (timestamp < 10000000000) {
            timestamp *= 1000;
        }

        const date = new Date(timestamp);

        if (isNaN(date.getTime())) {
            setError("Invalid date");
            return;
        }

        // Format: YYYY.MM.DD HH:mm:ss Timezone
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        // Get timezone name (e.g., "China Standard Time" or "CST" or "GMT+8")
        // Intl.DateTimeFormat with timeZoneName: 'short' or 'long'
        const timeZoneName = new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' })
            .formatToParts(date)
            .find(part => part.type === 'timeZoneName')?.value || '';

        setResult(`${year}.${month}.${day} ${hours}:${minutes}:${seconds} ${timeZoneName}`);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Date Timestamp Format</h1>
                <p className="text-[var(--muted-foreground)]">
                    Convert Unix timestamps to human-readable dates.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Converter</CardTitle>
                    <CardDescription>
                        Enter a Unix timestamp (seconds or milliseconds)
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-4">
                        <Input
                            placeholder="e.g. 1672531200"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleConvert()}
                        />
                        <Button onClick={handleConvert}>Convert</Button>
                    </div>

                    {error && (
                        <div className="p-4 rounded-md bg-red-500/10 text-red-500 text-sm">
                            {error}
                        </div>
                    )}

                    {result && (
                        <div className="space-y-2">
                            <div className="text-sm text-[var(--muted-foreground)]">Result:</div>
                            <div className="p-4 rounded-md bg-[var(--muted)] font-mono text-lg break-all">
                                {result}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Current Timestamp</CardTitle>
                    <CardDescription>The current Unix timestamp (seconds)</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--muted)]/50 border border-[var(--border)]">
                            <div className="space-y-1">
                                <div className="text-sm text-[var(--muted-foreground)] font-medium">Unix Timestamp</div>
                                <div className="text-xl font-mono font-medium tracking-tight text-[var(--foreground)]">
                                    {currentTimestamp}
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    navigator.clipboard.writeText(currentTimestamp.toString());
                                }}
                                title="Copy Timestamp"
                                className="h-10 w-10 hover:bg-[var(--background)] hover:text-[var(--primary)] transition-colors"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                                </svg>
                            </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--muted)]/50 border border-[var(--border)]">
                            <div className="space-y-1">
                                <div className="text-sm text-[var(--muted-foreground)] font-medium">Local Time</div>
                                <div className="text-xl font-medium text-[var(--foreground)]">
                                    {(() => {
                                        const date = new Date(currentTimestamp * 1000);
                                        const year = date.getFullYear();
                                        const month = String(date.getMonth() + 1).padStart(2, '0');
                                        const day = String(date.getDate()).padStart(2, '0');
                                        const hours = String(date.getHours()).padStart(2, '0');
                                        const minutes = String(date.getMinutes()).padStart(2, '0');
                                        const seconds = String(date.getSeconds()).padStart(2, '0');
                                        const timeZoneName = new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' })
                                            .formatToParts(date)
                                            .find(part => part.type === 'timeZoneName')?.value || '';
                                        return `${year}.${month}.${day} ${hours}:${minutes}:${seconds} ${timeZoneName}`;
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
