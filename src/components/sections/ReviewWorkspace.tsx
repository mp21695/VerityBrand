"use client";

import React, { useReducer, useState } from "react";
import Image from "next/image";
import {
  createInitialReviewState,
  reviewReducer,
  revisedText,
  segmentText,
  unresolvedCount,
  ROLES,
  ROLE_ORDER,
  KIND_META,
  TONE_CLASSES,
  shortHash,
  type Role,
  type Finding,
  RULES,
  FACTS,
  SOURCES,
  QUEUE,
  RULE_INSIGHTS,
  GLOSSARY_TERMS,
  BRAND_ASSETS,
  INITIAL_COMMENTS,
  FORMAT_PRESETS,
  type ReviewComment,
  type Rule,
  type Fact,
  analyzeAnyContent,
} from "@/lib/review";
import { motion, AnimatePresence } from "motion/react";

interface WorkspaceProps {
  onBackToLanding?: () => void;
}

export function ReviewWorkspace({ onBackToLanding }: WorkspaceProps) {
  const [state, dispatch] = useReducer(reviewReducer, undefined, createInitialReviewState);
  const [activeTab, setActiveTab] = useState<"workspace" | "brain" | "queue" | "insights" | "audit">("workspace");

  // Format Switcher inside Review Studio: text | image | document
  const [currentFormat, setCurrentFormat] = useState<"text" | "image" | "document">("text");

  // Interaction State for resolution
  const [isEditingFix, setIsEditingFix] = useState<boolean>(false);
  const [customEditText, setCustomEditText] = useState<string>("");
  const [dismissReason, setDismissReason] = useState<string>("");
  const [showDismissModal, setShowDismissModal] = useState<boolean>(false);

  // New Content / Live Scan Modal State
  const [showScanModal, setShowScanModal] = useState<boolean>(false);
  const [scanPreset, setScanPreset] = useState<"agency" | "marketing" | "custom">("agency");
  const [customInputText, setCustomInputText] = useState<string>(
    "Build steady wealth with guaranteed 15% returns from Arthaa Gold Savings Fund! India's #1 fund beating 99% of peers. Hurry up, start a SIP and enjoy zero risk profits!"
  );

  // Brand Brain Sub-tabs: rules | facts | glossary | assets
  const [brainSubTab, setBrainSubTab] = useState<"rules" | "facts" | "glossary" | "assets">("rules");
  const [allRules, setAllRules] = useState<Rule[]>(RULES);
  const [allFacts, setAllFacts] = useState<Fact[]>(FACTS);
  const [showAddRuleModal, setShowAddRuleModal] = useState<boolean>(false);
  const [newRuleData, setNewRuleData] = useState({ id: "R-15", title: "", summary: "", category: "Regulatory" as const, severity: "high" as const });
  const [showAddFactModal, setShowAddFactModal] = useState<boolean>(false);
  const [newFactData, setNewFactData] = useState({ id: "F-050", label: "", value: "", validUntil: "2027-12-31" });

  // Collaboration / Comments Thread
  const [comments, setComments] = useState<ReviewComment[]>(INITIAL_COMMENTS);
  const [newCommentText, setNewCommentText] = useState<string>("");
  const [showCommentsDrawer, setShowCommentsDrawer] = useState<boolean>(false);

  // Privacy & AI Disclosure Modal
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false);

  const selectedFinding = state.findings.find((f) => f.id === state.selectedId) || state.findings[0];
  const roleProfile = ROLES[state.role];
  const openCount = unresolvedCount(state.findings);
  const isApproved = state.phase === "approved";

  // Handlers
  const handleSelectFinding = (id: string) => {
    dispatch({ type: "select", id });
    setIsEditingFix(false);
  };

  const handleAcceptFix = (id: string) => {
    dispatch({ type: "accept", id, at: new Date().toISOString() });
    setIsEditingFix(false);
  };

  const handleApplyCustomEdit = (id: string) => {
    if (!customEditText.trim()) return;
    dispatch({ type: "edit", id, text: customEditText.trim(), at: new Date().toISOString() });
    setIsEditingFix(false);
  };

  const handleConfirmDismiss = (id: string) => {
    if (!dismissReason.trim() || dismissReason.trim().length < 8) return;
    dispatch({ type: "dismiss", id, reason: dismissReason.trim(), at: new Date().toISOString() });
    setShowDismissModal(false);
    setDismissReason("");
  };

  const handleApprove = () => {
    dispatch({ type: "approve", at: new Date().toISOString() });
  };

  const handlePostComment = () => {
    if (!newCommentText.trim()) return;
    const newComment: ReviewComment = {
      id: `CMT-${String(comments.length + 1).padStart(2, "0")}`,
      author: roleProfile.person,
      role: state.role,
      at: new Date().toISOString(),
      text: newCommentText.trim(),
    };
    setComments((prev) => [...prev, newComment]);
    setNewCommentText("");
  };

  const handleFormatChange = (fmt: "text" | "image" | "document") => {
    setCurrentFormat(fmt);
    if (fmt === "text") {
      const textPreset = FORMAT_PRESETS.text;
      const findings = analyzeAnyContent(textPreset.text, "text");
      dispatch({
        type: "submit_custom_draft",
        draft: textPreset,
        findings,
        at: new Date().toISOString(),
      });
    } else if (fmt === "image") {
      const imgPreset = FORMAT_PRESETS.image;
      const findings = analyzeAnyContent(imgPreset.text, "image", {
        altText: imgPreset.altText,
        contrastRatio: imgPreset.contrastRatio,
      });
      dispatch({
        type: "submit_custom_draft",
        draft: {
          id: imgPreset.id,
          title: imgPreset.title,
          brand: imgPreset.brand,
          campaign: imgPreset.campaign,
          channel: imgPreset.channel,
          author: imgPreset.author,
          submittedAt: imgPreset.submittedAt,
          version: imgPreset.version,
          text: imgPreset.text,
        },
        findings,
        at: new Date().toISOString(),
      });
    } else if (fmt === "document") {
      const docPreset = FORMAT_PRESETS.document;
      const findings = analyzeAnyContent(docPreset.text, "document");
      dispatch({
        type: "submit_custom_draft",
        draft: docPreset,
        findings,
        at: new Date().toISOString(),
      });
    }
  };

  const handleRunLiveScan = () => {
    const textToScan = customInputText.trim();
    if (!textToScan) return;
    const findings = analyzeAnyContent(textToScan, "text");
    const newDraft = {
      id: `draft-custom-${Date.now().toString().slice(-4)}`,
      title: scanPreset === "agency" ? "AI Agency Generation (Live Intake)" : "Custom Marketing Copy",
      brand: "Arthaa Finserv",
      campaign: "Live Scanner Intake",
      channel: "Multi-Channel Retail Campaign",
      author: `${roleProfile.person} (${roleProfile.label})`,
      submittedAt: new Date().toISOString(),
      version: 1,
      text: textToScan,
    };
    dispatch({
      type: "submit_custom_draft",
      draft: newDraft,
      findings,
      at: new Date().toISOString(),
    });
    setShowScanModal(false);
    setCurrentFormat("text");
  };

  const handleCreateRule = () => {
    if (!newRuleData.title.trim()) return;
    const rule: Rule = {
      id: newRuleData.id,
      version: "1.0",
      title: newRuleData.title,
      summary: newRuleData.summary,
      category: newRuleData.category,
      severity: newRuleData.severity,
      status: "in_force",
      effectiveFrom: new Date().toISOString().slice(0, 10),
    };
    setAllRules((prev) => [rule, ...prev]);
    setShowAddRuleModal(false);
    setNewRuleData({ id: `R-${Math.floor(Math.random() * 80 + 20)}`, title: "", summary: "", category: "Regulatory", severity: "high" });
  };

  const handleCreateFact = () => {
    if (!newFactData.label.trim()) return;
    const fact: Fact = {
      id: newFactData.id,
      version: "1",
      label: newFactData.label,
      value: newFactData.value,
      validFrom: new Date().toISOString().slice(0, 10),
      validUntil: newFactData.validUntil,
      sourceId: "E-021",
      status: "current",
    };
    setAllFacts((prev) => [fact, ...prev]);
    setShowAddFactModal(false);
    setNewFactData({ id: `F-${Math.floor(Math.random() * 80 + 50)}`, label: "", value: "", validUntil: "2027-12-31" });
  };

  return (
    <section id="workspace" className="min-h-screen bg-background text-text-primary pt-24 pb-20">
      <div className="container-x">
        {/* Workspace Top Header & Navigation Bar */}
        <div className="bg-surface rounded-2xl p-5 border border-border mb-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {onBackToLanding && (
              <button
                onClick={onBackToLanding}
                className="text-xs uppercase font-mono tracking-wider text-brand-green hover:underline flex items-center gap-1"
              >
                ← Public Site
              </button>
            )}
            <h2 className="font-serif italic text-2xl text-text-primary">
              Review Workspace
            </h2>
            <span className="text-xs font-mono bg-surface-muted px-2.5 py-0.5 rounded-full text-text-secondary">
              {state.draft.brand} · v{state.draft.version}
            </span>

            {/* Privacy & AI Disclosure Trigger */}
            <button
              onClick={() => setShowPrivacyModal(true)}
              className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-surface-muted hover:bg-background-soft border border-border/80 text-text-muted hover:text-text-primary transition-colors flex items-center gap-1.5"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-success inline-block" />
              Sovereign AI Protocol
            </button>
          </div>

          {/* Interactive Role Switcher */}
          <div className="flex items-center gap-2 self-stretch md:self-auto justify-between md:justify-end">
            <span className="text-xs font-mono text-text-muted mr-1 hidden sm:inline">Active Persona:</span>
            <div className="flex items-center bg-background-soft rounded-full p-1 border border-border">
              {ROLE_ORDER.map((r) => {
                const p = ROLES[r];
                const active = state.role === r;
                return (
                  <button
                    key={r}
                    onClick={() => dispatch({ type: "set_role", role: r })}
                    className={`text-xs px-3 py-1 rounded-full transition-all duration-200 font-sans ${
                      active
                        ? "bg-brand-green text-on-dark font-medium shadow-xs"
                        : "text-text-muted hover:text-text-primary"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center justify-between border-b border-border/80 pb-2 mb-6 overflow-x-auto gap-4">
          <div className="flex items-center gap-2">
            {[
              { id: "workspace", label: "Review Studio" },
              { id: "brain", label: "Brand Brain (Guidelines, Facts, Assets)" },
              { id: "queue", label: "Review Queue" },
              { id: "insights", label: "Governance Insights" },
              { id: "audit", label: "SHA-256 Audit Trail" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`text-xs uppercase tracking-wider font-mono px-4 py-2 rounded-t-lg transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-surface text-brand-green font-semibold border-t border-x border-border border-b-2 border-b-surface"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Action button: Scan New Content */}
          <button
            onClick={() => setShowScanModal(true)}
            className="text-xs font-mono uppercase px-3.5 py-1.5 rounded-pill bg-brand-green text-on-dark hover:bg-brand-green-dark transition-colors whitespace-nowrap font-medium shadow-xs flex items-center gap-1.5"
          >
            <span>+</span> Scan New Content
          </button>
        </div>

        {/* TAB 1: Main Review Studio */}
        {activeTab === "workspace" && (
          <div className="space-y-6">
            {/* Multi-Format Selector Bar */}
            <div className="bg-surface rounded-xl p-3 border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-text-muted mr-2">
                  Content Format:
                </span>
                <button
                  onClick={() => handleFormatChange("text")}
                  className={`text-xs font-mono px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    currentFormat === "text"
                      ? "bg-brand-green text-on-dark font-medium"
                      : "bg-background-soft text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <span>📝</span> Marketing Copy
                </button>
                <button
                  onClick={() => handleFormatChange("image")}
                  className={`text-xs font-mono px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    currentFormat === "image"
                      ? "bg-brand-green text-on-dark font-medium"
                      : "bg-background-soft text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <span>🎨</span> Visual Banner & WCAG
                </button>
                <button
                  onClick={() => handleFormatChange("document")}
                  className={`text-xs font-mono px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    currentFormat === "document"
                      ? "bg-brand-green text-on-dark font-medium"
                      : "bg-background-soft text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <span>📄</span> Factsheet PDF & Claims
                </button>
              </div>

              {/* Toggle Team Discussion Drawer */}
              <button
                onClick={() => setShowCommentsDrawer(!showCommentsDrawer)}
                className={`text-xs font-mono px-3 py-1.5 rounded-lg border border-border transition-colors flex items-center gap-1.5 ${
                  showCommentsDrawer ? "bg-surface-muted text-brand-green font-medium" : "text-text-muted hover:text-text-primary"
                }`}
              >
                <span>💬</span> Team Notes ({comments.length})
              </button>
            </div>

            {/* Main 3-Area Studio Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Draft Content Display (Text / Image / Document) */}
              <div className="lg:col-span-7 space-y-6">
                {/* Content Box */}
                <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-border shadow-xs">
                  <div className="flex items-center justify-between pb-4 border-b border-border/60 mb-6">
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary">
                        {state.draft.title}
                      </h3>
                      <p className="text-xs text-text-muted mt-0.5">
                        Author: {state.draft.author} · {state.draft.channel}
                      </p>
                    </div>

                    <span
                      className={`text-xs font-mono uppercase px-3 py-1 rounded-full ${
                        isApproved
                          ? "bg-success-soft text-success font-medium"
                          : openCount === 0
                          ? "bg-brand-pink-soft text-brand-pink font-medium"
                          : "bg-warning-soft text-warning font-medium"
                      }`}
                    >
                      {isApproved
                        ? "Certified & Approved"
                        : openCount === 0
                        ? "Ready For Sign-Off"
                        : `${openCount} Open Issue${openCount > 1 ? "s" : ""}`}
                    </span>
                  </div>

                  {/* FORMAT 1: Text Copy with Interactive marked spans */}
                  {currentFormat === "text" && (
                    <div>
                      <div className="relative text-lg sm:text-xl font-serif leading-relaxed text-text-primary p-4 rounded-xl bg-background-soft border border-border/60 min-h-36">
                        {segmentText(state.draft.text, state.findings).map((seg, idx) => {
                          if (!seg.finding) {
                            return <span key={idx}>{seg.text}</span>;
                          }

                          const f = seg.finding;
                          const isSelected = f.id === state.selectedId;
                          const tone = KIND_META[f.kind].tone;
                          const resolved = f.status !== "open";

                          return (
                            <button
                              type="button"
                              key={idx}
                              onClick={() => handleSelectFinding(f.id)}
                              className={`mark-span text-left inline-block cursor-pointer ${
                                isSelected
                                  ? TONE_CLASSES[tone].markActive
                                  : TONE_CLASSES[tone].mark
                              } ${
                                resolved
                                  ? "opacity-60 line-through decoration-text-muted"
                                  : ""
                              }`}
                            >
                              {f.phrase}
                            </button>
                          );
                        })}
                      </div>

                      {/* Intent-Preserving Live Diff Preview */}
                      <div className="mt-6 pt-6 border-t border-border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs uppercase font-mono tracking-wider text-brand-green font-semibold">
                            Intent-Preserving Live Proposal:
                          </span>
                          <span className="text-xs font-mono text-text-muted">
                            {state.findings.filter((f) => f.status !== "open").length} / {state.findings.length} resolved
                          </span>
                        </div>

                        <p className="text-base font-serif italic text-text-primary p-4 rounded-xl bg-surface-muted/40 border border-border/80">
                          {revisedText(state.draft, state.findings)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* FORMAT 2: Visual Banner & WCAG Accessibility Analyzer */}
                  {currentFormat === "image" && (
                    <div className="space-y-6">
                      <div className="relative rounded-xl overflow-hidden border border-border bg-background-soft aspect-square max-h-[380px] mx-auto flex items-center justify-center">
                        <Image
                          src="/images/cap-fixes.jpg"
                          alt="Campaign Creative Visual Asset"
                          fill
                          className="object-cover"
                        />
                        {/* Interactive Diagnostic Overlays */}
                        <div className="absolute inset-0 bg-black/25 flex flex-col justify-between p-4">
                          <div className="flex items-center justify-between">
                            <span className="bg-critical/90 backdrop-blur-md text-on-dark text-[11px] font-mono px-2.5 py-1 rounded-full border border-white/20">
                              ⚠️ Contrast: 2.8:1 (WCAG AA FAILS)
                            </span>
                            <span className="bg-warning/90 backdrop-blur-md text-on-dark text-[11px] font-mono px-2.5 py-1 rounded-full border border-white/20">
                              ⚠️ Alt-Text Missing
                            </span>
                          </div>

                          <div className="bg-surface/95 backdrop-blur-md p-3 rounded-lg border border-border text-xs">
                            <div className="flex items-center justify-between text-text-primary font-medium mb-1">
                              <span>Overlay Text: &quot;Guaranteed wealth growth&quot;</span>
                              <span className="text-critical font-mono">Flagged R-07</span>
                            </div>
                            <p className="text-[11px] text-text-muted">
                              Visual standard V-04 requires 4.5:1 text-to-background contrast and 24px logo margin.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Visual & Accessibility Diagnostics Table */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-background-soft rounded-xl border border-border">
                          <span className="text-text-muted block text-[11px] font-mono uppercase mb-0.5">Color Palette Check</span>
                          <span className="font-semibold text-text-primary flex items-center gap-1.5">
                            <span className="h-3 w-3 rounded-full bg-[#c26043] inline-block" />
                            Primary Terracotta Token Passed
                          </span>
                        </div>
                        <div className="p-3 bg-background-soft rounded-xl border border-border">
                          <span className="text-text-muted block text-[11px] font-mono uppercase mb-0.5">Logo Clearspace</span>
                          <span className="font-semibold text-text-primary">24px Safe Padding Verified</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FORMAT 3: Factsheet PDF & Claims Extraction */}
                  {currentFormat === "document" && (
                    <div className="space-y-4">
                      <div className="p-4 bg-background-soft rounded-xl border border-border space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-border/60">
                          <span className="text-xs font-mono uppercase text-brand-green font-semibold">
                            Audited Document Claims vs Fact Ledger
                          </span>
                          <span className="text-xs font-mono text-text-muted">pgvector Match 99.2%</span>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between p-2 rounded-lg bg-surface border border-border/60">
                            <div>
                              <span className="font-semibold text-text-primary block">Reported AUM Metric</span>
                              <span className="text-text-muted font-mono">Document states: ₹4,200 crore</span>
                            </div>
                            <span className="bg-warning-soft text-warning px-2.5 py-1 rounded-full font-mono text-[11px]">
                              Expired (Audited v2 is ₹4,850 Cr)
                            </span>
                          </div>

                          <div className="flex items-center justify-between p-2 rounded-lg bg-surface border border-border/60">
                            <div>
                              <span className="font-semibold text-text-primary block">Total Expense Ratio (TER)</span>
                              <span className="text-text-muted font-mono">Document states: 0.65%</span>
                            </div>
                            <span className="bg-success-soft text-success px-2.5 py-1 rounded-full font-mono text-[11px]">
                              Verified SEBI Compliant
                            </span>
                          </div>

                          <div className="flex items-center justify-between p-2 rounded-lg bg-surface border border-border/60">
                            <div>
                              <span className="font-semibold text-text-primary block">Statutory Riskometer Graphic</span>
                              <span className="text-text-muted font-mono">Document classification: High</span>
                            </div>
                            <span className="bg-success-soft text-success px-2.5 py-1 rounded-full font-mono text-[11px]">
                              Verified Consistent
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Team Discussion & Collaboration Thread Drawer */}
                <AnimatePresence>
                  {showCommentsDrawer && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-surface rounded-2xl p-6 border border-border shadow-xs space-y-4"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-border">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-text-primary">
                            Reviewer Collaboration & Audit Thread
                          </h4>
                          <span className="text-xs font-mono bg-surface-muted px-2 py-0.5 rounded-full text-text-muted">
                            {comments.length} notes
                          </span>
                        </div>
                        <span className="text-xs text-text-muted font-mono">Role: {roleProfile.label}</span>
                      </div>

                      {/* Comment List */}
                      <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                        {comments.map((cmt) => (
                          <div key={cmt.id} className="p-3 bg-background-soft rounded-xl border border-border/60 text-xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-text-primary">
                                {cmt.author} <span className="text-text-muted font-normal font-mono">({cmt.role})</span>
                              </span>
                              <span className="text-[11px] font-mono text-text-muted">
                                {cmt.at.slice(11, 16)}
                              </span>
                            </div>
                            <p className="text-text-secondary leading-relaxed">{cmt.text}</p>
                          </div>
                        ))}
                      </div>

                      {/* Post Comment Input */}
                      <div className="flex gap-2 pt-2">
                        <input
                          type="text"
                          value={newCommentText}
                          onChange={(e) => setNewCommentText(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handlePostComment()}
                          placeholder={`Add note as ${roleProfile.label}...`}
                          className="flex-1 text-xs px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:border-brand-green"
                        />
                        <button
                          type="button"
                          onClick={handlePostComment}
                          disabled={!newCommentText.trim()}
                          className="text-xs font-mono uppercase px-4 py-2 rounded-xl bg-brand-green text-on-dark font-medium hover:bg-brand-green-dark transition-colors disabled:opacity-40"
                        >
                          Post
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Hard-Gated Approval Lock Widget */}
                <div
                  className={`rounded-2xl p-6 border transition-all duration-300 ${
                    isApproved
                      ? "bg-[#0e231a] text-on-dark border-brand-green shadow-md"
                      : openCount === 0
                      ? "bg-surface border-brand-green shadow-xs"
                      : "bg-surface/50 border-border opacity-85"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            isApproved
                              ? "bg-success"
                              : openCount === 0
                              ? "bg-brand-pink"
                              : "bg-warning"
                          }`}
                        />
                        <h4 className="font-semibold text-sm">
                          {isApproved
                            ? "Cryptographic Approval Certificate Issued"
                            : openCount === 0
                            ? "All Findings Resolved — Ready for Sign-Off"
                            : `Approval Locked (${openCount} issue${openCount > 1 ? "s" : ""} open)`}
                        </h4>
                      </div>

                      <p className="text-xs text-text-muted max-w-md">
                        {isApproved
                          ? `Certified by ${state.approval?.approvedBy} (${state.approval?.role}). Sealed hash: ${shortHash(state.approval?.contentHash || "")}`
                          : openCount === 0
                          ? roleProfile.can.approve
                            ? "As Compliance Approver, you can sign and lock this approved copy version."
                            : "Switch to Compliance Approver or Admin to sign the final audit certificate."
                          : "In accordance with governance policy, unreviewed findings strictly forbid publishing."}
                      </p>
                    </div>

                    {!isApproved && openCount === 0 && (
                      <button
                        type="button"
                        disabled={!roleProfile.can.approve}
                        onClick={handleApprove}
                        className="px-6 py-3 rounded-pill bg-brand-green text-on-dark text-xs uppercase font-semibold tracking-wider hover:bg-brand-green-dark transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                      >
                        Sign & Lock Approval
                      </button>
                    )}

                    {isApproved && (
                      <span className="text-xs font-mono uppercase bg-success-soft text-success px-3 py-1.5 rounded-full font-semibold">
                        {state.approval?.certificateId}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Selected Finding Resolution Panel */}
              <div className="lg:col-span-5">
                <div className="bg-surface rounded-2xl p-6 sm:p-7 border border-border shadow-xs sticky top-28">
                  {selectedFinding ? (
                    <div className="space-y-6">
                      {/* Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-border/80">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-mono uppercase px-2.5 py-0.5 rounded-full ${
                              TONE_CLASSES[KIND_META[selectedFinding.kind].tone].chip
                            }`}
                          >
                            {KIND_META[selectedFinding.kind].label}
                          </span>
                          <span className="text-xs font-mono text-text-muted">
                            {selectedFinding.severity.toUpperCase()}
                          </span>
                        </div>

                        <span
                          className={`text-xs font-mono uppercase ${
                            selectedFinding.status === "open"
                              ? "text-warning font-semibold"
                              : "text-success font-semibold"
                          }`}
                        >
                          ● {selectedFinding.status}
                        </span>
                      </div>

                      {/* Target Phrase */}
                      <div>
                        <span className="text-xs uppercase font-mono tracking-wider text-text-muted block mb-1">
                          Flagged Target Span:
                        </span>
                        <blockquote className="text-base font-serif italic text-text-primary bg-background-soft p-3 rounded-lg border border-border/60">
                          “{selectedFinding.phrase}”
                        </blockquote>
                      </div>

                      {/* Explanation (Why) */}
                      <div>
                        <span className="text-xs uppercase font-mono tracking-wider text-text-muted block mb-1">
                          Why It Was Flagged:
                        </span>
                        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                          {selectedFinding.why}
                        </p>
                      </div>

                      {/* Evidence & Citation */}
                      <div className="bg-surface-muted/30 p-3.5 rounded-xl border border-border/80 space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-brand-green font-semibold">
                            Citation / Rule Ref:
                          </span>
                          <span className="text-text-muted">
                            {selectedFinding.ruleId || selectedFinding.factId || "Source Ref"}
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary">
                          {selectedFinding.evidence}
                        </p>
                        <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] font-mono text-text-muted">
                          <span>Confidence: {(selectedFinding.confidence * 100).toFixed(0)}%</span>
                          <span>{selectedFinding.confidenceNote}</span>
                        </div>
                      </div>

                      {/* Suggested Intent-Preserving Fix */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs uppercase font-mono tracking-wider text-brand-green font-semibold">
                            Intent-Preserving Proposal:
                          </span>
                          <span className="text-[11px] text-text-muted">
                            Creator Intent Preserved
                          </span>
                        </div>

                        <div className="bg-background-soft p-3.5 rounded-xl border border-border flex flex-col gap-2">
                          <p className="text-sm font-medium text-text-primary font-serif">
                            {selectedFinding.suggestedFix}
                          </p>
                          <p className="text-xs text-text-muted italic">
                            Note: {selectedFinding.intentNote}
                          </p>
                        </div>
                      </div>

                      {/* Custom Edit Box if active */}
                      {isEditingFix && (
                        <div className="space-y-2 pt-2">
                          <label className="text-xs font-mono uppercase tracking-wider text-text-secondary">
                            Custom Replacement Phrasing:
                          </label>
                          <textarea
                            rows={3}
                            value={customEditText}
                            onChange={(e) => setCustomEditText(e.target.value)}
                            className="w-full text-xs p-3 rounded-lg border border-border bg-background focus:outline-none focus:border-brand-green"
                            placeholder="Type custom compliant copy..."
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setIsEditingFix(false)}
                              className="text-xs px-3 py-1.5 text-text-muted hover:text-text-primary"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleApplyCustomEdit(selectedFinding.id)}
                              className="text-xs px-4 py-1.5 rounded-pill bg-brand-green text-on-dark font-medium"
                            >
                              Apply Edit
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Review Actions: Accept, Edit, Dismiss */}
                      {!isApproved && selectedFinding.status === "open" && !isEditingFix && (
                        <div className="pt-4 border-t border-border flex items-center gap-2">
                          <button
                            type="button"
                            disabled={!roleProfile.can.acceptFix}
                            onClick={() => handleAcceptFix(selectedFinding.id)}
                            className="flex-1 py-2.5 rounded-pill bg-brand-green text-on-dark text-xs uppercase font-semibold tracking-wider hover:bg-brand-green-dark transition-all disabled:opacity-40"
                          >
                            Accept Fix
                          </button>

                          <button
                            type="button"
                            disabled={!roleProfile.can.editFix}
                            onClick={() => {
                              setCustomEditText(selectedFinding.suggestedFix);
                              setIsEditingFix(true);
                            }}
                            className="px-4 py-2.5 rounded-pill border border-border text-xs uppercase font-semibold tracking-wider hover:bg-background-soft transition-all disabled:opacity-40"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            disabled={!roleProfile.can.dismiss}
                            onClick={() => setShowDismissModal(true)}
                            className="px-4 py-2.5 rounded-pill border border-critical/30 text-critical text-xs uppercase font-semibold tracking-wider hover:bg-critical-soft transition-all disabled:opacity-40"
                          >
                            Dismiss
                          </button>
                        </div>
                      )}

                      {/* Reopen button if already resolved */}
                      {selectedFinding.status !== "open" && !isApproved && (
                        <div className="pt-4 border-t border-border flex items-center justify-between">
                          <span className="text-xs text-text-muted italic">
                            Resolved by {selectedFinding.resolution?.by} ({selectedFinding.resolution?.role})
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              dispatch({
                                type: "reopen",
                                id: selectedFinding.id,
                                at: new Date().toISOString(),
                              })
                            }
                            className="text-xs font-mono text-brand-green hover:underline"
                          >
                            Reopen Flag
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-text-muted text-center py-12">
                      Select a finding to inspect citations and take action.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Brand Brain (Guidelines, Facts, Glossary, Brand Assets) */}
        {activeTab === "brain" && (
          <div className="space-y-6">
            {/* Sub-tab Navigation */}
            <div className="flex items-center justify-between border-b border-border/80 pb-2">
              <div className="flex items-center gap-2">
                {[
                  { id: "rules", label: "Rules & Guidelines" },
                  { id: "facts", label: "Fact Ledger & Vault" },
                  { id: "glossary", label: "Approved Terminology" },
                  { id: "assets", label: "Brand Assets & Tokens" },
                ].map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setBrainSubTab(sub.id as any)}
                    className={`text-xs uppercase font-mono px-3 py-1.5 rounded-md transition-colors ${
                      brainSubTab === sub.id
                        ? "bg-brand-green text-on-dark font-medium"
                        : "bg-surface text-text-muted hover:text-text-primary"
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>

              {/* Add Entry Buttons */}
              <div>
                {brainSubTab === "rules" && (
                  <button
                    onClick={() => setShowAddRuleModal(true)}
                    className="text-xs font-mono uppercase px-3 py-1.5 rounded-pill bg-brand-green text-on-dark hover:bg-brand-green-dark transition-colors"
                  >
                    + Define New Rule
                  </button>
                )}
                {brainSubTab === "facts" && (
                  <button
                    onClick={() => setShowAddFactModal(true)}
                    className="text-xs font-mono uppercase px-3 py-1.5 rounded-pill bg-brand-green text-on-dark hover:bg-brand-green-dark transition-colors"
                  >
                    + Register Audited Fact
                  </button>
                )}
              </div>
            </div>

            {/* Sub-tab 1: Rules & Guidelines */}
            {brainSubTab === "rules" && (
              <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-border">
                <h3 className="font-serif italic text-2xl text-text-primary mb-2">
                  Active Brand Rules & Regulatory Standards
                </h3>
                <p className="text-xs sm:text-sm text-text-muted mb-6">
                  Deterministic regex and brand rules in force across Arthaa Finserv.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allRules.map((rule) => (
                    <div
                      key={rule.id}
                      className="p-5 rounded-xl bg-background-soft border border-border/80"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono font-semibold text-brand-green">
                          {rule.id} · v{rule.version}
                        </span>
                        <span className="text-[11px] font-mono uppercase bg-surface-muted px-2 py-0.5 rounded-full">
                          {rule.category}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-text-primary mb-1">
                        {rule.title}
                      </h4>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {rule.summary}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-tab 2: Fact Ledger & Source Vault */}
            {brainSubTab === "facts" && (
              <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-border">
                <h3 className="font-serif italic text-2xl text-text-primary mb-2">
                  Temporal Fact Ledger & Source Vault
                </h3>
                <p className="text-xs sm:text-sm text-text-muted mb-6">
                  Audited financial metrics with temporal validity windows and cryptographic hash citations.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead>
                      <tr className="border-b border-border text-text-muted font-mono uppercase">
                        <th className="py-2.5">Fact ID</th>
                        <th>Metric</th>
                        <th>Audited Value</th>
                        <th>Validity Window</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {allFacts.map((fact, idx) => (
                        <tr key={idx} className="hover:bg-background-soft/60">
                          <td className="py-3 font-mono font-medium text-brand-green">
                            {fact.id} v{fact.version}
                          </td>
                          <td className="font-medium text-text-primary">{fact.label}</td>
                          <td className="font-mono">{fact.value}</td>
                          <td className="text-text-muted">
                            {fact.validFrom || "2026-01-01"} → {fact.validUntil}
                          </td>
                          <td>
                            <span
                              className={`px-2 py-0.5 rounded-full font-mono text-[11px] ${
                                fact.status === "current"
                                  ? "bg-success-soft text-success"
                                  : "bg-warning-soft text-warning"
                              }`}
                            >
                              {fact.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Sub-tab 3: Approved Terminology & Glossary */}
            {brainSubTab === "glossary" && (
              <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-border">
                <h3 className="font-serif italic text-2xl text-text-primary mb-2">
                  Brand Glossary & Nomenclature Registry
                </h3>
                <p className="text-xs sm:text-sm text-text-muted mb-6">
                  Approved vs disallowed phrasing ensuring tone, messaging, and statutory compliance.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead>
                      <tr className="border-b border-border text-text-muted font-mono uppercase">
                        <th className="py-2.5 text-critical">Disallowed Phrasing</th>
                        <th className="text-success">Approved / Preferred Term</th>
                        <th>Governance Rationale</th>
                        <th>Rule ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {GLOSSARY_TERMS.map((term, idx) => (
                        <tr key={idx} className="hover:bg-background-soft/60">
                          <td className="py-3 text-critical font-medium line-through">
                            {term.disallowed}
                          </td>
                          <td className="text-success font-medium">
                            {term.preferred}
                          </td>
                          <td className="text-text-secondary max-w-sm">
                            {term.reason}
                          </td>
                          <td className="font-mono text-brand-green">
                            {term.ruleId}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Sub-tab 4: Brand Assets & Design Tokens */}
            {brainSubTab === "assets" && (
              <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-border">
                <h3 className="font-serif italic text-2xl text-text-primary mb-2">
                  Reusable Brand Assets & Visual Standards
                </h3>
                <p className="text-xs sm:text-sm text-text-muted mb-6">
                  Design tokens, logo safety guidelines, color palettes, and statutory boilerplates.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {BRAND_ASSETS.map((asset) => (
                    <div key={asset.id} className="p-4 rounded-xl bg-background-soft border border-border/80">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs font-semibold text-brand-green">
                          {asset.id}
                        </span>
                        <span className="text-[11px] font-mono uppercase bg-surface-muted px-2 py-0.5 rounded">
                          {asset.type}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-text-primary mb-1">
                        {asset.name}
                      </h4>
                      <p className="text-xs font-mono bg-surface p-2 rounded border border-border/60 text-text-primary mb-2">
                        {asset.value}
                      </p>
                      <p className="text-xs text-text-muted leading-relaxed">
                        {asset.rule}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Review Queue */}
        {activeTab === "queue" && (
          <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-border">
            <h3 className="font-serif italic text-2xl text-text-primary mb-2">
              Cross-Channel Review Queue
            </h3>
            <p className="text-xs sm:text-sm text-text-muted mb-6">
              Marketing campaigns routed for automated analysis and human governance.
            </p>

            <div className="divide-y divide-border/60">
              {QUEUE.map((item) => (
                <div
                  key={item.id}
                  className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div>
                    <h4 className="text-sm font-semibold text-text-primary">
                      {item.title}
                    </h4>
                    <p className="text-xs text-text-muted mt-0.5">
                      {item.channel} · Author: {item.author} · Updated {item.updated}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-text-secondary">
                      {item.findings} Findings
                    </span>
                    <span
                      className={`text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full ${
                        item.status === "approved"
                          ? "bg-success-soft text-success"
                          : item.status === "in_review"
                          ? "bg-warning-soft text-warning"
                          : "bg-surface-muted text-text-secondary"
                      }`}
                    >
                      {item.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Governance Insights & Learning Loop */}
        {activeTab === "insights" && (
          <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-border space-y-6">
            <div>
              <h3 className="font-serif italic text-2xl text-text-primary mb-2">
                Governance Insights & Learning Loop
              </h3>
              <p className="text-xs sm:text-sm text-text-muted">
                Human reviewer dismissals identify ambiguous or over-restrictive brand rules.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {RULE_INSIGHTS.map((ri) => (
                <div
                  key={ri.ruleId}
                  className={`p-5 rounded-xl border ${
                    ri.flag === "unclear"
                      ? "bg-warning-soft/20 border-warning/40"
                      : "bg-background-soft border-border"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-semibold text-brand-green">
                      {ri.ruleId}
                    </span>
                    <span
                      className={`text-xs font-mono font-semibold ${
                        ri.flag === "unclear" ? "text-warning" : "text-text-muted"
                      }`}
                    >
                      {(ri.dismissalRate * 100).toFixed(0)}% Dismissal Rate
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-text-primary mb-2">
                    {ri.title}
                  </h4>

                  {ri.flag === "unclear" && (
                    <span className="inline-block text-[11px] uppercase font-mono bg-warning-soft text-warning px-2 py-0.5 rounded-full mb-3">
                      ⚠️ Rule Friction Detected
                    </span>
                  )}

                  {ri.feedback.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border/60">
                      <span className="text-[11px] uppercase font-mono text-text-muted block mb-1">
                        Recent Dismissal Feedback:
                      </span>
                      <ul className="text-xs text-text-secondary space-y-1 italic">
                        {ri.feedback.map((fb, idx) => (
                          <li key={idx}>“{fb}”</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: Tamper-Evident SHA-256 Audit Trail */}
        {activeTab === "audit" && (
          <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-border">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-serif italic text-2xl text-text-primary mb-1">
                  Cryptographic Audit Chain
                </h3>
                <p className="text-xs text-text-muted">
                  Every human decision is sealed in an append-only SHA-256 hash block.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs font-mono font-semibold text-success">
                  Mathematical Integrity Verified
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-border text-text-muted font-mono uppercase">
                    <th className="py-2.5">Block ID</th>
                    <th>Timestamp</th>
                    <th>Actor & Role</th>
                    <th>Action</th>
                    <th>Details</th>
                    <th>Block SHA-256</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {state.audit.map((entry) => (
                    <tr key={entry.id} className="hover:bg-background-soft/60">
                      <td className="py-3 font-mono font-semibold text-brand-green">
                        {entry.id}
                      </td>
                      <td className="text-text-muted font-mono whitespace-nowrap">
                        {entry.at.replace("T", " ").slice(0, 19)}
                      </td>
                      <td className="font-medium text-text-primary">
                        {entry.actor} ({entry.role})
                      </td>
                      <td>
                        <span className="font-mono text-[11px] bg-surface-muted px-2 py-0.5 rounded">
                          {entry.action}
                        </span>
                      </td>
                      <td className="text-text-secondary max-w-xs truncate">
                        {entry.detail}
                      </td>
                      <td className="font-mono text-text-muted">
                        {shortHash(entry.hash)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL 1: Dismissal Justification Modal */}
        <AnimatePresence>
          {showDismissModal && selectedFinding && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <div className="bg-surface rounded-2xl p-6 sm:p-8 max-w-lg w-full border border-border shadow-xl space-y-4">
                <h4 className="font-serif italic text-2xl text-text-primary">
                  Dismiss Finding with Justification
                </h4>
                <p className="text-xs text-text-muted">
                  Dismissals require a clear justification to maintain audit integrity and train the Brand Brain.
                </p>

                <div className="p-3 bg-background-soft rounded-lg text-xs font-mono text-text-secondary">
                  Dismissing: “{selectedFinding.phrase}” ({selectedFinding.ruleId || selectedFinding.factId})
                </div>

                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-text-secondary block mb-1">
                    Auditable Justification Reason (min. 8 characters):
                  </label>
                  <textarea
                    rows={3}
                    value={dismissReason}
                    onChange={(e) => setDismissReason(e.target.value)}
                    className="w-full text-xs p-3 rounded-lg border border-border bg-background focus:outline-none focus:border-brand-green"
                    placeholder="e.g. Approved by legal counsel for specific institutional distribution..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDismissModal(false);
                      setDismissReason("");
                    }}
                    className="text-xs px-4 py-2 text-text-muted hover:text-text-primary"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={dismissReason.trim().length < 8}
                    onClick={() => handleConfirmDismiss(selectedFinding.id)}
                    className="text-xs px-5 py-2.5 rounded-pill bg-critical text-on-dark font-semibold uppercase tracking-wider disabled:opacity-40"
                  >
                    Confirm Dismissal
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODAL 2: Live Content Scanner Modal */}
        <AnimatePresence>
          {showScanModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <div className="bg-surface rounded-2xl p-6 sm:p-8 max-w-xl w-full border border-border shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border/80">
                  <h4 className="font-serif italic text-2xl text-text-primary">
                    Scan Marketing Content
                  </h4>
                  <button
                    onClick={() => setShowScanModal(false)}
                    className="text-xs font-mono text-text-muted hover:text-text-primary"
                  >
                    ✕ Close
                  </button>
                </div>
                <p className="text-xs text-text-muted">
                  Test realistic marketing copy generated by agencies, external tools, or employees.
                </p>

                {/* Preset Selector */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setScanPreset("agency");
                      setCustomInputText(
                        "Build steady wealth with guaranteed 15% returns from Arthaa Gold Savings Fund! India's #1 fund beating 99% of peers. Hurry up, start a SIP and enjoy zero risk profits!"
                      );
                    }}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-mono ${
                      scanPreset === "agency"
                        ? "bg-brand-green text-on-dark border-brand-green"
                        : "bg-background-soft text-text-secondary border-border"
                    }`}
                  >
                    AI Agency Copy (High Risk)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setScanPreset("marketing");
                      setCustomInputText(
                        "Arthaa Gold Savings Fund now manages ₹4,200 crore with proven historical growth. Start a SIP today."
                      );
                    }}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-mono ${
                      scanPreset === "marketing"
                        ? "bg-brand-green text-on-dark border-brand-green"
                        : "bg-background-soft text-text-secondary border-border"
                    }`}
                  >
                    Marketing Blast (Expired AUM)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setScanPreset("custom");
                      setCustomInputText("");
                    }}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-mono ${
                      scanPreset === "custom"
                        ? "bg-brand-green text-on-dark border-brand-green"
                        : "bg-background-soft text-text-secondary border-border"
                    }`}
                  >
                    Freeform
                  </button>
                </div>

                {/* Textarea */}
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-text-secondary block mb-1">
                    Content Text to Verify:
                  </label>
                  <textarea
                    rows={4}
                    value={customInputText}
                    onChange={(e) => setCustomInputText(e.target.value)}
                    placeholder="Paste marketing copy, newsletter draft, or promotional snippet here..."
                    className="w-full text-xs p-3.5 rounded-xl border border-border bg-background focus:outline-none focus:border-brand-green font-serif"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowScanModal(false)}
                    className="text-xs px-4 py-2 text-text-muted hover:text-text-primary"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!customInputText.trim()}
                    onClick={handleRunLiveScan}
                    className="text-xs px-5 py-2.5 rounded-pill bg-brand-green text-on-dark font-semibold uppercase tracking-wider hover:bg-brand-green-dark transition-all disabled:opacity-40"
                  >
                    Run Dual-Engine Scan
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODAL 3: Add Rule Modal */}
        <AnimatePresence>
          {showAddRuleModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <div className="bg-surface rounded-2xl p-6 sm:p-8 max-w-lg w-full border border-border shadow-xl space-y-4">
                <h4 className="font-serif italic text-2xl text-text-primary">
                  Define New Brand Guideline Rule
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-text-secondary block mb-1">
                      Rule Title:
                    </label>
                    <input
                      type="text"
                      value={newRuleData.title}
                      onChange={(e) => setNewRuleData({ ...newRuleData, title: e.target.value })}
                      placeholder="e.g. Prohibit Unlicensed Comparative Benchmarks"
                      className="w-full text-xs p-3 rounded-lg border border-border bg-background focus:outline-none focus:border-brand-green"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-text-secondary block mb-1">
                      Guideline Summary:
                    </label>
                    <textarea
                      rows={2}
                      value={newRuleData.summary}
                      onChange={(e) => setNewRuleData({ ...newRuleData, summary: e.target.value })}
                      placeholder="Explanation of the statutory or brand policy..."
                      className="w-full text-xs p-3 rounded-lg border border-border bg-background focus:outline-none focus:border-brand-green"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddRuleModal(false)}
                    className="text-xs px-4 py-2 text-text-muted hover:text-text-primary"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!newRuleData.title.trim()}
                    onClick={handleCreateRule}
                    className="text-xs px-5 py-2.5 rounded-pill bg-brand-green text-on-dark font-semibold uppercase tracking-wider hover:bg-brand-green-dark transition-all disabled:opacity-40"
                  >
                    Publish Rule v1.0
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODAL 4: Add Fact Modal */}
        <AnimatePresence>
          {showAddFactModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <div className="bg-surface rounded-2xl p-6 sm:p-8 max-w-lg w-full border border-border shadow-xl space-y-4">
                <h4 className="font-serif italic text-2xl text-text-primary">
                  Register Audited Fact in Ledger
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-text-secondary block mb-1">
                      Metric Label:
                    </label>
                    <input
                      type="text"
                      value={newFactData.label}
                      onChange={(e) => setNewFactData({ ...newFactData, label: e.target.value })}
                      placeholder="e.g. Q3 FY27 Equity Fund AUM"
                      className="w-full text-xs p-3 rounded-lg border border-border bg-background focus:outline-none focus:border-brand-green"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-text-secondary block mb-1">
                      Audited Value:
                    </label>
                    <input
                      type="text"
                      value={newFactData.value}
                      onChange={(e) => setNewFactData({ ...newFactData, value: e.target.value })}
                      placeholder="e.g. ₹5,120 crore"
                      className="w-full text-xs p-3 rounded-lg border border-border bg-background focus:outline-none focus:border-brand-green"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddFactModal(false)}
                    className="text-xs px-4 py-2 text-text-muted hover:text-text-primary"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!newFactData.label.trim() || !newFactData.value.trim()}
                    onClick={handleCreateFact}
                    className="text-xs px-5 py-2.5 rounded-pill bg-brand-green text-on-dark font-semibold uppercase tracking-wider hover:bg-brand-green-dark transition-all disabled:opacity-40"
                  >
                    Commit to Ledger
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODAL 5: Privacy, Confidentiality & AI Disclosure Protocol */}
        <AnimatePresence>
          {showPrivacyModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <div className="bg-surface rounded-2xl p-6 sm:p-8 max-w-xl w-full border border-border shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border/80">
                  <h4 className="font-serif italic text-2xl text-text-primary">
                    Data Privacy & AI Disclosure
                  </h4>
                  <button
                    onClick={() => setShowPrivacyModal(false)}
                    className="text-xs font-mono text-text-muted hover:text-text-primary"
                  >
                    ✕ Close
                  </button>
                </div>

                <div className="space-y-3 text-xs text-text-secondary leading-relaxed">
                  <div className="p-3 bg-background-soft rounded-xl border border-border">
                    <span className="font-semibold text-text-primary block mb-1">
                      🔒 Sovereign Localized Enclave (Zero Model Training)
                    </span>
                    <p>
                      VerityBrand operates in customer-dedicated execution environments. Draft copy, creative banners, and financial documents are never ingested into third-party public models or used for AI retraining.
                    </p>
                  </div>

                  <div className="p-3 bg-background-soft rounded-xl border border-border">
                    <span className="font-semibold text-text-primary block mb-1">
                      ⚙️ Dual-Engine Architecture: AI Proposes, Humans Decide
                    </span>
                    <p>
                      Deterministic regex engines enforce statutory non-negotiables (e.g. SEBI returns prohibition), while grounded vector retrieval verifies factual claims against timestamped source vaults.
                    </p>
                  </div>

                  <div className="p-3 bg-background-soft rounded-xl border border-border">
                    <span className="font-semibold text-text-primary block mb-1">
                      🛡️ Strict AI Abstention Invariant
                    </span>
                    <p>
                      When documentary evidence is missing or ambiguous, the engine explicitly abstains and tags the claim as &ldquo;Needs Human Verification&rdquo; rather than fabricating a false or unverified approval verdict.
                    </p>
                  </div>

                  <div className="p-3 bg-background-soft rounded-xl border border-border">
                    <span className="font-semibold text-text-primary block mb-1">
                      ⛓️ SHA-256 Tamper-Evident Audit Ledger
                    </span>
                    <p>
                      Every edit, dismissal, and sign-off is hashed and chained into an append-only mathematical ledger, guaranteeing accountability across all review roles.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPrivacyModal(false)}
                    className="text-xs px-5 py-2.5 rounded-pill bg-brand-green text-on-dark font-medium"
                  >
                    Understood
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}