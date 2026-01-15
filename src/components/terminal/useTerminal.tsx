"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { findClosest } from "@@/utils/levenshtein";
import { blogs } from "@@/data/blogs";
import { projects } from "@@/data/projects";
import { useGameSession } from "./useGameSession";

const COMMANDS: string[] = [
  "help",
  "about",
  "experience",
  "projects",
  "blogs",
  "open",
  "read",
  "search",
  "clear",
  "theme",
  "game",
  "exc",
  "quit",
  "exit",
  "close",
] as const;

type OutputLine = { id: string; content: React.ReactNode };
let lineCounter = 0;
const generateId = () =>
  `line-${++lineCounter}-${Math.random().toString(36).slice(2, 9)}`;
const makeLine = (content: React.ReactNode): OutputLine => ({
  id: generateId(),
  content,
});

const BOOT_MESSAGES = [
  { text: "Initializing ZiglaOS...", color: "text-zinc-500" },
  { text: "[OK] Loading kernel modules", color: "text-green-400" },
  { text: "[OK] Mounting file systems", color: "text-green-400" },
  { text: "[OK] Starting network services", color: "text-green-400" },
  { text: "[OK] Loading user profile: zigla", color: "text-green-400" },
  { text: "─".repeat(40), color: "text-zinc-700" },
  { text: "Welcome to ZiglaOS v2.0", color: "text-cyan-300 font-bold" },
  { text: "Type 'help' to see available commands.", color: "text-zinc-400" },
  { text: "─".repeat(40), color: "text-zinc-700" },
];

export function useTerminal(
  initialHistory: string[] = [],
  onClose: () => void,
  isOpen: boolean
) {
  const [lines, setLines] = useState<OutputLine[]>([]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>(initialHistory);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [isBooting, setIsBooting] = useState(true);
  const [cachedBlogs] = useState(blogs);
  const [cachedProjects] = useState(projects);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Game session hook
  const gameSession = useGameSession();

  const hasBooted = useRef(false);
  const bootLineIndex = useRef(0);
  const bootCharIndex = useRef(0);
  const currentBootText = useRef("");
  const bootIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Typewriter boot effect - only runs on first open
  useEffect(() => {
    if (!isOpen || hasBooted.current) return;

    hasBooted.current = true;
    setLines([]);
    setIsBooting(true);
    bootLineIndex.current = 0;
    bootCharIndex.current = 0;
    currentBootText.current = "";

    const typeNext = () => {
      const currentMessage = BOOT_MESSAGES[bootLineIndex.current];
      if (!currentMessage) {
        bootIntervalRef.current && clearInterval(bootIntervalRef.current);
        setIsBooting(false);
        return;
      }

      const { text, color } = currentMessage;

      // Start new line
      if (bootCharIndex.current === 0) {
        setLines((prev) => [
          ...prev,
          makeLine(<div className={`font-mono ${color}`}></div>),
        ]);
      }

      // Type character
      if (bootCharIndex.current < text.length) {
        currentBootText.current += text[bootCharIndex.current];
        bootCharIndex.current++;

        setLines((prev) => {
          const next = [...prev];
          const lastIndex = next.length - 1;
          next[lastIndex] = makeLine(
            <div className={`font-mono ${color}`}>
              {currentBootText.current}
            </div>
          );
          return next;
        });
      } else {
        // Move to next line
        currentBootText.current = "";
        bootCharIndex.current = 0;
        bootLineIndex.current++;

        if (bootLineIndex.current >= BOOT_MESSAGES.length) {
          bootIntervalRef.current && clearInterval(bootIntervalRef.current);
          setIsBooting(false);
        }
      }
    };

    bootIntervalRef.current = setInterval(typeNext, 30);

    return () => {
      bootIntervalRef.current && clearInterval(bootIntervalRef.current);
    };
  }, [isOpen]);

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
              <strong>projects</strong> — list all projects
            </li>
            <li>
              <strong>blogs</strong> — list all blog posts
            </li>
            <li>
              <strong>open &lt;blog|project&gt; &lt;id|slug&gt;</strong> —
              navigate to blog/project
            </li>
            <li>
              <strong>read &lt;blog|project&gt; &lt;id|slug&gt;</strong> — view
              details in terminal
            </li>
            <li>
              <strong>search &lt;term&gt;</strong> — fuzzy search blogs &
              projects
            </li>
            <li>
              <strong>game</strong> — list available games
            </li>
            <li>
              <strong>game play &lt;id|name&gt;</strong> — start a game
            </li>
            <li>
              <strong>exc</strong> — exit current game
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
            • <strong>Enzypher — In stealth</strong> — Encrypted Chat System{" "}
          </div>
        </div>
      );
    } else if (head === "projects") {
      pushLine(
        <div className="font-mono text-sm space-y-1">
          {cachedProjects.map((p) => (
            <div key={p.title}>
              <strong>#{p.id}</strong> — {p.title}{" "}
              <span className="text-zinc-500">({p.categories.join(", ")})</span>
              {p.featured && <span className="text-yellow-400 ml-1">★</span>}
            </div>
          ))}
          <div className="mt-2 text-zinc-400">
            Use <code>read project &lt;id&gt;</code> to view details or{" "}
            <code>open project &lt;id&gt;</code> to visit
          </div>
        </div>
      );
    } else if (head === "blogs") {
      pushLine(
        <div className="font-mono text-sm space-y-1">
          {cachedBlogs.map((b) => (
            <div key={b.slug}>
              <strong>#{b.id}</strong> — {b.title}{" "}
              <span className="text-zinc-500">({b.date})</span>
            </div>
          ))}
          <div className="mt-2 text-zinc-400">
            Use <code>read blog &lt;id|slug&gt;</code> to view or{" "}
            <code>open blog &lt;id|slug&gt;</code> to visit
          </div>
        </div>
      );
    } else if (head === "open") {
      const [type, ...identifierParts] = rest;
      const identifier = identifierParts.join(" ");

      if (!type || !identifier) {
        pushLine(
          <div className="text-red-400">
            Usage: open &lt;blog|project&gt; &lt;id|slug&gt;
          </div>
        );
        return false;
      }

      if (type === "blog") {
        const blog = cachedBlogs.find(
          (b) => b.id === Number(identifier) || b.slug === identifier
        );
        if (blog) {
          pushLine(
            <div className="text-cyan-300">Opening: {blog.title}...</div>
          );
          router.push(`/blogs/${blog.slug}`);
          return true;
        } else {
          pushLine(
            <div className="text-red-400">Blog not found: "{identifier}"</div>
          );
        }
      } else if (type === "project") {
        const project = cachedProjects.find(
          (p) =>
            p.id === Number(identifier) ||
            p.title.toLowerCase() === identifier.toLowerCase()
        );
        if (project) {
          pushLine(
            <div className="text-cyan-300">Opening: {project.title}...</div>
          );
          if (project.demo && project.demo !== "#") {
            window.open(project.demo, "_blank");
          } else if (project.github && project.github !== "#") {
            window.open(project.github, "_blank");
          } else {
            pushLine(
              <div className="text-yellow-400">
                No demo or repo link available for this project.
              </div>
            );
            return false;
          }
          return false;
        } else {
          pushLine(
            <div className="text-red-400">
              Project not found: "{identifier}"
            </div>
          );
        }
      } else {
        pushLine(
          <div className="text-red-400">
            Unknown type: "{type}". Use <code>blog</code> or{" "}
            <code>project</code>.
          </div>
        );
      }
    } else if (head === "read") {
      const [type, ...identifierParts] = rest;
      const identifier = identifierParts.join(" ");

      if (!type || !identifier) {
        pushLine(
          <div className="text-red-400">
            Usage: read &lt;blog|project&gt; &lt;id|slug&gt;
          </div>
        );
        return false;
      }

      if (type === "blog") {
        const blog = cachedBlogs.find(
          (b) => b.id === Number(identifier) || b.slug === identifier
        );
        if (blog) {
          pushLine(
            <div className="font-mono text-sm space-y-2 border-l-2 border-cyan-500 pl-3 my-2">
              <div className="text-lg font-bold text-cyan-300">
                {blog.title}
              </div>
              <div className="text-zinc-400 text-xs">
                <span className="uppercase tracking-wider">{blog.date}</span>
                <span className="mx-2 text-zinc-600">|</span>
                <span>{blog.readTime}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {blog.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-zinc-700 text-cyan-300 rounded text-xs"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="text-zinc-300 italic border-t border-zinc-700 pt-2 mt-2">
                "{blog.excerpt}"
              </div>
              <div className="text-zinc-500 text-xs mt-2">
                <span className="text-zinc-600">[TIP]</span> Use{" "}
                <code className="text-cyan-300">open blog {blog.id}</code> to
                read the full article
              </div>
            </div>
          );
        } else {
          pushLine(
            <div className="text-red-400">Blog not found: "{identifier}"</div>
          );
        }
      } else if (type === "project") {
        const project = cachedProjects.find(
          (p) =>
            p.id === Number(identifier) ||
            p.title.toLowerCase() === identifier.toLowerCase()
        );
        if (project) {
          pushLine(
            <div className="font-mono text-sm space-y-2 border-l-2 border-green-500 pl-3 my-2">
              <div className="text-lg font-bold text-green-300">
                {project.title}
                {project.featured && (
                  <span className="text-yellow-400 ml-2">★ Featured</span>
                )}
              </div>
              <div className="text-zinc-400 text-xs uppercase tracking-wider">
                {project.categories.join(" / ")}
              </div>
              <div className="flex flex-wrap gap-1">
                {project.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-zinc-700 text-green-300 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="text-zinc-300 border-t border-zinc-700 pt-2 mt-2">
                {project.description}
              </div>
              <div className="flex gap-4 text-xs mt-2">
                {project.github && project.github !== "#" && (
                  <span className="text-zinc-400">
                    GitHub:{" "}
                    <span className="text-cyan-300">
                      {project.github.replace("https://github.com/", "")}
                    </span>
                  </span>
                )}
                {project.demo && project.demo !== "#" && (
                  <span className="text-zinc-400">
                    <span className="text-green-400">[LIVE]</span> Demo
                    available
                  </span>
                )}
              </div>
              <div className="text-zinc-500 text-xs mt-2">
                <span className="text-zinc-600">[TIP]</span> Use{" "}
                <code className="text-cyan-300">open project {project.id}</code>{" "}
                to visit
              </div>
            </div>
          );
        } else {
          pushLine(
            <div className="text-red-400">
              Project not found: "{identifier}"
            </div>
          );
        }
      } else {
        pushLine(
          <div className="text-red-400">
            Unknown type: "{type}". Use <code>blog</code> or{" "}
            <code>project</code>.
          </div>
        );
      }
    } else if (head === "search") {
      if (!arg) {
        pushLine(
          <div className="text-red-400">Usage: search &lt;term&gt;</div>
        );
        return false;
      }
      const blogMatches = cachedBlogs.filter(
        (b) =>
          b.title.toLowerCase().includes(arg.toLowerCase()) ||
          b.excerpt.toLowerCase().includes(arg.toLowerCase()) ||
          b.tags.some((t) => t.toLowerCase().includes(arg.toLowerCase()))
      );
      const projectMatches = cachedProjects.filter(
        (p) =>
          p.title.toLowerCase().includes(arg.toLowerCase()) ||
          p.description.toLowerCase().includes(arg.toLowerCase()) ||
          p.tags.some((t) => t.toLowerCase().includes(arg.toLowerCase())) ||
          p.categories.some((c) => c.toLowerCase().includes(arg.toLowerCase()))
      );

      if (blogMatches.length === 0 && projectMatches.length === 0) {
        pushLine(<div className="text-red-400">No results for "{arg}"</div>);
      } else {
        pushLine(
          <div className="font-mono text-sm space-y-2">
            {blogMatches.length > 0 && (
              <div>
                <div className="text-cyan-400 font-bold mb-1 uppercase tracking-wider text-xs">
                  [ Blogs ]{" "}
                  <span className="font-normal normal-case">
                    ({blogMatches.length} found)
                  </span>
                </div>
                {blogMatches.map((b) => (
                  <div key={b.slug} className="ml-2">
                    <strong>#{b.id}</strong> — {b.title}
                  </div>
                ))}
              </div>
            )}
            {projectMatches.length > 0 && (
              <div>
                <div className="text-green-400 font-bold mb-1 uppercase tracking-wider text-xs">
                  [ Projects ]{" "}
                  <span className="font-normal normal-case">
                    ({projectMatches.length} found)
                  </span>
                </div>
                {projectMatches.map((p) => (
                  <div key={p.title} className="ml-2">
                    <strong>#{p.id}</strong> — {p.title}
                  </div>
                ))}
              </div>
            )}
            <div className="text-zinc-500 text-xs mt-2">
              Use <code>read blog/project &lt;id&gt;</code> to view details
            </div>
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
    } else if (head === "game") {
      const [subCmd, ...gameArgs] = rest;
      const gameName = gameArgs.join(" ");

      if (!subCmd) {
        // List all games
        const games = gameSession.listGames();
        pushLine(
          <div className="font-mono text-sm space-y-2">
            <div className="text-cyan-300 font-bold">🎮 Available Games:</div>
            <div className="border border-zinc-700 rounded overflow-hidden">
              {games.map((game, index) => (
                <div
                  key={game.id}
                  className={`p-2 ${
                    index % 2 === 0 ? "bg-zinc-800/50" : "bg-zinc-900/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-green-400 font-bold">#{game.id}</span>
                    <span className="text-zinc-100">{game.name}</span>
                    {game.version === "0.0.0" ? (
                      <span className="text-xs px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">
                        Coming Soon
                      </span>
                    ) : (
                      <span className="text-xs px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded">
                        v{game.version}
                      </span>
                    )}
                  </div>
                  <div className="text-zinc-500 text-xs ml-4 mt-1">
                    {game.description}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-zinc-400 text-xs mt-2">
              Use{" "}
              <code className="text-cyan-300">game play &lt;id|name&gt;</code>{" "}
              to start a game
            </div>
          </div>
        );
      } else if (subCmd === "play") {
        if (!gameName) {
          pushLine(
            <div className="text-red-400">
              Usage: game play &lt;id|name&gt;
              <div className="text-zinc-400 text-xs mt-1">
                Example: <code className="text-cyan-300">game play snake</code>
              </div>
            </div>
          );
          return false;
        }

        const result = gameSession.startGame(gameName);
        if (result.success) {
          // Game will be shown in GameCanvas, terminal output is replaced
          // No need to push lines here, the UI will switch to GameCanvas
        } else {
          pushLine(<div className="text-red-400">{result.message}</div>);
        }
      } else {
        pushLine(
          <div className="text-red-400">
            Unknown game command: <strong>{subCmd}</strong>
            <div className="text-zinc-400 text-xs mt-1">
              Available: <code className="text-cyan-300">game</code> or{" "}
              <code className="text-cyan-300">game play &lt;id|name&gt;</code>
            </div>
          </div>
        );
      }
    } else if (head === "exc") {
      if (!gameSession.isInGameMode()) {
        pushLine(
          <div className="text-yellow-400">
            No game is currently running.
            <div className="text-zinc-400 text-xs mt-1">
              Use{" "}
              <code className="text-cyan-300">game play &lt;id|name&gt;</code>{" "}
              to start a game.
            </div>
          </div>
        );
      } else {
        const result = gameSession.exitGame();
        setLines([]); // Clear the game display
        pushLine(
          <div className="text-cyan-300">
            {result.message}
            <div className="text-zinc-400 text-xs mt-1">
              Type <code className="text-cyan-300">game</code> to see available
              games.
            </div>
          </div>
        );
      }
    } else if (["quit", "exit", "close"].includes(head)) {
      pushLine(
        <div className="text-zinc-400">Terminal closed. Ctrl+` to reopen.</div>
      );
      setTimeout(() => onClose(), 1000);
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
          <div className="text-zinc-400 text-xs mt-1">
            Type <code className="text-cyan-300">help</code> to view all valid
            commands.
          </div>
        </div>
      );
    }

    return false;
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    // In game mode, input is disabled and GameCanvas handles keys
    // So we only need to handle terminal commands here

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
    isBooting,
    gameSession,
  };
}
