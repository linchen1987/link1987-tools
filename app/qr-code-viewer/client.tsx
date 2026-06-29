"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import jsQR from "jsqr";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Copy, Upload, Trash2, ClipboardPaste, ScanLine } from "lucide-react";
import { toast } from "sonner";

export default function QrCodeViewerClient() {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isDecoding, setIsDecoding] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const decodeImage = useCallback((img: HTMLImageElement) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);

        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "attemptBoth",
        });

        if (!code) {
            const scale = 2;
            canvas.width = img.naturalWidth * scale;
            canvas.height = img.naturalHeight * scale;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "attemptBoth",
            });
        }

        if (code) {
            setResult(code.data);
            setError(null);
            toast.success("QR code decoded");
        } else {
            setResult(null);
            setError("No QR code detected in the image. Try a clearer or larger image.");
        }
    }, []);

    const loadImage = useCallback(
        (file: File) => {
            if (!file.type.startsWith("image/")) {
                setError("Please provide a valid image file.");
                return;
            }
            setError(null);
            setResult(null);
            setImageUrl((prev) => {
                if (prev) URL.revokeObjectURL(prev);
                return null;
            });

            const url = URL.createObjectURL(file);
            const img = new Image();
            img.onload = () => {
                setImageUrl(url);
                setIsDecoding(true);
                try {
                    decodeImage(img);
                } finally {
                    setIsDecoding(false);
                }
            };
            img.onerror = () => {
                setError("Failed to load the image.");
                URL.revokeObjectURL(url);
            };
            img.src = url;
        },
        [decodeImage]
    );

    const handleFileUpload = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) loadImage(file);
        },
        [loadImage]
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) loadImage(file);
        },
        [loadImage]
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handlePasteFromClipboard = useCallback(async () => {
        try {
            const items = await navigator.clipboard.read();
            const imageItem = items.find((item) => item.types.some((t) => t.startsWith("image/")));
            if (!imageItem) {
                toast.error("No image found in clipboard");
                return;
            }
            const imageType = imageItem.types.find((t) => t.startsWith("image/"))!;
            const blob = await imageItem.getType(imageType);
            loadImage(new File([blob], "pasted-image", { type: imageType }));
        } catch {
            toast.error("Unable to read clipboard. Try pasting with Ctrl/Cmd+V.");
        }
    }, [loadImage]);

    const handlePasteEvent = useCallback(
        (e: ClipboardEvent) => {
            const item = Array.from(e.clipboardData?.items || []).find((i) =>
                i.type.startsWith("image/")
            );
            if (item) {
                const file = item.getAsFile();
                if (file) {
                    e.preventDefault();
                    loadImage(file);
                }
            }
        },
        [loadImage]
    );

    useEffect(() => {
        window.addEventListener("paste", handlePasteEvent);
        return () => window.removeEventListener("paste", handlePasteEvent);
    }, [handlePasteEvent]);

    const handleReset = useCallback(() => {
        setImageUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return null;
        });
        setResult(null);
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }, []);

    const copyResult = useCallback(() => {
        if (result) {
            navigator.clipboard.writeText(result);
            toast.success("Copied to clipboard");
        }
    }, [result]);

    const isUrl = isUrlString(result);

    return (
        <Card className="w-full max-w-3xl mx-auto">
            <CardHeader>
                <CardTitle>QR Code Viewer</CardTitle>
                <CardDescription>
                    Upload, paste, or drag a QR code image to decode its text content.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                        isDragging
                            ? "border-[var(--primary)] bg-[var(--primary)]/5"
                            : "border-[var(--input)] hover:border-[var(--primary)]"
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                    <ScanLine className="mx-auto mb-4 h-12 w-12 text-[var(--muted-foreground)]" />
                    <p className="text-[var(--foreground)] font-medium">
                        Click, drop, or paste a QR code image
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)] mt-1">
                        Supports PNG, JPG, GIF, WebP, BMP
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Button
                        variant="outline"
                        onClick={handlePasteFromClipboard}
                        className="flex-1"
                    >
                        <ClipboardPaste className="mr-2 h-4 w-4" /> Paste from Clipboard
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1"
                    >
                        <Upload className="mr-2 h-4 w-4" /> Upload File
                    </Button>
                </div>

                {imageUrl && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-center p-4 bg-[var(--muted)]/30 rounded-lg">
                            <img
                                src={imageUrl}
                                alt="QR code preview"
                                className="max-w-full max-h-64 object-contain"
                            />
                        </div>
                    </div>
                )}

                {isDecoding && (
                    <p className="text-sm text-center text-[var(--muted-foreground)]">
                        Decoding...
                    </p>
                )}

                {error && (
                    <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-md border border-red-500/20">
                        {error}
                    </div>
                )}

                {result && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Decoded Text</label>
                            <div className="flex gap-2">
                                {isUrl && (
                                    <a
                                        href={result}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center h-8 px-2 text-xs rounded-md hover:bg-[var(--muted)] hover:text-[var(--muted-foreground)] transition-colors"
                                    >
                                        Open
                                    </a>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={copyResult}
                                    className="h-8 px-2"
                                >
                                    <Copy className="h-4 w-4 mr-1" /> Copy
                                </Button>
                            </div>
                        </div>
                        <div className="flex min-h-[80px] w-full rounded-md border border-[var(--input)] bg-[var(--muted)]/50 px-3 py-2 text-sm break-all whitespace-pre-wrap">
                            {result}
                        </div>
                    </div>
                )}

                {(imageUrl || result || error) && (
                    <Button variant="ghost" onClick={handleReset} className="w-full">
                        <Trash2 className="mr-2 h-4 w-4" /> Clear
                    </Button>
                )}

                <canvas ref={canvasRef} className="hidden" />
            </CardContent>
        </Card>
    );
}

function isUrlString(text: string | null): boolean {
    try {
        if (!text) return false;
        const url = new URL(text);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
}
