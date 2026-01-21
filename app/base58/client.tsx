"use client";

import EncodingForm from "../components/encoding-form";

const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const BASE = BigInt(58);

function toBytes(text: string): Uint8Array {
    return new TextEncoder().encode(text);
}

function fromBytes(bytes: Uint8Array): string {
    return new TextDecoder().decode(bytes);
}

function encodeBase58(source: Uint8Array): string {
    if (source.length === 0) return "";

    let x = BigInt(0);
    for (const byte of source) {
        x = x * BigInt(256) + BigInt(byte);
    }

    let result = "";
    while (x > 0) {
        const remainder = Number(x % BASE);
        x = x / BASE;
        result = ALPHABET[remainder] + result;
    }

    // Handle leading zeros
    for (let i = 0; i < source.length; i++) {
        if (source[i] === 0) {
            result = ALPHABET[0] + result;
        } else {
            break;
        }
    }

    return result;
}

function decodeBase58(input: string): Uint8Array {
    if (input.length === 0) return new Uint8Array(0);

    let x = BigInt(0);
    for (let i = 0; i < input.length; i++) {
        const char = input[i];
        const index = ALPHABET.indexOf(char);
        if (index === -1) {
            throw new Error(`Invalid Base58 character '${char}' at index ${i}`);
        }
        x = x * BASE + BigInt(index);
    }

    const bytes: number[] = [];
    while (x > 0) {
        bytes.unshift(Number(x % BigInt(256)));
        x = x / BigInt(256);
    }

    // Handle leading zeros
    for (let i = 0; i < input.length; i++) {
        if (input[i] === ALPHABET[0]) {
            bytes.unshift(0);
        } else {
            break;
        }
    }

    return new Uint8Array(bytes);
}

export default function Base58Client() {
    const handleEncode = (input: string) => {
        const bytes = toBytes(input);
        return encodeBase58(bytes);
    };

    const handleDecode = (input: string) => {
        const bytes = decodeBase58(input);
        return fromBytes(bytes);
    };

    return (
        <EncodingForm
            title="Base58 Encoder / Decoder"
            description="Encode and decode text using Base58 encoding scheme (Bitcoin alphabet)."
            onEncode={handleEncode}
            onDecode={handleDecode}
        />
    );
}
