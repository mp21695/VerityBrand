"use client";

import React, { useState } from "react";
import { RevealText } from "@/components/motion/RevealText";
import { Reveal } from "@/components/motion/Reveal";
import { SITE_DATA } from "@/data/siteData";

export function WhatItFinds() {
  const { whatItFinds } = SITE_DATA;
  const [activeFinding, setActiveFinding] = useState<string>("fnd-1");

  return (
    <section id="analysis" className="section-y bg-background-soft text-text-primary">
      <div className="container-x">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 sm:mb-20">
          <RevealText
            label={whatItFinds.sectionLabel}
            text={whatItFinds.heading}
            as="h2"
            className="t-h2 font-medium tracking-tight mb-4"
          />
          <p className="text-lg text-text-muted">{whatItFinds.subheading}</p>
        </div>

        {/* Live Content Analysis Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Realistic Draft Copy with Interactive Highlighted Spans */}
          <div className="lg:col-span-6 bg-surface rounded-2xl p-8 sm:p-10 border border-border shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-border/60 mb-6">
              <span className="text-xs font-mono uppercase tracking-wider text-text-muted">
                Submitted Draft Sample · Gold Savings Fund
              </span>
              <span className="text-xs font-mono text-brand-green font-semibold">
                4 Cited Findings
              </span>
            </div>

            <p className="text-xl sm:text-2xl font-serif italic text-text-primary leading-relaxed">
              Build steady wealth with{" "}
              <button
                type="button"
                onClick={() => setActiveFinding("fnd-1")}
                className={`mark-span transition-all text-left ${
                  activeFinding === "fnd-1"
                    ? "bg-critical/20 text-critical font-medium underline decoration-critical decoration-2"
                    : "bg-critical-soft text-critical"
                }`}
              >
                guaranteed 12% returns
              </button>{" "}
              from the Arthaa Gold Savings Fund,{" "}
              <button
                type="button"
                onClick={() => setActiveFinding("fnd-3")}
                className={`mark-span transition-all text-left ${
                  activeFinding === "fnd-3"
                    ? "bg-info/20 text-info font-medium underline decoration-info decoration-2"
                    : "bg-info-soft text-info"
                }`}
              >
                India's #1 fund
              </button>{" "}
              managing{" "}
              <button
                type="button"
                onClick={() => setActiveFinding("fnd-2")}
                className={`mark-span transition-all text-left ${
                  activeFinding === "fnd-2"
                    ? "bg-warning/20 text-warning font-medium underline decoration-warning decoration-2"
                    : "bg-warning-soft text-warning"
                }`}
              >
                ₹4,200 crore
              </button>
              .{" "}
              <button
                type="button"
                onClick={() => setActiveFinding("fnd-4")}
                className={`mark-span transition-all text-left ${
                  activeFinding === "fnd-4"
                    ? "bg-surface-muted text-text-secondary font-medium underline decoration-text-muted decoration-2"
                    : "bg-surface-muted/60 text-text-secondary"
                }`}
              >
                Start a SIP today
              </button>
              .
            </p>

            <div className="mt-8 pt-6 border-t border-border flex items-center justify-between text-xs text-text-muted font-sans">
              <span>Click any highlighted span to inspect cited evidence</span>
              <span className="font-mono">Analysis Time: 218ms</span>
            </div>
          </div>

          {/* Right Column: Stacked Cited Finding Cards */}
          <div className="lg:col-span-6 space-y-4">
            {whatItFinds.findingsPreview.map((item) => {
              const isSelected = activeFinding === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveFinding(item.id)}
                  className={`cursor-pointer rounded-xl p-5 border transition-all duration-300 ${
                    isSelected
                      ? "bg-surface border-brand-green shadow-md scale-[1.01]"
                      : "bg-surface/60 border-border hover:bg-surface/90"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-mono uppercase px-2 py-0.5 rounded-full ${
                          item.severity === "Critical"
                            ? "bg-critical-soft text-critical"
                            : item.severity === "High"
                            ? "bg-info-soft text-info"
                            : item.severity === "Medium"
                            ? "bg-warning-soft text-warning"
                            : "bg-surface-muted text-text-secondary"
                        }`}
                      >
                        {item.kindLabel}
                      </span>
                      <span className="text-xs font-semibold text-text-primary">
                        “{item.phrase}”
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-text-muted">
                      {item.confidence}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-text-secondary mb-3">
                    {item.issue}
                  </p>

                  <div className="bg-background-soft rounded-lg p-3 border border-border/80 flex items-start gap-2">
                    <span className="text-brand-green text-xs font-mono uppercase font-semibold shrink-0">
                      Fix Proposal:
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-text-primary">
                      {item.suggestedFix}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
