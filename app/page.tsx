import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";

const tools = [
  {
    id: "datetime",
    title: "Date Time Format",
    description: "Convert between Unix timestamp and human-readable date formats.",
    href: "/datetime",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="text-center space-y-4 py-12">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Developer Tools Collection
        </h1>
        <p className="text-xl text-[var(--muted-foreground)] max-w-2xl mx-auto">
          A curated set of simple, elegant, and useful tools for developers to boost productivity.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <Link key={tool.id} href={tool.href} className="block h-full">
            <Card className="h-full hover:bg-[var(--muted)]/50 transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-[var(--primary)]/10 rounded-lg text-[var(--primary)]">
                    {tool.icon}
                  </div>
                  <CardTitle>{tool.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {tool.description}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
