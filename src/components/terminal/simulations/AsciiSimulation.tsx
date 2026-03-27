"use client";

import { useEffect, useMemo, useRef } from "react";

type SimulationKind = "donut" | "cnn" | "word";

type Point3D = {
  x: number;
  y: number;
  z: number;
  glyph: string;
};

const ASCII_GLYPHS = "@#$%&*+=-:.;!~^?abcdefghijklmnopqrstuvwxyz0123456789";

const SPECIAL_WORDS: Record<string, SimulationKind> = {
  donut: "donut",
  cnn: "cnn",
};

type CnnLayer = {
  name: string;
  feature: string;
  activation?: string;
  nodes: number;
};

const CNN_LAYERS: CnnLayer[] = [
  { name: "INPUT", feature: "28x28", nodes: 7 },
  { name: "CONV1", feature: "3x3 x16", activation: "ReLU", nodes: 11 },
  { name: "POOL1", feature: "2x2", nodes: 8 },
  { name: "CONV2", feature: "3x3 x32", activation: "ReLU", nodes: 11 },
  { name: "POOL2", feature: "2x2", nodes: 7 },
  { name: "DENSE", feature: "128", activation: "ReLU", nodes: 9 },
  { name: "OUTPUT", feature: "10 cls", activation: "Softmax", nodes: 5 },
];

function drawCnnSimulation(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  mouseX: number,
  mouseY: number,
): void {
  const layers = CNN_LAYERS;
  const layerCount = layers.length;
  const isCompact = width < 900;
  const marginX = Math.max(20, width * 0.055);
  const topY = Math.max(40, height * 0.16);
  const bottomY = Math.min(height - 72, height * 0.79);
  const networkHeight = Math.max(140, bottomY - topY);
  const spacingX = (width - marginX * 2) / Math.max(1, layerCount - 1);

  const labelSize = Math.max(9, Math.min(13, Math.floor(width / 110)));
  const nodeSize = Math.max(10, Math.min(16, Math.floor(width / 90)));
  const charWidth = Math.max(6, nodeSize * 0.57);

  const flow = (time * 0.0012) % (layerCount - 1);
  const activeEdge = Math.floor(flow);
  const edgeProgress = flow - activeEdge;
  const activeLayer = Math.floor((time * 0.0014) % layerCount);

  const nodeColumns: Array<Array<{ x: number; y: number }>> = [];

  ctx.textBaseline = "top";

  for (let i = 0; i < layerCount; i += 1) {
    const layer = layers[i];
    const x =
      marginX +
      i * spacingX +
      Math.sin(time * 0.0007 + i * 0.35) * 3 +
      mouseX * (isCompact ? 5 : 9);

    const label = isCompact ? layer.name.slice(0, 5) : layer.name;
    ctx.font = `700 ${labelSize}px monospace`;
    ctx.fillStyle =
      i === activeLayer
        ? "rgba(220, 255, 236, 0.98)"
        : "rgba(150, 205, 178, 0.9)";
    ctx.fillText(label, x - (label.length * labelSize * 0.28) / 2, topY - 30);

    const feature = isCompact ? layer.feature.replace(" ", "") : layer.feature;
    ctx.fillStyle = "rgba(115, 170, 145, 0.9)";
    ctx.fillText(
      feature,
      x - (feature.length * labelSize * 0.25) / 2,
      topY - 16,
    );

    const nodeColumn: Array<{ x: number; y: number }> = [];
    for (let n = 0; n < layer.nodes; n += 1) {
      const y =
        topY +
        ((n + 1) / (layer.nodes + 1)) * networkHeight +
        Math.sin(time * 0.001 + i * 0.6 + n * 0.38) * 1.8 +
        mouseY * 3;

      const isLayerActive = i === activeLayer;
      ctx.font = `700 ${nodeSize}px monospace`;
      ctx.fillStyle = isLayerActive
        ? "rgba(210, 255, 230, 0.95)"
        : "rgba(130, 185, 160, 0.82)";
      ctx.fillText("O", x - charWidth / 2, y - nodeSize * 0.55);

      nodeColumn.push({ x, y });
    }

    if (layer.activation) {
      const actY = bottomY + 18 + Math.sin(time * 0.0014 + i) * 1.5;
      ctx.font = `700 ${Math.max(9, labelSize - 1)}px monospace`;
      ctx.fillStyle = "rgba(185, 245, 215, 0.88)";
      ctx.fillText(
        `[${layer.activation}]`,
        x - (layer.activation.length + 2) * labelSize * 0.25,
        actY,
      );
    }

    nodeColumns.push(nodeColumn);
  }

  // Draw sparse but clear connection mesh between consecutive layers.
  ctx.font = `700 ${Math.max(8, nodeSize - 2)}px monospace`;
  for (let i = 0; i < nodeColumns.length - 1; i += 1) {
    const left = nodeColumns[i];
    const right = nodeColumns[i + 1];

    for (let s = 0; s < left.length; s += 1) {
      const mapped = Math.round(
        (s / Math.max(1, left.length - 1)) * (right.length - 1),
      );
      const targets = [mapped - 1, mapped, mapped + 1].filter(
        (idx) => idx >= 0 && idx < right.length,
      );

      for (const t of targets) {
        const start = left[s];
        const end = right[t];
        const steps = isCompact ? 3 : 4;

        for (let k = 1; k <= steps; k += 1) {
          const r = k / (steps + 1);
          const px = start.x + (end.x - start.x) * r;
          const py = start.y + (end.y - start.y) * r;
          ctx.fillStyle =
            i === activeEdge
              ? "rgba(170, 245, 210, 0.44)"
              : "rgba(98, 148, 128, 0.33)";
          ctx.fillText(".", px - 2, py - 2);
        }
      }
    }
  }

  // Animated packet moving through the pipeline.
  if (activeEdge >= 0 && activeEdge < nodeColumns.length - 1) {
    const fromCol = nodeColumns[activeEdge];
    const toCol = nodeColumns[activeEdge + 1];
    const nodeIdx =
      Math.floor(((time * 0.0042) % 1) * fromCol.length) % fromCol.length;
    const fromNode = fromCol[nodeIdx];
    const toIdx = Math.round(
      (nodeIdx / Math.max(1, fromCol.length - 1)) * (toCol.length - 1),
    );
    const toNode = toCol[Math.max(0, Math.min(toCol.length - 1, toIdx))];

    const px = fromNode.x + (toNode.x - fromNode.x) * edgeProgress;
    const py = fromNode.y + (toNode.y - fromNode.y) * edgeProgress;

    ctx.font = `700 ${Math.max(10, nodeSize)}px monospace`;
    ctx.fillStyle = "rgba(235, 255, 240, 0.98)";
    ctx.fillText("@", px - 3, py - nodeSize * 0.55);
  }

  const pipelineText = isCompact
    ? "INPUT -> CONV -> POOL -> CONV -> POOL -> DENSE -> OUT"
    : "Pipeline: input -> conv/relu -> pool -> conv/relu -> pool -> dense -> softmax";
  ctx.font = `700 ${Math.max(9, labelSize - 1)}px monospace`;
  ctx.fillStyle = "rgba(155, 220, 190, 0.82)";
  ctx.fillText(pipelineText, marginX, height - 24);
}

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

interface AsciiSimulationProps {
  word: string;
  onExit?: () => void;
  fullscreen?: boolean;
}

export default function AsciiSimulation({
  word,
  onExit,
  fullscreen = false,
}: AsciiSimulationProps) {
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

      if (simulationKind === "cnn") {
        drawCnnSimulation(ctx, width, height, time, mouseX, mouseY);
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

  useEffect(() => {
    if (!onExit) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onExit();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onExit]);

  return (
    <div
      className={`rounded-lg border border-zinc-700 bg-black/95 overflow-hidden ${
        fullscreen ? "h-full" : "mt-2"
      }`}
    >
      <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2 text-xs text-zinc-400">
        <span>
          mode: <span className="text-cyan-300">{simulationKind}</span>
        </span>
        <span>
          {simulationKind === "donut"
            ? "move mouse to steer donut"
            : simulationKind === "cnn"
              ? "move mouse to inspect cnn layers"
              : "move mouse for side-to-side depth"}
        </span>
      </div>
      <div
        ref={wrapperRef}
        className={`relative w-full ${fullscreen ? "h-[calc(100%-37px)]" : "h-[340px]"}`}
      >
        <canvas ref={canvasRef} className="block h-full w-full" />
      </div>
    </div>
  );
}
