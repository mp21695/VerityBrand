"use client";

import React, { useEffect, useRef } from "react";

interface EvidenceFieldCanvasProps {
  onStepChange?: (stepIndex: number, stepLabel: string) => void;
}

const STEP_LABELS = [
  '01 CLAIM · "guaranteed 12% returns"',
  "02 RULE · R-07 v3.0",
  "03 EVIDENCE · E-014 SEBI Code",
  "04 CONFIDENCE · 1.00 Deterministic",
  "05 HUMAN REVIEW · Awaiting Decision",
  "06 AUDIT · Publish Locked",
];

const STOPS_X = [
  { p: 0, v: 0 },
  { p: 0.32, v: -3.1 },
  { p: 0.64, v: 3.2 },
  { p: 1, v: 0 },
];

const STOPS_Y = [
  { p: 0, v: -4.5 },
  { p: 0.32, v: 0.55 },
  { p: 0.64, v: 0.45 },
  { p: 1, v: 0.15 },
];

const STOPS_S = [
  { p: 0, v: 2.15 },
  { p: 0.32, v: 1.0 },
  { p: 0.64, v: 0.92 },
  { p: 1, v: 1.12 },
];

function smoothstep(min: number, max: number, value: number) {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

function sampleStops(stops: { p: number; v: number }[], p: number) {
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    if (p >= a.p && p <= b.p) {
      const t = smoothstep(a.p, b.p, p);
      return a.v + (b.v - a.v) * t;
    }
  }
  return stops[stops.length - 1].v;
}

export default function EvidenceFieldCanvas({
  onStepChange,
}: EvidenceFieldCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    interface Vec3 {
      x: number;
      y: number;
      z: number;
    }

    function rotatePoint(p: Vec3, rx: number, ry: number, rz: number): Vec3 {
      const x1 = p.x * Math.cos(rz) - p.y * Math.sin(rz);
      const y1 = p.x * Math.sin(rz) + p.y * Math.cos(rz);
      const z1 = p.z;
      const y2 = y1 * Math.cos(rx) - z1 * Math.sin(rx);
      const z2 = y1 * Math.sin(rx) + z1 * Math.cos(rx);
      const x2 = x1;
      const x3 = x2 * Math.cos(ry) + z2 * Math.sin(ry);
      const z3 = -x2 * Math.sin(ry) + z2 * Math.cos(ry);
      return { x: x3, y: y2, z: z3 };
    }

    const cameraZ = 11.5;
    const fovScale = 0.85;
    function project(
      localPt: Vec3,
      worldPos: Vec3,
      worldScale: number,
      worldRotX: number,
      worldRotY: number
    ) {
      const rotated = rotatePoint(localPt, worldRotX, worldRotY, 0);
      const wx = rotated.x * worldScale + worldPos.x;
      const wy = rotated.y * worldScale + worldPos.y;
      const wz = rotated.z * worldScale + worldPos.z;

      const dist = cameraZ - wz;
      if (dist <= 0.2) return null;

      const scaleFactor = (Math.min(width, height) * fovScale) / dist;
      const sx = width * 0.5 + wx * scaleFactor;
      const sy = height * 0.5 - wy * scaleFactor;
      return { sx, sy, scale: scaleFactor, depth: dist, wz };
    }

    // Blue & Deep Navy Palette:
    // Primary blue:    #3395FF
    // Secondary blue:  #528FF0
    // Deep navy:       #192839
    // White:           #FFFFFF
    // Light blue tint: #B4CDFD
    const orbits = [
      { rx: 5.6, ry: 2.3, rotX: 0.62, rotY: -0.22, rotZ: 0.14, op: 0.22, color: "#3395FF", speed: 0.03 },
      { rx: 7.2, ry: 3.1, rotX: -0.48, rotY: 0.31, rotZ: -0.2, op: 0.15, color: "#528FF0", speed: -0.024 },
      { rx: 8.8, ry: 3.9, rotX: 0.35, rotY: 0.12, rotZ: 0.28, op: 0.1, color: "#B4CDFD", speed: 0.018 },
      { rx: 4.2, ry: 1.85, rotX: -0.7, rotY: -0.35, rotZ: -0.1, op: 0.24, color: "#3395FF", speed: -0.035 },
    ];

    const nodes = [
      {
        id: "CLAIM",
        top: "CLAIM",
        main: '"guaranteed 12% returns"',
        pos: { x: -2.7, y: 1.35, z: 1.1 },
        color: "#3395FF",
        stepIndex: 0,
        phase: 0.2,
      },
      {
        id: "RULE",
        top: "RULE · R-07",
        main: "Guaranteed return prohibited",
        pos: { x: 2.6, y: 1.45, z: 0.85 },
        color: "#528FF0",
        stepIndex: 1,
        phase: 1.3,
      },
      {
        id: "EVIDENCE",
        top: "EVIDENCE · E-014",
        main: "SEBI Advertising Code",
        pos: { x: 3.35, y: -0.25, z: 0.45 },
        color: "#3395FF",
        stepIndex: 2,
        phase: 2.4,
      },
      {
        id: "CONFIDENCE",
        top: "CONFIDENCE · 1.00",
        main: "Deterministic Match",
        pos: { x: 1.95, y: -1.65, z: 0.95 },
        color: "#B4CDFD",
        stepIndex: 3,
        phase: 3.5,
      },
      {
        id: "HUMAN REVIEW",
        top: "HUMAN REVIEW",
        main: "Awaiting Decision",
        pos: { x: -2.15, y: -1.55, z: 1.05 },
        color: "#528FF0",
        stepIndex: 4,
        phase: 4.6,
      },
      {
        id: "AUDIT",
        top: "AUDIT · v3",
        main: "Publish Locked",
        pos: { x: -3.45, y: -0.15, z: 0.55 },
        color: "#3395FF",
        stepIndex: 5,
        phase: 5.7,
      },
    ];

    const particleCount = width <= 560 ? 220 : 420;
    const particles = Array.from({ length: particleCount }, (_, i) => {
      const r = 1.4 + Math.random() * 8.5;
      const theta = Math.random() * Math.PI * 2;
      return {
        x: Math.cos(theta) * r,
        y: (Math.random() - 0.5) * 5.2,
        z: (Math.random() - 0.5) * 5.4,
        size: 1.0 + Math.random() * 1.5,
        alpha: 0.16 + Math.random() * 0.48,
        color: i % 3 === 0 ? "#FFFFFF" : i % 2 === 0 ? "#3395FF" : "#B4CDFD",
      };
    });

    let curX = 0;
    let curY = -6.5;
    let curS = 2.15;
    const startTime = performance.now();
    let prevTime = startTime;
    let lastStep = -1;

    let mouseX = 0;
    let mouseY = 0;
    const onPointerMove = (e: PointerEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 0.2;
      mouseY = -(e.clientY / window.innerHeight - 0.5) * 0.15;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    let frameId: number;

    const renderFrame = (now: number) => {
      frameId = requestAnimationFrame(renderFrame);

      const dt = Math.min(0.05, (now - prevTime) / 1000);
      prevTime = now;
      const elapsed = (now - startTime) / 1000;

      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      const p = Math.max(0, Math.min(1, window.scrollY / maxScroll));

      const lateralFactor = width <= 980 ? 0.45 : 1.0;
      const targetScrollX = sampleStops(STOPS_X, p) * lateralFactor;
      const targetScrollY = sampleStops(STOPS_Y, p);
      const targetScrollS =
        sampleStops(STOPS_S, p) * (width <= 560 ? 0.78 : 1.0);

      const entranceT = Math.min(1, elapsed / 1.9);
      const entranceEase = 1 - Math.pow(1 - entranceT, 3);
      const entranceOffsetY = (1 - entranceEase) * -2.0;

      const finalTargetX = targetScrollX + mouseX;
      const finalTargetY = targetScrollY + entranceOffsetY + mouseY;

      const damp = Math.min(1, dt * 3.2);
      curX += (finalTargetX - curX) * damp;
      curY += (finalTargetY - curY) * damp;
      curS += (targetScrollS - curS) * damp;

      const worldPos: Vec3 = { x: curX, y: curY, z: 0 };
      const worldRotY = p * 0.42 + Math.sin(elapsed * 0.14) * 0.06;
      const worldRotX = p * 0.18;

      const activeStep = Math.floor(elapsed / 3.4) % 6;
      if (activeStep !== lastStep) {
        lastStep = activeStep;
        if (onStepChange) {
          onStepChange(activeStep, STEP_LABELS[activeStep]);
        }
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const coreProj = project(
        { x: 0, y: 0, z: 0 },
        worldPos,
        curS,
        worldRotX,
        worldRotY
      );

      // 1. Atmospheric Primary & Secondary Blue Glow
      if (coreProj) {
        const glowRadius = Math.max(width, height) * 0.52 * (curS / 1.5);
        const radGrad = ctx.createRadialGradient(
          coreProj.sx,
          coreProj.sy,
          10,
          coreProj.sx,
          coreProj.sy,
          glowRadius
        );
        radGrad.addColorStop(0, "rgba(51, 149, 255, 0.22)");
        radGrad.addColorStop(0.45, "rgba(82, 143, 240, 0.1)");
        radGrad.addColorStop(1, "rgba(25, 40, 57, 0)");
        ctx.fillStyle = radGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // 2. Ambient Data Particles
      const particleRotY = elapsed * 0.022;
      particles.forEach((pt) => {
        const rp = rotatePoint(pt, 0, particleRotY, 0);
        const proj = project(rp, worldPos, curS, worldRotX, worldRotY);
        if (!proj) return;
        if (
          proj.sx < -20 ||
          proj.sx > width + 20 ||
          proj.sy < -20 ||
          proj.sy > height + 20
        )
          return;
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = pt.alpha * Math.min(1, 9 / proj.depth);
        ctx.beginPath();
        ctx.arc(proj.sx, proj.sy, pt.size * (curS * 0.62), 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // 3. Elliptical Orbital Paths
      orbits.forEach((orb) => {
        ctx.beginPath();
        const steps = 96;
        let started = false;
        const dynamicRotZ = orb.rotZ + elapsed * orb.speed;
        for (let i = 0; i <= steps; i++) {
          const a = (i / steps) * Math.PI * 2;
          const localPt = rotatePoint(
            { x: Math.cos(a) * orb.rx, y: Math.sin(a) * orb.ry, z: 0 },
            orb.rotX,
            orb.rotY,
            dynamicRotZ
          );
          const proj = project(localPt, worldPos, curS, worldRotX, worldRotY);
          if (!proj) continue;
          if (!started) {
            ctx.moveTo(proj.sx, proj.sy);
            started = true;
          } else {
            ctx.lineTo(proj.sx, proj.sy);
          }
        }
        ctx.strokeStyle = orb.color;
        ctx.globalAlpha = orb.op;
        ctx.lineWidth = 1.0;
        ctx.stroke();
      });
      ctx.globalAlpha = 1;

      // 4. Connection Filaments & Traveling Blue/White Pulses
      const projectedNodes = nodes.map((n, idx) => {
        const drifted: Vec3 = {
          x: n.pos.x + Math.cos(elapsed * 0.65 + n.phase) * 0.05,
          y: n.pos.y + Math.sin(elapsed * 0.85 + n.phase) * 0.07,
          z: n.pos.z,
        };
        const proj = project(drifted, worldPos, curS, worldRotX, worldRotY);
        return { node: n, drifted, proj, idx };
      });

      if (coreProj) {
        projectedNodes.forEach(({ node, proj, idx }) => {
          if (!proj) return;
          const isHighlighted = node.stepIndex === activeStep;

          const ctrlX =
            (proj.sx + coreProj.sx) * 0.5 + (idx % 2 === 0 ? 32 : -32);
          const ctrlY = (proj.sy + coreProj.sy) * 0.5 - 24;

          ctx.beginPath();
          ctx.moveTo(proj.sx, proj.sy);
          ctx.quadraticCurveTo(ctrlX, ctrlY, coreProj.sx, coreProj.sy);
          ctx.strokeStyle = isHighlighted ? "#3395FF" : "#B4CDFD";
          ctx.globalAlpha = isHighlighted ? 0.72 : 0.16;
          ctx.lineWidth = isHighlighted ? 1.6 : 0.85;
          ctx.stroke();

          // Traveling pulse particle
          const t = (elapsed * (isHighlighted ? 0.38 : 0.2) + idx * 0.17) % 1;
          const invT = 1 - t;
          const px =
            invT * invT * proj.sx +
            2 * invT * t * ctrlX +
            t * t * coreProj.sx;
          const py =
            invT * invT * proj.sy +
            2 * invT * t * ctrlY +
            t * t * coreProj.sy;

          ctx.globalAlpha = isHighlighted ? 1.0 : 0.5;
          ctx.fillStyle = isHighlighted ? "#FFFFFF" : "#3395FF";
          ctx.beginPath();
          ctx.arc(px, py, isHighlighted ? 3.2 : 2.0, 0, Math.PI * 2);
          ctx.fill();
        });
      }
      ctx.globalAlpha = 1;

      // 5. Central Verification Nucleus
      if (coreProj) {
        const baseR = 54 * curS;
        const pulse = 1 + Math.sin(elapsed * 1.5) * 0.035;

        [0.75, 1.05, 1.38].forEach((mult, rIdx) => {
          ctx.beginPath();
          ctx.arc(
            coreProj.sx,
            coreProj.sy,
            baseR * mult * pulse,
            0,
            Math.PI * 2
          );
          ctx.strokeStyle = rIdx === 0 ? "#3395FF" : "#B4CDFD";
          ctx.globalAlpha = rIdx === 0 ? 0.7 : 0.24 - rIdx * 0.05;
          ctx.lineWidth = rIdx === 0 ? 1.5 : 0.9;
          ctx.stroke();
        });

        ctx.globalAlpha = 0.94;
        ctx.fillStyle = "#142130";
        ctx.beginPath();
        ctx.arc(coreProj.sx, coreProj.sy, baseR * 0.72, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1;
        ctx.textAlign = "center";
        ctx.font = '600 9px "JetBrains Mono", monospace';
        ctx.fillStyle = "#3395FF";
        ctx.fillText("BRANDPROOF", coreProj.sx, coreProj.sy - 13);

        ctx.font = '500 15px "Playfair Display", Georgia, serif';
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText("VERIFICATION", coreProj.sx, coreProj.sy + 4);

        ctx.font = 'italic 13px "Playfair Display", Georgia, serif';
        ctx.fillStyle = "#B4CDFD";
        ctx.fillText("CORE", coreProj.sx, coreProj.sy + 20);
        ctx.textAlign = "left";
      }

      // 6. Floating Evidence Nodes
      projectedNodes
        .filter((item) => item.proj !== null)
        .sort((a, b) => b.proj!.depth - a.proj!.depth)
        .forEach(({ node, proj }) => {
          if (!proj) return;
          const isHighlighted = node.stepIndex === activeStep;
          const cardAlpha = isHighlighted ? 1.0 : 0.78;

          ctx.save();
          ctx.globalAlpha = cardAlpha;

          ctx.fillStyle = isHighlighted ? "#3395FF" : "#B4CDFD";
          ctx.beginPath();
          ctx.arc(proj.sx, proj.sy, isHighlighted ? 4.2 : 2.8, 0, Math.PI * 2);
          ctx.fill();

          const boxW = 186;
          const boxH = 44;
          const bx = proj.sx - boxW * 0.5;
          const by = proj.sy - boxH - 10;

          ctx.fillStyle = "rgba(25, 40, 57, 0.88)";
          ctx.strokeStyle = isHighlighted
            ? "#3395FF"
            : "rgba(180, 205, 253, 0.25)";
          ctx.lineWidth = isHighlighted ? 1.5 : 1;

          ctx.beginPath();
          ctx.roundRect(bx, by, boxW, boxH, 8);
          ctx.fill();
          ctx.stroke();

          ctx.font = '600 9px "JetBrains Mono", monospace';
          ctx.fillStyle = isHighlighted ? "#3395FF" : "#B4CDFD";
          ctx.fillText(node.top, bx + 11, by + 16);

          ctx.font = '500 11.5px "Inter", sans-serif';
          ctx.fillStyle = "#FFFFFF";
          ctx.fillText(node.main, bx + 11, by + 34);

          ctx.restore();
        });

      ctx.restore();
    };

    frameId = requestAnimationFrame(renderFrame);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [onStepChange]);

  return <canvas ref={canvasRef} className="evidence-canvas" />;
}
