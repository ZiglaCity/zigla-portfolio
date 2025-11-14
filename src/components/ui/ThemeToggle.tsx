"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "../providers/ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      aria-label="Toggle theme"
      onClick={toggleTheme}
      className="fixed left-6 top-6 z-50 w-10 h-10 rounded-md flex items-center justify-center bg-[rgb(var(--card-bg))] border border-[rgb(var(--card-border))] transition-colors hover:bg-[rgb(var(--background))]"
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-yellow-400" />
      ) : (
        <Moon className="w-5 h-5 text-gray-800" />
      )}
    </button>
  );
}
