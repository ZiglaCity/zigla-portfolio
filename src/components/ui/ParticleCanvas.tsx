"use client";

import { useEffect, useRef, useState } from "react";

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Detect initial theme
    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      const theme = root.classList.contains("dark");
      setIsDark(theme);
    });

    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    setIsDark(root.classList.contains("dark"));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let raf: number;

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Optional subtle gradient background per theme
      const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      if (isDark) {
        g.addColorStop(0, "rgba(6,12,34,0.22)");
        g.addColorStop(1, "rgba(8,4,20,0.12)");
      } else {
        g.addColorStop(0, "rgba(255,255,255,0.05)");
        g.addColorStop(1, "rgba(245,245,245,0.05)");
      }
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < 40; i++) {
        const x = (Math.sin(t / 1000 + i) * 0.5 + 0.5) * window.innerWidth;
        const y = (Math.cos(t / 700 + i) * 0.5 + 0.5) * window.innerHeight;
        const r = Math.abs(Math.sin(t / 900 + i)) * 3 + 0.3;

        // Particle color per theme
        ctx.beginPath();
        ctx.fillStyle = isDark
          ? "rgba(88,199,255,0.03)" // original bluish for dark
          : "rgba(0,0,0,0.1)"; // subtle dark for light theme
        ctx.arc(x, y, r * 6, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-20 pointer-events-none opacity-75"
    />
  );
}
