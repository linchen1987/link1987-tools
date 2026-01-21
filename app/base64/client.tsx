"use client";

import EncodingForm from "../components/encoding-form";

export default function Base64Client() {
    const handleEncode = (input: string) => {
        // Handle UTF-8 strings
        const encoder = new TextEncoder();
        const data = encoder.encode(input);
        const binString = Array.from(data, (byte) => String.fromCodePoint(byte)).join("");
        return btoa(binString);
    };

    const handleDecode = (input: string) => {
        // Handle UTF-8 strings
        const binString = atob(input);
        const data = Uint8Array.from(binString, (m) => m.codePointAt(0)!);
        const decoder = new TextDecoder();
        return decoder.decode(data);
    };

    return (
        <EncodingForm
            title="Base64 Encoder / Decoder"
            description="Encode and decode text using Base64 encoding scheme. Supports UTF-8 characters."
            onEncode={handleEncode}
            onDecode={handleDecode}
        />
    );
}
