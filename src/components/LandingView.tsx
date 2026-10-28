"use client";

import React, { useState, useEffect, useCallback } from "react";
import EvidenceFieldCanvas from "@/components/ui/EvidenceFieldCanvas";
import {
  ShieldCheck,
  FileText,
  Clock,
  Edit3,
  Layout,
  BarChart3,
} from "lucide-react";

interface LandingViewProps {
  onLaunchWorkspace: () => void;
  onOpenDocs: () => void;
}

export default function LandingView({
  onLaunchWorkspace,
  onOpenDocs,
}: LandingViewProps) {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [activeStepLabel, setActiveStepLabel] = useState<string>(
    '01 CLAIM · "guaranteed 12% returns"'
  );
  const currentYear = new Date().getFullYear();

  const handleStepChange = useCallback((stepIdx: number, label: string) => {
    setActiveStepIndex(stepIdx);
    setActiveStepLabel(label);
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const elements = document.querySelectorAll("[data-reveal]");

    if (prefersReducedMotion) {
      elements.forEach((el) => el.classList.add("in"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const capabilities = [
    {
      meta: "01 / RULE",
      title: "Rule Engine",
      desc: "Check banned terms, required phrases, numbers, dates and deterministic policy rules.",
      icon: ShieldCheck,
    },
    {
      meta: "02 / CLAIM",
      title: "Grounded Claim Verification",
      desc: "Extract claims, retrieve approved evidence, compare against source truth and attach citations.",
      icon: FileText,
    },
    {
      meta: "03 / EXPIRY",
      title: "Expiry Detection",
      desc: "Flag claims that depend on facts whose validity period has expired.",
      icon: Clock,
    },
    {
      meta: "04 / FIXES",
      title: "Intent-Preserving Fixes",
      desc: "Suggest compliant edits without silently changing the creator’s persuasive intent.",
      icon: Edit3,
    },
    {
      meta: "05 / VISUAL",
      title: "Visual & Accessibility Checks",
      desc: "Check logo usage, typography, contrast, palette and basic accessibility requirements.",
      icon: Layout,
    },
    {
      meta: "06 / INSIGHT",
      title: "Governance Dashboard",
      desc: "Surface recurring violations, dismissed findings, unclear rules and review history.",
      icon: BarChart3,
    },
  ];

  const recordRows = [
    {
      label: "RULE",
      code: "R-07 · v3.0",
      isAccent: true,
      value: "Guaranteed return promise prohibited",
    },
    {
      label: "EVIDENCE",
      code: "E-014",
      isAccent: false,
      value: "SEBI Advertising Code",
    },
    {
      label: "CONFIDENCE",
      code: "1.00 · DETERMINISTIC",
      isAccent: false,
      value: "Exact policy rule match verified",
    },
    {
      label: "FACT",
      code: "F-021",
      isAccent: true,
      value: "AUM figure expired 30 JUN 2026",
    },
    {
      label: "HUMAN DECISION",
      code: "LOCKED GATE",
      isAccent: true,
      value: "AWAITING REVIEW",
    },
  ];

  const trailNodes = [
    "CLAIM",
    "RULE",
    "EVIDENCE",
    "CONFIDENCE",
    "HUMAN DECISION",
    "AUDIT",
  ];

  return (
    <div className="relative min-h-screen text-[#FFFFFF]">
      {/* PERSISTENT FULL-VIEWPORT EVIDENCE FIELD */}
      <EvidenceFieldCanvas onStepChange={handleStepChange} />

      <div className="page" id="top">
        {/* ================= SECTION 1 · HERO ================= */}
        <header
          className="min-h-screen flex flex-col justify-between relative"
          style={{
            background:
              "radial-gradient(125% 62% at 50% -10%, rgba(25,40,57,0.92) 0%, rgba(51,149,255,0.20) 48%, transparent 72%)",
          }}
        >
          {/* Minimal, Uncluttered Navigation */}
          <nav className="w-full max-w-[1180px] mx-auto px-6 py-6 flex items-center justify-between gap-5 z-10">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#3395FF] flex items-center justify-center text-[#FFFFFF] shadow-[0_0_20px_rgba(51,149,255,0.45)]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-serif text-[22px] font-medium tracking-tight text-[#FFFFFF]">
                VerityBrand
              </span>
              <span className="hidden sm:inline-block font-mono text-[10px] tracking-[0.14em] uppercase text-[#2A2A2A] font-semibold px-2.5 py-0.5 rounded-full bg-[#B4CDFD]">
                ROUND 2 MVP
              </span>
            </div>

            <div className="hidden md:flex items-center gap-9 text-[13px] text-[#B4CDFD]">
              <a
                href="#features"
                className="hover:text-[#FFFFFF] transition-colors"
              >
                Capabilities
              </a>
              <a
                href="#solutions"
                className="hover:text-[#FFFFFF] transition-colors"
              >
                Traceability
              </a>
              <button
                type="button"
                onClick={onOpenDocs}
                className="hover:text-[#FFFFFF] transition-colors"
              >
                Architecture
              </button>
            </div>

            <div className="flex items-center gap-3.5">
              <button
                type="button"
                onClick={onLaunchWorkspace}
                className="btn btn-primary text-[13px] py-2.5 px-5"
              >
                Launch Workspace →
              </button>
            </div>
          </nav>

          {/* Editorial Hero Copy — Open, Breathable, Uncluttered */}
          <div className="w-full max-w-[1180px] mx-auto px-6 flex flex-1 items-center justify-start text-left -translate-y-[5vh]">
            <div className="max-w-[650px]">
              {/* Dataset Pill */}
              <div
                data-reveal
                style={{ "--rd": "0ms" } as React.CSSProperties}
                className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#192839]/75 border border-[#B4CDFD]/30 font-mono text-[11px] mb-7 backdrop-blur-md"
              >
                <span className="pulse-dot" />
                <span className="text-[#B4CDFD] tracking-wider">
                  Arthaa Finserv · Q4 Campaign · v2
                </span>
              </div>

              {/* Large Editorial Serif Headline */}
              <h1
                data-reveal
                style={{ "--rd": "60ms" } as React.CSSProperties}
                className="font-serif text-[clamp(48px,6.6vw,88px)] font-medium leading-[0.97] tracking-[-0.04em] text-[#FFFFFF]"
              >
                Every claim
                <br />
                <span className="italic font-normal text-[#3395FF]">
                  grounded.
                </span>
                <br />
                Every asset
                <br />
                <span className="italic font-normal text-[#528FF0]">
                  on-brand.
                </span>
                <br />
                Every decision
                <br />
                <span className="italic font-normal text-[#B4CDFD]">
                  accountable.
                </span>
              </h1>

              {/* Hero Description */}
              <p
                data-reveal
                style={{ "--rd": "180ms" } as React.CSSProperties}
                className="mt-7 max-w-[540px] text-[clamp(16px,1.35vw,19px)] leading-[1.68] text-[#B4CDFD]"
              >
                VerityBrand checks content against approved rules, verifies
                claims against traceable sources, and asks a human before
                anything goes live.
              </p>

              {/* Hero Buttons */}
              <div
                data-reveal
                style={{ "--rd": "300ms" } as React.CSSProperties}
                className="mt-9 flex flex-wrap items-center gap-4"
              >
                <button
                  type="button"
                  onClick={onLaunchWorkspace}
                  className="btn btn-primary"
                >
                  Launch Workspace →
                </button>
                <button
                  type="button"
                  onClick={onOpenDocs}
                  className="btn btn-outline"
                >
                  Spec &amp; Data Model
                </button>
              </div>
            </div>
          </div>

          {/* Clean, Minimal Bottom Telemetry Line */}
          <div
            data-reveal
            style={{ "--rd": "420ms" } as React.CSSProperties}
            className="w-full max-w-[1180px] mx-auto px-6 pt-6 pb-8 border-t border-[#B4CDFD]/20 flex flex-wrap items-center justify-between gap-4"
          >
            <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#B4CDFD] flex flex-wrap items-center gap-3.5">
              <span>
                <strong className="text-[#FFFFFF] font-semibold">412</strong>{" "}
                CLAIMS VERIFIED
              </span>
              <span>·</span>
              <span>
                <strong className="text-[#FFFFFF] font-semibold">37</strong>{" "}
                RULES ACTIVE
              </span>
              <span>·</span>
              <span>
                <strong className="text-[#3395FF] font-semibold">12</strong>{" "}
                FACTS EXPIRING
              </span>
              <span>·</span>
              <span className="text-[#FFFFFF]">HUMAN APPROVAL REQUIRED</span>
            </div>

            <div className="hidden lg:inline-flex items-center gap-2.5 font-mono text-[11px] text-[#FFFFFF] bg-[#192839]/80 border border-[#528FF0]/35 px-3.5 py-1.5 rounded-full">
              <span className="pulse-dot" />
              <span>{activeStepLabel}</span>
            </div>
          </div>
        </header>

        {/* ================= SECTION 2 · GOVERNANCE CAPABILITIES ================= */}
        <section className="section features" id="features">
          <div className="section-head" data-reveal>
            <span className="eyebrow">EVIDENCE-BACKED GOVERNANCE</span>
            <h2>Everything needed to keep content accountable</h2>
            <p>
              VerityBrand connects rules, facts, evidence and human approval
              into one traceable review workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((cap, idx) => {
              const Icon = cap.icon;
              return (
                <article
                  key={cap.title}
                  data-reveal
                  style={{ "--rd": `${idx * 90}ms` } as React.CSSProperties}
                  className="card rounded-[20px] p-8 hover:-translate-y-1 transition-all"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#3395FF]/15 border border-[#3395FF]/40 flex items-center justify-center text-[#3395FF] mb-6">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="font-mono text-[10px] tracking-[0.16em] uppercase text-[#B4CDFD] mb-2">
                    {cap.meta}
                  </div>
                  <h3 className="font-serif text-[25px] font-medium text-[#FFFFFF] mb-3">
                    {cap.title}
                  </h3>
                  <p className="text-[15px] leading-[1.68] text-[#B4CDFD]">
                    {cap.desc}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        {/* ================= SECTION 3 · VERIFICATION SHOWCASE + STATS ================= */}
        <section className="section showcase" id="solutions">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-5 showcase-copy" data-reveal>
              <span className="eyebrow">TRACE EVERY DECISION</span>
              <h2>From claim to accountable decision.</h2>
              <p className="mt-5 text-[18px] leading-[1.68] text-[#B4CDFD]">
                Every finding is connected to the exact claim, applicable rule,
                supporting evidence, validity period and confidence level behind
                it.
              </p>
              <div className="mt-9">
                <button
                  type="button"
                  onClick={onLaunchWorkspace}
                  className="btn btn-primary"
                >
                  Launch Review Workspace →
                </button>
              </div>
            </div>

            {/* Right: Clean, Uncluttered Verification Record */}
            <div
              className="lg:col-span-7 verification-record rounded-[26px] p-8 sm:p-9 border border-[#B4CDFD]/25"
              data-reveal
              style={{ "--rd": "140ms" } as React.CSSProperties}
            >
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#B4CDFD]/20">
                <span className="inline-flex items-center gap-2.5 font-mono text-[11px] font-semibold tracking-[0.16em] uppercase text-[#FFFFFF]">
                  <span className="pulse-dot" />
                  LIVE FINDING
                </span>
                <span className="font-mono text-[10px] font-semibold tracking-[0.14em] px-3 py-1 rounded-full bg-[#FFFFFF] text-[#2A2A2A]">
                  4 FINDINGS DETECTED
                </span>
              </div>

              {/* Claim Quote — Crisp White Surface with Dark Text (#2A2A2A) for clean contrast */}
              <div className="rounded-2xl bg-[#FFFFFF] border border-[#B4CDFD] p-5 mb-6 shadow-sm">
                <div className="font-mono text-[10px] tracking-[0.15em] uppercase text-[#528FF0] font-semibold mb-1.5">
                  EXTRACTED CLAIM · SPAN [22..44]
                </div>
                <div className="font-serif italic text-2xl sm:text-[28px] text-[#2A2A2A]">
                  “guaranteed 12% returns”
                </div>
              </div>

              {/* Record Body + Connected Trail */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-stretch">
                <div className="sm:col-span-7 flex flex-col gap-3">
                  {recordRows.map((row, idx) => {
                    const isHighlighted =
                      idx === activeStepIndex % recordRows.length;
                    return (
                      <div
                        key={row.label}
                        className={`rounded-xl p-3.5 border transition-all duration-300 ${
                          isHighlighted
                            ? "border-[#3395FF] bg-[#3395FF]/18"
                            : "border-[#B4CDFD]/18 bg-[#192839]/70"
                        }`}
                      >
                        <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.14em] uppercase text-[#B4CDFD] mb-1">
                          <span>{row.label}</span>
                          <span
                            className={`font-semibold ${
                              row.isAccent
                                ? "text-[#3395FF]"
                                : "text-[#FFFFFF]"
                            }`}
                          >
                            {row.code}
                          </span>
                        </div>
                        <div className="text-[14px] font-medium text-[#FFFFFF]">
                          {row.value}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Connected Vertical Trail */}
                <div className="sm:col-span-5 rounded-xl bg-[#192839]/80 border border-[#B4CDFD]/20 p-5 flex flex-col justify-between relative min-h-[260px]">
                  <div className="absolute left-[24px] top-7 bottom-7 w-[1px] bg-[#B4CDFD]/25 overflow-hidden">
                    <div className="trail-spine-progress" />
                  </div>

                  {trailNodes.map((nodeName, idx) => {
                    const isActive = idx <= activeStepIndex;
                    return (
                      <div
                        key={nodeName}
                        className={`relative z-10 flex items-center gap-3 font-mono text-[10px] tracking-[0.14em] transition-colors ${
                          isActive
                            ? "text-[#FFFFFF] font-semibold"
                            : "text-[#B4CDFD]/55"
                        }`}
                      >
                        <span
                          className={`w-2.5 h-2.5 rounded-full border transition-all ${
                            isActive
                              ? "bg-[#3395FF] border-[#3395FF] shadow-[0_0_12px_#3395FF]"
                              : "bg-[#192839] border-[#B4CDFD]/45"
                          }`}
                        />
                        <span>{nodeName}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Four Spacious Governance Stats */}
          <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                num: "412",
                label: "Claims Verified",
                sub: "TRACEABLE TO SOURCE ID",
              },
              {
                num: "37",
                label: "Active Rules",
                sub: "VERSION-PINNED POLICIES",
              },
              {
                num: "12",
                label: "Expiring Facts",
                sub: "TIME-BOUNDED LEDGER",
              },
              {
                num: "100%",
                label: "Human Approval Gate",
                sub: "ZERO AUTO-PUBLISH",
              },
            ].map((st, idx) => (
              <div
                key={st.label}
                data-reveal
                style={{ "--rd": `${idx * 90}ms` } as React.CSSProperties}
                className="stat rounded-[20px] p-8"
              >
                <div className="font-serif text-[clamp(42px,4.4vw,58px)] font-medium leading-none tracking-tight text-[#FFFFFF] mb-3">
                  {st.num}
                </div>
                <div className="text-[15px] font-semibold text-[#FFFFFF]">
                  {st.label}
                </div>
                <div className="font-mono text-[10px] tracking-wider text-[#3395FF] mt-1.5">
                  {st.sub}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= SECTION 4 · CTA + FOOTER ================= */}
        <section className="section cta" id="cta">
          <div
            data-reveal
            className="cta-card rounded-[28px] p-12 sm:p-20 text-center border border-[#B4CDFD]/25"
          >
            <span className="eyebrow">READY FOR ACCOUNTABLE CONTENT?</span>
            <h2>Put evidence behind every decision.</h2>
            <p className="max-w-[540px] mx-auto mt-5 text-[18px] leading-[1.68] text-[#B4CDFD]">
              Review claims, verify facts, resolve findings and keep a traceable
              approval trail before anything goes live.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <button
                type="button"
                onClick={onLaunchWorkspace}
                className="btn btn-primary"
              >
                Launch Workspace →
              </button>
              <a href="#features" className="btn btn-outline">
                View Architecture
              </a>
            </div>
          </div>
        </section>

        {/* Clean Footer */}
        <footer className="max-w-[1180px] mx-auto px-6 pt-14 pb-12 border-t border-[#B4CDFD]/20">
          <div className="flex flex-col md:flex-row justify-between gap-12 mb-12">
            <div>
              <h4 className="font-serif text-2xl font-medium text-[#FFFFFF]">
                VerityBrand
              </h4>
              <p className="mt-2 text-sm text-[#B4CDFD]">
                Evidence-backed brand governance.
              </p>
            </div>

            <div className="flex flex-wrap gap-16">
              <div>
                <h5 className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#3395FF] mb-3.5">
                  Product
                </h5>
                <ul className="space-y-2.5 text-sm text-[#B4CDFD]">
                  <li>
                    <button
                      type="button"
                      onClick={onLaunchWorkspace}
                      className="hover:text-[#FFFFFF]"
                    >
                      Review Workspace
                    </button>
                  </li>
                  <li>
                    <a href="#solutions" className="hover:text-[#FFFFFF]">
                      5-Step Pipeline
                    </a>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={onLaunchWorkspace}
                      className="hover:text-[#FFFFFF]"
                    >
                      Findings
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h5 className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#3395FF] mb-3.5">
                  Governance
                </h5>
                <ul className="space-y-2.5 text-sm text-[#B4CDFD]">
                  <li>
                    <a href="#features" className="hover:text-[#FFFFFF]">
                      Rules
                    </a>
                  </li>
                  <li>
                    <a href="#solutions" className="hover:text-[#FFFFFF]">
                      Evidence
                    </a>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={onLaunchWorkspace}
                      className="hover:text-[#FFFFFF]"
                    >
                      Audit Trail
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h5 className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#3395FF] mb-3.5">
                  System
                </h5>
                <ul className="space-y-2.5 text-sm text-[#B4CDFD]">
                  <li>
                    <a href="#features" className="hover:text-[#FFFFFF]">
                      Architecture
                    </a>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={onOpenDocs}
                      className="hover:text-[#FFFFFF]"
                    >
                      Data Model
                    </button>
                  </li>
                  <li>
                    <a href="#cta" className="hover:text-[#FFFFFF]">
                      Security
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#B4CDFD]/15 flex flex-wrap items-center justify-between gap-3 text-[13px] text-[#B4CDFD]/75">
            <span>
              © {currentYear} VerityBrand — Every decision accountable.
            </span>
            <span className="font-mono text-[11px]">
              CLAIM → EVIDENCE → RULE → CONFIDENCE → HUMAN DECISION → AUDIT
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
