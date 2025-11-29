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
                    <div className="text-4xl font-mono font-bold text-[var(--primary)]">
                        {currentTimestamp}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
