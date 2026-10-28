"use client";

import React, { useState, useEffect } from "react";

interface VerificationStep {
  step: number;
  tag: string;
  nodeId: string;
  headline: string;
  subline: string;
  metaLeft: string;
  metaRight: string;
  accent: "emerald" | "critical" | "amber" | "teal";
}

const VERIFICATION_STEPS: VerificationStep[] = [
  {
    step: 1,
    tag: "STEP 01 // CLAIM DETECTED",
    nodeId: "CLAIM",
    headline: '"guaranteed 12% returns"',
    subline: "Extracted from Arthaa Gold Savings Fund Q4 Launch Copy · Span [22..44]",
    metaLeft: "INGEST_STREAM: ACTIVE",
    metaRight: "TYPE: RETURN_PROMISE",
    accent: "emerald",
  },
  {
    step: 2,
    tag: "STEP 02 // RULE RETRIEVED",
    nodeId: "RULE",
    headline: "RULE R-07 · v3.0",
    subline: '"Guaranteed return promise prohibited"',
    metaLeft: "ENGINE: DETERMINISTIC_AST",
    metaRight: "SEVERITY: CRITICAL",
    accent: "critical",
  },
  {
    step: 3,
    tag: "STEP 03 // EVIDENCE LINKED",
    nodeId: "EVIDENCE",
    headline: "EVIDENCE E-014",
    subline: "SEBI Advertising Code & Approved Brand Guidelines v3.0",
    metaLeft: "PGVECTOR_INDEX: MATCHED",
    metaRight: "FACT F-021: EXPIRY_CHECKED",
    accent: "teal",
  },
  {
    step: 4,
    tag: "STEP 04 // CERTAINTY CALIBRATED",
    nodeId: "CONFIDENCE",
    headline: "CONFIDENCE 1.00",
    subline: "DETERMINISTIC · Zero-hallucination rule match verified",
    metaLeft: "ABSTENTION_THRESHOLD: 0.85",
    metaRight: "VERDICT: CONFIRMED_VIOLATION",
    accent: "emerald",
  },
  {
    step: 5,
    tag: "STEP 05 // ROUTED TO AUTHORITY",
    nodeId: "HUMAN REVIEW",
    headline: "HUMAN REVIEW",
    subline: "AWAITING DECISION · Assigned to Arjun M. (Accept / Edit / Dismiss)",
    metaLeft: "INTENT_FIX: READY",
    metaRight: "SILENT_REWRITE: BLOCKED",
    accent: "amber",
  },
  {
    step: 6,
    tag: "STEP 06 // IMMUTABLE GATE STATE",
    nodeId: "AUDIT",
    headline: "PUBLISH LOCKED",
    subline: "Asset locked until human sign-off · Traceable to Audit Trail AUD-904",
    metaLeft: "GATE_STATUS: LOCKED",
    metaRight: "AUDIT_TRAIL: VERSION_PINNED",
    accent: "critical",
  },
];

interface SpatialNode {
  id: string;
  label: string;
  sublabel: string;
  x: number; // SVG coordinate 0..800
  y: number; // SVG coordinate 0..680
  depth: "near" | "mid" | "far"; // Controls scale, blur, opacity for 2.5D depth
  stepHighlight?: number[]; // Which verification steps highlight this node
  orbitClass: string;
}

const SPATIAL_NODES: SpatialNode[] = [
  {
    id: "CLAIM",
    label: "CLAIM",
    sublabel: '"guaranteed 12% returns"',
    x: 145,
    y: 165,
    depth: "near",
    stepHighlight: [1],
    orbitClass: "animate-orbit-slow-1",
  },
  {
    id: "RULE",
    label: "RULE",
    sublabel: "R-07 · v3.0",
    x: 645,
    y: 150,
    depth: "near",
    stepHighlight: [2],
    orbitClass: "animate-orbit-slow-2",
  },
  {
    id: "EVIDENCE",
    label: "EVIDENCE",
    sublabel: "E-014 · SEBI Ad Code",
    x: 685,
    y: 365,
    depth: "near",
    stepHighlight: [3],
    orbitClass: "animate-orbit-slow-3",
  },
  {
    id: "FACT",
    label: "FACT",
    sublabel: "F-021 · Ledger Record",
    x: 220,
    y: 85,
    depth: "far",
    stepHighlight: [3],
    orbitClass: "animate-orbit-slow-2",
  },
  {
    id: "EXPIRY",
    label: "EXPIRY",
    sublabel: "30 JUN 2026 · Lapsed",
    x: 600,
    y: 82,
    depth: "far",
    stepHighlight: [3],
    orbitClass: "animate-orbit-slow-1",
  },
  {
    id: "CONFIDENCE",
    label: "CONFIDENCE",
    sublabel: "1.00 · DETERMINISTIC",
    x: 615,
    y: 545,
    depth: "mid",
    stepHighlight: [4],
    orbitClass: "animate-orbit-slow-1",
  },
  {
    id: "HUMAN REVIEW",
    label: "HUMAN REVIEW",
    sublabel: "AWAITING DECISION",
    x: 175,
    y: 540,
    depth: "near",
    stepHighlight: [5],
    orbitClass: "animate-orbit-slow-3",
  },
  {
    id: "AUDIT",
    label: "AUDIT",
    sublabel: "PUBLISH LOCKED · v3",
    x: 110,
    y: 360,
    depth: "mid",
    stepHighlight: [6],
    orbitClass: "animate-orbit-slow-2",
  },
];

// Center of the 800x680 SVG canvas
const CORE_X = 400;
const CORE_Y = 335;

export default function EvidenceVerificationCore({
  onLaunchWorkspace,
}: {
  onLaunchWorkspace?: () => void;
}) {
  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Slow, deliberate, mechanical progression through the 6 verification steps
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveStepIdx((prev) => (prev + 1) % VERIFICATION_STEPS.length);
    }, 3600);
    return () => clearInterval(timer);
  }, [isPaused]);

  const currentStep = VERIFICATION_STEPS[activeStepIdx];

  return (
    <div
      className="relative w-full select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Outer 2.5D Spatial Viewport Container */}
      <div className="relative w-full h-[560px] sm:h-[640px] lg:h-[680px] rounded-lg border border-cannoli/[0.08] bg-[#050807]/90 overflow-hidden">
        {/* Deep Atmospheric Radial Illumination Behind Core */}
        <div
          className="pointer-events-none absolute left-1/2 top-[48%] -translate-x-1/2 -translate-y-1/2 w-[460px] h-[460px] rounded-full transition-all duration-1000 blur-[110px]"
          style={{
            background:
              currentStep.accent === "critical"
                ? "radial-gradient(circle, rgba(255,43,117,0.14) 0%, rgba(0,217,154,0.06) 55%, transparent 75%)"
                : currentStep.accent === "amber"
                ? "radial-gradient(circle, rgba(231,184,75,0.14) 0%, rgba(0,217,154,0.06) 55%, transparent 75%)"
                : "radial-gradient(circle, rgba(0,217,154,0.16) 0%, rgba(19,207,160,0.05) 55%, transparent 75%)",
          }}
        />

        {/* Fine Subgrid & Depth Vignette */}
        <div className="pointer-events-none absolute inset-0 bg-fine-subgrid opacity-55" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 48%, transparent 38%, rgba(5, 8, 7, 0.88) 100%)",
          }}
        />

        {/* Top Telemetry Bar Inside Viewport */}
        <div className="relative z-20 flex items-center justify-between px-5 py-3.5 border-b border-cannoli/[0.06] font-mono text-[10px] tracking-[0.16em] uppercase text-cannoli-muted">
          <div className="flex items-center gap-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-forest-vivid animate-pulse" />
            <span className="text-cannoli">EVIDENCE VERIFICATION CORE</span>
            <span className="text-cannoli-dim hidden sm:inline">
              // ENGINE_V3.0
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-forest-vivid">
              CLAIM → EVIDENCE → RULE → CONFIDENCE → DECISION → AUDIT
            </span>
          </div>
        </div>

        {/* 2.5D SVG Orbital Conduit & Particle Layer */}
        <svg
          viewBox="0 0 800 680"
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* Glowing Emerald Line Gradient */}
            <linearGradient id="coreLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00D99A" stopOpacity="0.08" />
              <stop offset="50%" stopColor="#00D99A" stopOpacity="0.38" />
              <stop offset="100%" stopColor="#13CFA0" stopOpacity="0.08" />
            </linearGradient>

            {/* Active Beam Gradient */}
            <linearGradient id="activeBeamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00D99A" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#A6FF3D" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#00D99A" stopOpacity="0.25" />
            </linearGradient>

            {/* Critical Lock Beam Gradient */}
            <linearGradient id="criticalBeamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF2B75" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#00D99A" stopOpacity="0.3" />
            </linearGradient>

            <filter id="emeraldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 3D Perspective Orbital Rings around Central Core */}
          <g transform={`translate(${CORE_X}, ${CORE_Y})`}>
            {/* Outer tilted orbital plane */}
            <ellipse
              cx="0"
              cy="0"
              rx="310"
              ry="195"
              fill="none"
              stroke="rgba(242, 244, 241, 0.045)"
              strokeWidth="1"
              strokeDasharray="3 9"
              transform="rotate(-14)"
            />
            {/* Mid orbital ring */}
            <ellipse
              cx="0"
              cy="0"
              rx="235"
              ry="150"
              fill="none"
              stroke="rgba(0, 217, 154, 0.11)"
              strokeWidth="0.75"
              transform="rotate(11)"
            />
            {/* Inner verification horizon ring */}
            <circle
              cx="0"
              cy="0"
              r="118"
              fill="none"
              stroke="rgba(0, 217, 154, 0.16)"
              strokeWidth="0.75"
              strokeDasharray="2 6"
            />
            {/* Core containment ring */}
            <circle
              cx="0"
              cy="0"
              r="82"
              fill="rgba(7, 16, 13, 0.85)"
              stroke={
                currentStep.accent === "critical"
                  ? "rgba(255, 43, 117, 0.55)"
                  : "rgba(0, 217, 154, 0.45)"
              }
              strokeWidth="1.2"
            />
          </g>

          {/* Thin Glowing Emerald Connection Lines from Every Node to Central Core + Outer Ring Links */}
          {SPATIAL_NODES.map((node, index) => {
            const isHighlighted = node.stepHighlight?.includes(currentStep.step);
            const isPassed =
              node.stepHighlight &&
              node.stepHighlight[0] < currentStep.step;

            // Curved quadratic bezier path between node and core for organic 2.5D depth
            const midX = (node.x + CORE_X) / 2 + (index % 2 === 0 ? 22 : -22);
            const midY = (node.y + CORE_Y) / 2 + (index % 2 === 0 ? -18 : 18);
            const pathData = `M ${node.x} ${node.y} Q ${midX} ${midY} ${CORE_X} ${CORE_Y}`;

            return (
              <g key={`conduit-${node.id}`}>
                {/* Base thin filament */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={
                    isHighlighted
                      ? currentStep.accent === "critical"
                        ? "url(#criticalBeamGrad)"
                        : "url(#activeBeamGrad)"
                      : isPassed
                      ? "rgba(0, 217, 154, 0.26)"
                      : "rgba(0, 217, 154, 0.09)"
                  }
                  strokeWidth={isHighlighted ? "1.6" : "0.85"}
                  filter={isHighlighted ? "url(#emeraldGlow)" : undefined}
                />

                {/* Travelling luminous particle along the connection path */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={
                    isHighlighted
                      ? currentStep.accent === "critical"
                        ? "#FF2B75"
                        : "#A6FF3D"
                      : "#00D99A"
                  }
                  strokeWidth={isHighlighted ? "2.4" : "1.3"}
                  strokeLinecap="round"
                  className={
                    isHighlighted
                      ? "animate-core-particle-fast"
                      : "animate-core-particle-slow"
                  }
                  style={{
                    opacity: isHighlighted ? 1 : node.depth === "far" ? 0.25 : 0.5,
                  }}
                />
              </g>
            );
          })}

          {/* Sequential Perimeter Trace Connecting CLAIM -> RULE -> EVIDENCE -> CONFIDENCE -> HUMAN REVIEW -> AUDIT */}
          <path
            d="M 145 165 L 645 150 L 685 365 L 615 545 L 175 540 L 110 360 Z"
            fill="none"
            stroke="rgba(0, 217, 154, 0.07)"
            strokeWidth="0.75"
            strokeDasharray="4 8"
          />
        </svg>

        {/* CENTRAL LUMINOUS VERIFICATION CORE */}
        <div
          className="absolute left-1/2 top-[49%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center text-center pointer-events-none"
          style={{ width: "176px", height: "176px" }}
        >
          {/* Slow pulsing outer halo */}
          <div
            className={`absolute inset-0 rounded-full transition-all duration-1000 animate-pulse-glow ${
              currentStep.accent === "critical"
                ? "bg-[#FF2B75]/15 shadow-[0_0_60px_rgba(255,43,117,0.3)]"
                : "bg-forest-vivid/15 shadow-[0_0_60px_rgba(0,217,154,0.32)]"
            }`}
          />

          {/* Core Glass Sphere */}
          <div
            className={`relative flex flex-col items-center justify-center w-36 h-36 rounded-full border backdrop-blur-xl transition-all duration-700 ${
              currentStep.accent === "critical"
                ? "border-[#FF2B75]/50 bg-[#080D0B]/95 shadow-[inset_0_0_28px_rgba(255,43,117,0.2)]"
                : "border-forest-vivid/50 bg-[#060E0B]/95 shadow-[inset_0_0_28px_rgba(0,217,154,0.22)]"
            }`}
          >
            <span className="font-mono text-[9px] tracking-[0.24em] uppercase text-forest-vivid">
              VERITYBRAND
            </span>
            <span className="mt-1 font-serif text-lg tracking-tight text-cannoli leading-none">
              VERIFICATION
            </span>
            <span className="font-serif italic text-base text-forest-vivid leading-tight">
              CORE
            </span>

            {/* Live step status pill inside core */}
            <div className="mt-2.5 rounded-sm border border-cannoli/[0.12] bg-[#050807] px-2 py-0.5 font-mono text-[9px] tracking-widest uppercase">
              {currentStep.step === 6 ? (
                <span className="text-[#FF2B75]">LOCKED</span>
              ) : (
                <span className="text-forest-vivid">
                  STEP 0{currentStep.step}/06
                </span>
              )}
            </div>
          </div>
        </div>

        {/* FLOATING 2.5D ORBITAL DATA NODES */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          {SPATIAL_NODES.map((node) => {
            const isHighlighted = node.stepHighlight?.includes(currentStep.step);
            const isPassed =
              node.stepHighlight &&
              node.stepHighlight[0] < currentStep.step;

            // Convert 800x680 coordinate space to percentage positioning
            const leftPct = `${(node.x / 800) * 100}%`;
            const topPct = `${(node.y / 680) * 100}%`;

            // 2.5D Depth styling (near = sharp/bright, mid = balanced, far = smaller/dimmer/blurred)
            const depthStyles =
              node.depth === "near"
                ? "scale-100 opacity-95"
                : node.depth === "mid"
                ? "scale-95 opacity-80"
                : "scale-90 opacity-45 blur-[0.4px] hidden sm:flex";

            return (
              <div
                key={node.id}
                style={{ left: leftPct, top: topPct }}
                onClick={() => {
                  if (node.stepHighlight && node.stepHighlight[0]) {
                    setActiveStepIdx(node.stepHighlight[0] - 1);
                  }
                }}
                className={`pointer-events-auto -translate-x-1/2 -translate-y-1/2 absolute transition-all duration-700 cursor-pointer ${depthStyles} ${node.orbitClass}`}
              >
                <div
                  className={`rounded border px-3 py-2 backdrop-blur-md transition-all duration-700 ${
                    isHighlighted
                      ? currentStep.accent === "critical"
                        ? "border-[#FF2B75] bg-[#14070C]/95 shadow-[0_0_28px_rgba(255,43,117,0.35)] scale-105"
                        : currentStep.accent === "amber"
                        ? "border-[#E7B84B] bg-[#141006]/95 shadow-[0_0_28px_rgba(231,184,75,0.3)] scale-105"
                        : "border-forest-vivid bg-[#071712]/95 shadow-[0_0_28px_rgba(0,217,154,0.35)] scale-105"
                      : isPassed
                      ? "border-forest-vivid/35 bg-[#07100D]/85"
                      : "border-cannoli/[0.09] bg-[#050807]/80 hover:border-cannoli/25"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isHighlighted
                          ? currentStep.accent === "critical"
                            ? "bg-[#FF2B75] animate-ping"
                            : "bg-forest-vivid animate-ping"
                          : isPassed
                          ? "bg-forest-vivid"
                          : "bg-cannoli-dim"
                      }`}
                    />
                    <span
                      className={`font-mono text-[10px] tracking-[0.16em] uppercase font-semibold ${
                        isHighlighted
                          ? currentStep.accent === "critical"
                            ? "text-[#FF2B75]"
                            : currentStep.accent === "amber"
                            ? "text-[#E7B84B]"
                            : "text-forest-vivid"
                          : "text-cannoli"
                      }`}
                    >
                      {node.label}
                    </span>
                  </div>
                  <div className="mt-0.5 font-mono text-[10px] text-cannoli-muted whitespace-nowrap">
                    {node.sublabel}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* LIVE DEMONSTRATION HUD AT BOTTOM OF CORE VIEWPORT */}
        <div className="absolute bottom-0 inset-x-0 z-30 border-t border-cannoli/[0.08] bg-[#050807]/95 backdrop-blur-xl p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Left: Active Step Explanation */}
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 font-mono text-[10px] tracking-[0.16em] uppercase">
                <span
                  className={
                    currentStep.accent === "critical"
                      ? "text-[#FF2B75]"
                      : currentStep.accent === "amber"
                      ? "text-[#E7B84B]"
                      : "text-forest-vivid"
                  }
                >
                  {currentStep.tag}
                </span>
                <span className="text-cannoli-dim">•</span>
                <span className="text-cannoli-dim">{currentStep.metaLeft}</span>
              </div>

              <div className="flex flex-wrap items-baseline gap-3">
                <span
                  className={`font-serif text-2xl sm:text-3xl tracking-tight ${
                    currentStep.accent === "critical"
                      ? "text-[#FF2B75]"
                      : currentStep.accent === "amber"
                      ? "text-[#E7B84B]"
                      : "text-cannoli"
                  }`}
                >
                  {currentStep.headline}
                </span>
                <span className="text-xs text-cannoli-muted">
                  {currentStep.subline}
                </span>
              </div>
            </div>

            {/* Right: 6-Step Interactive Scrubber */}
            <div className="flex flex-col items-start sm:items-end justify-between gap-2 shrink-0">
              <div className="font-mono text-[10px] text-cannoli-dim uppercase tracking-wider">
                {currentStep.metaRight}
              </div>
              <div className="flex items-center gap-1.5">
                {VERIFICATION_STEPS.map((s, idx) => {
                  const active = idx === activeStepIdx;
                  return (
                    <button
                      key={s.step}
                      onClick={() => setActiveStepIdx(idx)}
                      className={`h-6 px-2 rounded-sm font-mono text-[10px] transition-all border ${
                        active
                          ? s.accent === "critical"
                            ? "border-[#FF2B75] bg-[#FF2B75]/20 text-[#FF2B75]"
                            : "border-forest-vivid bg-forest-vivid text-obsidian font-semibold"
                          : idx < activeStepIdx
                          ? "border-forest-vivid/30 bg-forest-vivid/10 text-forest-vivid"
                          : "border-cannoli/10 bg-white/[0.02] text-cannoli-dim hover:text-cannoli"
                      }`}
                      title={`${s.tag}: ${s.headline}`}
                    >
                      0{s.step}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
