"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Maximize } from "lucide-react";

interface RGB {
    r: number;
    g: number;
    b: number;
}

const DEFAULT_HEX = "#ff0000";

function clamp(value: number): number {
    return Math.min(255, Math.max(0, Math.round(value)));
}

function rgbToHex(rgb: RGB): string {
    const to = (v: number) => clamp(v).toString(16).padStart(2, "0");
    return `#${to(rgb.r)}${to(rgb.g)}${to(rgb.b)}`;
}

function hexToRgb(hex: string): RGB | null {
    const match = hex.trim().replace(/^#/, "").match(/^([0-9a-fA-F]{6})$/);
    if (!match) return null;
    const n = parseInt(match[1], 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export default function ColorDisplayClient() {
    const [hex, setHex] = useState(DEFAULT_HEX);
    const [rgb, setRgb] = useState<RGB>({ r: 255, g: 0, b: 0 });
    const [isInvalid, setIsInvalid] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const fullscreenRef = useRef<HTMLDivElement>(null);

    const updateFromHex = (value: string) => {
        setHex(value);
        const parsed = hexToRgb(value);
        if (parsed) {
            setRgb(parsed);
            setIsInvalid(false);
        } else {
            setIsInvalid(true);
        }
    };

    const updateChannel = (channel: "r" | "g" | "b", value: number) => {
        if (Number.isNaN(value)) return;
        const next = { ...rgb, [channel]: clamp(value) };
        setRgb(next);
        setHex(rgbToHex(next));
        setIsInvalid(false);
    };

    const enterFullscreen = useCallback(() => {
        const el = fullscreenRef.current;
        if (!el) return;
        if (!document.fullscreenElement) {
            el.requestFullscreen()
                .then(() => setIsFullscreen(true))
                .catch(() => {});
        } else {
            document.exitFullscreen();
        }
    }, []);

    useEffect(() => {
        const onFullscreenChange = () => {
            if (!document.fullscreenElement) {
                setIsFullscreen(false);
            }
        };
        document.addEventListener("fullscreenchange", onFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
    }, []);

    const displayColor = hexToRgb(hex) ? hex : "#000000";

    return (
        <div className="flex flex-col gap-6 min-h-[calc(100vh-13rem)]">
            <Card>
                <CardHeader>
                    <CardTitle>Color Display</CardTitle>
                    <CardDescription>
                        Choose a color and the screen fills with it. Hit Fullscreen for a pure
                        color display with no UI. Press <kbd className="rounded border border-[var(--border)] bg-[var(--muted)] px-1.5 py-0.5 text-xs">Esc</kbd> to exit.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <input
                            type="color"
                            value={displayColor}
                            onChange={(e) => updateFromHex(e.target.value)}
                            className="h-9 w-14 cursor-pointer rounded-md border border-[var(--input)] bg-transparent p-1"
                            aria-label="Pick a color"
                        />
                        <div className="w-40">
                            <Input
                                value={hex}
                                onChange={(e) => updateFromHex(e.target.value)}
                                placeholder="#ff0000"
                                className={`font-mono ${isInvalid ? "border-red-500" : ""}`}
                            />
                            {isInvalid && (
                                <p className="mt-1 text-xs text-red-500">Invalid hex color</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        {(["r", "g", "b"] as const).map((channel) => (
                            <div key={channel} className="flex items-center gap-3">
                                <span className="w-6 text-sm font-medium uppercase">{channel}</span>
                                <input
                                    type="range"
                                    min={0}
                                    max={255}
                                    value={rgb[channel]}
                                    onChange={(e) => updateChannel(channel, Number(e.target.value))}
                                    className="flex-1"
                                    style={{ accentColor: displayColor }}
                                    aria-label={`${channel.toUpperCase()} value`}
                                />
                                <Input
                                    type="number"
                                    min={0}
                                    max={255}
                                    value={rgb[channel]}
                                    onChange={(e) => updateChannel(channel, Number(e.target.value))}
                                    className="h-8 w-20 font-mono"
                                    aria-label={`${channel.toUpperCase()} value input`}
                                />
                            </div>
                        ))}
                    </div>

                    <Button onClick={enterFullscreen} className="w-full sm:w-auto">
                        <Maximize /> Fullscreen
                    </Button>
                </CardContent>
            </Card>

            <div className="relative flex-1 min-h-[50vh] rounded-xl border overflow-hidden">
                <div
                    ref={fullscreenRef}
                    className="absolute inset-0 transition-colors duration-150"
                    style={{ backgroundColor: displayColor }}
                />
                {!isFullscreen && (
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2">
                        <span className="rounded-md bg-black/60 px-3 py-1 font-mono text-sm text-white">
                            {hex.toUpperCase()}
                        </span>
                        <span className="rounded-md bg-black/60 px-3 py-1 font-mono text-sm text-white">
                            rgb({rgb.r}, {rgb.g}, {rgb.b})
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
