import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { ThemeProvider } from "./components/theme-provider";
import { ModeToggle } from "./components/mode-toggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Link1987 Tools",
  description: "A collection of useful tools",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <header className="border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
              <Link href="/" className="text-xl font-bold tracking-tight hover:text-[var(--primary)] transition-colors">
                Link1987<span className="text-[var(--primary)]">.Tools</span>
              </Link>
              <div className="flex items-center gap-4">
                <nav className="flex gap-4 text-sm font-medium text-[var(--muted-foreground)]">
                  <Link href="/" className="hover:text-[var(--foreground)] transition-colors">Home</Link>
                  <a href="https://github.com/linchen1987" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--foreground)] transition-colors">GitHub</a>
                </nav>
                <ModeToggle />
              </div>
            </div>
          </header>
          <main className="flex-1 container mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="border-t border-[var(--border)] py-6 text-center text-sm text-[var(--muted-foreground)]">
            <p>© {new Date().getFullYear()} Link1987 Tools. Built for developers.</p>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
