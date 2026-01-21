"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Copy, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";

interface EncodingFormProps {
    title: string;
    description: string;
    onEncode: (input: string) => string;
    onDecode: (input: string) => string;
}

export default function EncodingForm({ title, description, onEncode, onDecode }: EncodingFormProps) {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [error, setError] = useState<string | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleEncode = () => {
        setError(null);
        try {
            if (!input) {
                setOutput("");
                return;
            }
            const result = onEncode(input);
            setOutput(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Encoding failed");
            setOutput("");
        }
    };

    const handleDecode = () => {
        setError(null);
        try {
            if (!input) {
                setOutput("");
                return;
            }
            const result = onDecode(input);
            setOutput(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Decoding failed");
            setOutput("");
        }
    };

    const copyToClipboard = () => {
        if (output) {
            navigator.clipboard.writeText(output);
            toast.success("Copied to clipboard");
        }
    };

    useEffect(() => {
        textareaRef.current?.focus();
    }, []);

    return (
        <Card className="w-full max-w-3xl mx-auto">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Input
                    </label>
                    <textarea
                        ref={textareaRef}
                        className="flex min-h-[120px] w-full rounded-md border border-[var(--input)] bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Enter text to encode or decode..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <Button onClick={handleEncode} className="flex-1">
                        <ArrowRightLeft className="mr-2 h-4 w-4" /> Encode
                    </Button>
                    <Button onClick={handleDecode} variant="outline" className="flex-1">
                        <ArrowRightLeft className="mr-2 h-4 w-4" /> Decode
                    </Button>
                </div>

                {error && (
                    <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-900">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Output
                        </label>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={copyToClipboard}
                            disabled={!output}
                            className="h-8 px-2"
                        >
                            <Copy className="h-4 w-4 mr-1" /> Copy
                        </Button>
                    </div>
                    <textarea
                        readOnly
                        className="flex min-h-[120px] w-full rounded-md border border-[var(--input)] bg-[var(--muted)]/50 px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Result will appear here..."
                        value={output}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
