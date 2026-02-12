import { Metadata } from "next";
import SvgToPngClient from "./client";

export const metadata: Metadata = {
    title: "SVG to PNG Converter | Link1987 Tools",
    description: "Convert SVG images to PNG format with customizable dimensions.",
    keywords: ["svg", "png", "converter", "image converter", "svg to png", "developer tools"],
    openGraph: {
        title: "SVG to PNG Converter | Link1987 Tools",
        description: "Convert SVG images to PNG format with customizable dimensions.",
        type: "website",
    },
};

export default function SvgToPngPage() {
    return <SvgToPngClient />;
}
