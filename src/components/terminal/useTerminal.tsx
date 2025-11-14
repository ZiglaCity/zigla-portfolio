"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { findClosest } from "@@/utils/levenshtein";
import { blogs } from "@@/data/blogs";

const COMMANDS: string[] = [
  "help",
  "about",
  "experience",
  "projects",
  "blogs",
  "open",
  "search",
  "clear",
  "theme",
  "quit",
  "exit",
  "close",
] as const;

type OutputLine = { id: number; content: React.ReactNode };
let OUT_ID = 1;
const makeLine = (content: React.ReactNode) => ({ id: OUT_ID++, content });

export function useTerminal(initialHistory: string[] = []) {
  const [lines, setLines] = useState<OutputLine[]>([
    makeLine(
      <div className="font-mono text-green-400">
        ZiglaOS booting... welcome.
      </div>
    ),
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>(initialHistory);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [cachedBlogs] = useState(blogs);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  // Persist history
  useEffect(() => {
    localStorage.setItem("terminalHistory", JSON.stringify(history));
  }, [history]);

  const pushLine = (content: React.ReactNode) =>
    setLines((prev) => [...prev, makeLine(content)]);

  const echoCommand = (cmd: string) =>
    pushLine(
      <div className="font-mono">
        <span className="text-cyan-300">zigla@enzypher:~$</span> {cmd}
      </div>
    );

  const runCommand = async (raw: string): Promise<boolean> => {
    const cmd = raw.trim();
    if (!cmd) return false;

    setHistory((h) => [...h, cmd]);
    setHistoryIndex(null);
    echoCommand(cmd);

    const [head, ...rest] = cmd.split(/\s+/);
    const arg = rest.join(" ");

    if (head === "help") {
      pushLine(
        <div className="font-mono text-sm space-y-1">
          <div>Available commands:</div>
          <ul className="ml-4 list-disc text-cyan-300">
            <li>
              <strong>help</strong> — show this list
            </li>
            <li>
              <strong>about</strong> — who am I
            </li>
            <li>
              <strong>experience</strong> — journey timeline
            </li>
            <li>
              <strong>projects</strong> — list projects
            </li>
            <li>
              <strong>blogs</strong> — list blog posts
            </li>
            <li>
              <strong>open &lt;id|slug&gt;</strong> — open blog
            </li>
            <li>
              <strong>search &lt;term&gt;</strong> — fuzzy search
            </li>
            <li>
              <strong>clear</strong> — clear screen
            </li>
            <li>
              <strong>theme &lt;dark|light&gt;</strong> — switch theme
            </li>
            <li>
              <strong>quit/exit/close</strong> — exit terminal
            </li>
          </ul>
        </div>
      );
    } else if (head === "about") {
      pushLine(
        <div className="prose prose-invert text-sm">
          <p>
            <strong>Hey, I’m Zigla</strong> (Solomon Dzah). I build intelligent,
            secure, and scalable systems.
          </p>
          <p>
            CS @ University of Ghana. Currently grinding A2SV, shipping
            Merrylow, and cooking Enzypher.
          </p>
          <p className="mt-2 italic">"Innovation Over Imitation, Always!"</p>
        </div>
      );
    } else if (head === "experience") {
      pushLine(
        <div className="font-mono text-sm space-y-2">
          <div>
            • <strong>A2SV — Fellow</strong> — 2025
          </div>
          <div>
            • <strong>Merrylow — Founder</strong> — Production platform
          </div>
          <div>
            • <strong>Enzypher — In stealth</strong> — AI comms layer
          </div>
        </div>
      );
    } else if (head === "projects") {
      pushLine(
        <div className="font-mono text-sm">
          <div>- Merrylow — Restaurant OS</div>
          <div>- ProxyPhish — Phishing detector</div>
          <div>- SafestCode — AI code review</div>
          <div>- Enzypher — Encrypted AI layer</div>
        </div>
      );
    } else if (head === "blogs") {
      pushLine(
        <div className="font-mono text-sm space-y-1">
          {cachedBlogs.map((b) => (
            <div key={b.id}>
              <strong>#{b.id}</strong> — {b.title}{" "}
              <span className="text-zinc-500">({b.date})</span>
            </div>
          ))}
          <div className="mt-2 text-zinc-400">
            Use <code>open &lt;id|slug&gt;</code> to read
          </div>
        </div>
      );
    } else if (head === "open") {
      if (!arg) {
        pushLine(
          <div className="text-red-400">Usage: open &lt;id|slug&gt;</div>
        );
        return false;
      }
      const blog = cachedBlogs.find(
        (b) => b.id === Number(arg) || b.slug === arg
      );
      if (blog) {
        pushLine(<div className="text-cyan-300">Opening: {blog.title}...</div>);
        router.push(`/blogs/${blog.slug}`);
        return true;
      } else {
        pushLine(<div className="text-red-400">Blog not found: "{arg}"</div>);
      }
    } else if (head === "search") {
      if (!arg) {
        pushLine(
          <div className="text-red-400">Usage: search &lt;term&gt;</div>
        );
        return false;
      }
      const matches = cachedBlogs.filter(
        (b) =>
          b.title.toLowerCase().includes(arg.toLowerCase()) ||
          b.excerpt.toLowerCase().includes(arg.toLowerCase()) ||
          b.tags.some((t) => t.toLowerCase().includes(arg.toLowerCase()))
      );
      if (matches.length === 0) {
        pushLine(<div className="text-red-400">No results for "{arg}"</div>);
      } else {
        pushLine(
          <div className="font-mono text-sm space-y-1">
            {matches.map((b) => (
              <div key={b.id}>
                <strong>#{b.id}</strong> — {b.title}
              </div>
            ))}
          </div>
        );
      }
    } else if (head === "clear") {
      setLines([]);
    } else if (head === "theme") {
      if (!arg || !["dark", "light"].includes(arg)) {
        pushLine(
          <div className="text-red-400">Usage: theme &lt;dark|light&gt;</div>
        );
      } else {
        document.documentElement.classList.toggle("light", arg === "light");
        localStorage.setItem("ziglaTheme", arg);
        pushLine(<div className="text-green-400">Theme set to {arg}</div>);
      }
    } else if (["quit", "exit", "close"].includes(head)) {
      pushLine(
        <div className="text-zinc-400">Terminal closed. Ctrl+` to reopen.</div>
      );
      return true;
    } else {
      const suggestion = findClosest(head, COMMANDS);
      pushLine(
        <div className="text-red-400">
          Unknown command: <strong>{head}</strong>
          {suggestion && (
            <>
              . Did you mean <code className="text-cyan-300">{suggestion}</code>
              ?
            </>
          )}
          {". Type "}
          <code>help</code> for commands.
        </div>
      );
    }

    return false;
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const shouldClose = await runCommand(input);
      setInput("");
      if (shouldClose) return;
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      const idx =
        historyIndex === null
          ? history.length - 1
          : Math.max(0, historyIndex - 1);
      setHistoryIndex(idx);
      setInput(history[idx]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex === null) return;
      const idx = Math.min(history.length - 1, historyIndex + 1);
      setHistoryIndex(idx < history.length ? idx : null);
      setInput(idx < history.length ? history[idx] : "");
    } else if (e.key === "Tab") {
      e.preventDefault();
      const [first] = input.split(/\s+/);
      if (!first) return;
      const match = findClosest(first, COMMANDS);
      if (match) {
        const rest = input.slice(first.length);
        setInput(match + rest);
      }
    }
  };

  return {
    lines,
    input,
    setInput,
    historyIndex,
    setHistoryIndex,
    runCommand,
    scrollRef,
    inputRef,
    handleKeyDown,
    pushLine,
  };
}
