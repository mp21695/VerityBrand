"use client";

import React, { useEffect, useState, useRef } from "react";
import { Check, Edit3, Lock, Unlock, ShieldCheck, RotateCcw } from "lucide-react";
import { FindingRecord } from "@/data/mockData";

// 1. SectionLabel — Restrained monospace technical label
export function SectionLabel({
  index,
  label,
  rightMeta,
}: {
  index?: string;
  label: string;
  rightMeta?: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-[#B4CDFD]/20 pb-3 mb-8 font-mono text-[11px] tracking-[0.16em] uppercase text-[#B4CDFD]">
      <div className="flex items-center gap-3">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#3395FF]" />
        {index && <span className="text-[#3395FF]">{index}</span>}
        {index && <span className="text-[#B4CDFD]/60">/</span>}
        <span>{label}</span>
      </div>
      {rightMeta && <span className="text-[#B4CDFD]/60 hidden sm:inline">{rightMeta}</span>}
    </div>
  );
}

// 2. GlassPanel — 1px subtle border, translucent dark surface, optional hover lift
export function GlassPanel({
  children,
  className = "",
  variant = "default",
  hoverLift = true,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "critical" | "amber" | "emerald";
  hoverLift?: boolean;
  onClick?: () => void;
}) {
  const borderVariant =
    variant === "critical"
      ? "border-[#3395FF]/45 hover:border-[#3395FF]/75"
      : variant === "amber"
      ? "border-[#528FF0]/45 hover:border-[#528FF0]/75"
      : variant === "emerald"
      ? "border-[#3395FF]/35 hover:border-[#3395FF]/65"
      : "border-[#B4CDFD]/20 hover:border-[#3395FF]/40";

  return (
    <div
      onClick={onClick}
      className={`glass-panel rounded-lg ${borderVariant} ${
        hoverLift ? "hover:-translate-y-0.5" : ""
      } ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

// 3. Navbar — Sticky/fixed translucent navigation that deepens on scroll
export function Navbar({
  onLaunchWorkspace,
  onOpenDocs,
  verifiedCount = 412,
}: {
  onLaunchWorkspace: () => void;
  onOpenDocs: () => void;
  verifiedCount?: number;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 28);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#192839]/90 border-b border-[#B4CDFD]/20 backdrop-blur-xl py-3"
          : "bg-[#192839]/45 border-b border-[#B4CDFD]/10 backdrop-blur-md py-4"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-3.5">
          <a href="#" className="flex items-center gap-2.5 group">
            <span className="flex h-7 w-7 items-center justify-center rounded border border-[#3395FF]/40 bg-[#192839] text-[#3395FF] transition-colors group-hover:border-[#3395FF]">
              <ShieldCheck className="h-3.5 w-3.5" />
            </span>
            <span className="font-serif text-xl tracking-tight text-[#FFFFFF]">
              BrandProof
            </span>
          </a>
          <span className="rounded bg-[#B4CDFD] px-2 py-0.5 font-mono text-[10px] font-semibold tracking-[0.12em] uppercase text-[#2A2A2A]">
            GOVERNANCE PLATFORM
          </span>
        </div>

        <nav className="hidden lg:flex items-center gap-8 text-xs font-sans tracking-wide text-[#B4CDFD]">
          <a
            href="#architecture"
            className="hover:text-[#FFFFFF] transition-colors duration-300"
          >
            Architecture
          </a>
          <a
            href="#pipeline"
            className="hover:text-[#FFFFFF] transition-colors duration-300"
          >
            5-Step Pipeline
          </a>
          <a
            href="#why-veritybrand"
            className="hover:text-[#FFFFFF] transition-colors duration-300"
          >
            Why BrandProof
          </a>
          <button
            onClick={onOpenDocs}
            className="hover:text-[#FFFFFF] transition-colors duration-300"
          >
            Spec &amp; Data Model
          </button>
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 rounded border border-[#3395FF]/25 bg-[#192839]/90 px-2.5 py-1 font-mono text-[11px] text-[#B4CDFD]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#3395FF] animate-pulse" />
            <span>
              <strong className="text-[#FFFFFF] font-normal">{verifiedCount}</strong>{" "}
              claims_verified
            </span>
          </div>

          <button
            onClick={onLaunchWorkspace}
            className="group inline-flex items-center gap-2 rounded bg-[#3395FF] hover:bg-[#528FF0] px-3.5 py-1.5 font-mono text-xs text-[#FFFFFF] transition-all duration-300"
          >
            <span>Launch Workspace</span>
            <span className="transition-transform duration-300 group-hover:translate-x-0.5">
              →
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

// 4. ClaimHighlight — Subtle inline highlight with sequential pulse capability
export function ClaimHighlight({
  children,
  type,
  active,
  resolvedStatus,
  badge,
  onClick,
}: {
  children: React.ReactNode;
  type: "critical" | "high" | "medium" | "low";
  active?: boolean;
  resolvedStatus?: "pending" | "accepted" | "edited" | "dismissed";
  badge?: string | number;
  onClick?: () => void;
}) {
  let colorClass = "";
  if (resolvedStatus === "accepted" || resolvedStatus === "edited") {
    colorClass =
      "bg-[#3395FF]/20 text-[#FFFFFF] border-b border-[#3395FF]";
  } else if (resolvedStatus === "dismissed") {
    colorClass =
      "bg-[#FFFFFF]/10 text-[#B4CDFD] border-b border-dashed border-[#B4CDFD]/60";
  } else if (type === "critical") {
    colorClass =
      "bg-[#FFFFFF] text-[#2A2A2A] border-b-2 border-[#3395FF] font-medium";
  } else if (type === "medium") {
    colorClass =
      "bg-[#B4CDFD] text-[#2A2A2A] border-b-2 border-[#528FF0] font-medium";
  } else if (type === "high") {
    colorClass =
      "bg-[#3395FF]/25 text-[#FFFFFF] border-b border-[#3395FF]";
  } else {
    colorClass =
      "bg-[#528FF0]/25 text-[#FFFFFF] border-b border-[#B4CDFD]";
  }

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-sm transition-all duration-500 ${
        onClick ? "cursor-pointer" : ""
      } ${colorClass} ${
        active ? "ring-1 ring-[#3395FF] animate-claim-pulse" : ""
      }`}
    >
      <span>{children}</span>
      {badge !== undefined && (
        <sup className="font-mono text-[9px] uppercase tracking-tighter opacity-85">
          [{badge}]
        </sup>
      )}
    </span>
  );
}

// 5. AnimatedMetric — Counts smoothly when scrolled into view
export function AnimatedMetric({
  value,
  suffix = "",
  prefix = "",
  label,
  sublabel,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  sublabel?: string;
}) {
  const [displayVal, setDisplayVal] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let frameId: number;
    const start = performance.now();
    const duration = 1400;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayVal(Math.round(value * eased));
      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [value]);

  return (
    <div ref={ref} className="space-y-1">
      <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#B4CDFD]">
        {label}
      </div>
      <div className="font-serif text-3xl sm:text-4xl text-[#FFFFFF] tracking-tight">
        {prefix}
        {displayVal.toLocaleString()}
        <span className="text-[#3395FF]">{suffix}</span>
      </div>
      {sublabel && (
        <div className="font-mono text-[11px] text-[#B4CDFD]">{sublabel}</div>
      )}
    </div>
  );
}

// 6. PipelineStep — Illuminated OS pipeline stage item
export function PipelineStep({
  number,
  title,
  description,
  active,
  passed,
  onClick,
}: {
  number: string;
  title: string;
  description: string;
  active: boolean;
  passed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left group relative pl-7 py-5 border-l transition-all duration-500 ${
        active
          ? "border-[#3395FF] bg-gradient-to-r from-[#3395FF]/15 to-transparent"
          : passed
          ? "border-[#528FF0]/45 opacity-80 hover:opacity-100"
          : "border-[#B4CDFD]/20 opacity-55 hover:opacity-85"
      }`}
    >
      <span
        className={`absolute -left-[5px] top-7 h-2.5 w-2.5 rounded-full transition-all duration-500 ${
          active
            ? "bg-[#3395FF] shadow-[0_0_14px_#3395FF] scale-110"
            : passed
            ? "bg-[#528FF0]"
            : "bg-[#B4CDFD]/50"
        }`}
      />
      <div className="flex items-center justify-between pr-4">
        <div className="flex items-baseline gap-3">
          <span
            className={`font-mono text-xs tracking-widest ${
              active ? "text-[#3395FF]" : "text-[#B4CDFD]"
            }`}
          >
            {number}
          </span>
          <h4 className="font-serif text-2xl tracking-tight text-[#FFFFFF]">
            {title}
          </h4>
        </div>
        {active && (
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#3395FF]">
            ACTIVE_STAGE
          </span>
        )}
      </div>
      <p className="mt-1.5 pr-4 text-xs sm:text-sm text-[#B4CDFD] leading-relaxed">
        {description}
      </p>
    </button>
  );
}

// 7. EvidenceCard — Displays versioned rule/fact metadata
export function EvidenceCard({
  id,
  version,
  title,
  source,
  statusLabel,
  variant = "emerald",
}: {
  id: string;
  version: string;
  title: string;
  source: string;
  statusLabel: string;
  variant?: "emerald" | "critical" | "amber";
}) {
  const accentColor =
    variant === "critical"
      ? "text-[#2A2A2A] border-[#3395FF] bg-[#FFFFFF]"
      : variant === "amber"
      ? "text-[#2A2A2A] border-[#528FF0] bg-[#B4CDFD]"
      : "text-[#FFFFFF] border-[#3395FF]/40 bg-[#3395FF]/20";

  return (
    <GlassPanel variant={variant} className="p-4 space-y-2.5">
      <div className="flex items-center justify-between font-mono text-[11px]">
        <span className="text-[#FFFFFF] font-medium">
          {id} <span className="text-[#B4CDFD]">• {version}</span>
        </span>
        <span className={`rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${accentColor}`}>
          {statusLabel}
        </span>
      </div>
      <div className="text-xs sm:text-sm text-[#FFFFFF] font-normal leading-snug">
        {title}
      </div>
      <div className="font-mono text-[10px] text-[#B4CDFD] pt-1 border-t border-[#B4CDFD]/15">
        SOURCE: {source}
      </div>
    </GlassPanel>
  );
}

// 8. FindingCard — Reusable interactive finding card with Accept / Edit / Dismiss
export function FindingCard({
  finding,
  isSelected,
  onSelect,
  onAccept,
  onEdit,
  onDismiss,
  onUndo,
  compact = false,
}: {
  finding: FindingRecord;
  isSelected?: boolean;
  onSelect?: () => void;
  onAccept: (finding: FindingRecord) => void;
  onEdit: (finding: FindingRecord, customText: string) => void;
  onDismiss: (finding: FindingRecord, reason: string) => void;
  onUndo: (finding: FindingRecord) => void;
  compact?: boolean;
}) {
  const [mode, setMode] = useState<"view" | "edit" | "dismiss">("view");
  const [editValue, setEditValue] = useState(
    finding.customEdit || finding.replacementPhrase
  );
  const [dismissValue, setDismissValue] = useState(
    "Contextual exception signed off by Marketing Ops; footer risk disclaimer present."
  );

  const severityMeta: Record<
    FindingRecord["severity"],
    { badge: string; panelVariant: "critical" | "amber" | "emerald" | "default" }
  > = {
    critical: {
      badge: "text-[#2A2A2A] border-[#FFFFFF] bg-[#FFFFFF] font-semibold",
      panelVariant: "critical",
    },
    high: {
      badge: "text-[#FFFFFF] border-[#3395FF] bg-[#3395FF]",
      panelVariant: "emerald",
    },
    medium: {
      badge: "text-[#2A2A2A] border-[#B4CDFD] bg-[#B4CDFD] font-semibold",
      panelVariant: "amber",
    },
    low: {
      badge: "text-[#B4CDFD] border-[#B4CDFD]/35 bg-[#528FF0]/15",
      panelVariant: "default",
    },
  };

  const meta = severityMeta[finding.severity];

  return (
    <GlassPanel
      variant={finding.status !== "pending" ? "emerald" : meta.panelVariant}
      onClick={onSelect}
      className={`p-5 transition-all duration-300 ${
        isSelected ? "ring-1 ring-[#3395FF] bg-[#192839]/95" : ""
      }`}
    >
      {/* Top Row: Category + Severity */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em]">
            <span className="text-[#B4CDFD]">0{finding.number}</span>
            <span className="text-[#FFFFFF] font-semibold">{finding.category}</span>
            {finding.status !== "pending" && (
              <span className="rounded-sm bg-[#3395FF] px-1.5 py-0.5 text-[#FFFFFF] font-semibold">
                {finding.status}
              </span>
            )}
          </div>
          <div className="font-mono text-[11px] text-[#B4CDFD]">
            {finding.ruleOrFactId} • {finding.ruleVersion}
            {finding.evidenceId !== "NONE" && ` • Evidence ${finding.evidenceId}`}
            {` • Confidence ${finding.confidence.toFixed(2)}`}
          </div>
        </div>

        <span
          className={`rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${meta.badge}`}
        >
          {finding.severity}
        </span>
      </div>

      {/* Quoted Target Phrase */}
      <div className="mt-3.5 rounded border border-[#B4CDFD] bg-[#FFFFFF] px-3 py-2 font-mono text-xs text-[#2A2A2A] font-medium">
        &ldquo;{finding.targetPhrase}&rdquo;
      </div>

      {/* Why + Suggested Fix */}
      {!compact && (
        <div className="mt-3 space-y-1.5 text-xs text-[#B4CDFD] leading-relaxed">
          <p>{finding.whyExplanation}</p>
          <p className="text-[#FFFFFF]">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#3395FF] mr-1.5">
              SUGGESTED:
            </span>
            &ldquo;{finding.customEdit || finding.replacementPhrase}&rdquo;
          </p>
        </div>
      )}

      {/* Edit Mode Drawer */}
      {mode === "edit" && finding.status === "pending" && (
        <div
          className="mt-3.5 space-y-2 border-t border-[#B4CDFD]/20 pt-3"
          onClick={(e) => e.stopPropagation()}
        >
          <label className="block font-mono text-[10px] uppercase tracking-wider text-[#3395FF]">
            Intent-Preserving Custom Edit
          </label>
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full rounded border border-[#B4CDFD]/40 bg-[#FFFFFF] px-3 py-1.5 text-xs text-[#2A2A2A] focus:outline-none focus:border-[#3395FF]"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onEdit(finding, editValue);
                setMode("view");
              }}
              className="rounded bg-[#3395FF] px-3 py-1 font-mono text-[11px] font-medium text-[#FFFFFF]"
            >
              Save Rewrite
            </button>
            <button
              onClick={() => setMode("view")}
              className="rounded border border-[#B4CDFD]/30 px-2.5 py-1 font-mono text-[11px] text-[#B4CDFD]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Dismiss Mode Drawer */}
      {mode === "dismiss" && finding.status === "pending" && (
        <div
          className="mt-3.5 space-y-2 border-t border-[#B4CDFD]/20 pt-3"
          onClick={(e) => e.stopPropagation()}
        >
          <label className="block font-mono text-[10px] uppercase tracking-wider text-[#B4CDFD]">
            Audit Justification Required
          </label>
          <input
            type="text"
            value={dismissValue}
            onChange={(e) => setDismissValue(e.target.value)}
            className="w-full rounded border border-[#B4CDFD]/40 bg-[#FFFFFF] px-3 py-1.5 text-xs text-[#2A2A2A] focus:outline-none focus:border-[#3395FF]"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onDismiss(finding, dismissValue);
                setMode("view");
              }}
              className="rounded bg-[#528FF0] px-3 py-1 font-mono text-[11px] font-medium text-[#FFFFFF]"
            >
              Confirm Dismiss
            </button>
            <button
              onClick={() => setMode("view")}
              className="rounded border border-[#B4CDFD]/30 px-2.5 py-1 font-mono text-[11px] text-[#B4CDFD]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Action Bar: Accept | Edit | Dismiss */}
      <div
        className="mt-4 pt-3 border-t border-[#B4CDFD]/15 flex items-center justify-between gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        {finding.status === "pending" ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onAccept(finding)}
              className="inline-flex items-center gap-1.5 rounded bg-[#3395FF] hover:bg-[#528FF0] px-3 py-1 font-mono text-[11px] font-medium text-[#FFFFFF] transition-all"
            >
              <Check className="h-3 w-3" />
              <span>Accept</span>
            </button>
            <button
              onClick={() => setMode(mode === "edit" ? "view" : "edit")}
              className="inline-flex items-center gap-1.5 rounded border border-[#B4CDFD]/35 bg-[#192839] hover:border-[#FFFFFF] px-3 py-1 font-mono text-[11px] text-[#FFFFFF] transition-all"
            >
              <Edit3 className="h-3 w-3 text-[#B4CDFD]" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => setMode(mode === "dismiss" ? "view" : "dismiss")}
              className="inline-flex items-center gap-1.5 rounded border border-transparent hover:border-[#B4CDFD]/30 px-2.5 py-1 font-mono text-[11px] text-[#B4CDFD] hover:text-[#FFFFFF] transition-all"
            >
              <span>Dismiss</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full font-mono text-[11px]">
            <span className="text-[#3395FF] truncate pr-2">
              {finding.status === "accepted" &&
                `✓ Applied: "${finding.replacementPhrase}"`}
              {finding.status === "edited" &&
                `✓ Edited: "${finding.customEdit}"`}
              {finding.status === "dismissed" &&
                `✓ Dismissed (Logged to Audit Trail)`}
            </span>
            <button
              onClick={() => onUndo(finding)}
              className="inline-flex items-center gap-1 text-[#B4CDFD] hover:text-[#FFFFFF] shrink-0"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Undo</span>
            </button>
          </div>
        )}
      </div>
    </GlassPanel>
  );
}

// 9. ApprovalBar — Functional human authority lock bar
export function ApprovalBar({
  resolvedCount,
  totalCount,
  isApproved,
  reviewerName = "Arjun M.",
  onRequestChanges,
  onApprove,
  onReset,
}: {
  resolvedCount: number;
  totalCount: number;
  isApproved: boolean;
  reviewerName?: string;
  onRequestChanges: () => void;
  onApprove: () => void;
  onReset?: () => void;
}) {
  const allResolved = totalCount > 0 && resolvedCount === totalCount;
  const pct = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 100;

  return (
    <div className="glass-panel rounded-lg border border-[#B4CDFD]/25 px-5 py-4 flex flex-wrap items-center justify-between gap-4">
      {/* Left: Progress indicator */}
      <div className="flex items-center gap-4">
        <div className="font-mono text-xs">
          <span className="text-[#FFFFFF] font-semibold">{resolvedCount}</span>
          <span className="text-[#B4CDFD]"> of </span>
          <span className="text-[#FFFFFF] font-semibold">{totalCount}</span>
          <span className="text-[#B4CDFD]"> findings resolved</span>
        </div>
        <div className="w-36 sm:w-48 h-1.5 rounded-full bg-[#B4CDFD]/20 overflow-hidden">
          <div
            className="h-full bg-[#3395FF] transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        {onReset && resolvedCount > 0 && (
          <button
            onClick={onReset}
            className="font-mono text-[10px] uppercase tracking-wider text-[#B4CDFD] hover:text-[#FFFFFF]"
          >
            [Reset]
          </button>
        )}
      </div>

      {/* Center: Lock telemetry */}
      <div className="hidden md:flex items-center gap-2 font-mono text-[11px]">
        {isApproved ? (
          <span className="text-[#3395FF] flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>SIGNED OFF BY {reviewerName.toUpperCase()} • AUDIT TRAIL LOCKED</span>
          </span>
        ) : allResolved ? (
          <span className="text-[#3395FF] flex items-center gap-1.5">
            <Unlock className="h-3.5 w-3.5" />
            <span>AUTHORITY LOCK DISENGAGED → READY FOR SIGN-OFF</span>
          </span>
        ) : (
          <span className="text-[#B4CDFD] flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-[#3395FF]" />
            <span>SIGN-OFF LOCKED UNTIL ALL {totalCount} FINDINGS ARE RESOLVED</span>
          </span>
        )}
      </div>

      {/* Right: Request Changes + Approve & Sign Off */}
      <div className="flex items-center gap-3">
        <button
          onClick={onRequestChanges}
          className="rounded border border-[#B4CDFD]/30 bg-[#192839] hover:border-[#FFFFFF] px-3.5 py-2 font-mono text-xs text-[#B4CDFD] hover:text-[#FFFFFF] transition-all"
        >
          Request Changes
        </button>

        <button
          disabled={!allResolved}
          onClick={onApprove}
          className={`inline-flex items-center gap-2 rounded px-4 py-2 font-mono text-xs transition-all duration-500 ${
            isApproved
              ? "bg-[#3395FF] text-[#FFFFFF] font-semibold"
              : allResolved
              ? "bg-[#3395FF] text-[#FFFFFF] font-semibold shadow-[0_0_25px_rgba(51,149,255,0.45)] hover:bg-[#528FF0] cursor-pointer"
              : "border border-[#B4CDFD]/20 bg-[#192839] text-[#B4CDFD]/50 cursor-not-allowed"
          }`}
        >
          {allResolved ? (
            <Unlock className="h-3.5 w-3.5" />
          ) : (
            <Lock className="h-3.5 w-3.5" />
          )}
          <span>
            {isApproved ? "Approved & Signed Off ✓" : "Approve & Sign Off"}
          </span>
        </button>
      </div>
    </div>
  );
}
