import { Metadata } from "next";
import Base64Client from "./client";

export const metadata: Metadata = {
    title: "Base64 Encoder/Decoder | Link1987 Tools",
    description: "Online Base64 encoder and decoder tool. Convert text to Base64 and vice versa easily.",
    keywords: ["base64", "encoder", "decoder", "base64 encode", "base64 decode", "developer tools"],
    openGraph: {
        title: "Base64 Encoder/Decoder | Link1987 Tools",
        description: "Online Base64 encoder and decoder tool.",
        type: "website",
    },
};

export default function Base64Page() {
    return <Base64Client />;
}
