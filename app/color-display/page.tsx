import { Metadata } from "next";
import ColorDisplayClient from "./client";

export const metadata: Metadata = {
    title: "Color Display | Link1987 Tools",
    description: "Preview an RGB color filling the screen and toggle true fullscreen display. Useful for testing color output on monitors and projectors.",
    keywords: ["color", "rgb", "hex", "fullscreen", "color test", "monitor", "developer tools"],
    openGraph: {
        title: "Color Display | Link1987 Tools",
        description: "Preview an RGB color filling the screen in true fullscreen.",
        type: "website",
    },
};

export default function ColorDisplayPage() {
    return <ColorDisplayClient />;
}
