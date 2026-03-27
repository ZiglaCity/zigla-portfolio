"use client";

import { useEffect, useMemo, useRef } from "react";

type SimulationKind = "donut" | "word";

type Point3D = {
  x: number;
  y: number;
  z: number;
  glyph: string;
};

const ASCII_GLYPHS = "@#$%&*+=-:.;!~^?abcdefghijklmnopqrstuvwxyz0123456789";

const SPECIAL_WORDS: Record<string, SimulationKind> = {
  donut: "donut",
};

function rotateX(point: Point3D, angle: number): Point3D {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    ...point,
    y: point.y * cos - point.z * sin,
    z: point.y * sin + point.z * cos,
  };
}

function rotateY(point: Point3D, angle: number): Point3D {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    ...point,
    x: point.x * cos + point.z * sin,
    z: -point.x * sin + point.z * cos,
  };
}

function hashGlyph(seed: number): string {
  const normalized = Math.abs(Math.floor(seed)) % ASCII_GLYPHS.length;
  return ASCII_GLYPHS[normalized];
}

function buildDonutPoints(): Point3D[] {
  const points: Point3D[] = [];
  const majorRadius = 80;
  const minorRadius = 32;

  // Keep donut detailed, but avoid excessive point count on slower devices.
  for (let u = 0; u < Math.PI * 2; u += 0.18) {
    for (let v = 0; v < Math.PI * 2; v += 0.26) {
      const x = (majorRadius + minorRadius * Math.cos(v)) * Math.cos(u);
      const y = (majorRadius + minorRadius * Math.cos(v)) * Math.sin(u);
      const z = minorRadius * Math.sin(v);
      points.push({
        x,
        y,
        z,
        glyph: hashGlyph(x * 7 + y * 11 + z * 13),
      });
    }
  }

  return points;
}

function formatDisplayWord(word: string): string {
  const cleaned = word.replace(/\s+/g, "").slice(0, 12).toUpperCase();
  return cleaned.split("").join(" ");
}

function drawWordSimulation(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  displayWord: string,
  time: number,
  mouseX: number,
  mouseY: number,
): void {
  const cx = width / 2;
  const cy = height / 2;
  const driftX =
    Math.sin(time * 0.00105) * (width * 0.11) + mouseX * width * 0.12;
  const driftY = Math.sin(time * 0.00065) * 9 + mouseY * 12;

  // Keep rotation subtle for readability.
  const yaw = Math.sin(time * 0.0009) * 0.14 + mouseX * 0.18;
  const pitch = -mouseY * 0.08;

  const layers = 13;
  const baseSize = Math.max(
    66,
    Math.min(
      180,
      Math.floor((width * 0.9) / Math.max(displayWord.length * 0.45, 3)),
    ),
  );

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let i = layers - 1; i >= 0; i -= 1) {
    const depth = i - layers / 2;
    const depthScale = 1 + depth * 0.02;
    const layerX = cx + driftX + Math.sin(yaw) * depth * 9;
    const layerY = cy + driftY + Math.sin(pitch) * depth * 8;
    const fontSize = Math.max(44, baseSize * depthScale);
    const alpha = Math.max(0.14, Math.min(0.96, 0.2 + (i / layers) * 0.8));

    ctx.font = `900 ${fontSize}px monospace`;
    ctx.fillStyle = `rgba(86, 168, 112, ${alpha * 0.38})`;
    ctx.fillText(displayWord, layerX + 1, layerY + 1);

    const frontGlow = i === layers - 1;
    ctx.fillStyle = frontGlow
      ? `rgba(210, 255, 225, ${Math.min(1, alpha + 0.04)})`
      : `rgba(164, 255, 196, ${alpha})`;
    ctx.fillText(displayWord, layerX, layerY);
  }
}

export default function AsciiSimulation({ word }: { word: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef(0);
  const targetMouseRef = useRef({ x: 0, y: 0 });
  const smoothedMouseRef = useRef({ x: 0, y: 0 });

  const rawWord = word.trim();
  const normalizedWord = rawWord.toLowerCase();
  const simulationKind: SimulationKind =
    SPECIAL_WORDS[normalizedWord] ?? "word";

  const displayWord = useMemo(
    () => formatDisplayWord(rawWord || "SIMULATE"),
    [rawWord],
  );

  const points = useMemo(() => {
    if (simulationKind === "donut") {
      return buildDonutPoints();
    }
    return [];
  }, [simulationKind]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const rect = wrapper.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(wrapper);
    resize();

    const onMouseMove = (event: MouseEvent) => {
      const rect = wrapper.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const relativeX = (event.clientX - rect.left) / rect.width;
      const relativeY = (event.clientY - rect.top) / rect.height;

      targetMouseRef.current.x = (relativeX - 0.5) * 2;
      targetMouseRef.current.y = (relativeY - 0.5) * 2;
    };

    const onMouseLeave = () => {
      targetMouseRef.current = { x: 0, y: 0 };
    };

    wrapper.addEventListener("mousemove", onMouseMove);
    wrapper.addEventListener("mouseleave", onMouseLeave);

    const draw = (time: number) => {
      // Cap effective FPS to reduce CPU/GPU pressure during continuous animation.
      if (time - lastFrameTimeRef.current < 33) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }
      lastFrameTimeRef.current = time;

      const width = wrapper.clientWidth;
      const height = wrapper.clientHeight;
      if (!width || !height) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      smoothedMouseRef.current.x +=
        (targetMouseRef.current.x - smoothedMouseRef.current.x) * 0.08;
      smoothedMouseRef.current.y +=
        (targetMouseRef.current.y - smoothedMouseRef.current.y) * 0.08;

      const mouseX = smoothedMouseRef.current.x;
      const mouseY = smoothedMouseRef.current.y;

      ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
      ctx.fillRect(0, 0, width, height);

      if (simulationKind === "word") {
        drawWordSimulation(
          ctx,
          width,
          height,
          displayWord,
          time,
          mouseX,
          mouseY,
        );
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      const cx =
        width / 2 + (simulationKind === "donut" ? mouseX * 40 : mouseX * 70);
      const cy =
        height / 2 + (simulationKind === "donut" ? mouseY * 20 : mouseY * 18);
      const perspective = simulationKind === "donut" ? 360 : 480;

      const rotY =
        simulationKind === "donut"
          ? time * 0.0013 + mouseX * 0.8
          : Math.sin(time * 0.0012) * 0.24 + mouseX * 0.22;
      const rotX =
        simulationKind === "donut"
          ? time * 0.00055 - mouseY * 0.5
          : -mouseY * 0.12;

      const projected = points
        .map((point) => {
          let transformed = rotateY(point, rotY);
          transformed = rotateX(transformed, rotX);

          const depth = transformed.z + perspective;
          const scale = perspective / Math.max(40, depth);
          const px = cx + transformed.x * scale;
          const py = cy + transformed.y * scale;

          return {
            x: px,
            y: py,
            scale,
            z: transformed.z,
            glyph: transformed.glyph,
          };
        })
        .filter(
          (p) =>
            p.x >= -20 && p.x <= width + 20 && p.y >= -20 && p.y <= height + 20,
        )
        .sort((a, b) => a.z - b.z);

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (const point of projected) {
        const alpha = Math.max(0.28, Math.min(1, 0.28 + (point.scale - 0.4)));
        const size =
          simulationKind === "donut"
            ? Math.max(8, Math.min(22, 8.5 * point.scale + 7))
            : Math.max(10, Math.min(28, 10.5 * point.scale + 9));

        ctx.font = `700 ${size}px monospace`;
        ctx.fillStyle =
          simulationKind === "donut"
            ? `rgba(255, 245, 180, ${alpha})`
            : `rgba(195, 255, 220, ${alpha})`;
        ctx.fillText(point.glyph, point.x, point.y);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      observer.disconnect();
      wrapper.removeEventListener("mousemove", onMouseMove);
      wrapper.removeEventListener("mouseleave", onMouseLeave);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [displayWord, points, simulationKind]);

  return (
    <div className="mt-2 rounded-lg border border-zinc-700 bg-black/95 overflow-hidden">
      <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2 text-xs text-zinc-400">
        <span>
          mode: <span className="text-cyan-300">{simulationKind}</span>
        </span>
        <span>
          {simulationKind === "donut"
            ? "move mouse to steer donut"
            : "move mouse for side-to-side depth"}
        </span>
      </div>
      <div ref={wrapperRef} className="relative h-[340px] w-full">
        <canvas ref={canvasRef} className="block h-full w-full" />
      </div>
    </div>
  );
}
