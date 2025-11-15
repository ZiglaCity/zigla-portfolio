import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@@/components/providers/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Zigla City | Software Engineer & AI/ML Enthusiast",
  description:
    "Portfolio of Solomon Dzah — Software Engineer, Cybersecurity Learner, AI/ML Developer. Projects, blogs, and contact information.",
  keywords: [
    "Zigla City",
    "ZiglaCity",
    "ziglacity",
    "Solomon Dzah",
    "software engineer",
    "AI developer",
    "ML developer",
    "cybersecurity",
    "portfolio",
    "@Zigla_City",
    "@ZiglaCity",
  ],
  authors: [{ name: "Solomon Dzah", url: "https://ziglacity.tech" }],
  creator: "Zigla City",
  openGraph: {
    title: "Zigla City | Portfolio",
    description:
      "Portfolio of Solomon Dzah — Software Engineer, Cybersecurity Learner, AI/ML Developer.",
    url: "https://ziglacity.tech",
    siteName: "Zigla City Portfolio",
    images: [
      {
        url: "/zigla.png",
        width: 800,
        height: 800,
        alt: "Zigla City Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zigla City | Portfolio",
    description: "Solomon Dzah — Software Engineer & AI/ML Developer",
    images: ["/zigla.png"],
    site: "@ZiglaCity",
    creator: "@ZiglaCity",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
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
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(theme);
      } catch (e) {
        console.error('Error setting initial theme:', e);
      }
    })();
  `;

  // JSON-LD structured data for SEO (Person schema)
  const jsonLd = `
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "Solomon Dzah",
      "url": "https://ziglacity.tech",
      "sameAs": [
        "https://twitter.com/ZiglaCity",
        "https://www.linkedin.com/in/ziglacity",
        "https://github.com/ZiglaCity",
        "https://brght.org/profile/zigla-city/"
      ],
      "jobTitle": "Software Engineer",
      "image": "https://ziglacity.tech/zigla.png"
    }
  `;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <script dangerouslySetInnerHTML={{ __html: setInitialTheme }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
      </head>
      <body
        className={`${inter.className} min-h-screen bg-[rgb(var(--background))] text-[rgb(var(--foreground))] transition-colors duration-300`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
