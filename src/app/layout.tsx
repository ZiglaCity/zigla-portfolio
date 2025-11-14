import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@@/components/providers/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Zigla City",
  description:
    "Software Engineer. Cybersecurity. Builder of Things That Think.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Pre-hydration theme script to prevent FOUC
  const setInitialTheme = `
    (function() {
      try {
        const saved = localStorage.getItem('ziglaTheme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = saved || (prefersDark ? 'dark' : 'light');
        document.documentElement.classList.remove('light','dark');
        document.documentElement.classList.add(theme);
      } catch (_) {}
    })();
  `;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: setInitialTheme }} />
      </head>
      <body
        className={`${inter.className} min-h-screen bg-[rgb(var(--background))] text-[rgb(var(--foreground))] transition-colors duration-300`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
