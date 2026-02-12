"use client";

import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

const PRESET_SIZES = [
    { label: "16x16", width: 16, height: 16 },
    { label: "32x32", width: 32, height: 32 },
    { label: "64x64", width: 64, height: 64 },
    { label: "128x128", width: 128, height: 128 },
    { label: "256x256", width: 256, height: 256 },
    { label: "512x512", width: 512, height: 512 },
    { label: "1024x1024", width: 1024, height: 1024 },
];

export default function SvgToPngClient() {
    const [svgContent, setSvgContent] = useState<string | null>(null);
    const [svgUrl, setSvgUrl] = useState<string | null>(null);
    const [originalSize, setOriginalSize] = useState<{ width: number; height: number } | null>(null);
    const [width, setWidth] = useState<number>(256);
    const [height, setHeight] = useState<number>(256);
    const [customWidth, setCustomWidth] = useState<string>("256");
    const [customHeight, setCustomHeight] = useState<string>("256");
    const [pngUrl, setPngUrl] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>("image");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name.replace(/\.svg$/i, ""));
        setPngUrl(null);

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            setSvgContent(content);
            const url = URL.createObjectURL(file);
            setSvgUrl(url);

            const parser = new DOMParser();
            const doc = parser.parseFromString(content, "image/svg+xml");
            const svgElement = doc.querySelector("svg");
            if (svgElement) {
                let w = parseFloat(svgElement.getAttribute("width") || "0");
                let h = parseFloat(svgElement.getAttribute("height") || "0");
                
                if (!w || !h) {
                    const viewBox = svgElement.getAttribute("viewBox");
                    if (viewBox) {
                        const parts = viewBox.split(/\s+|,/).map(Number);
                        if (parts.length >= 4) {
                            w = parts[2];
                            h = parts[3];
                        }
                    }
                }

                if (w && h) {
                    setOriginalSize({ width: w, height: h });
                    setWidth(Math.round(w));
                    setHeight(Math.round(h));
                    setCustomWidth(Math.round(w).toString());
                    setCustomHeight(Math.round(h).toString());
                }
            }
        };
        reader.readAsText(file);
    }, []);

    const handlePresetSize = useCallback((w: number, h: number) => {
        setWidth(w);
        setHeight(h);
        setCustomWidth(w.toString());
        setCustomHeight(h.toString());
    }, []);

    const handleCustomSizeChange = useCallback(() => {
        const w = parseInt(customWidth, 10);
        const h = parseInt(customHeight, 10);
        if (w > 0 && h > 0) {
            setWidth(w);
            setHeight(h);
        }
    }, [customWidth, customHeight]);

    const convertToPng = useCallback(() => {
        if (!svgContent || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const img = new Image();
        const svgBlob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
            canvas.width = width;
            canvas.height = height;
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            URL.revokeObjectURL(url);

            const pngDataUrl = canvas.toDataURL("image/png");
            setPngUrl(pngDataUrl);
        };

        img.src = url;
    }, [svgContent, width, height]);

    const downloadPng = useCallback(() => {
        if (!pngUrl) return;
        const link = document.createElement("a");
        link.href = pngUrl;
        link.download = `${fileName}-${width}x${height}.png`;
        link.click();
    }, [pngUrl, fileName, width, height]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file && file.type === "image/svg+xml") {
            if (fileInputRef.current) {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                fileInputRef.current.files = dataTransfer.files;
                fileInputRef.current.dispatchEvent(new Event("change", { bubbles: true }));
            }
        }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>SVG to PNG Converter</CardTitle>
                <CardDescription>
                    Upload an SVG file and convert it to PNG with custom dimensions.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div
                    className="border-2 border-dashed border-[var(--input)] rounded-lg p-8 text-center hover:border-[var(--primary)] transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".svg,image/svg+xml"
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mx-auto mb-4 text-[var(--muted-foreground)]"
                    >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <p className="text-[var(--muted-foreground)]">
                        Click or drag an SVG file here
                    </p>
                </div>

                {svgUrl && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-center p-4 bg-[var(--muted)]/30 rounded-lg">
                            <img
                                src={svgUrl}
                                alt="SVG Preview"
                                className="max-w-full max-h-48 object-contain"
                            />
                        </div>
                        {originalSize && (
                            <p className="text-sm text-center text-[var(--muted-foreground)]">
                                Original size: {originalSize.width} x {originalSize.height}
                            </p>
                        )}
                    </div>
                )}

                {svgContent && (
                    <>
                        <div className="space-y-3">
                            <label className="text-sm font-medium">Preset Sizes</label>
                            <div className="flex flex-wrap gap-2">
                                {PRESET_SIZES.map((size) => (
                                    <button
                                        key={size.label}
                                        onClick={() => handlePresetSize(size.width, size.height)}
                                        className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                                            width === size.width && height === size.height
                                                ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                                                : "border-[var(--input)] hover:border-[var(--primary)]/50"
                                        }`}
                                    >
                                        {size.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-medium">Custom Size</label>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={customWidth}
                                        onChange={(e) => setCustomWidth(e.target.value)}
                                        onBlur={handleCustomSizeChange}
                                        className="w-24 h-9 px-3 rounded-md border border-[var(--input)] bg-transparent text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring)]"
                                        placeholder="Width"
                                        min="1"
                                    />
                                    <span className="text-[var(--muted-foreground)]">x</span>
                                    <input
                                        type="number"
                                        value={customHeight}
                                        onChange={(e) => setCustomHeight(e.target.value)}
                                        onBlur={handleCustomSizeChange}
                                        className="w-24 h-9 px-3 rounded-md border border-[var(--input)] bg-transparent text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring)]"
                                        placeholder="Height"
                                        min="1"
                                    />
                                </div>
                                <span className="text-sm text-[var(--muted-foreground)]">px</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={convertToPng}
                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring)] bg-[var(--primary)] text-[var(--primary-foreground)] shadow hover:bg-[var(--primary)]/90 h-9 px-4 py-2"
                            >
                                Convert to PNG
                            </button>
                            {pngUrl && (
                                <button
                                    onClick={downloadPng}
                                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring)] border border-[var(--input)] bg-transparent shadow-sm hover:bg-[var(--muted)] hover:text-[var(--muted-foreground)] h-9 px-4 py-2"
                                >
                                    Download PNG ({width}x{height})
                                </button>
                            )}
                        </div>

                        {pngUrl && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Preview</label>
                                <div className="flex items-center justify-center p-4 bg-[var(--muted)]/30 rounded-lg">
                                    <img
                                        src={pngUrl}
                                        alt="PNG Preview"
                                        className="max-w-full max-h-64 object-contain"
                                        style={{ imageRendering: width <= 64 || height <= 64 ? "pixelated" : "auto" }}
                                    />
                                </div>
                            </div>
                        )}
                    </>
                )}

                <canvas ref={canvasRef} className="hidden" />
            </CardContent>
        </Card>
    );
}
