"use client";

import { useEffect, useMemo, useRef } from "react";

type SimulationKind =
  | "donut"
  | "bird"
  | "cnn"
  | "linreg"
  | "ziglaPortrait"
  | "word";

type Point3D = {
  x: number;
  y: number;
  z: number;
  glyph: string;
};

const ASCII_GLYPHS = "@#$%&*+=-:.;!~^?abcdefghijklmnopqrstuvwxyz0123456789";

const SPECIAL_WORDS: Record<string, SimulationKind> = {
  donut: "donut",
  bird: "bird",
  cnn: "cnn",
  linreg: "linreg",
  zigla: "ziglaPortrait",
  ziglacity: "ziglaPortrait",
};

type PortraitPoint = {
  x: number;
  y: number;
  z: number;
  b: number;
};

const PORTRAIT_ASCII = "@#S%?*+;:,.";
const PORTRAIT_IMAGE_PATH = "/assets/simulations/zigla.png";

let portraitPointsCache: PortraitPoint[] | null = null;
let portraitLoadState: "idle" | "loading" | "ready" | "error" = "idle";
let portraitLoadPromise: Promise<boolean> | null = null;
let portraitLoadError: string | null = null;

function generatePortraitPoints(imageData: ImageData): PortraitPoint[] {
  const { width: size, data } = imageData;
  const generated: PortraitPoint[] = [];

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const idx = (y * size + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];
      if (a < 10) continue;

      const brightness = (r + g + b) / 3 / 255;

      generated.push({
        x: (x - size / 2) * 0.072,
        y: (y - size / 2) * 0.072,
        z: (1 - brightness) * 2.7,
        b: brightness,
      });
    }
  }

  return generated;
}

export async function preloadZiglaPortraitAsset(): Promise<boolean> {
  if (portraitLoadState === "ready" && portraitPointsCache?.length) {
    return true;
  }

  if (portraitLoadState === "loading" && portraitLoadPromise) {
    return portraitLoadPromise;
  }

  if (typeof window === "undefined") {
    return false;
  }

  portraitLoadState = "loading";
  portraitLoadError = null;

  portraitLoadPromise = new Promise<boolean>((resolve) => {
    const img = new Image();

    img.onload = () => {
      const size = 80;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        portraitLoadState = "error";
        portraitLoadError = "Unable to initialize portrait canvas.";
        resolve(false);
        return;
      }

      canvas.width = size;
      canvas.height = size;
      ctx.drawImage(img, 0, 0, size, size);

      const imageData = ctx.getImageData(0, 0, size, size);
      portraitPointsCache = generatePortraitPoints(imageData);

      if (!portraitPointsCache.length) {
        portraitLoadState = "error";
        portraitLoadError = "Portrait data is empty.";
        resolve(false);
        return;
      }

      portraitLoadState = "ready";
      resolve(true);
    };

    img.onerror = () => {
      portraitLoadState = "error";
      portraitLoadError = `Could not load ${PORTRAIT_IMAGE_PATH}`;
      resolve(false);
    };

    img.src = PORTRAIT_IMAGE_PATH;
  });

  return portraitLoadPromise;
}

type LinRegDatum = {
  weight: number;
  horsepower: number;
  mpg: number;
};

type Vec3 = {
  x: number;
  y: number;
  z: number;
};

const LINREG_DATA: LinRegDatum[] = Array.from({ length: 36 }, (_, i) => {
  const t = i / 35;
  const weight = 2200 + t * 3000 + Math.sin(i * 1.8) * 220;
  const horsepower = 58 + t * 165 + Math.cos(i * 1.35) * 16;
  const baseline = 51 - 0.0036 * weight - 0.069 * horsepower;
  const noise = Math.sin(i * 0.9) * 2.7 + Math.cos(i * 0.55) * 1.5;
  return {
    weight,
    horsepower,
    mpg: Math.max(7, Math.min(44, baseline + noise)),
  };
});

function drawAsciiSegment(
  ctx: CanvasRenderingContext2D,
  start: { x: number; y: number },
  end: { x: number; y: number },
  char: string,
  color: string,
  size: number,
  step = 8,
): void {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.max(1, Math.hypot(dx, dy));
  const samples = Math.max(2, Math.floor(length / step));

  ctx.font = `700 ${size}px monospace`;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let i = 0; i <= samples; i += 1) {
    const t = i / samples;
    ctx.fillText(char, start.x + dx * t, start.y + dy * t);
  }
}

function linRegPredict(weight: number, horsepower: number): number {
  return 51 - 0.0036 * weight - 0.069 * horsepower;
}

function toPlotSpace(weight: number, horsepower: number, mpg: number): Vec3 {
  const x = (horsepower - 140) / 92;
  const z = (weight - 3600) / 1400;
  const y = (mpg - 23) / 11;
  return { x, y, z };
}

function projectPlotPoint(
  point: Vec3,
  width: number,
  height: number,
  yaw: number,
  pitch: number,
): { x: number; y: number; depth: number } {
  const rotated = rotateX(
    rotateY({ x: point.x, y: point.y, z: point.z, glyph: "" }, yaw),
    pitch,
  );
  const perspective = 310;
  const depthOffset = 4.1;
  const sceneScale = 1.42;
  const depth = rotated.z + depthOffset;
  const scale = perspective / Math.max(1.1, depth);

  return {
    x: width * 0.53 + rotated.x * scale * sceneScale,
    y: height * 0.62 - rotated.y * scale * sceneScale,
    depth,
  };
}

function drawLinRegSimulation(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  mouseX: number,
  mouseY: number,
): void {
  const yaw = -0.62 + mouseX * 0.3 + Math.sin(time * 0.0006) * 0.06;
  const pitch = 0.4 - mouseY * 0.23;
  const axisSize = Math.max(10, Math.min(14, Math.floor(width / 86)));
  const pointSize = Math.max(12, Math.min(18, Math.floor(width / 72)));

  const planeWeightSteps = 13;
  const planeHorseSteps = 11;

  const planeNode = (wi: number, hi: number) => {
    const weight = 2200 + (wi / (planeWeightSteps - 1)) * 3000;
    const horsepower = 55 + (hi / (planeHorseSteps - 1)) * 175;
    const mpg = linRegPredict(weight, horsepower);
    return projectPlotPoint(
      toPlotSpace(weight, horsepower, mpg),
      width,
      height,
      yaw,
      pitch,
    );
  };

  // Regression plane mesh.
  for (let wi = 0; wi < planeWeightSteps; wi += 1) {
    for (let hi = 0; hi < planeHorseSteps - 1; hi += 1) {
      const a = planeNode(wi, hi);
      const b = planeNode(wi, hi + 1);
      drawAsciiSegment(
        ctx,
        a,
        b,
        "=",
        "rgba(120, 205, 245, 0.56)",
        Math.max(8, axisSize),
        8,
      );
    }
  }
  for (let hi = 0; hi < planeHorseSteps; hi += 1) {
    for (let wi = 0; wi < planeWeightSteps - 1; wi += 1) {
      const a = planeNode(wi, hi);
      const b = planeNode(wi + 1, hi);
      drawAsciiSegment(
        ctx,
        a,
        b,
        "-",
        "rgba(175, 235, 135, 0.52)",
        Math.max(8, axisSize),
        8,
      );
    }
  }

  // Axis references.
  const origin = projectPlotPoint(
    toPlotSpace(2200, 55, 8),
    width,
    height,
    yaw,
    pitch,
  );
  const xAxis = projectPlotPoint(
    toPlotSpace(2200, 230, 8),
    width,
    height,
    yaw,
    pitch,
  );
  const zAxis = projectPlotPoint(
    toPlotSpace(5200, 55, 8),
    width,
    height,
    yaw,
    pitch,
  );
  const yAxis = projectPlotPoint(
    toPlotSpace(2200, 55, 42),
    width,
    height,
    yaw,
    pitch,
  );

  drawAsciiSegment(
    ctx,
    origin,
    xAxis,
    "-",
    "rgba(180, 210, 255, 0.72)",
    axisSize,
  );
  drawAsciiSegment(
    ctx,
    origin,
    zAxis,
    "-",
    "rgba(180, 210, 255, 0.72)",
    axisSize,
  );
  drawAsciiSegment(
    ctx,
    origin,
    yAxis,
    "|",
    "rgba(180, 210, 255, 0.72)",
    axisSize,
  );

  ctx.font = `700 ${axisSize}px monospace`;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "rgba(210, 240, 255, 0.92)";

  const clampX = (value: number, text: string) =>
    Math.max(6, Math.min(width - text.length * axisSize * 0.62 - 6, value));
  const clampY = (value: number) => Math.max(14, Math.min(height - 8, value));

  const hpLabel = "Horsepower";
  const wtLabel = "Weight";
  const mpgLabel = "MPG";

  ctx.fillText(hpLabel, clampX(xAxis.x + 6, hpLabel), clampY(xAxis.y + 2));
  ctx.fillText(wtLabel, clampX(zAxis.x + 6, wtLabel), clampY(zAxis.y + 2));
  ctx.fillText(mpgLabel, clampX(yAxis.x + 6, mpgLabel), clampY(yAxis.y - 4));

  // Data points and animated residual hints.
  const pulse = (Math.sin(time * 0.0032) + 1) * 0.5;
  const sampleIndex = Math.floor((time * 0.0038) % LINREG_DATA.length);

  let focusMeasured: { x: number; y: number } | null = null;
  let focusPredicted: { x: number; y: number } | null = null;
  let focusResidual = 0;

  for (let i = 0; i < LINREG_DATA.length; i += 1) {
    const datum = LINREG_DATA[i];
    const measured = projectPlotPoint(
      toPlotSpace(datum.weight, datum.horsepower, datum.mpg),
      width,
      height,
      yaw,
      pitch,
    );
    const predicted = projectPlotPoint(
      toPlotSpace(
        datum.weight,
        datum.horsepower,
        linRegPredict(datum.weight, datum.horsepower),
      ),
      width,
      height,
      yaw,
      pitch,
    );

    if (i % 3 === 0 || i === sampleIndex) {
      drawAsciiSegment(
        ctx,
        measured,
        predicted,
        ":",
        i === sampleIndex
          ? `rgba(255, 238, 170, ${0.56 + pulse * 0.36})`
          : "rgba(185, 185, 142, 0.34)",
        Math.max(8, axisSize),
        i === sampleIndex ? 6 : 9,
      );
    }

    if (i === sampleIndex) {
      focusMeasured = measured;
      focusPredicted = predicted;
      focusResidual = Math.abs(
        datum.mpg - linRegPredict(datum.weight, datum.horsepower),
      );
    }

    ctx.font = `700 ${pointSize}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle =
      i === sampleIndex
        ? `rgba(235, 252, 255, ${0.78 + pulse * 0.22})`
        : "rgba(130, 205, 255, 0.95)";
    ctx.fillText("o", measured.x, measured.y);

    if (i === sampleIndex) {
      ctx.font = `700 ${Math.max(11, pointSize - 1)}px monospace`;
      ctx.fillStyle = `rgba(255, 230, 150, ${0.72 + pulse * 0.26})`;
      ctx.fillText("x", predicted.x, predicted.y);
    }
  }

  if (focusMeasured && focusPredicted) {
    const midX = (focusMeasured.x + focusPredicted.x) / 2;
    const midY = (focusMeasured.y + focusPredicted.y) / 2;
    ctx.font = `700 ${Math.max(10, axisSize)}px monospace`;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "rgba(255, 240, 175, 0.92)";
    ctx.fillText(`residual=${focusResidual.toFixed(2)}`, midX + 8, midY - 6);
  }

  const panelY = Math.max(12, height * 0.08);
  ctx.font = `700 ${Math.max(10, axisSize)}px monospace`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = "rgba(182, 236, 255, 0.9)";
  ctx.fillText(
    "LINREG MODEL: MPG = b0 + b1*Weight + b2*Horsepower",
    14,
    panelY,
  );
  ctx.fillStyle = "rgba(160, 210, 230, 0.82)";
  ctx.fillText(
    "o = measured, x = prediction, : = residual error",
    14,
    panelY + 18,
  );
}

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

function buildBirdPoints(flap: number): Point3D[] {
  const points: Point3D[] = [];

  // Body (ellipsoid)
  for (let u = 0; u < Math.PI * 2; u += 0.26) {
    for (let v = -Math.PI / 2; v <= Math.PI / 2; v += 0.32) {
      points.push({
        x: 28 * Math.cos(v) * Math.cos(u),
        y: 18 * Math.sin(v),
        z: 14 * Math.cos(v) * Math.sin(u),
        glyph: "@",
      });
    }
  }

  // Head
  for (let u = 0; u < Math.PI * 2; u += 0.36) {
    for (let v = -Math.PI / 2; v <= Math.PI / 2; v += 0.42) {
      points.push({
        x: 28 + 9 * Math.cos(v) * Math.cos(u),
        y: -8 + 9 * Math.sin(v),
        z: 7 * Math.cos(v) * Math.sin(u),
        glyph: "#",
      });
    }
  }

  // Beak
  for (let t = 0; t <= 1; t += 0.1) {
    const beakX = 36 + t * 18;
    const radius = (1 - t) * 4;
    for (let a = 0; a < Math.PI * 2; a += 0.8) {
      points.push({
        x: beakX,
        y: -8 + Math.sin(a) * radius,
        z: Math.cos(a) * radius,
        glyph: ">",
      });
    }
  }

  // Wings (animated flap)
  const wingLift = -4 - flap * 9;
  for (const side of [-1, 1] as const) {
    for (let u = 0; u <= 1; u += 0.06) {
      const curve = Math.sin(u * Math.PI);
      for (let t = -1; t <= 1; t += 0.5) {
        points.push({
          x: -4 + u * 62,
          y: wingLift - curve * (10 + flap * 4) + t * 1.4,
          z: side * (14 + u * 42 + curve * 9 + t * 3),
          glyph: u > 0.75 ? "~" : "*",
        });
      }
    }
  }

  // Tail feathers
  for (let i = -4; i <= 4; i += 1) {
    for (let t = 0; t <= 1; t += 0.12) {
      points.push({
        x: -28 - t * 24,
        y: -2 + Math.abs(i) * 0.7 - t * 2,
        z: i * 3.2 + t * i * 0.8,
        glyph: "^",
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
  const portraitAngleXRef = useRef(0);
  const portraitAngleYRef = useRef(0);

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

      if (simulationKind === "linreg") {
        drawLinRegSimulation(ctx, width, height, time, mouseX, mouseY);
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      if (simulationKind === "bird") {
        const flap = Math.sin(time * 0.012);
        const birdPoints = buildBirdPoints(flap);
        const birdScale = 1.55;

        const cx = width / 2 + mouseX * 26;
        const cy = height / 2 + mouseY * 18;
        const perspective = 340;
        const rotY = time * 0.0009 + mouseX * 0.62;
        const rotX = Math.sin(time * 0.0011) * 0.08 - mouseY * 0.3;

        const projected = birdPoints
          .map((point) => {
            let transformed = rotateY(point, rotY);
            transformed = rotateX(transformed, rotX);

            const depth = transformed.z + perspective;
            const scale = perspective / Math.max(40, depth);

            return {
              x: cx + transformed.x * scale * birdScale,
              y: cy + transformed.y * scale * birdScale,
              z: transformed.z,
              scale,
              glyph: transformed.glyph,
            };
          })
          .filter(
            (p) =>
              p.x >= -20 &&
              p.x <= width + 20 &&
              p.y >= -20 &&
              p.y <= height + 20,
          )
          .sort((a, b) => a.z - b.z);

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        for (const point of projected) {
          const alpha = Math.max(0.3, Math.min(1, 0.3 + (point.scale - 0.42)));
          const size = Math.max(9, Math.min(27, 9.8 * point.scale + 8));
          ctx.font = `700 ${size}px monospace`;
          ctx.fillStyle = `rgba(245, 238, 195, ${alpha})`;
          ctx.fillText(point.glyph, point.x, point.y);
        }

        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      if (simulationKind === "ziglaPortrait") {
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.fillRect(0, 0, width, height);

        if (portraitLoadState !== "ready" || !portraitPointsCache?.length) {
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.font = "700 14px monospace";
          ctx.fillStyle = "rgba(185, 235, 215, 0.92)";
          ctx.fillText(
            portraitLoadState === "error"
              ? "can't simulate zigla right now, cuz he disabled it, try next time."
              : "Preparing Zigla simulation...",
            width / 2,
            height / 2,
          );

          animationRef.current = requestAnimationFrame(draw);
          return;
        }

        const points3D = portraitPointsCache;
        const centerX = width / 2;
        const centerY = height / 2;
        const distance = 3.8;

        // Keep portrait readable: no full spin, only subtle side-to-side 3D motion.
        const targetY = mouseX * 0.42 + Math.sin(time * 0.001) * 0.1;
        const targetX = mouseY * 0.18;

        portraitAngleYRef.current +=
          (targetY - portraitAngleYRef.current) * 0.1;
        portraitAngleXRef.current +=
          (targetX - portraitAngleXRef.current) * 0.1;

        portraitAngleYRef.current = Math.max(
          -0.6,
          Math.min(0.6, portraitAngleYRef.current),
        );
        portraitAngleXRef.current = Math.max(
          -0.24,
          Math.min(0.24, portraitAngleXRef.current),
        );

        const angleY = portraitAngleYRef.current;
        const angleX = portraitAngleXRef.current;

        const cosY = Math.cos(angleY);
        const sinY = Math.sin(angleY);
        const cosX = Math.cos(angleX);
        const sinX = Math.sin(angleX);

        const zBuffer = new Float32Array(width * height);
        zBuffer.fill(-Infinity);

        const projectionScale = Math.min(width, height) * 1.08;
        const charSize = Math.max(7, Math.min(12, Math.floor(width / 95)));

        ctx.font = `700 ${charSize}px monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        for (const point of points3D) {
          // Rotate around Y with mouse X influence.
          const x1 = point.x * cosY - point.z * sinY;
          const z1 = point.x * sinY + point.z * cosY;

          // Rotate around X with mouse Y influence.
          const y1 = point.y * cosX - z1 * sinX;
          const z2 = point.y * sinX + z1 * cosX;

          const scale = 1 / (z2 + distance);
          const sx = Math.floor(centerX + x1 * scale * projectionScale);
          const sy = Math.floor(centerY + y1 * scale * projectionScale);

          if (sx < 0 || sx >= width || sy < 0 || sy >= height) continue;

          const zIndex = sy * width + sx;
          if (z2 <= zBuffer[zIndex]) continue;

          zBuffer[zIndex] = z2;

          const charIndex = Math.max(
            0,
            Math.min(
              PORTRAIT_ASCII.length - 1,
              Math.floor(point.b * (PORTRAIT_ASCII.length - 1)),
            ),
          );
          const char = PORTRAIT_ASCII[charIndex];

          const alpha = Math.min(1, 0.28 + (1 - point.b) * 0.75);
          ctx.fillStyle = `rgba(170, 255, 215, ${alpha})`;
          ctx.fillText(char, sx, sy);
        }

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
            : simulationKind === "bird"
              ? "move mouse to view the flapping bird in 3D"
              : simulationKind === "cnn"
                ? "move mouse to inspect cnn layers"
                : simulationKind === "linreg"
                  ? "move mouse to inspect regression surface"
                  : simulationKind === "ziglaPortrait"
                    ? "move mouse for slight side-to-side 3D view"
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
