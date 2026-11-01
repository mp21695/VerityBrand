"use client";

import React from "react";
import { RevealText } from "@/components/motion/RevealText";
import { Reveal } from "@/components/motion/Reveal";
import { SITE_DATA } from "@/data/siteData";

export function LearningLoop() {
  const { learningLoop } = SITE_DATA;

  return (
    <section id="learning" className="section-y bg-background text-text-primary">
      <div className="container-x">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 sm:mb-20">
          <RevealText
            label={learningLoop.sectionLabel}
            text={learningLoop.heading}
            as="h2"
            className="t-h2 font-medium tracking-tight mb-4"
          />
          <p className="text-lg text-text-muted">{learningLoop.subheading}</p>
        </div>

        {/* Learning Loop Feature Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* Metric Highlight Card */}
          <div className="lg:col-span-5 bg-surface rounded-2xl p-8 sm:p-10 border border-border flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-brand-pink block mb-4">
                Automated Pattern Detection
              </span>
              <div className="font-serif italic text-6xl sm:text-7xl text-brand-green mb-4">
                {learningLoop.metricStat.value}
              </div>
              <h3 className="text-xl font-medium text-text-primary mb-2">
                {learningLoop.metricStat.label}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {learningLoop.metricStat.subtext}
              </p>
            </div>

            <div className="pt-8 border-t border-border mt-8">
              <p className="text-xs text-text-muted font-sans leading-normal">
                When reviewers frequently dismiss a rule with similar feedback, the Brand Brain detects rule friction rather than treating creators as non-compliant.
              </p>
            </div>
          </div>

          {/* Real Case Study Card */}
          <div className="lg:col-span-7 bg-[#0e231a] text-on-dark rounded-2xl p-8 sm:p-10 border border-on-dark/20 flex flex-col justify-between shadow-lg">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-mono uppercase text-brand-pink-soft bg-brand-pink/20 px-3 py-1 rounded-full">
                  Unclear Rule Case · {learningLoop.caseStudy.ruleId}
                </span>
                <span className="text-xs font-mono text-on-dark/60">
                  {learningLoop.caseStudy.dismissalRate}
                </span>
              </div>

              <h4 className="font-serif italic text-2xl sm:text-3xl text-on-dark mb-4">
                {learningLoop.caseStudy.ruleName}
              </h4>

              <div className="space-y-4 text-sm sm:text-base text-on-dark/80 leading-relaxed mb-8">
                <p className="text-xs uppercase font-mono tracking-wider text-on-dark/50">
                  Reviewer Dismissal Feedback:
                </p>
                <blockquote className="border-l-2 border-brand-pink pl-4 italic text-on-dark/90">
                  {learningLoop.caseStudy.reasonSnippet}
                </blockquote>
              </div>
            </div>

            <div className="pt-6 border-t border-on-dark/15">
              <span className="text-xs uppercase font-mono tracking-wider text-brand-pink-soft block mb-1">
                Autonomous Modernisation Outcome:
              </span>
              <p className="text-xs sm:text-sm text-on-dark/80">
                {learningLoop.caseStudy.systemAction}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
