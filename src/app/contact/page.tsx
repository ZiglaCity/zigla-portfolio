"use client";

import { useState, useEffect, useRef } from "react";
import {
  Send,
  Github,
  Linkedin,
  Twitter,
  Terminal,
  Mail,
  User,
  MessageSquare,
} from "lucide-react";
import ClientWrapper from "@@/components/ClientWrapper";
import ParticleCanvas from "@@/components/ui/ParticleCanvas";
import ThemeToggle from "@@/components/ui/ThemeToggle";
import { Metadata } from "next";
type FormData = {
  name: string;
  email: string;
  message: string;
};

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  /* ── TERMINAL TYPEWRITER (FIXED) ── */
  const terminalLines = [
    "$ whoami",
    "zigla_city",
    "$ pwd",
    "/home/zigla/contact",
    "$ ls -la",
    "total 3",
    "drwxr-xr-x  2 zigla zigla 4096 Jan 15 2025 .",
    "drwxr-xr-x  3 zigla zigla 4096 Jan 15 2025 ..",
    "-rw-r--r--  1 zigla zigla  256 Jan 15 2025 message.txt",
    "$ cat message.txt",
    "Ready to connect and collaborate…",
    "$ ping -c 1 you",
    "PONG — I’m listening.",
    "$ _",
  ];

  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const lineIndex = useRef(0);
  const charIndex = useRef(0);
  const currentLine = useRef("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setDisplayedLines([]);
    lineIndex.current = 0;
    charIndex.current = 0;
    currentLine.current = "";

    const typeNext = () => {
      const line = terminalLines[lineIndex.current];

      if (charIndex.current === 0) {
        setDisplayedLines((prev) => [...prev, ""]);
      }

      if (charIndex.current < line.length) {
        currentLine.current += line[charIndex.current];
        charIndex.current++;

        setDisplayedLines((prev) => {
          const next = [...prev];
          next[next.length - 1] = currentLine.current;
          return next;
        });
      } else {
        currentLine.current = "";
        charIndex.current = 0;
        lineIndex.current++;

        if (lineIndex.current >= terminalLines.length) {
          intervalRef.current && clearInterval(intervalRef.current);
        }
      }
    };

    intervalRef.current = setInterval(typeNext, 60);

    return () => {
      intervalRef.current && clearInterval(intervalRef.current);
    };
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1800));
    setIsSubmitting(false);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", message: "" });
    }, 3000);
  };

  return (
    <ClientWrapper>
      <div className="min-h-screen bg-[rgb(var(--background))] text-[rgb(var(--foreground))] py-16 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
        <ParticleCanvas />
        <ThemeToggle />

        <div className="max-w-6xl mx-auto">
          <header className="text-center mb-16">
            <h1 className="text-5xl sm:text-6xl font-bold font-mono">
              Ping <span className="text-cyan-400">Me</span>
            </h1>
            <p className="mt-4 text-xl text-[rgb(var(--muted))] max-w-2xl mx-auto">
              Project, security, or just a chat — I’m always open.
            </p>
          </header>

          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12">
            {/* ── TERMINAL ── */}
            <div className="order-2 lg:order-1">
              <div className="bg-[#0a0a0a] rounded-lg overflow-hidden shadow-2xl border border-cyan-900/30">
                <div className="flex items-center gap-3 px-4 py-2 bg-[#111] border-b border-cyan-900/40">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <span className="flex-1 text-center text-xs font-mono text-cyan-300">
                    zigla@terminal:~
                  </span>
                </div>
                <div className="h-80 p-5 font-mono text-sm sm:text-base leading-snug overflow-x-auto overflow-y-hidden">
                  <pre className="text-green-400 whitespace-pre-wrap sm:whitespace-pre">
                    {displayedLines.map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                  </pre>
                  {lineIndex.current < terminalLines.length && (
                    <span className="inline-block w-2 h-5 bg-cyan-400 animate-pulse align-middle"></span>
                  )}
                </div>
              </div>

              {/* Socials */}
              <div className="mt-8 space-y-4">
                <h3 className="text-lg font-semibold">Connect</h3>
                <div className="flex flex-wrap gap-3">
                  {[
                    {
                      Icon: Github,
                      href: "https://github.com/ziglacity",
                      label: "GitHub",
                    },
                    {
                      Icon: Linkedin,
                      href: "https://linkedin.com/in/ziglacity",
                      label: "LinkedIn",
                    },
                    {
                      Icon: Twitter,
                      href: "https://twitter.com/ziglacity",
                      label: "Twitter",
                    },
                  ].map(({ Icon, href, label }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--card-bg))] border border-[rgb(var(--card-border))] rounded-lg hover:bg-zinc-700/80 hover:border-cyan-600 transition"
                    >
                      <Icon className="w-5 h-5 text-cyan-400" />
                      <span className="text-sm">{label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="bg-[rgb(var(--card-bg))] backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-xl border border-[rgb(var(--card-border))] max-w-full">
                <div className="flex items-center gap-3 mb-6">
                  <Terminal className="w-6 h-6 text-cyan-400" />
                  <h2 className="text-2xl font-bold">Send Message</h2>
                </div>

                {submitted ? (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-900/40 flex items-center justify-center">
                      <Send className="w-8 h-8 text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      Message Sent!
                    </h3>
                    <p className="text-[rgb(var(--muted))]">I’ll reply ASAP.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium mb-2">
                        <User className="w-4 h-4" /> Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        className="w-full px-4 py-3 bg-[rgb(var(--background))] border border-[rgb(var(--card-border))] rounded-lg focus:border-cyan-500 focus:outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium mb-2">
                        <Mail className="w-4 h-4" /> Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 bg-[rgb(var(--background))] border border-[rgb(var(--card-border))] rounded-lg focus:border-cyan-500 focus:outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium mb-2">
                        <MessageSquare className="w-4 h-4" /> Message
                      </label>
                      <textarea
                        name="message"
                        required
                        rows={5}
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell me everything..."
                        className="w-full px-4 py-3 bg-[rgb(var(--background))] border border-[rgb(var(--card-border))] rounded-lg focus:border-cyan-500 focus:outline-none resize-none transition"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-3 py-4 bg-cyan-600/20 border border-cyan-600 rounded-lg hover:bg-cyan-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                          Sending…
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>

              <div className="mt-8 p-6 bg-[rgb(var(--card-bg))] rounded-lg border border-[rgb(var(--card-border))] max-w-full">
                <h3 className="text-lg font-semibold mb-3">Response Times</h3>
                <ul className="space-y-1 text-sm text-[rgb(var(--muted))]">
                  <li>
                    Project Inquiries — <strong>&lt;24 h</strong>
                  </li>
                  <li>
                    Collaboration — <strong>&lt;48 h</strong>
                  </li>
                  <li>
                    General — <strong>&lt;72 h</strong>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClientWrapper>
  );
}

export const metadata: Metadata = {
  title: "Contact | Zigla City",
  description:
    "Get in touch with Solomon Dzah — Software Engineer, AI/ML Developer, Cybersecurity Learner. Reach out for collaborations or inquiries.",
  openGraph: {
    title: "Contact | Zigla City",
    description:
      "Get in touch with Solomon Dzah — Software Engineer, AI/ML Developer, Cybersecurity Learner.",
    url: "https://ziglacity.tech/contact",
    images: [
      { url: "/zigla.png", width: 800, height: 800, alt: "Zigla City Contact" },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact | Zigla City",
    description:
      "Get in touch with Solomon Dzah — Software Engineer, AI/ML Developer, Cybersecurity Learner.",
    images: ["/zigla.png"],
  },
};
