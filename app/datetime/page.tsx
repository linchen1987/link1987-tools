import { Metadata } from "next";
import DateTimestampClient from "./client";

export const metadata: Metadata = {
    title: "Date Timestamp Format | Link1987 Tools",
    description: "Convert Unix timestamps to human-readable dates. Support for seconds and milliseconds.",
    keywords: ["unix timestamp", "date converter", "epoch time", "developer tools", "timestamp format"],
    openGraph: {
        title: "Date Timestamp Format | Link1987 Tools",
        description: "Convert Unix timestamps to human-readable dates.",
        type: "website",
    },
};

export default function DateTimestampPage() {
    return <DateTimestampClient />;
}
