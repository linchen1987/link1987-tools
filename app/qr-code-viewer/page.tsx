import { Metadata } from "next";
import QrCodeViewerClient from "./client";

export const metadata: Metadata = {
    title: "QR Code Viewer | Link1987 Tools",
    description: "Decode and read text from QR code images. Supports file upload, drag & drop, and paste from clipboard.",
    keywords: ["qr code", "qr reader", "qr decoder", "barcode", "scan qr", "developer tools"],
    openGraph: {
        title: "QR Code Viewer | Link1987 Tools",
        description: "Decode and read text from QR code images.",
        type: "website",
    },
};

export default function QrCodeViewerPage() {
    return <QrCodeViewerClient />;
}
