import { Metadata } from "next";
import Base58Client from "./client";

export const metadata: Metadata = {
    title: "Base58 Encoder/Decoder | Link1987 Tools",
    description: "Online Base58 encoder and decoder tool. Convert text to Base58 (Bitcoin alphabet) and vice versa.",
    keywords: ["base58", "encoder", "decoder", "bitcoin base58", "base58 encode", "base58 decode", "developer tools"],
    openGraph: {
        title: "Base58 Encoder/Decoder | Link1987 Tools",
        description: "Online Base58 encoder and decoder tool.",
        type: "website",
    },
};

export default function Base58Page() {
    return <Base58Client />;
}
