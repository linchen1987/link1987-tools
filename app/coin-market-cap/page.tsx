import { Metadata } from "next";
import CoinMarketCapClient from "./client";

export const metadata: Metadata = {
    title: "Coin Market Cap | Link1987 Tools",
    description: "Visualize cryptocurrency market cap data with interactive charts, including bar charts, pie charts, and table views.",
    keywords: ["cryptocurrency", "market cap", "bitcoin", "ethereum", "crypto visualization", "developer tools"],
    openGraph: {
        title: "Coin Market Cap | Link1987 Tools",
        description: "Visualize cryptocurrency market cap data with interactive charts.",
        type: "website",
    },
};

export default function CoinMarketCapPage() {
    return <CoinMarketCapClient />;
}
