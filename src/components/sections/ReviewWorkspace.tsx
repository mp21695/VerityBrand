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
  DEMO_CREATIVE_META,
  DEMO_OCR_REGIONS,
  type OCRTextRegion,
  type CreativeAssetMetadata,
  analyzeAnyContent,
  verifyChain,
} from "@/lib/review";
import { motion, AnimatePresence } from "motion/react";

interface WorkspaceProps {
  onBackToLanding?: () => void;
}

// Demo Credentials Mapping per user specifications
export const DEMO_CREDENTIALS: Record<
  Role,
  { email: string; pass: string; name: string; title: string; subtitle: string; hint: string; badge: string; accentColor: string }
> = {
  creator: {
    email: "creator@veritybrand.demo",
    pass: "creator123",
    name: "Riya Sharma",
    title: "Creator Login",
    subtitle: "Access your campaigns, drafts and submissions.",
    hint: "creator@veritybrand.demo / creator123",
    badge: "Campaign Creator",
    accentColor: "from-amber-600/20 to-amber-500/10 border-amber-500/40 text-amber-800",
  },
  reviewer: {
    email: "reviewer@veritybrand.demo",
    pass: "reviewer123",
    name: "Arjun Verma",
    title: "Reviewer Login",
    subtitle: "Access your review queue and evidence-linked findings.",
    hint: "reviewer@veritybrand.demo / reviewer123",
    badge: "Brand Reviewer",
    accentColor: "from-indigo-600/20 to-indigo-500/10 border-indigo-500/40 text-indigo-800",
  },
  approver: {
    email: "approver@veritybrand.demo",
    pass: "approver123",
    name: "Priya Sundaram",
    title: "Compliance Approver Login",
    subtitle: "Access campaigns awaiting final approval.",
    hint: "approver@veritybrand.demo / approver123",
    badge: "Brand Compliance Approver",
    accentColor: "from-emerald-600/20 to-emerald-500/10 border-emerald-500/40 text-emerald-800",
  },
  admin: {
    email: "admin@veritybrand.demo",
    pass: "admin123",
    name: "Harini Nair",
    title: "Admin Login",
    subtitle: "Access governance configuration and system controls.",
    hint: "admin@veritybrand.demo / admin123",
    badge: "Governance Administrator",
    accentColor: "from-blue-600/20 to-blue-500/10 border-blue-500/40 text-blue-800",
  },
};

export function ReviewWorkspace({ onBackToLanding }: WorkspaceProps) {
  // Shared Campaign State across all roles
  const [state, dispatch] = useReducer(reviewReducer, undefined, createInitialReviewState);

  // Authentication State
  const [authenticatedRole, setAuthenticatedRole] = useState<Role | null>(null);
  const [selectedPersonaForLogin, setSelectedPersonaForLogin] = useState<Role | null>(null);
  const [loginEmail, setLoginEmail] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showPersonaDropdown, setShowPersonaDropdown] = useState<boolean>(false);

  // Role-Specific Navigation Tabs
  const [creatorTab, setCreatorTab] = useState<"overview" | "campaigns" | "drafts" | "guidelines" | "sources">("overview");
  const [reviewerTab, setReviewerTab] = useState<"queue" | "review" | "all_campaigns" | "findings" | "decisions">("queue");
  const [approverTab, setApproverTab] = useState<"approval_queue" | "active_review" | "blocked" | "certificates" | "audit">("approval_queue");
  const [adminTab, setAdminTab] = useState<"overview" | "brand_brain" | "facts" | "terminology" | "insights" | "audit_logs" | "users">("overview");

  // Format Switcher inside Review/Draft Studio: text | image | document | version_history
  const [currentFormat, setCurrentFormat] = useState<"text" | "image" | "document" | "version_history">("text");

  // Interaction State for resolution
  const [isEditingFix, setIsEditingFix] = useState<boolean>(false);
  const [customEditText, setCustomEditText] = useState<string>("");
  const [dismissReason, setDismissReason] = useState<string>("");
  const [showDismissModal, setShowDismissModal] = useState<boolean>(false);

  // New Content / Live Scan Modal State (Creator action)
  const [showScanModal, setShowScanModal] = useState<boolean>(false);
  const [scanPreset, setScanPreset] = useState<"agency" | "marketing" | "custom">("agency");
  const [customInputText, setCustomInputText] = useState<string>(
    `NOVA AERORUN X1

Built for your fastest miles.

30% lighter than leading running shoes.

Up to 40 km tested durability.

India's #1 running shoe.

Guaranteed to make every run faster.

Now ₹3,999.`
  );

  // Brand Brain Sub-tabs / Creation Modals (Admin action)
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

  // Multi-Page PDF Source Dossier Viewer State
  const [activePdfDoc, setActivePdfDoc] = useState<"product_facts" | "pricing_master" | "approved_claims" | "guidelines">("product_facts");
  const [activePdfPage, setActivePdfPage] = useState<number>(1);

  // Creative Asset & OCR Vision Pipeline State
  const [creativeMeta, setCreativeMeta] = useState<CreativeAssetMetadata>(DEMO_CREATIVE_META);
  const [ocrRegions, setOcrRegions] = useState<OCRTextRegion[]>(DEMO_OCR_REGIONS);
  const [isOcrScanning, setIsOcrScanning] = useState<boolean>(false);
  const [ocrScanStep, setOcrScanStep] = useState<number>(6); // 0 to 6
  const [creativeFilter, setCreativeFilter] = useState<"all" | "requires_review" | "verified">("all");
  const [hoveredRegionId, setHoveredRegionId] = useState<string | null>(null);

  const OCR_PIPELINE_STEPS = [
    { title: "Creative Received", detail: "Asset ingested · NOVA_AeroRun_Campaign.png · 1024×1024" },
    { title: "Asset Validation", detail: "Dimensions validated (1:1 Square) · RGB color space · WCAG contrast check" },
    { title: "OCR Region Localization", detail: "Computer vision bounding box detection · 9 text regions identified" },
    { title: "Claims Extraction", detail: "5 marketing/performance claims extracted & normalized" },
    { title: "Evidence Retrieval", detail: "Grounded semantic retrieval against 4 active NOVA evidence PDFs" },
    { title: "Governance Rules Applied", detail: "R-01, R-02, R-03, R-04, R-05 evaluated · Findings generated" },
  ];

  const handleCreativeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setIsOcrScanning(true);
    setOcrScanStep(0);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < OCR_PIPELINE_STEPS.length) {
        setOcrScanStep(step);
      } else {
        clearInterval(interval);
        setIsOcrScanning(false);
        const nextVersion = creativeMeta.version + 1;
        setCreativeMeta((prev) => ({
          ...prev,
          fileName: file.name,
          fileUri: objectUrl,
          version: nextVersion,
          uploadedAt: new Date().toISOString(),
        }));
        dispatch({
          type: "replace_creative",
          fileName: file.name,
          fileUri: objectUrl,
          at: new Date().toISOString(),
        });
      }
    }, 280);
  };

  const handleRerunOcr = () => {
    setIsOcrScanning(true);
    setOcrScanStep(0);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < OCR_PIPELINE_STEPS.length) {
        setOcrScanStep(step);
      } else {
        clearInterval(interval);
        setIsOcrScanning(false);
      }
    }, 250);
  };

  const selectedFinding = state.findings.find((f) => f.id === state.selectedId) || state.findings[0];
  const roleProfile = authenticatedRole ? ROLES[authenticatedRole] : ROLES["creator"];
  const openCount = unresolvedCount(state.findings);
  const isApproved = state.phase === "approved";

  // Login handler
  const handleOpenLogin = (role: Role) => {
    setSelectedPersonaForLogin(role);
    setLoginEmail(DEMO_CREDENTIALS[role].email);
    setLoginPassword(DEMO_CREDENTIALS[role].pass);
    setLoginError(null);
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPersonaForLogin) return;
    const creds = DEMO_CREDENTIALS[selectedPersonaForLogin];

    if (
      loginEmail.trim().toLowerCase() === creds.email.toLowerCase() &&
      loginPassword.trim() === creds.pass
    ) {
      setAuthenticatedRole(selectedPersonaForLogin);
      dispatch({ type: "set_role", role: selectedPersonaForLogin });
      setSelectedPersonaForLogin(null);
      setLoginError(null);
      setShowPersonaDropdown(false);
    } else {
      setLoginError(`Invalid credentials. Demo login: ${creds.email} / ${creds.pass}`);
    }
  };

  const handleSignOut = () => {
    setAuthenticatedRole(null);
    setShowPersonaDropdown(false);
  };

  const handleSelectFinding = (id: string) => {
    dispatch({ type: "select", id });
    setIsEditingFix(false);
  };

  const handleAcceptFix = (id: string) => {
    dispatch({ type: "apply_fix", findingId: id, at: new Date().toISOString() });
    setIsEditingFix(false);
  };

  const handleApplyCustomEdit = (id: string) => {
    if (!customEditText.trim()) return;
    dispatch({ type: "apply_fix", findingId: id, text: customEditText.trim(), at: new Date().toISOString() });
    setIsEditingFix(false);
  };

  const handleConfirmDismiss = (id: string) => {
    if (!dismissReason.trim() || dismissReason.trim().length < 8) return;
    dispatch({ type: "dismiss", id, reason: dismissReason.trim(), at: new Date().toISOString() });
    setShowDismissModal(false);
    setDismissReason("");
  };

  const handleApprove = () => {
    if (authenticatedRole !== "approver" && authenticatedRole !== "admin") return;
    dispatch({ type: "approve", at: new Date().toISOString() });
  };

  const handlePostComment = () => {
    if (!newCommentText.trim()) return;
    const newComment: ReviewComment = {
      id: `CMT-${String(comments.length + 1).padStart(2, "0")}`,
      author: roleProfile.person,
      role: authenticatedRole || "creator",
      at: new Date().toISOString(),
      text: newCommentText.trim(),
    };
    setComments((prev) => [...prev, newComment]);
    setNewCommentText("");
  };

  const handleRunLiveScan = () => {
    const textToScan = customInputText.trim();
    if (!textToScan) return;
    const findings = analyzeAnyContent(textToScan, "text");
    const newDraft = {
      id: `draft-custom-${Date.now().toString().slice(-4)}`,
      title: scanPreset === "agency" ? "NOVA Campaign Intake (Live Scan)" : "Custom Product Copy",
      brand: "NOVA Footwear",
      campaign: "Monsoon Running Campaign 2026",
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
    if (authenticatedRole === "creator") setCreatorTab("drafts");
    if (authenticatedRole === "reviewer") setReviewerTab("review");
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

  const renderCreativeLeftColumn = () => (
    <div className="space-y-5">
      {/* 1. Ingestion Pipeline Status Bar */}
      <div className="p-4 bg-surface rounded-2xl border border-border shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/80">
          <div className="flex items-center gap-2.5">
            <span className={`w-2.5 h-2.5 rounded-full ${isOcrScanning ? "bg-amber-400 animate-ping" : "bg-brand-green"}`} />
            <div>
              <span className="text-xs font-mono font-semibold text-text-primary block">
                {isOcrScanning ? "OCR Vision & Grounded Verification Running..." : "Creative OCR Vision Pipeline Complete"}
              </span>
              <span className="text-[11px] text-text-muted">
                {isOcrScanning
                  ? OCR_PIPELINE_STEPS[ocrScanStep]?.detail
                  : "Asset: NOVA_AeroRun_Campaign.png · Grounded in 4 active NOVA evidence PDFs"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRerunOcr}
              disabled={isOcrScanning}
              className="text-[11px] font-mono px-3 py-1.5 rounded-lg border border-border bg-background-soft hover:bg-surface-muted transition-all disabled:opacity-50"
            >
              Re-run OCR Scan
            </button>
            <label className="text-[11px] font-mono px-3 py-1.5 rounded-lg bg-brand-green text-on-dark font-semibold cursor-pointer hover:bg-brand-green-dark transition-all">
              Upload / Replace
              <input type="file" accept="image/*" onChange={handleCreativeUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Pipeline Progression Steps */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 pt-3">
          {OCR_PIPELINE_STEPS.map((step, idx) => {
            const isDone = !isOcrScanning || ocrScanStep >= idx;
            const isCurrent = isOcrScanning && ocrScanStep === idx;
            return (
              <div
                key={idx}
                className={`p-2 rounded-xl text-[10px] font-mono border transition-all ${
                  isCurrent
                    ? "bg-amber-500/10 border-amber-500/60 text-amber-500 font-semibold"
                    : isDone
                    ? "bg-brand-green/10 border-brand-green/40 text-brand-green"
                    : "bg-background-soft border-border/40 text-text-muted"
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-semibold">Step {idx + 1}</span>
                  <span>{isCurrent ? "⟳" : isDone ? "✓" : "○"}</span>
                </div>
                <div className="truncate font-sans font-medium text-text-primary">{step.title}</div>
              </div>
            );
          })}
        </div>

        {/* OCR Result Metrics */}
        {!isOcrScanning && (
          <div className="mt-3 pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-background-soft px-2 py-0.5 rounded border border-border text-text-secondary">
                <strong className="text-text-primary">9</strong> text regions
              </span>
              <span className="bg-background-soft px-2 py-0.5 rounded border border-border text-text-secondary">
                <strong className="text-text-primary">5</strong> marketing claims
              </span>
              <span className="bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded border border-amber-500/30">
                <strong className="text-amber-700">{openCount}</strong> requires review
              </span>
              <span className="bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded border border-emerald-500/30">
                <strong className="text-emerald-700">2</strong> verified with evidence
              </span>
            </div>
            <span className="text-text-muted">Draft v{creativeMeta.version} · 1024 × 1024 px</span>
          </div>
        )}
      </div>

      {/* 2. Interactive Creative Image with Bounding Boxes */}
      <div className="relative rounded-2xl overflow-hidden aspect-square w-full max-w-[540px] mx-auto bg-[#0a0a09] border border-border shadow-2xl group select-none">
        <Image
          src={creativeMeta.fileUri}
          alt={creativeMeta.altText}
          fill
          priority
          className="object-contain"
        />

        {/* Bounding Box Highlights Overlay */}
        <div className="absolute inset-0">
          {ocrRegions.map((region) => {
            const matchingFinding = state.findings.find((f) => f.id === region.findingId);
            const isSelected = matchingFinding && state.selectedId === matchingFinding.id;
            const isResolved = matchingFinding && matchingFinding.status !== "open";

            let boxClass = "border-white/30 bg-white/5 hover:border-white/80";
            let badgeClass = "bg-black/85 text-white/90 border-white/30";
            let badgeLabel = region.text;

            if (region.status === "flagged") {
              if (matchingFinding?.severity === "critical") {
                boxClass = isSelected
                  ? "border-rose-500 bg-rose-500/25 ring-4 ring-rose-400/80 shadow-[0_0_25px_rgba(244,63,94,0.9)] z-30 animate-pulse"
                  : "border-rose-500/80 bg-rose-500/10 hover:bg-rose-500/25 hover:border-rose-400 z-10";
                badgeClass = "bg-rose-950/95 text-rose-200 border-rose-500 font-semibold";
                badgeLabel = "R-04 Prohibited Guarantee · Critical";
              } else {
                boxClass = isSelected
                  ? "border-amber-400 bg-amber-400/25 ring-4 ring-amber-300/80 shadow-[0_0_25px_rgba(251,191,36,0.9)] z-30 animate-pulse"
                  : "border-amber-400/80 bg-amber-400/10 hover:bg-amber-400/25 hover:border-amber-300 z-10";
                badgeClass = "bg-amber-950/95 text-amber-200 border-amber-400 font-semibold";
                badgeLabel = matchingFinding?.ruleId === "R-01" ? "R-01 Comparative Claim" : "R-03 Superlative Claim";
              }
            } else if (region.status === "verified") {
              boxClass = isSelected
                ? "border-emerald-400 bg-emerald-400/25 ring-4 ring-emerald-300/80 shadow-[0_0_25px_rgba(52,211,153,0.9)] z-30"
                : "border-emerald-500/80 bg-emerald-500/15 hover:bg-emerald-500/25 z-10";
              badgeClass = "bg-emerald-950/95 text-emerald-200 border-emerald-500 font-semibold";
              badgeLabel = region.evidenceRef ? `Verified: ${region.evidenceRef} ✓` : "Verified Claim ✓";
            }

            if (isResolved) {
              boxClass = "border-emerald-500/60 bg-emerald-500/10 opacity-75";
              badgeClass = "bg-emerald-950/90 text-emerald-300 border-emerald-500/60";
              badgeLabel = `Resolved: ${matchingFinding?.status} ✓`;
            }

            return (
              <div
                key={region.id}
                onClick={() => {
                  if (region.findingId) {
                    handleSelectFinding(region.findingId);
                  }
                }}
                onMouseEnter={() => setHoveredRegionId(region.id)}
                onMouseLeave={() => setHoveredRegionId(null)}
                style={{
                  top: `${region.box.y}%`,
                  left: `${region.box.x}%`,
                  width: `${region.box.w}%`,
                  height: `${region.box.h}%`,
                }}
                className={`absolute rounded-xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-start p-1 ${boxClass}`}
                title={`${region.text} (Click to inspect claim)`}
              >
                <div className="flex items-center gap-1 pointer-events-none">
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border shadow-sm backdrop-blur-md truncate max-w-full ${badgeClass}`}>
                    {badgeLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Creative Intelligence & Accessibility Card */}
      <div className="bg-surface rounded-2xl p-5 border border-border shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-green" />
            <h4 className="text-xs font-mono uppercase tracking-wider font-semibold text-text-primary">
              Creative Intelligence & Accessibility Suite
            </h4>
          </div>
          <span className="text-[11px] font-mono bg-brand-green/10 text-brand-green px-2 py-0.5 rounded font-semibold border border-brand-green/30">
            WCAG 2.1 AA Compliant
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-background-soft p-3 rounded-xl border border-border/80">
            <span className="text-[10px] font-mono uppercase text-text-muted block">Contrast Ratio</span>
            <span className="text-sm font-mono font-bold text-brand-green block mt-0.5">{creativeMeta.contrastRatio}:1</span>
            <span className="text-[10px] text-text-secondary">WCAG AA Pass (&gt;4.5:1)</span>
          </div>
          <div className="bg-background-soft p-3 rounded-xl border border-border/80">
            <span className="text-[10px] font-mono uppercase text-text-muted block">Logo Clearspace</span>
            <span className="text-sm font-mono font-bold text-brand-green block mt-0.5">31px / 51px</span>
            <span className="text-[10px] text-text-secondary">Brand standard (&ge;24px)</span>
          </div>
          <div className="bg-background-soft p-3 rounded-xl border border-border/80">
            <span className="text-[10px] font-mono uppercase text-text-muted block">Resolution & Ratio</span>
            <span className="text-sm font-mono font-bold text-text-primary block mt-0.5">1024 × 1024</span>
            <span className="text-[10px] text-text-secondary">1:1 Square Feed Asset</span>
          </div>
          <div className="bg-background-soft p-3 rounded-xl border border-border/80">
            <span className="text-[10px] font-mono uppercase text-text-muted block">Readability Grade</span>
            <span className="text-sm font-mono font-bold text-brand-green block mt-0.5">Grade 8</span>
            <span className="text-[10px] text-text-secondary">High Consumer Clarity</span>
          </div>
        </div>

        <div className="p-3 bg-background-soft rounded-xl border border-border/80 text-xs">
          <span className="text-[10px] font-mono uppercase text-text-muted block mb-1">
            Verified Screen-Reader Alt-Text:
          </span>
          <p className="font-serif italic text-text-secondary text-[11px] leading-relaxed">
            &quot;{creativeMeta.altText}&quot;
          </p>
        </div>
      </div>
    </div>
  );

  const renderVersionHistory = () => (
    <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-border space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border">
        <div>
          <span className="text-[11px] font-mono uppercase bg-brand-green/10 text-brand-green px-2.5 py-0.5 rounded-full font-semibold">
            One-Click Apply Fix · Version Timeline Ledger
          </span>
          <h3 className="font-serif italic text-2xl text-text-primary mt-1">Campaign Version History</h3>
          <p className="text-xs text-text-muted mt-0.5">
            Every “Apply Fix” creates an immutable version snapshot with changed text diff, author, and findings count.
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1.5 rounded-full bg-brand-green/10 text-brand-green font-semibold border border-brand-green/20">
            Current: v{state.draft.version}
          </span>
          <span className="text-text-muted bg-surface-muted px-2.5 py-1 rounded-full">
            {state.versionHistory.length} Version{state.versionHistory.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {[...state.versionHistory].reverse().map((snap) => {
          const isCurrent = snap.version === state.draft.version;
          return (
            <div
              key={snap.version}
              className={`p-5 rounded-2xl border transition-all ${
                isCurrent
                  ? "bg-brand-green/5 border-brand-green/40 shadow-xs ring-1 ring-brand-green/20"
                  : "bg-background-soft border-border hover:border-border-strong"
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg ${
                      isCurrent ? "bg-brand-green text-on-dark" : "bg-surface-muted text-text-secondary"
                    }`}
                  >
                    v{snap.version}
                  </span>
                  <span className="font-serif text-base font-semibold text-text-primary">
                    {snap.label}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 font-bold border border-emerald-500/30">
                      Active Version
                    </span>
                  )}
                </div>
                <div className="text-xs font-mono text-text-muted flex items-center gap-2">
                  <span>{snap.author}</span>
                  <span>•</span>
                  <span>{new Date(snap.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              </div>

              {/* Changed Text Diff (if applied fix) */}
              {snap.changedText && (
                <div className="my-3 p-3.5 rounded-xl bg-surface border border-border/80 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-500/10 text-red-600 font-semibold border border-red-500/20 shrink-0">
                      - Original
                    </span>
                    <span className="font-serif line-through text-text-muted">{snap.originalText}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-600 font-semibold border border-emerald-500/20 shrink-0">
                      + Replaced
                    </span>
                    <span className="font-serif font-medium text-emerald-700">{snap.changedText}</span>
                  </div>
                </div>
              )}

              {/* Rationale & Metrics */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/60 text-xs">
                <p className="text-text-secondary text-xs italic font-serif max-w-xl">
                  {snap.reason}
                </p>
                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <span className={`px-2.5 py-0.5 rounded-full font-semibold ${snap.openCount === 0 ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-amber-500/10 text-amber-700 border border-amber-500/20"}`}>
                    {snap.openCount} Open Issue{snap.openCount === 1 ? "" : "s"}
                  </span>
                  <span className="text-text-muted">
                    SHA-256: {snap.contentHash.slice(0, 10)}…
                  </span>
                </div>
              </div>

              {/* Collapsible Full Text Copy */}
              <details className="mt-3 text-xs text-text-muted">
                <summary className="cursor-pointer hover:text-text-primary font-mono text-[11px] select-none">
                  Inspect Version Text Copy ▾
                </summary>
                <div className="mt-2.5 p-4 rounded-xl bg-background border border-border/80 font-serif leading-relaxed whitespace-pre-line text-text-primary text-xs">
                  {snap.text}
                </div>
              </details>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderClaimsInspector = (isReviewer: boolean) => (
    <div className="bg-surface rounded-2xl p-6 border border-border sticky top-20 space-y-4">
      {/* Filter Pills */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <span className="text-xs font-mono uppercase tracking-wider font-semibold text-text-primary">
          Detected Claims ({state.findings.length})
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCreativeFilter("all")}
            className={`text-[10px] font-mono px-2 py-0.5 rounded-lg border transition-all ${
              creativeFilter === "all" ? "bg-brand-green text-on-dark border-brand-green" : "border-border text-text-muted"
            }`}
          >
            All ({state.findings.length})
          </button>
          <button
            type="button"
            onClick={() => setCreativeFilter("requires_review")}
            className={`text-[10px] font-mono px-2 py-0.5 rounded-lg border transition-all ${
              creativeFilter === "requires_review" ? "bg-amber-500 text-black font-semibold border-amber-500" : "border-border text-text-muted"
            }`}
          >
            Review ({openCount})
          </button>
          <button
            type="button"
            onClick={() => setCreativeFilter("verified")}
            className={`text-[10px] font-mono px-2 py-0.5 rounded-lg border transition-all ${
              creativeFilter === "verified" ? "bg-emerald-600 text-white font-semibold border-emerald-600" : "border-border text-text-muted"
            }`}
          >
            Verified (2)
          </button>
        </div>
      </div>

      {/* Selected Finding Detail Card */}
      {selectedFinding ? (
        <div className="space-y-4 pt-1">
          <div className="flex items-center justify-between pb-2 border-b border-border/80">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${TONE_CLASSES[KIND_META[selectedFinding.kind].tone].chip}`}>
                {KIND_META[selectedFinding.kind].label}
              </span>
              {selectedFinding.isVerified && (
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 font-semibold border border-emerald-500/40">
                  Grounded Claim Verified ✓
                </span>
              )}
            </div>
            <span className={`text-xs font-mono uppercase font-semibold ${selectedFinding.status === "open" ? "text-amber-600" : "text-emerald-600"}`}>
              ● {selectedFinding.status}
            </span>
          </div>

          <div>
            <span className="text-[11px] uppercase font-mono text-text-muted block mb-1">Detected Text Region:</span>
            <blockquote className="text-sm font-serif italic bg-background-soft p-3 rounded-xl border border-border text-text-primary">
              &quot;{selectedFinding.phrase}&quot;
            </blockquote>
          </div>

          <div>
            <span className="text-[11px] uppercase font-mono text-text-muted block mb-1">Governance Analysis & Why Flagged:</span>
            <p className="text-xs text-text-secondary leading-relaxed bg-background-soft p-3 rounded-xl border border-border">
              {selectedFinding.why}
            </p>
          </div>

          <div className="bg-surface-muted/40 p-3 rounded-xl border border-border text-xs space-y-1">
            <div className="flex justify-between font-mono text-[11px]">
              <span className="text-brand-green font-semibold">Evidence Citation:</span>
              <span>{selectedFinding.ruleId || selectedFinding.factId}</span>
            </div>
            <p className="text-text-secondary text-[11px] leading-relaxed">{selectedFinding.evidence}</p>
          </div>

          {selectedFinding.suggestedFix && (
            <div className="bg-background-soft p-3.5 rounded-xl border border-border">
              <span className="text-[11px] uppercase font-mono text-brand-green font-semibold block mb-1">
                Intent-Preserving Recommendation:
              </span>
              <p className="text-xs font-serif font-medium text-text-primary mb-1">
                {selectedFinding.suggestedFix}
              </p>
              {selectedFinding.intentNote && (
                <p className="text-[11px] text-text-muted italic">{selectedFinding.intentNote}</p>
              )}
            </div>
          )}

          {/* Actions: Creator or Reviewer */}
          {selectedFinding.status === "open" && (
            <div className="pt-3 border-t border-border flex items-center gap-2">
              {isReviewer ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleAcceptFix(selectedFinding.id)}
                    className="flex-1 py-2.5 rounded-pill bg-brand-green text-on-dark text-xs uppercase font-mono font-semibold tracking-wider hover:bg-brand-green-dark transition-all"
                  >
                    Accept Fix
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomEditText(selectedFinding.suggestedFix);
                      setIsEditingFix(true);
                    }}
                    className="px-3.5 py-2.5 rounded-pill border border-border text-xs uppercase font-mono font-semibold hover:bg-background-soft transition-all"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDismissModal(true)}
                    className="px-3.5 py-2.5 rounded-pill border border-critical/30 text-critical text-xs uppercase font-mono font-semibold hover:bg-critical-soft transition-all"
                  >
                    Dismiss
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handleAcceptFix(selectedFinding.id)}
                    className="flex-1 py-2.5 rounded-pill bg-brand-green text-on-dark text-xs uppercase font-semibold font-mono tracking-wider hover:bg-brand-green-dark transition-all"
                  >
                    Apply Fix
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomEditText(selectedFinding.suggestedFix);
                      setIsEditingFix(true);
                    }}
                    className="px-4 py-2.5 rounded-pill border border-border text-xs uppercase font-mono font-semibold hover:bg-background-soft transition-all"
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
          )}

          {selectedFinding.status !== "open" && (
            <div className="pt-3 border-t border-border text-xs text-success font-mono">
              ✓ Resolved: {selectedFinding.status}
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-text-muted text-center py-8">Select a claim to inspect.</p>
      )}

      {/* Quick Switching Across All Detected Claims */}
      <div className="pt-4 border-t border-border space-y-2">
        <span className="text-[11px] uppercase font-mono text-text-muted block">
          All Extracted Claims on Image:
        </span>
        <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
          {state.findings
            .filter((f) => {
              if (creativeFilter === "requires_review") return f.status === "open";
              if (creativeFilter === "verified") return f.isVerified;
              return true;
            })
            .map((f) => {
              const isSelected = f.id === state.selectedId;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => handleSelectFinding(f.id)}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between gap-2 ${
                    isSelected
                      ? "bg-brand-green/15 border-brand-green text-text-primary ring-1 ring-brand-green"
                      : "bg-background-soft/60 border-border/80 text-text-secondary hover:bg-background-soft"
                  }`}
                >
                  <div className="truncate">
                    <span className="font-semibold block truncate">{f.phrase}</span>
                    <span className="text-[10px] font-mono text-text-muted block">
                      {f.ruleId || f.factId} · {f.title}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full whitespace-nowrap ${
                      f.status === "open"
                        ? f.severity === "critical"
                          ? "bg-rose-500/20 text-rose-500 border border-rose-500/40"
                          : "bg-amber-500/20 text-amber-600 border border-amber-500/40"
                        : "bg-emerald-500/20 text-emerald-600 border border-emerald-500/40"
                    }`}
                  >
                    {f.status}
                  </span>
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );

  return (
    <section id="workspace" className="min-h-screen bg-[#eee9dc] text-[#1c1a18]">
      {/* ──────────────────────────────────────────────────────────────────────────
          TOP APPLICATION BAR (Consistent SaaS Navigation)
      ────────────────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#1c1a18] text-white px-5 sm:px-8 py-3.5 border-b border-white/10 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif italic text-2xl tracking-tight text-white">VerityBrand</span>
            <span className="hidden sm:inline-block text-[11px] font-mono uppercase bg-white/10 px-2 py-0.5 rounded text-white/70">
              Governance Studio
            </span>
          </div>

          {authenticatedRole && (
            <div className="hidden md:flex items-center gap-2 pl-4 border-l border-white/10 text-xs text-white/70 font-mono">
              <span>Campaign: <strong className="text-white font-medium">{state.draft.campaign}</strong></span>
              <span>·</span>
              <span className={`px-2 py-0.5 rounded text-[11px] ${isApproved ? "bg-emerald-950 text-emerald-400" : openCount === 0 ? "bg-amber-950 text-amber-300" : "bg-red-950 text-red-300"}`}>
                {isApproved ? "Approved & Sealed" : openCount === 0 ? "Ready for Sign-Off" : `${openCount} Open Finding${openCount > 1 ? "s" : ""}`}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Privacy Protocol Pill */}
          <button
            onClick={() => setShowPrivacyModal(true)}
            className="text-[11px] font-mono px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-white/80 transition-colors flex items-center gap-1.5"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">Sovereign Protocol</span>
          </button>

          {/* Authenticated Persona Indicator & Dropdown Switcher */}
          {authenticatedRole ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowPersonaDropdown(!showPersonaDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-mono text-white transition-all"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="font-semibold">{DEMO_CREDENTIALS[authenticatedRole].name}</span>
                <span className="text-white/60">({ROLES[authenticatedRole].label})</span>
                <span className="text-[10px]">▾</span>
              </button>

              {/* Persona Switcher Dropdown */}
              <AnimatePresence>
                {showPersonaDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 mt-2 w-64 bg-surface rounded-2xl border border-border shadow-2xl p-2 z-50 text-text-primary"
                  >
                    <div className="p-2.5 border-b border-border/80">
                      <span className="text-[10px] uppercase font-mono text-text-muted block">Signed In As</span>
                      <p className="text-xs font-semibold text-text-primary">{DEMO_CREDENTIALS[authenticatedRole].name}</p>
                      <p className="text-[11px] font-mono text-brand-green">{ROLES[authenticatedRole].label}</p>
                    </div>

                    <div className="py-1">
                      <span className="text-[10px] uppercase font-mono text-text-muted px-2.5 py-1 block">
                        Switch Persona (Auth Required)
                      </span>
                      {ROLE_ORDER.map((r) => {
                        const isCurrent = r === authenticatedRole;
                        return (
                          <button
                            key={r}
                            onClick={() => {
                              setShowPersonaDropdown(false);
                              if (!isCurrent) handleOpenLogin(r);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                              isCurrent ? "bg-background-soft font-semibold text-brand-green" : "hover:bg-background-soft text-text-secondary"
                            }`}
                          >
                            <span>{ROLES[r].label}</span>
                            <span className="text-[11px] font-mono text-text-muted">{DEMO_CREDENTIALS[r].name.split(" ")[0]}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-1 border-t border-border/80">
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-critical hover:bg-critical-soft/30 font-medium transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <span className="text-xs font-mono text-white/60">Not Authenticated</span>
          )}

          {/* Close / Return button */}
          {onBackToLanding && (
            <button
              onClick={onBackToLanding}
              className="px-3.5 py-1.5 rounded-full border border-white/20 text-xs font-mono uppercase tracking-wider hover:bg-white hover:text-black transition-all"
            >
              ✕ Exit
            </button>
          )}
        </div>
      </header>

      {/* ──────────────────────────────────────────────────────────────────────────
          STAGE 1: NEUTRAL WORKSPACE ENTRY (Shown prior to authentication)
      ────────────────────────────────────────────────────────────────────────── */}
      {!authenticatedRole && (
        <div className="h-[calc(100vh-61px)] flex flex-col justify-between px-4 sm:px-8 py-4 sm:py-6 max-w-7xl mx-auto overflow-hidden">
          {/* Header directly below navbar without RBAC tag */}
          <div className="text-center pt-1 sm:pt-2">
            <h1 className="font-serif italic text-2xl sm:text-3xl lg:text-[2.25rem] text-text-primary tracking-tight">
              Welcome to VerityBrand Workspace
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary mt-1.5 max-w-2xl mx-auto">
              Select your role to access your workspace. Each persona provides tailored tools, permissions, and dashboards aligned with corporate brand governance.
            </p>
          </div>

          {/* Four Persona Entry Cards (Single row on desktop, fits screen without scroll) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-auto">
            {ROLE_ORDER.map((r) => {
              const creds = DEMO_CREDENTIALS[r];
              const p = ROLES[r];

              return (
                <div
                  key={r}
                  onClick={() => handleOpenLogin(r)}
                  className="group bg-surface rounded-2xl p-5 border border-border hover:border-brand-green shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between h-full min-h-[220px]"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-muted text-text-secondary group-hover:bg-brand-green group-hover:text-on-dark transition-colors">
                        {creds.badge}
                      </span>
                      <span className="text-[11px] font-mono text-text-muted">
                        {creds.name.split(" ")[0]}
                      </span>
                    </div>

                    <h3 className="font-serif italic text-xl text-text-primary group-hover:text-brand-green transition-colors mb-1.5">
                      {p.label}
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed line-clamp-3 mb-4">
                      {p.summary}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border/80 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-text-muted truncate max-w-[140px]">
                      {creds.email}
                    </span>
                    <span className="text-xs font-semibold text-brand-green group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 shrink-0">
                      Sign In →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Clean 1-line footer note */}
          <div className="text-center text-[11px] font-mono text-text-muted pb-1">
            Shared campaign state across all 4 personas · Instant cryptographic audit verification
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          STAGE 2: AUTHENTICATED WORKSPACE SHELL (Sidebar + Dynamic Role Views)
      ────────────────────────────────────────────────────────────────────────── */}
      {authenticatedRole && (
        <div className="flex flex-col md:flex-row min-h-[calc(100vh-61px)]">
          {/* Left Sidebar Navigation */}
          <aside className="w-full md:w-64 bg-surface border-r border-border p-4 flex flex-col justify-between shrink-0 shadow-xs">
            <div className="space-y-6">
              {/* Persona Context Card */}
              <div className="p-3.5 rounded-2xl bg-background-soft border border-border/80">
                <div className="flex items-center gap-2 mb-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-text-primary">
                    {DEMO_CREDENTIALS[authenticatedRole].name}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-brand-green block">
                  {ROLES[authenticatedRole].label}
                </span>
                <span className="text-[10px] text-text-muted mt-1 block">
                  {DEMO_CREDENTIALS[authenticatedRole].email}
                </span>
              </div>

              {/* Dynamic Navigation Tabs per Role (Clean, emoji-free professional UI) */}
              <nav className="space-y-1">
                {authenticatedRole === "creator" && (
                  <>
                    {[
                      { id: "overview", label: "Overview" },
                      { id: "campaigns", label: "My Campaigns" },
                      { id: "drafts", label: "Drafts & Editor" },
                      { id: "guidelines", label: "Brand Guidelines" },
                      { id: "sources", label: "Approved Sources" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setCreatorTab(tab.id as any)}
                        className={`w-full text-left text-xs font-sans px-3.5 py-2.5 rounded-xl transition-all ${
                          creatorTab === tab.id
                            ? "bg-[#1c1a18] text-white font-medium shadow-xs"
                            : "text-text-secondary hover:bg-background-soft hover:text-text-primary"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </>
                )}

                {authenticatedRole === "reviewer" && (
                  <>
                    {[
                      { id: "queue", label: "Review Queue" },
                      { id: "review", label: "Campaign Review" },
                      { id: "all_campaigns", label: "All Campaigns" },
                      { id: "findings", label: "Findings Hub" },
                      { id: "decisions", label: "Decision History" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setReviewerTab(tab.id as any)}
                        className={`w-full text-left text-xs font-sans px-3.5 py-2.5 rounded-xl transition-all ${
                          reviewerTab === tab.id
                            ? "bg-[#1c1a18] text-white font-medium shadow-xs"
                            : "text-text-secondary hover:bg-background-soft hover:text-text-primary"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </>
                )}

                {authenticatedRole === "approver" && (
                  <>
                    {[
                      { id: "approval_queue", label: "Approval Queue" },
                      { id: "active_review", label: "Statutory Audit & Sign" },
                      { id: "blocked", label: "Blocked Campaigns" },
                      { id: "certificates", label: "Issued Certificates" },
                      { id: "audit", label: "Audit Ledger" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setApproverTab(tab.id as any)}
                        className={`w-full text-left text-xs font-sans px-3.5 py-2.5 rounded-xl transition-all ${
                          approverTab === tab.id
                            ? "bg-[#1c1a18] text-white font-medium shadow-xs"
                            : "text-text-secondary hover:bg-background-soft hover:text-text-primary"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </>
                )}

                {authenticatedRole === "admin" && (
                  <>
                    {[
                      { id: "overview", label: "System Overview" },
                      { id: "brand_brain", label: "Brand Brain (Rules)" },
                      { id: "facts", label: "Fact Ledger & Sources" },
                      { id: "terminology", label: "Terminology & Assets" },
                      { id: "insights", label: "Learning Loop" },
                      { id: "audit_logs", label: "Cryptographic Audit" },
                      { id: "users", label: "Users & Roles" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setAdminTab(tab.id as any)}
                        className={`w-full text-left text-xs font-sans px-3.5 py-2.5 rounded-xl transition-all ${
                          adminTab === tab.id
                            ? "bg-[#1c1a18] text-white font-medium shadow-xs"
                            : "text-text-secondary hover:bg-background-soft hover:text-text-primary"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </>
                )}
              </nav>
            </div>

            {/* Sidebar Footer Action */}
            <div className="pt-4 border-t border-border/80">
              {authenticatedRole === "creator" && (
                <button
                  onClick={() => setShowScanModal(true)}
                  className="w-full py-2.5 rounded-xl bg-brand-green text-on-dark text-xs uppercase font-mono font-medium hover:bg-brand-green-dark transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <span>+</span> New Campaign
                </button>
              )}

              {authenticatedRole !== "creator" && (
                <div className="text-[11px] font-mono text-text-muted p-2 rounded-lg bg-background-soft text-center">
                  <span>Logged in as </span>
                  <span className="font-semibold text-text-primary">{ROLES[authenticatedRole].label}</span>
                </div>
              )}
            </div>
          </aside>

          {/* Main Work Area: Dynamically switches based on Authenticated Role */}
          <main className="flex-1 p-5 sm:p-8 overflow-y-auto">
            {/* ⚠️ ROUND 3 FEATURE 2: STALE-CLAIM TEMPORAL RADAR ALERT BANNER */}
            {state.staleAlert?.active ? (
              <div className="mb-6 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm max-w-6xl mx-auto">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-700 shrink-0 mt-0.5">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-base text-amber-950 font-serif">
                        Stale Information Detected — 1 Campaign Requires Re-Review
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-amber-200 text-amber-900 font-bold border border-amber-300">
                        RE-REVIEW REQUIRED
                      </span>
                    </div>
                    <p className="text-xs text-amber-900 mt-1">
                      <strong className="font-semibold">Reason:</strong> Pricing fact F-08 expired on 15 Nov 2026 · <strong className="font-semibold">Affected Campaign:</strong> {state.draft.title} · <strong className="font-semibold">Affected Claim:</strong> “Now ₹3,999”
                    </p>
                    <p className="text-[11px] font-mono text-amber-800/90 mt-1">
                      Automated re-analysis completed · Rule R-05 flagged 1 new Expired Promotional Claim · Prior approval revoked &amp; compliance gate locked
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => dispatch({ type: "restore_fact", factId: "F-08", at: new Date().toISOString() })}
                    className="px-4 py-2 rounded-pill bg-white border border-amber-300 text-xs font-mono font-semibold text-amber-950 hover:bg-amber-50 transition-colors shadow-xs"
                  >
                    ↺ Restore Fact Validity
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 bg-surface border border-border px-4 py-2.5 rounded-2xl text-xs font-mono shadow-xs max-w-6xl mx-auto">
                <div className="flex items-center gap-2.5 text-text-secondary">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Temporal Radar Active: 8 Approved NOVA Facts Monitored · Fact F-08 (Launch Price ₹3,999) expires 15 Nov 2026</span>
                </div>
                <button
                  onClick={() => dispatch({ type: "expire_fact", factId: "F-08", at: new Date().toISOString() })}
                  className="text-[11px] text-amber-800 hover:text-amber-950 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg border border-amber-500/30 transition-all font-medium flex items-center gap-1.5"
                  title="Simulate temporal clock passing 15 Nov 2026"
                >
                  <span>⚡</span> Simulate Expiry (Post-15 Nov 2026)
                </button>
              </div>
            )}
            {/* ─────────────────────────────────────────────────────────────
                ROLE 1: CREATOR WORKSPACE ("What is wrong and how do I fix it?")
            ───────────────────────────────────────────────────────────── */}
            {authenticatedRole === "creator" && (
              <div className="space-y-6 max-w-6xl mx-auto">
                {/* Creator Header Banner */}
                <div className="bg-surface rounded-2xl p-6 border border-border shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-mono uppercase bg-amber-500/10 text-amber-700 px-2.5 py-0.5 rounded-full font-semibold">
                      Creator Studio
                    </span>
                    <h2 className="font-serif italic text-2xl sm:text-3xl text-text-primary mt-1">
                      Welcome, Riya
                    </h2>
                    <p className="text-xs sm:text-sm text-text-muted mt-0.5">
                      Draft marketing copy, review automated findings, and apply intent-preserving fixes before submitting for review.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowScanModal(true)}
                    className="px-5 py-2.5 rounded-pill bg-brand-green text-on-dark text-xs font-mono uppercase tracking-wider font-medium hover:bg-brand-green-dark transition-colors shadow-xs"
                  >
                    + Submit New Draft
                  </button>
                </div>

                {/* CREATOR: TAB 1 - OVERVIEW */}
                {creatorTab === "overview" && (
                  <div className="space-y-6">
                    {/* Creator KPI Stat Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-surface p-5 rounded-2xl border border-border">
                        <span className="text-[11px] font-mono uppercase text-text-muted block mb-1">Needing Attention</span>
                        <span className="font-serif italic text-3xl text-critical">1</span>
                        <span className="text-[11px] text-text-muted block mt-1">Campaign with open flags</span>
                      </div>
                      <div className="bg-surface p-5 rounded-2xl border border-border">
                        <span className="text-[11px] font-mono uppercase text-text-muted block mb-1">Active Drafts</span>
                        <span className="font-serif italic text-3xl text-text-primary">2</span>
                        <span className="text-[11px] text-text-muted block mt-1">In editing pipeline</span>
                      </div>
                      <div className="bg-surface p-5 rounded-2xl border border-border">
                        <span className="text-[11px] font-mono uppercase text-text-muted block mb-1">Approved Campaigns</span>
                        <span className="font-serif italic text-3xl text-success">{isApproved ? 1 : 0}</span>
                        <span className="text-[11px] text-text-muted block mt-1">{isApproved ? "1 certified" : "0 approved"}</span>
                      </div>
                      <div className="bg-surface p-5 rounded-2xl border border-border">
                        <span className="text-[11px] font-mono uppercase text-text-muted block mb-1">Unresolved Flags</span>
                        <span className="font-serif italic text-3xl text-warning">{openCount}</span>
                        <span className="text-[11px] text-text-muted block mt-1">Issues to resolve</span>
                      </div>
                    </div>

                    {/* Active Campaign Card */}
                    <div className="bg-surface rounded-2xl p-6 border border-border">
                      <div className="flex items-center justify-between pb-4 border-b border-border/80 mb-4">
                        <div>
                          <span className="text-xs font-mono text-brand-green uppercase font-semibold">Active Campaign</span>
                          <h3 className="font-serif italic text-xl text-text-primary">{state.draft.title}</h3>
                          <p className="text-xs text-text-muted mt-0.5">Channel: {state.draft.channel} · Author: {state.draft.author}</p>
                        </div>
                        <button
                          onClick={() => setCreatorTab("drafts")}
                          className="px-4 py-2 rounded-xl bg-background-soft border border-border text-xs font-mono text-text-primary hover:border-brand-green transition-colors"
                        >
                          Open in Editor →
                        </button>
                      </div>

                      <div className="p-4 rounded-xl bg-background-soft border border-border/60 text-sm font-serif italic text-text-secondary mb-4">
                        &quot;{state.draft.text}&quot;
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full font-mono text-[11px] ${openCount === 0 ? "bg-success-soft text-success" : "bg-warning-soft text-warning"}`}>
                            {openCount === 0 ? "Ready for Sign-Off" : `${openCount} Open Issues`}
                          </span>
                          <span className="text-text-muted">Creator Permissions Active: Edit & Apply Fixes</span>
                        </div>
                        <span className="text-[11px] font-mono text-text-muted">
                          Approval Authority: Compliance Officer
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* CREATOR: TAB 2 - MY CAMPAIGNS */}
                {creatorTab === "campaigns" && (
                  <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-border">
                    <h3 className="font-serif italic text-2xl text-text-primary mb-2">My Submissions & Campaigns</h3>
                    <p className="text-xs text-text-muted mb-6">Marketing drafts authored by Riya Sharma for NOVA Footwear.</p>

                    <div className="divide-y divide-border/60">
                      {QUEUE.map((item) => (
                        <div key={item.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div>
                            <h4 className="text-sm font-semibold text-text-primary">{item.title}</h4>
                            <p className="text-xs text-text-muted mt-0.5">{item.channel} · Updated {item.updated}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-text-secondary">{item.findings} Findings</span>
                            <span className={`text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full ${item.status === "approved" ? "bg-success-soft text-success" : "bg-warning-soft text-warning"}`}>
                              {item.status.replace("_", " ")}
                            </span>
                            <button
                              onClick={() => setCreatorTab("drafts")}
                              className="text-xs font-mono text-brand-green hover:underline ml-2"
                            >
                              Edit Copy →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CREATOR: TAB 3 - DRAFTS & EDITOR */}
                {creatorTab === "drafts" && (
                  <div className="space-y-6">
                    {/* Format Selector Bar for Creator Studio */}
                    <div className="bg-surface rounded-2xl p-4 border border-border flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setCurrentFormat("text")}
                          className={`text-xs font-mono px-3.5 py-1.5 rounded-xl transition-all ${
                            currentFormat === "text"
                              ? "bg-brand-green text-on-dark font-semibold shadow-xs"
                              : "bg-background-soft text-text-muted hover:text-text-primary"
                          }`}
                        >
                          Text Copy
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentFormat("image")}
                          className={`text-xs font-mono px-3.5 py-1.5 rounded-xl transition-all ${
                            currentFormat === "image"
                              ? "bg-brand-green text-on-dark font-semibold shadow-xs"
                              : "bg-background-soft text-text-muted hover:text-text-primary"
                          }`}
                        >
                          Campaign Creative (Visual OCR)
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentFormat("document")}
                          className={`text-xs font-mono px-3.5 py-1.5 rounded-xl transition-all ${
                            currentFormat === "document"
                              ? "bg-brand-green text-on-dark font-semibold shadow-xs"
                              : "bg-background-soft text-text-muted hover:text-text-primary"
                          }`}
                        >
                          Factsheet PDF Dossier
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentFormat("version_history")}
                          className={`text-xs font-mono px-3.5 py-1.5 rounded-xl transition-all ${
                            currentFormat === "version_history"
                              ? "bg-brand-green text-on-dark font-semibold shadow-xs"
                              : "bg-background-soft text-text-muted hover:text-text-primary"
                          }`}
                        >
                          Version History ({state.versionHistory.length})
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setCurrentFormat("version_history")}
                          className="text-xs font-mono px-2.5 py-1 rounded-lg bg-brand-green/10 text-brand-green hover:bg-brand-green/20 border border-brand-green/30 font-semibold transition-all"
                          title="View Version Timeline & Audit Ledger"
                        >
                          Draft v{state.draft.version} ▾
                        </button>
                        <span className="text-xs font-mono bg-surface-muted px-2.5 py-1 rounded-full text-text-secondary">
                          {openCount} / {state.findings.length} Unresolved
                        </span>
                      </div>
                    </div>

                    {currentFormat === "version_history" ? (
                      renderVersionHistory()
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      <div className="lg:col-span-7 space-y-6">
                        {currentFormat === "text" && (
                          <div className="bg-surface rounded-2xl p-6 border border-border">
                            <div className="flex items-center justify-between pb-3 border-b border-border/80 mb-4">
                              <div>
                                <h3 className="text-sm font-semibold text-text-primary">{state.draft.title}</h3>
                                <p className="text-xs text-text-muted">Click flagged spans to view recommended fixes</p>
                              </div>
                            </div>

                            {/* Text highlights */}
                            <div className="relative text-lg font-serif leading-relaxed text-text-primary p-4 rounded-xl bg-background-soft border border-border/60 min-h-36">
                              {segmentText(state.draft.text, state.findings).map((seg, idx) => {
                                if (!seg.finding) return <span key={idx}>{seg.text}</span>;
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
                                      isSelected ? TONE_CLASSES[tone].markActive : TONE_CLASSES[tone].mark
                                    } ${resolved ? "opacity-60 line-through decoration-text-muted" : ""}`}
                                  >
                                    {f.phrase}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Live Intent-Preserving Diff */}
                            <div className="mt-6 pt-6 border-t border-border">
                              <span className="text-xs uppercase font-mono tracking-wider text-brand-green font-semibold block mb-2">
                                Intent-Preserving Live Proposal:
                              </span>
                              <p className="text-sm sm:text-base font-serif italic text-text-primary p-4 rounded-xl bg-surface-muted/40 border border-border/80">
                                {revisedText(state.draft, state.findings)}
                              </p>
                            </div>
                          </div>
                        )}

                        {currentFormat === "image" && renderCreativeLeftColumn()}

                        {currentFormat === "document" && (
                          <div className="bg-surface rounded-2xl p-6 border border-border space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-border">
                              <h4 className="text-sm font-semibold text-text-primary">NOVA Approved Factsheet &amp; Pricing Master</h4>
                              <a
                                href="/docs/02_NOVA_Product_Facts.pdf"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-mono text-brand-green hover:underline"
                              >
                                View PDF ↗
                              </a>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs border border-border bg-background-soft rounded-lg overflow-hidden">
                                <thead>
                                  <tr className="bg-[#264831] text-white font-mono text-[11px]">
                                    <th className="py-2 px-3">Field</th>
                                    <th className="py-2 px-3">Approved Specification</th>
                                    <th className="py-2 px-3">Evidence Reference</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                  <tr>
                                    <td className="py-2 px-3 font-semibold text-text-primary">Product Model</td>
                                    <td className="py-2 px-3 font-mono">NOVA AeroRun X1</td>
                                    <td className="py-2 px-3 text-text-muted">Product Brief PB-2026</td>
                                  </tr>
                                  <tr className="bg-background-soft/40">
                                    <td className="py-2 px-3 font-semibold text-text-primary">Certified Weight</td>
                                    <td className="py-2 px-3 font-mono">218 g per shoe</td>
                                    <td className="py-2 px-3 text-text-muted">Product Spec PS-2026-018</td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 px-3 font-semibold text-text-primary">Tested Durability</td>
                                    <td className="py-2 px-3 font-mono text-brand-green font-bold">Up to 40 km</td>
                                    <td className="py-2 px-3 text-brand-green font-semibold">Performance Test PT-2026-041</td>
                                  </tr>
                                  <tr className="bg-background-soft/40">
                                    <td className="py-2 px-3 font-semibold text-text-primary">Promotional Launch Price</td>
                                    <td className="py-2 px-3 font-mono text-brand-green font-bold">₹3,999 (Valid 1–15 Nov 2026)</td>
                                    <td className="py-2 px-3 text-text-muted">03_NOVA_Pricing_Master.pdf</td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 px-3 font-semibold text-text-primary">Standard Retail Price</td>
                                    <td className="py-2 px-3 font-mono">₹4,499</td>
                                    <td className="py-2 px-3 text-text-muted">03_NOVA_Pricing_Master.pdf</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Creator Scope Notice */}
                        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs flex items-center justify-between">
                          <span>
                            <strong>Creator Scope:</strong> You can apply fixes and edit draft copy. Final regulatory sign-off is restricted to the Compliance Approver.
                          </span>
                          <span className="font-mono text-[11px] bg-amber-500/20 px-2 py-0.5 rounded">
                            Approval Locked
                          </span>
                        </div>
                      </div>

                      <div className="lg:col-span-5">
                        {renderClaimsInspector(false)}
                      </div>
                    </div>
                    )}
                  </div>
                )}

                {/* CREATOR: TAB 4 - BRAND GUIDELINES */}
                {creatorTab === "guidelines" && (
                  <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-border space-y-6">
                    <h3 className="font-serif italic text-2xl text-text-primary">Creator Brand Reference</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {BRAND_ASSETS.map((asset) => (
                        <div key={asset.id} className="p-4 rounded-xl bg-background-soft border border-border">
                          <span className="text-[11px] font-mono uppercase text-brand-green font-semibold block mb-1">{asset.type}</span>
                          <h4 className="text-sm font-semibold text-text-primary">{asset.name}</h4>
                          <p className="text-xs font-mono bg-surface p-2 rounded my-2 text-text-secondary">{asset.value}</p>
                          <p className="text-xs text-text-muted">{asset.rule}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CREATOR: TAB 5 - SOURCES */}
                {creatorTab === "sources" && (
                  <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-border space-y-6">
                    <div>
                      <h3 className="font-serif italic text-2xl text-text-primary mb-2">NOVA Product Evidence Repository</h3>
                      <p className="text-xs text-text-muted">Authoritative source documents backing product specifications, pricing ledgers, and testing certificates.</p>
                    </div>

                    {/* 9-Stage Ingestion Pipeline Flow */}
                    <div className="p-4 rounded-xl bg-background-soft border border-border/80">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-brand-green font-semibold block mb-2">
                        Source Document Ingestion &amp; Indexing Pipeline
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-text-secondary">
                        <span className="px-2 py-1 rounded bg-surface border border-border text-text-primary">1. File received</span>
                        <span>→</span>
                        <span className="px-2 py-1 rounded bg-surface border border-border text-text-primary">2. Document parsed</span>
                        <span>→</span>
                        <span className="px-2 py-1 rounded bg-surface border border-border text-text-primary">3. Tables detected</span>
                        <span>→</span>
                        <span className="px-2 py-1 rounded bg-surface border border-border text-text-primary">4. Facts extracted</span>
                        <span>→</span>
                        <span className="px-2 py-1 rounded bg-surface border border-border text-text-primary">5. Claims extracted</span>
                        <span>→</span>
                        <span className="px-2 py-1 rounded bg-surface border border-border text-text-primary">6. Validity dates detected</span>
                        <span>→</span>
                        <span className="px-2 py-1 rounded bg-surface border border-border text-text-primary">7. Evidence chunks created</span>
                        <span>→</span>
                        <span className="px-2 py-1 rounded bg-surface border border-border text-text-primary">8. Embeddings generated</span>
                        <span>→</span>
                        <span className="px-2 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">9. Indexed in PostgreSQL + pgvector</span>
                      </div>
                    </div>

                    {/* Source Documents List */}
                    <div className="divide-y divide-border/60">
                      {SOURCES.map((src) => (
                        <div key={src.id} className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                          <div>
                            <span className="text-xs font-semibold text-text-primary block font-mono">{src.title}</span>
                            <span className="text-[11px] font-mono text-text-muted">
                              ID: {src.id} · Issued: {src.issued} · {src.pages || 2} Pages · Kind: {src.kind}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono bg-success-soft text-success px-2 py-0.5 rounded-full">
                              Vector Indexed
                            </span>
                            <a
                              href={src.fileUri || `/docs/${src.title}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-mono text-brand-green hover:underline flex items-center gap-1 font-semibold"
                            >
                              Open PDF ↗
                            </a>
                            <span className="text-[11px] font-mono bg-surface-muted px-2 py-0.5 rounded text-text-secondary">
                              SHA: {shortHash(src.hash)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                ROLE 2: REVIEWER WORKSPACE ("What findings require my judgment?")
            ───────────────────────────────────────────────────────────── */}
            {authenticatedRole === "reviewer" && (
              <div className="space-y-6 max-w-6xl mx-auto">
                {/* Reviewer Header Banner */}
                <div className="bg-surface rounded-2xl p-6 border border-border shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-mono uppercase bg-indigo-500/10 text-indigo-700 px-2.5 py-0.5 rounded-full font-semibold">
                      Editorial Review Station
                    </span>
                    <h2 className="font-serif italic text-2xl sm:text-3xl text-text-primary mt-1">
                      Review Queue & Triage
                    </h2>
                    <p className="text-xs sm:text-sm text-text-muted mt-0.5">
                      Review flagged claims, inspect citations, accept intent-preserving fixes, or dismiss with written justification.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowCommentsDrawer(!showCommentsDrawer)}
                      className="px-4 py-2 rounded-xl bg-background-soft border border-border text-xs font-mono text-text-primary hover:border-brand-green transition-colors"
                    >
                      Review Notes ({comments.length})
                    </button>
                  </div>
                </div>

                {/* REVIEWER: TAB 1 - QUEUE */}
                {reviewerTab === "queue" && (
                  <div className="space-y-6">
                    {/* Reviewer KPI Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-surface p-5 rounded-2xl border border-border">
                        <span className="text-[11px] font-mono uppercase text-text-muted block mb-1">Awaiting Review</span>
                        <span className="font-serif italic text-3xl text-warning">1</span>
                        <span className="text-[11px] text-text-muted block mt-1">Active priority draft</span>
                      </div>
                      <div className="bg-surface p-5 rounded-2xl border border-border">
                        <span className="text-[11px] font-mono uppercase text-text-muted block mb-1">High-Priority Flags</span>
                        <span className="font-serif italic text-3xl text-critical">2</span>
                        <span className="text-[11px] text-text-muted block mt-1">Statutory & claim issues</span>
                      </div>
                      <div className="bg-surface p-5 rounded-2xl border border-border">
                        <span className="text-[11px] font-mono uppercase text-text-muted block mb-1">Needs Verification</span>
                        <span className="font-serif italic text-3xl text-amber-600">1</span>
                        <span className="text-[11px] text-text-muted block mt-1">Strict abstention item</span>
                      </div>
                      <div className="bg-surface p-5 rounded-2xl border border-border">
                        <span className="text-[11px] font-mono uppercase text-text-muted block mb-1">Expiring Facts</span>
                        <span className="font-serif italic text-3xl text-text-secondary">1</span>
                        <span className="text-[11px] text-text-muted block mt-1">F-08 Launch Price (1–15 Nov)</span>
                      </div>
                    </div>

                    {/* Review Queue Items */}
                    <div className="bg-surface rounded-2xl p-6 border border-border">
                      <div className="flex items-center justify-between pb-4 border-b border-border/80 mb-4">
                        <h3 className="font-serif italic text-xl text-text-primary">Prioritized Triage Queue</h3>
                        <span className="text-xs font-mono text-text-muted">SLA: 2 hours remaining</span>
                      </div>

                      <div className="p-5 rounded-xl bg-background-soft border border-border/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono font-semibold text-brand-green">{state.draft.campaign}</span>
                            <span className="text-[11px] font-mono uppercase bg-warning-soft text-warning px-2 py-0.5 rounded-full">
                              Needs Triage
                            </span>
                          </div>
                          <h4 className="text-sm font-semibold text-text-primary">{state.draft.title}</h4>
                          <p className="text-xs text-text-muted mt-0.5">Author: {state.draft.author} · Channel: {state.draft.channel}</p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-critical font-semibold">{openCount} Flags Open</span>
                          <button
                            onClick={() => setReviewerTab("review")}
                            className="px-5 py-2.5 rounded-pill bg-brand-green text-on-dark text-xs font-mono uppercase font-semibold hover:bg-brand-green-dark transition-all"
                          >
                            Review Draft →
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* REVIEWER: TAB 2 - MAIN CAMPAIGN REVIEW */}
                {reviewerTab === "review" && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left: Draft Content with Span Highlights & Format Selector */}
                    <div className="lg:col-span-7 space-y-6">
                      <div className="bg-surface rounded-2xl p-6 border border-border">
                        <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setCurrentFormat("text")}
                              className={`text-xs font-mono px-3 py-1 rounded-lg ${currentFormat === "text" ? "bg-brand-green text-on-dark" : "bg-background-soft text-text-muted"}`}
                            >
                              Text Copy
                            </button>
                            <button
                              onClick={() => setCurrentFormat("image")}
                              className={`text-xs font-mono px-3 py-1 rounded-lg ${currentFormat === "image" ? "bg-brand-green text-on-dark" : "bg-background-soft text-text-muted"}`}
                            >
                              Visual Banner & WCAG
                            </button>
                            <button
                              onClick={() => setCurrentFormat("document")}
                              className={`text-xs font-mono px-3 py-1 rounded-lg ${currentFormat === "document" ? "bg-brand-green text-on-dark" : "bg-background-soft text-text-muted"}`}
                            >
                              Factsheet PDF
                            </button>
                            <button
                              onClick={() => setCurrentFormat("version_history")}
                              className={`text-xs font-mono px-3 py-1 rounded-lg ${currentFormat === "version_history" ? "bg-brand-green text-on-dark" : "bg-background-soft text-text-muted"}`}
                            >
                              Version History ({state.versionHistory.length})
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => setCurrentFormat("version_history")}
                            className="text-xs font-mono px-2 py-0.5 rounded bg-brand-green/10 text-brand-green hover:bg-brand-green/20 border border-brand-green/30 font-semibold transition-all"
                            title="View Version Timeline & Audit Ledger"
                          >
                            Draft v{state.draft.version} ▾
                          </button>
                        </div>

                        {currentFormat === "text" && (
                          <div className="relative text-lg font-serif leading-relaxed text-text-primary p-4 rounded-xl bg-background-soft border border-border/60 min-h-36">
                            {segmentText(state.draft.text, state.findings).map((seg, idx) => {
                              if (!seg.finding) return <span key={idx}>{seg.text}</span>;
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
                                    isSelected ? TONE_CLASSES[tone].markActive : TONE_CLASSES[tone].mark
                                  } ${resolved ? "opacity-60 line-through decoration-text-muted" : ""}`}
                                >
                                  {f.phrase}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {currentFormat === "image" && renderCreativeLeftColumn()}

                        {currentFormat === "document" && (
                          <div className="space-y-3">
                            {/* Document Selector Pills */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border">
                              <div className="flex flex-wrap gap-1.5">
                                {[
                                  { id: "product_facts", label: "02_NOVA_Product_Facts.pdf", file: "02_NOVA_Product_Facts.pdf" },
                                  { id: "pricing_master", label: "03_NOVA_Pricing_Master.pdf", file: "03_NOVA_Pricing_Master.pdf" },
                                  { id: "approved_claims", label: "04_NOVA_Approved_Claims.pdf", file: "04_NOVA_Approved_Claims.pdf" },
                                  { id: "guidelines", label: "01_NOVA_Brand_Guidelines.pdf", file: "01_NOVA_Brand_Guidelines.pdf" },
                                ].map((doc) => (
                                  <button
                                    key={doc.id}
                                    type="button"
                                    onClick={() => {
                                      setActivePdfDoc(doc.id as any);
                                      setActivePdfPage(1);
                                    }}
                                    className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border transition-all ${
                                      activePdfDoc === doc.id
                                        ? "bg-brand-green text-on-dark border-brand-green font-semibold shadow-xs"
                                        : "bg-surface border-border text-text-secondary hover:bg-background-soft"
                                    }`}
                                  >
                                    {doc.label}
                                  </button>
                                ))}
                              </div>

                              {/* Page Switcher & Download Raw Link */}
                              <div className="flex items-center gap-2">
                                <div className="flex items-center border border-border rounded-lg overflow-hidden font-mono text-[11px]">
                                  <button
                                    type="button"
                                    onClick={() => setActivePdfPage(1)}
                                    className={`px-2 py-0.5 ${activePdfPage === 1 ? "bg-[#1c1a18] text-white font-semibold" : "bg-surface text-text-muted hover:bg-background-soft"}`}
                                  >
                                    Page 1
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setActivePdfPage(2)}
                                    className={`px-2 py-0.5 ${activePdfPage === 2 ? "bg-[#1c1a18] text-white font-semibold" : "bg-surface text-text-muted hover:bg-background-soft"}`}
                                  >
                                    Page 2
                                  </button>
                                </div>

                                <a
                                  href={`/docs/${
                                    activePdfDoc === "product_facts"
                                      ? "02_NOVA_Product_Facts.pdf"
                                      : activePdfDoc === "pricing_master"
                                      ? "03_NOVA_Pricing_Master.pdf"
                                      : activePdfDoc === "approved_claims"
                                      ? "04_NOVA_Approved_Claims.pdf"
                                      : "01_NOVA_Brand_Guidelines.pdf"
                                  }`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs font-mono text-brand-green hover:underline flex items-center gap-1 font-semibold whitespace-nowrap"
                                >
                                  Open PDF ↗
                                </a>
                              </div>
                            </div>

                            {/* Render Table Content Based on Active Document & Active Page */}
                            <div className="bg-background-soft p-4 rounded-xl border border-border text-xs space-y-3 font-sans shadow-inner">
                              {/* 02_NOVA_Product_Facts.pdf */}
                              {activePdfDoc === "product_facts" && (
                                <>
                                  <div className="flex justify-between font-mono text-[11px] pb-2 border-b border-border/80 text-text-muted">
                                    <span>NOVA Technical Engineering Dossier · Page {activePdfPage} of 2</span>
                                    <span className="text-brand-green font-semibold">ISO 20871 Tested Standard</span>
                                  </div>

                                  {activePdfPage === 1 && (
                                    <div className="space-y-2">
                                      <span className="font-mono text-[11px] font-semibold text-text-primary uppercase block">
                                        Table 1: Product Specifications
                                      </span>
                                      <table className="w-full text-left text-xs border border-border bg-surface rounded-lg overflow-hidden">
                                        <thead>
                                          <tr className="bg-[#264831] text-white font-mono text-[11px]">
                                            <th className="py-2 px-3">Field</th>
                                            <th className="py-2 px-3">Approved Value</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                          <tr>
                                            <td className="py-2 px-3 font-semibold text-text-primary">Product</td>
                                            <td className="py-2 px-3 font-mono">NOVA AeroRun X1</td>
                                          </tr>
                                          <tr className="bg-background-soft/40">
                                            <td className="py-2 px-3 font-semibold text-text-primary">Weight</td>
                                            <td className="py-2 px-3 font-mono">218 g</td>
                                          </tr>
                                          <tr>
                                            <td className="py-2 px-3 font-semibold text-text-primary">Upper</td>
                                            <td className="py-2 px-3 font-mono">Engineered mesh</td>
                                          </tr>
                                          <tr className="bg-background-soft/40">
                                            <td className="py-2 px-3 font-semibold text-text-primary">Midsole</td>
                                            <td className="py-2 px-3 font-mono">EVA foam</td>
                                          </tr>
                                          <tr>
                                            <td className="py-2 px-3 font-semibold text-text-primary">Outsole</td>
                                            <td className="py-2 px-3 font-mono">Rubber traction outsole</td>
                                          </tr>
                                          <tr className="bg-background-soft/40">
                                            <td className="py-2 px-3 font-semibold text-text-primary">Sizes</td>
                                            <td className="py-2 px-3 font-mono">6–11</td>
                                          </tr>
                                          <tr>
                                            <td className="py-2 px-3 font-semibold text-text-primary">Intended use</td>
                                            <td className="py-2 px-3 font-mono">Everyday running</td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </div>
                                  )}

                                  {activePdfPage === 2 && (
                                    <div className="space-y-2">
                                      <span className="font-mono text-[11px] font-semibold text-text-primary uppercase block">
                                        Table 2: Performance Evidence
                                      </span>
                                      <table className="w-full text-left text-xs border border-border bg-surface rounded-lg overflow-hidden">
                                        <thead>
                                          <tr className="bg-[#264831] text-white font-mono text-[11px]">
                                            <th className="py-2 px-3">Claim</th>
                                            <th className="py-2 px-3">Result</th>
                                            <th className="py-2 px-3">Evidence</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                          <tr>
                                            <td className="py-2 px-3 font-semibold text-text-primary">Tested durability</td>
                                            <td className="py-2 px-3 font-mono text-success">Up to 40 km</td>
                                            <td className="py-2 px-3 font-mono text-text-muted">Performance Test PT-2026-041</td>
                                          </tr>
                                          <tr className="bg-background-soft/40">
                                            <td className="py-2 px-3 font-semibold text-text-primary">Lightweight</td>
                                            <td className="py-2 px-3 font-mono text-success">218 g</td>
                                            <td className="py-2 px-3 font-mono text-text-muted">Product Specification PS-2026-018</td>
                                          </tr>
                                          <tr>
                                            <td className="py-2 px-3 font-semibold text-text-primary">Injury prevention</td>
                                            <td className="py-2 px-3 font-mono text-critical font-medium">Not tested</td>
                                            <td className="py-2 px-3 font-mono text-text-muted">— (Prohibited from marketing claims)</td>
                                          </tr>
                                          <tr className="bg-background-soft/40">
                                            <td className="py-2 px-3 font-semibold text-text-primary">Guaranteed speed improvement</td>
                                            <td className="py-2 px-3 font-mono text-critical font-medium">Not tested</td>
                                            <td className="py-2 px-3 font-mono text-text-muted">— (Prohibited from marketing claims)</td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </>
                              )}

                              {/* 03_NOVA_Pricing_Master.pdf */}
                              {activePdfDoc === "pricing_master" && (
                                <>
                                  <div className="flex justify-between font-mono text-[11px] pb-2 border-b border-border/80 text-text-muted">
                                    <span>NOVA Commercial Pricing Catalog · Page {activePdfPage} of 2</span>
                                    <span className="text-warning font-semibold">Active Window: 01–15 Nov 2026</span>
                                  </div>

                                  <div className="space-y-2">
                                    <span className="font-mono text-[11px] font-semibold text-text-primary uppercase block">
                                      Table: Regional Pricing &amp; Promotional Schedule
                                    </span>
                                    <table className="w-full text-left text-xs border border-border bg-surface rounded-lg overflow-hidden">
                                      <thead>
                                        <tr className="bg-[#264831] text-white font-mono text-[11px]">
                                          <th className="py-2 px-3">Region</th>
                                          <th className="py-2 px-3">Standard Price</th>
                                          <th className="py-2 px-3">Campaign Price</th>
                                          <th className="py-2 px-3">Valid From</th>
                                          <th className="py-2 px-3">Valid Until</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-border font-mono">
                                        <tr>
                                          <td className="py-2 px-3 font-semibold text-text-primary font-sans">India</td>
                                          <td className="py-2 px-3">₹4,499</td>
                                          <td className="py-2 px-3 text-brand-green font-semibold">₹3,999</td>
                                          <td className="py-2 px-3">01 Nov 2026</td>
                                          <td className="py-2 px-3 text-warning font-semibold">15 Nov 2026</td>
                                        </tr>
                                        <tr className="bg-background-soft/40">
                                          <td className="py-2 px-3 font-semibold text-text-primary font-sans">Export (SAARC)</td>
                                          <td className="py-2 px-3">₹4,999</td>
                                          <td className="py-2 px-3 text-brand-green font-semibold">₹4,499</td>
                                          <td className="py-2 px-3">01 Nov 2026</td>
                                          <td className="py-2 px-3 text-warning font-semibold">15 Nov 2026</td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>

                                  <div className="p-2.5 rounded-lg bg-warning-soft/30 border border-warning/40 text-[11px] text-text-secondary leading-relaxed">
                                    <span className="font-semibold text-warning font-mono block mb-0.5">Expiry Radar Rule:</span>
                                    Promotional pricing ₹3,999 is valid strictly between 01 Nov and 15 Nov 2026. Any copy published outside this window will be flagged as an <b>EXPIRED PROMOTIONAL CLAIM</b>.
                                  </div>
                                </>
                              )}

                              {/* 04_NOVA_Approved_Claims.pdf */}
                              {activePdfDoc === "approved_claims" && (
                                <>
                                  <div className="flex justify-between font-mono text-[11px] pb-2 border-b border-border/80 text-text-muted">
                                    <span>NOVA Approved &amp; Unapproved Claims Register · Page {activePdfPage} of 2</span>
                                    <span className="text-brand-green font-semibold">Legal Decision Matrix</span>
                                  </div>

                                  <div className="space-y-2">
                                    <span className="font-mono text-[11px] font-semibold text-text-primary uppercase block">
                                      Table: Master Claims Decision Matrix
                                    </span>
                                    <table className="w-full text-left text-xs border border-border bg-surface rounded-lg overflow-hidden">
                                      <thead>
                                        <tr className="bg-[#264831] text-white font-mono text-[11px]">
                                          <th className="py-2 px-3">Claim</th>
                                          <th className="py-2 px-3">Status</th>
                                          <th className="py-2 px-3">Evidence</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-border">
                                        <tr>
                                          <td className="py-2 px-3 font-semibold text-text-primary">Designed for everyday running</td>
                                          <td className="py-2 px-3 font-mono text-success font-semibold">Approved</td>
                                          <td className="py-2 px-3 font-mono text-text-muted">Product Brief</td>
                                        </tr>
                                        <tr className="bg-background-soft/40">
                                          <td className="py-2 px-3 font-semibold text-text-primary">Lightweight performance footwear</td>
                                          <td className="py-2 px-3 font-mono text-success font-semibold">Approved</td>
                                          <td className="py-2 px-3 font-mono text-text-muted">Product Specification</td>
                                        </tr>
                                        <tr>
                                          <td className="py-2 px-3 font-semibold text-text-primary">Up to 40 km tested durability</td>
                                          <td className="py-2 px-3 font-mono text-success font-semibold">Approved</td>
                                          <td className="py-2 px-3 font-mono text-text-muted">Performance Test</td>
                                        </tr>
                                        <tr className="bg-background-soft/40">
                                          <td className="py-2 px-3 font-semibold text-text-primary">India&apos;s #1 running shoe</td>
                                          <td className="py-2 px-3 font-mono text-critical font-semibold">Not approved</td>
                                          <td className="py-2 px-3 font-mono text-text-muted">No evidence</td>
                                        </tr>
                                        <tr>
                                          <td className="py-2 px-3 font-semibold text-text-primary">30% lighter than leading shoes</td>
                                          <td className="py-2 px-3 font-mono text-critical font-semibold">Not approved</td>
                                          <td className="py-2 px-3 font-mono text-text-muted">No comparison baseline</td>
                                        </tr>
                                        <tr className="bg-background-soft/40">
                                          <td className="py-2 px-3 font-semibold text-text-primary">Guaranteed to make you faster</td>
                                          <td className="py-2 px-3 font-mono text-critical font-semibold">Not approved</td>
                                          <td className="py-2 px-3 font-mono text-text-muted">No evidence</td>
                                        </tr>
                                        <tr>
                                          <td className="py-2 px-3 font-semibold text-text-primary">Injury-proof cushioning</td>
                                          <td className="py-2 px-3 font-mono text-critical font-semibold">Not approved</td>
                                          <td className="py-2 px-3 font-mono text-text-muted">No clinical evidence</td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>
                                </>
                              )}

                              {/* 01_NOVA_Brand_Guidelines.pdf */}
                              {activePdfDoc === "guidelines" && (
                                <>
                                  <div className="flex justify-between font-mono text-[11px] pb-2 border-b border-border/80 text-text-muted">
                                    <span>NOVA Brand Guidelines &amp; Claims Policy · Page {activePdfPage} of 2</span>
                                    <span className="text-brand-green font-semibold">Version 2.1 Standard</span>
                                  </div>

                                  <div className="space-y-2">
                                    <span className="font-mono text-[11px] font-semibold text-text-primary uppercase block">
                                      Brand Voice &amp; Mandatory Guardrails
                                    </span>
                                    <div className="p-3 bg-surface rounded-lg border border-border space-y-1.5 text-text-secondary">
                                      <p>• <b>Voice Pillars:</b> Confident, energetic, practical, athlete-focused, clear and concise.</p>
                                      <p>• <b>Preferred Language:</b> lightweight, performance, designed for everyday running, tested durability, responsive cushioning, breathable upper, everyday training.</p>
                                      <p>• <b>Prohibited Language:</b> miracle, guaranteed performance, injury-proof, prevents injuries, world&apos;s best, India&apos;s #1, unbeatable, guaranteed to make you faster.</p>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        )}

                        {currentFormat === "version_history" && renderVersionHistory()}

                        {/* Intent-Preserving Diff */}
                        <div className="mt-4 pt-4 border-t border-border">
                          <span className="text-xs uppercase font-mono tracking-wider text-brand-green font-semibold block mb-1">
                            Live Result:
                          </span>
                          <p className="text-sm font-serif italic text-text-primary p-3 rounded-xl bg-surface-muted/40 border border-border/80">
                            {revisedText(state.draft, state.findings)}
                          </p>
                        </div>
                      </div>

                      {/* Reviewer Notice */}
                      <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-900 text-xs flex items-center justify-between">
                        <span>
                          <strong>Reviewer Scope:</strong> You can accept fixes, edit text, or dismiss with justification. Regulatory sign-off requires Compliance Approver.
                        </span>
                        <span className="font-mono text-[11px] bg-indigo-500/20 px-2 py-0.5 rounded">
                          Reviewer Mode
                        </span>
                      </div>
                    </div>

                    {/* Right: Finding Actions Panel (Accept, Edit, Dismiss) */}
                    <div className="lg:col-span-5">
                      {renderClaimsInspector(true)}
                    </div>
                  </div>
                )}

                {/* REVIEWER: TAB 3 - ALL CAMPAIGNS */}
                {reviewerTab === "all_campaigns" && (
                  <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-border">
                    <h3 className="font-serif italic text-2xl text-text-primary mb-2">Cross-Channel Campaign Portfolio</h3>
                    <div className="divide-y divide-border/60">
                      {QUEUE.map((item) => (
                        <div key={item.id} className="py-4 flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-semibold text-text-primary">{item.title}</h4>
                            <p className="text-xs text-text-muted">{item.channel} · Author: {item.author}</p>
                          </div>
                          <span className={`text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full ${item.status === "approved" ? "bg-success-soft text-success" : "bg-warning-soft text-warning"}`}>
                            {item.status.replace("_", " ")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* REVIEWER: TAB 4 - FINDINGS HUB */}
                {reviewerTab === "findings" && (
                  <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-border space-y-4">
                    <h3 className="font-serif italic text-2xl text-text-primary">Active Findings Catalog</h3>
                    <div className="space-y-3">
                      {state.findings.map((f) => (
                        <div key={f.id} className="p-4 rounded-xl bg-background-soft border border-border flex items-center justify-between">
                          <div>
                            <span className="text-xs font-mono font-semibold text-brand-green">{f.ruleId || f.factId}</span>
                            <h4 className="text-sm font-medium text-text-primary">{f.title}</h4>
                            <p className="text-xs text-text-muted">&quot;{f.phrase}&quot;</p>
                          </div>
                          <span className={`text-[11px] font-mono uppercase px-2 py-0.5 rounded-full ${f.status === "open" ? "bg-warning-soft text-warning" : "bg-success-soft text-success"}`}>
                            {f.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* REVIEWER: TAB 5 - DECISIONS */}
                {reviewerTab === "decisions" && (
                  <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-border">
                    <h3 className="font-serif italic text-2xl text-text-primary mb-2">Logged Reviewer Decisions</h3>
                    <p className="text-xs text-text-muted mb-4">Historical triage events feeding the Brand Brain learning loop.</p>
                    <div className="divide-y divide-border/60">
                      {state.audit.filter((a) => a.action.includes("ACCEPTED") || a.action.includes("DISMISSED") || a.action.includes("EDITED")).map((entry) => (
                        <div key={entry.id} className="py-3 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-semibold text-text-primary">{entry.action}</span>
                            <p className="text-text-muted">{entry.detail}</p>
                          </div>
                          <span className="font-mono text-[11px] text-text-muted">{entry.at.slice(11, 16)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                ROLE 3: COMPLIANCE APPROVER WORKSPACE ("Is this safe to approve?")
            ───────────────────────────────────────────────────────────── */}
            {authenticatedRole === "approver" && (
              <div className="space-y-6 max-w-6xl mx-auto">
                {/* Approver Header Banner */}
                <div className="bg-surface rounded-2xl p-6 border border-border shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-mono uppercase bg-emerald-500/10 text-emerald-800 px-2.5 py-0.5 rounded-full font-semibold">
                      Brand Governance Gateway
                    </span>
                    <h2 className="font-serif italic text-2xl sm:text-3xl text-text-primary mt-1">
                      Compliance &amp; Legal Sign-Off
                    </h2>
                    <p className="text-xs sm:text-sm text-text-muted mt-0.5">
                      Verify claims compliance, ensure zero unverified product liabilities, and issue tamper-evident approval certificates.
                    </p>
                  </div>

                  <span className="text-xs font-mono uppercase bg-surface-muted px-3 py-1.5 rounded-full border border-border text-text-secondary font-medium">
                    Brand Claims Policy Signatory
                  </span>
                </div>

                {/* APPROVER: TAB 1 - APPROVAL QUEUE */}
                {approverTab === "approval_queue" && (
                  <div className="space-y-6">
                    {/* Approver KPI Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-surface p-5 rounded-2xl border border-border">
                        <span className="text-[11px] font-mono uppercase text-text-muted block mb-1">Ready for Sign-Off</span>
                        <span className="font-serif italic text-3xl text-success">{openCount === 0 && !isApproved ? 1 : 0}</span>
                        <span className="text-[11px] text-text-muted block mt-1">All findings resolved</span>
                      </div>
                      <div className="bg-surface p-5 rounded-2xl border border-border">
                        <span className="text-[11px] font-mono uppercase text-text-muted block mb-1">Approval Locked</span>
                        <span className="font-serif italic text-3xl text-critical">{openCount > 0 ? 1 : 0}</span>
                        <span className="text-[11px] text-text-muted block mt-1">{openCount} unresolved findings</span>
                      </div>
                      <div className="bg-surface p-5 rounded-2xl border border-border">
                        <span className="text-[11px] font-mono uppercase text-text-muted block mb-1">Certified Approved</span>
                        <span className="font-serif italic text-3xl text-brand-green">{isApproved ? 1 : 0}</span>
                        <span className="text-[11px] text-text-muted block mt-1">{isApproved ? "Sealed with SHA-256" : "None sealed"}</span>
                      </div>
                      <div className="bg-surface p-5 rounded-2xl border border-border">
                        <span className="text-[11px] font-mono uppercase text-text-muted block mb-1">Claims Risk</span>
                        <span className={`font-serif italic text-xl ${openCount > 0 ? "text-critical" : "text-success"}`}>
                          {openCount > 0 ? "High Risk" : "Zero Liability"}
                        </span>
                        <span className="text-[11px] text-text-muted block mt-1">Brand compliance score</span>
                      </div>
                    </div>

                    {/* Active Campaign Card for Approver */}
                    <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-border">
                      <div className="flex items-center justify-between pb-4 border-b border-border/80 mb-6">
                        <div>
                          <span className="text-xs font-mono font-semibold text-brand-green uppercase">Campaign Awaiting Approval</span>
                          <h3 className="font-serif italic text-2xl text-text-primary mt-0.5">{state.draft.title}</h3>
                          <p className="text-xs text-text-muted mt-0.5">Author: {state.draft.author} · Channel: {state.draft.channel}</p>
                        </div>

                        <span className={`text-xs font-mono uppercase px-3 py-1 rounded-full ${isApproved ? "bg-success-soft text-success font-semibold" : openCount === 0 ? "bg-brand-pink-soft text-brand-pink font-semibold" : "bg-critical-soft text-critical font-semibold"}`}>
                          {isApproved ? "Approved & Certified" : openCount === 0 ? "Ready for Sign-Off" : `Locked (${openCount} Flags)`}
                        </span>
                      </div>

                      {/* Statutory Readiness Checklist */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-xs">
                        <div className="p-3.5 rounded-xl bg-background-soft border border-border flex items-center justify-between">
                          <span>Findings Resolved:</span>
                          <span className={`font-mono font-semibold ${openCount === 0 ? "text-success" : "text-critical"}`}>
                            {state.findings.filter((f) => f.status !== "open").length} / {state.findings.length} Resolved
                          </span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-background-soft border border-border flex items-center justify-between">
                          <span>Evidence Vault Check:</span>
                          <span className="font-mono text-success font-semibold">Product_Facts.pdf Linked ✓</span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-background-soft border border-border flex items-center justify-between">
                          <span>Reviewer Attribution:</span>
                          <span className="font-mono text-text-primary">Arjun Verma (Claims Reviewer)</span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-background-soft border border-border flex items-center justify-between">
                          <span>Temporal Validity:</span>
                          <span className={`font-mono font-semibold ${state.staleAlert?.active ? "text-critical" : "text-success"}`}>
                            {state.staleAlert?.active ? "Stale Fact F-08 · Re-Review Required" : "Valid 2026 Campaign ✓"}
                          </span>
                        </div>
                      </div>

                      {/* Approval Gate Widget */}
                      <div className={`p-6 rounded-2xl border transition-all ${
                        isApproved
                          ? "bg-[#0e231a] text-white border-brand-green"
                          : state.phase === "re_review_required"
                          ? "bg-amber-500/10 border-amber-500/50"
                          : openCount === 0
                          ? "bg-surface border-brand-green shadow-md"
                          : "bg-surface-muted/50 border-critical/30"
                      }`}>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`h-2.5 w-2.5 rounded-full ${
                                isApproved
                                  ? "bg-success"
                                  : state.phase === "re_review_required"
                                  ? "bg-amber-500 animate-pulse"
                                  : openCount === 0
                                  ? "bg-brand-pink"
                                  : "bg-critical"
                              }`} />
                              <h4 className="font-semibold text-sm">
                                {isApproved
                                  ? "Cryptographic Approval Certificate Issued"
                                  : state.phase === "re_review_required"
                                  ? "Approval Blocked: Re-Review Required (Pricing Fact Stale)"
                                  : openCount === 0
                                  ? "All Findings Resolved — Ready for Compliance Sign-Off"
                                  : `Approval Locked (${openCount} Unresolved Issue${openCount > 1 ? "s" : ""})`}
                              </h4>
                            </div>
                            <p className="text-xs text-text-muted max-w-lg">
                              {isApproved
                                ? `Certified by Priya Sundaram (Compliance Approver). Sealed Hash: ${shortHash(state.approval?.contentHash || "")}`
                                : state.phase === "re_review_required"
                                ? "Temporal radar detected that promotional pricing fact F-08 expired on 15 Nov 2026. Automatic re-review was triggered and prior approval was revoked."
                                : openCount === 0
                                ? "As Compliance Approver, you are authorized to seal this approved draft into an immutable audit certificate."
                                : "Publishing is strictly blocked under corporate compliance policy until all findings are accepted, edited, or justified."}
                            </p>
                          </div>

                          {!isApproved && (
                            <button
                              type="button"
                              disabled={openCount > 0 || state.phase === "re_review_required"}
                              onClick={handleApprove}
                              className="px-6 py-3 rounded-pill bg-brand-green text-on-dark text-xs uppercase font-mono font-semibold tracking-wider hover:bg-brand-green-dark transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md whitespace-nowrap"
                            >
                              {state.phase === "re_review_required"
                                ? "Re-Review Required (Locked)"
                                : openCount === 0
                                ? "Approve & Seal Certificate"
                                : "Approval Locked"}
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
                  </div>
                )}

                {/* APPROVER: TAB 2 - ACTIVE REVIEW DETAIL */}
                {approverTab === "active_review" && (
                  <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-border space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
                      <div>
                        <h3 className="font-serif italic text-2xl text-text-primary">Statutory Inspection &amp; Campaign Assets</h3>
                        <p className="text-xs text-text-muted mt-0.5">Comprehensive review of text copy and creative banners before compliance certification.</p>
                      </div>
                      <span className={`text-xs font-mono px-3 py-1 rounded-full ${openCount === 0 ? "bg-emerald-500/20 text-emerald-600 font-semibold border border-emerald-500/40" : "bg-amber-500/20 text-amber-600 font-semibold border border-amber-500/40"}`}>
                        {openCount === 0 ? "Ready for Final Approval ✓" : `${openCount} Open Issues Pending Resolution`}
                      </span>
                    </div>

                    {/* Dual Assets: Live Copy & Visual Banner */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-background-soft border border-border space-y-2">
                        <span className="text-[11px] uppercase font-mono text-brand-green font-semibold block">Live Proposal Copy:</span>
                        <p className="text-sm font-serif italic text-text-primary leading-relaxed">
                          {revisedText(state.draft, state.findings)}
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-background-soft border border-border flex items-center gap-4">
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-border flex-shrink-0 bg-black">
                          <Image src={creativeMeta.fileUri} alt={creativeMeta.altText} fill className="object-contain" />
                        </div>
                        <div className="space-y-1 text-xs">
                          <span className="font-semibold text-text-primary block">{creativeMeta.fileName}</span>
                          <span className="text-[11px] font-mono text-text-muted block">Asset v{creativeMeta.version} · {creativeMeta.dimensions.width}×{creativeMeta.dimensions.height}</span>
                          <span className="text-[11px] font-mono text-brand-green font-semibold block">WCAG Contrast: {creativeMeta.contrastRatio}:1 (Pass)</span>
                          <span className="text-[11px] font-mono text-brand-green block">Logo Clearspace: 31px / 51px (Pass)</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <span className="text-xs uppercase font-mono text-brand-green font-semibold">Governance Finding Resolutions</span>
                      <div className="divide-y divide-border/60 border border-border rounded-xl overflow-hidden bg-background-soft">
                        {state.findings.map((f) => (
                          <div key={f.id} className="p-3 text-xs flex justify-between items-center">
                            <div>
                              <span className="font-semibold text-text-primary block">{f.title}</span>
                              <span className="text-[11px] text-text-muted">&quot;{f.phrase}&quot; · {f.ruleId || f.factId}</span>
                            </div>
                            <span className={`font-mono text-[11px] px-2 py-0.5 rounded-full font-semibold ${f.status === "open" ? "bg-amber-500/20 text-amber-600" : "bg-emerald-500/20 text-emerald-600"}`}>
                              {f.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Seal & Approve Button */}
                    <div className="pt-4 border-t border-border flex items-center justify-between">
                      <span className="text-xs text-text-muted font-mono">
                        {state.phase === "re_review_required"
                          ? "Re-review required: Fact F-08 expired on 15 Nov 2026. Approval revoked."
                          : openCount === 0
                          ? "All statutory findings resolved. Ready to issue certificate."
                          : `Resolve remaining ${openCount} open issue(s) to unlock certificate signature.`}
                      </span>
                      <button
                        type="button"
                        onClick={() => dispatch({ type: "approve", at: new Date().toISOString() })}
                        disabled={openCount > 0 || isApproved || state.phase === "re_review_required"}
                        className="px-6 py-2.5 rounded-pill bg-brand-green text-on-dark text-xs font-mono uppercase font-semibold tracking-wider hover:bg-brand-green-dark transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                      >
                        {isApproved
                          ? "Approved & Cryptographically Sealed ✓"
                          : state.phase === "re_review_required"
                          ? "Re-Review Required (Approval Revoked)"
                          : openCount > 0
                          ? `Approval Locked (${openCount} Open)`
                          : "Sign & Approve Campaign →"}
                      </button>
                    </div>
                  </div>
                )}

                {/* APPROVER: TAB 3 - BLOCKED */}
                {approverTab === "blocked" && (
                  <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-border">
                    <h3 className="font-serif italic text-2xl text-text-primary mb-2">Blocked Campaigns</h3>
                    <p className="text-xs text-text-muted mb-4">Campaigns held from publication due to statutory or factual breaches.</p>
                    {openCount > 0 || state.phase === "re_review_required" ? (
                      <div className="p-4 bg-critical-soft/30 border border-critical/30 rounded-xl text-xs flex justify-between items-center">
                        <div>
                          <span className="font-semibold text-text-primary block">{state.draft.title}</span>
                          <span className="text-critical">
                            {state.phase === "re_review_required"
                              ? "Re-Review Required: Fact F-08 (Pricing) expired on 15 Nov 2026"
                              : `${openCount} unresolved findings`}
                          </span>
                        </div>
                        <span className="font-mono text-critical font-semibold">
                          {state.phase === "re_review_required" ? "RE-REVIEW REQUIRED" : "BLOCKED"}
                        </span>
                      </div>
                    ) : (
                      <p className="text-xs text-text-muted">Zero campaigns currently blocked.</p>
                    )}
                  </div>
                )}

                {/* APPROVER: TAB 4 - CERTIFICATES */}
                {approverTab === "certificates" && (
                  <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-border space-y-4">
                    <h3 className="font-serif italic text-2xl text-text-primary">Issued Approval Certificates</h3>
                    {isApproved ? (
                      <div className="p-5 bg-background-soft rounded-xl border border-border text-xs space-y-2">
                        <div className="flex justify-between items-center font-mono">
                          <span className="font-semibold text-brand-green text-sm">{state.approval?.certificateId}</span>
                          <span className="text-success font-semibold">VALID SEAL</span>
                        </div>
                        <p className="text-text-primary font-medium">{state.draft.title}</p>
                        <p className="text-text-muted font-mono">Sealed Hash: {state.approval?.contentHash}</p>
                        <p className="text-text-muted">Approved by {state.approval?.approvedBy} on {state.approval?.at.slice(0, 10)}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-text-muted">No certificates issued yet. Resolve all findings and click &quot;Approve &amp; Seal&quot;.</p>
                    )}
                  </div>
                )}

                {/* APPROVER: TAB 5 - AUDIT */}
                {approverTab === "audit" && (
                  <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-border">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-serif italic text-2xl text-text-primary">Cryptographic Audit Chain</h3>
                      <span className="text-xs font-mono text-success font-semibold">✓ Mathematical Integrity Verified</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-sans">
                        <thead>
                          <tr className="border-b border-border text-text-muted font-mono uppercase">
                            <th className="py-2">Block</th>
                            <th>Timestamp</th>
                            <th>Actor &amp; Role</th>
                            <th>Action</th>
                            <th>Hash</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {state.audit.map((entry) => (
                            <tr key={entry.id}>
                              <td className="py-2.5 font-mono text-brand-green">{entry.id}</td>
                              <td className="text-text-muted font-mono">{entry.at.slice(11, 16)}</td>
                              <td>{entry.actor} ({entry.role})</td>
                              <td><span className="bg-surface-muted px-2 py-0.5 rounded font-mono">{entry.action}</span></td>
                              <td className="font-mono text-text-muted">{shortHash(entry.hash)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                ROLE 4: ADMIN WORKSPACE ("Is the governance system healthy?")
            ───────────────────────────────────────────────────────────── */}
            {authenticatedRole === "admin" && (
              <div className="space-y-6 max-w-6xl mx-auto">
                {/* Admin Header Banner */}
                <div className="bg-surface rounded-2xl p-6 border border-border shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-mono uppercase bg-blue-500/10 text-blue-800 px-2.5 py-0.5 rounded-full font-semibold">
                      System Governance & Administration
                    </span>
                    <h2 className="font-serif italic text-2xl sm:text-3xl text-text-primary mt-1">
                      Platform Overview & Controls
                    </h2>
                    <p className="text-xs sm:text-sm text-text-muted mt-0.5">
                      Maintain the Brand Brain, manage versioned rules, audit cryptographic integrity, and monitor unclear rule friction.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowAddRuleModal(true)}
                      className="px-4 py-2 rounded-xl bg-brand-green text-on-dark text-xs font-mono uppercase font-medium hover:bg-brand-green-dark transition-colors"
                    >
                      + Add Rule
                    </button>
                    <button
                      onClick={() => setShowAddFactModal(true)}
                      className="px-4 py-2 rounded-xl bg-background-soft border border-border text-xs font-mono text-text-primary hover:border-brand-green transition-colors"
                    >
                      + Register Fact
                    </button>
                  </div>
                </div>

                {/* ADMIN: TAB 1 - OVERVIEW */}
                {adminTab === "overview" && (
                  <div className="space-y-6">
                    {/* Admin System KPI Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-surface p-5 rounded-2xl border border-border">
                        <span className="text-[11px] font-mono uppercase text-text-muted block mb-1">Active Users</span>
                        <span className="font-serif italic text-3xl text-text-primary">4</span>
                        <span className="text-[11px] text-text-muted block mt-1">All personas active</span>
                      </div>
                      <div className="bg-surface p-5 rounded-2xl border border-border">
                        <span className="text-[11px] font-mono uppercase text-text-muted block mb-1">Active Rules</span>
                        <span className="font-serif italic text-3xl text-brand-green">{allRules.length}</span>
                        <span className="text-[11px] text-text-muted block mt-1">In-force brand policies</span>
                      </div>
                      <div className="bg-surface p-5 rounded-2xl border border-border">
                        <span className="text-[11px] font-mono uppercase text-text-muted block mb-1">Connected Sources</span>
                        <span className="font-serif italic text-3xl text-text-secondary">{SOURCES.length}</span>
                        <span className="text-[11px] text-text-muted block mt-1">Audited PDF vaults</span>
                      </div>
                      <div className="bg-surface p-5 rounded-2xl border border-border">
                        <span className="text-[11px] font-mono uppercase text-text-muted block mb-1">System Health</span>
                        <span className="font-serif italic text-3xl text-success">100%</span>
                        <span className="text-[11px] text-text-muted block mt-1">SHA-256 chain verified</span>
                      </div>
                    </div>

                    {/* Adaptive Learning Loop Summary */}
                    <div className="bg-surface rounded-2xl p-6 border border-border">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-serif italic text-xl text-text-primary">Adaptive Governance: Unclear Rules Radar</h3>
                        <span className="text-xs font-mono text-warning font-semibold">1 Friction Rule Detected</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        {RULE_INSIGHTS.map((ri) => (
                          <div key={ri.ruleId} className={`p-4 rounded-xl border ${ri.flag === "unclear" ? "bg-warning-soft/20 border-warning/40" : "bg-background-soft border-border"}`}>
                            <div className="flex justify-between font-mono mb-1">
                              <span className="font-semibold text-brand-green">{ri.ruleId}</span>
                              <span className={ri.flag === "unclear" ? "text-warning font-semibold" : "text-text-muted"}>
                                {(ri.dismissalRate * 100).toFixed(0)}% Dismissal Rate
                              </span>
                            </div>
                            <h4 className="font-semibold text-text-primary mb-2">{ri.title}</h4>
                            {ri.feedback.length > 0 && (
                              <p className="text-[11px] text-text-muted italic border-t border-border pt-1">
                                Recent feedback: &quot;{ri.feedback[0]}&quot;
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ADMIN: TAB 2 - BRAND BRAIN */}
                {adminTab === "brand_brain" && (
                  <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-border space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-serif italic text-2xl text-text-primary">Versioned Rule Catalog</h3>
                      <button onClick={() => setShowAddRuleModal(true)} className="px-3.5 py-1.5 rounded-pill bg-brand-green text-on-dark text-xs font-mono">
                        + New Rule
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {allRules.map((rule) => (
                        <div key={rule.id} className="p-4 rounded-xl bg-background-soft border border-border">
                          <div className="flex justify-between items-center font-mono text-xs mb-1">
                            <span className="font-semibold text-brand-green">{rule.id} v{rule.version}</span>
                            <span className="bg-surface-muted px-2 py-0.5 rounded text-[11px]">{rule.category}</span>
                          </div>
                          <h4 className="text-sm font-semibold text-text-primary mb-1">{rule.title}</h4>
                          <p className="text-xs text-text-secondary">{rule.summary}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ADMIN: TAB 3 - FACTS */}
                {adminTab === "facts" && (
                  <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-border space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-serif italic text-2xl text-text-primary">Temporal Fact Ledger</h3>
                      <button onClick={() => setShowAddFactModal(true)} className="px-3.5 py-1.5 rounded-pill bg-brand-green text-on-dark text-xs font-mono">
                        + Register Fact
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-sans">
                        <thead>
                          <tr className="border-b border-border text-text-muted font-mono uppercase">
                            <th className="py-2">Fact ID</th>
                            <th>Metric</th>
                            <th>Value</th>
                            <th>Validity Window</th>
                            <th>Status</th>
                            <th className="text-right py-2">Temporal Radar</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {allFacts.map((fact, idx) => {
                            const isF08Expired = state.staleAlert?.active && fact.id === "F-08";
                            const displayStatus = isF08Expired ? "expired" : fact.status;
                            return (
                              <tr key={idx}>
                                <td className="py-2.5 font-mono text-brand-green">{fact.id} v{fact.version}</td>
                                <td className="font-medium text-text-primary">{fact.label}</td>
                                <td className="font-mono">{fact.value}</td>
                                <td className="text-text-muted font-mono">{fact.validFrom || "2026-01-01"} → {fact.validUntil}</td>
                                <td>
                                  <span className={`px-2 py-0.5 rounded-full font-mono text-[11px] font-semibold ${
                                    displayStatus === "expired"
                                      ? "bg-red-500/10 text-red-600 border border-red-500/30"
                                      : displayStatus === "current"
                                      ? "bg-success-soft text-success"
                                      : "bg-warning-soft text-warning"
                                  }`}>
                                    {displayStatus}
                                  </span>
                                </td>
                                <td className="text-right py-2.5">
                                  {fact.id === "F-08" ? (
                                    isF08Expired ? (
                                      <button
                                        onClick={() => dispatch({ type: "restore_fact", factId: "F-08", at: new Date().toISOString() })}
                                        className="px-2.5 py-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 border border-emerald-500/30 font-mono text-[11px] font-semibold transition-all"
                                      >
                                        ↺ Restore Fact
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => dispatch({ type: "expire_fact", factId: "F-08", at: new Date().toISOString() })}
                                        className="px-2.5 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 border border-amber-500/30 font-mono text-[11px] font-semibold transition-all"
                                      >
                                        ⚡ Simulate Expiry
                                      </button>
                                    )
                                  ) : (
                                    <span className="text-[11px] text-text-muted font-mono">Monitored</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ADMIN: TAB 4 - TERMINOLOGY */}
                {adminTab === "terminology" && (
                  <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-border space-y-4">
                    <h3 className="font-serif italic text-2xl text-text-primary">Brand Glossary &amp; Design Tokens</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-sans">
                        <thead>
                          <tr className="border-b border-border text-text-muted font-mono uppercase">
                            <th className="py-2 text-critical">Disallowed Phrasing</th>
                            <th className="text-success">Approved Term</th>
                            <th>Rationale</th>
                            <th>Rule</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {GLOSSARY_TERMS.map((term, idx) => (
                            <tr key={idx}>
                              <td className="py-2.5 text-critical font-medium line-through">{term.disallowed}</td>
                              <td className="text-success font-medium">{term.preferred}</td>
                              <td className="text-text-secondary">{term.reason}</td>
                              <td className="font-mono text-brand-green">{term.ruleId}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ADMIN: TAB 5 - INSIGHTS */}
                {adminTab === "insights" && (
                  <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-border space-y-6">
                    <div>
                      <h3 className="font-serif italic text-2xl text-text-primary">Governance Friction &amp; Insights</h3>
                      <p className="text-xs text-text-muted mt-1">Adaptive telemetry tracking recurring reviewer dismissals, guideline ambiguities, and policy friction.</p>
                    </div>

                    {/* Top Recurring Governance Issues */}
                    <div className="p-5 rounded-2xl bg-background-soft border border-border space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-sm text-text-primary">Top Recurring Governance Issues (Q4 2026)</h4>
                        <span className="text-xs font-mono text-brand-green">142 Total Triage Decisions</span>
                      </div>

                      <div className="space-y-3">
                        {[
                          { issue: "Unsupported performance claims", pct: 31, count: 44, color: "bg-critical" },
                          { issue: "Expired pricing claims", pct: 24, count: 34, color: "bg-warning" },
                          { issue: "Unapproved superlatives", pct: 19, count: 27, color: "bg-amber-600" },
                          { issue: "Terminology inconsistencies", pct: 15, count: 21, color: "bg-indigo-600" },
                          { issue: "Incorrect product specifications", pct: 7, count: 10, color: "bg-blue-600" },
                          { issue: "Accessibility issues (contrast / alt-text)", pct: 4, count: 6, color: "bg-emerald-600" },
                        ].map((item, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="font-medium text-text-primary">{item.issue}</span>
                              <span className="font-mono font-semibold text-text-secondary">{item.pct}% ({item.count})</span>
                            </div>
                            <div className="w-full bg-border/60 h-2 rounded-full overflow-hidden">
                              <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.pct}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Adaptive Governance Alert: Guideline Ambiguity Detected */}
                    <div className="p-5 rounded-2xl bg-warning-soft/20 border border-warning/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono uppercase bg-warning text-black font-semibold px-2 py-0.5 rounded-full">
                          Guideline Ambiguity Detected
                        </span>
                        <span className="text-xs font-mono text-warning font-semibold">Rule R-01 (31% Reviewer Dismissal)</span>
                      </div>

                      <div>
                        <h4 className="font-semibold text-text-primary text-sm">
                          Current Guideline: &quot;Performance claims must be supported by approved evidence.&quot;
                        </h4>
                        <p className="text-xs text-text-secondary mt-1">
                          Reviewers repeatedly disagree about comparative claims vs baseline. 31% of flags on &quot;% lighter&quot; were dismissed because reviewers lacked clear benchmark test requirements.
                        </p>
                      </div>

                      <div className="p-3 bg-surface rounded-xl border border-border text-xs space-y-1">
                        <span className="font-mono font-semibold text-brand-green uppercase text-[10px] block">
                          Suggested Rule Modernisation:
                        </span>
                        <p className="font-serif italic text-text-primary font-medium">
                          &quot;Comparative performance claims must include an approved comparison baseline and test methodology.&quot;
                        </p>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => alert("Rule R-01 clarification published to Brand Brain v2.0!")}
                          className="px-4 py-2 rounded-pill bg-brand-green text-on-dark text-xs font-mono uppercase font-semibold hover:bg-brand-green-dark transition-all shadow-xs"
                        >
                          Promote Clarification to In-Force Rule
                        </button>
                      </div>
                    </div>

                    {/* All Monitored Rule Insights */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {RULE_INSIGHTS.map((ri) => (
                        <div key={ri.ruleId} className="p-4 rounded-xl bg-background-soft border border-border">
                          <span className="font-mono text-brand-green font-semibold">{ri.ruleId}</span>
                          <h4 className="font-semibold text-text-primary mt-1">{ri.title}</h4>
                          <span className="text-[11px] text-text-muted block mt-1">Reviewed {ri.reviews} times · {(ri.dismissalRate * 100).toFixed(0)}% dismissal</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ADMIN: TAB 6 - AUDIT LOGS */}
                {adminTab === "audit_logs" && (
                  <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-border space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-serif italic text-2xl text-text-primary">Cryptographic Audit Chain</h3>
                      <button
                        onClick={() => {
                          const res = verifyChain(state.audit);
                          alert(res.ok ? "✓ Cryptographic SHA-256 Chain is mathematically intact!" : `Broken link at: ${res.brokenAt}`);
                        }}
                        className="px-3.5 py-1.5 rounded-pill bg-background-soft border border-border text-xs font-mono text-brand-green hover:border-brand-green"
                      >
                        Verify Chain Integrity
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-sans">
                        <thead>
                          <tr className="border-b border-border text-text-muted font-mono uppercase">
                            <th className="py-2">Block</th>
                            <th>Timestamp</th>
                            <th>Actor</th>
                            <th>Action</th>
                            <th>Hash</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {state.audit.map((entry) => (
                            <tr key={entry.id}>
                              <td className="py-2.5 font-mono text-brand-green">{entry.id}</td>
                              <td className="text-text-muted font-mono">{entry.at.slice(11, 16)}</td>
                              <td>{entry.actor} ({entry.role})</td>
                              <td><span className="bg-surface-muted px-2 py-0.5 rounded font-mono">{entry.action}</span></td>
                              <td className="font-mono text-text-muted">{shortHash(entry.hash)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ADMIN: TAB 7 - USERS & ROLES */}
                {adminTab === "users" && (
                  <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-border space-y-4">
                    <h3 className="font-serif italic text-2xl text-text-primary">Users &amp; Role-Based Access Control</h3>
                    <div className="divide-y divide-border/60">
                      {ROLE_ORDER.map((r) => {
                        const creds = DEMO_CREDENTIALS[r];
                        const p = ROLES[r];
                        return (
                          <div key={r} className="py-3.5 flex items-center justify-between text-xs">
                            <div>
                              <span className="font-semibold text-text-primary block">{creds.name}</span>
                              <span className="text-text-muted font-mono">{creds.email} · Role: {p.label}</span>
                            </div>
                            <span className="text-[11px] font-mono bg-surface-muted px-2.5 py-1 rounded-full text-text-secondary">
                              {p.summary}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          MODAL 1: PERSONA AUTHENTICATION MODAL (Dark Translucent Backdrop Blur)
      ────────────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedPersonaForLogin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Dark translucent overlay with subtle backdrop blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPersonaForLogin(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Centered Login Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md bg-surface rounded-3xl p-6 sm:p-8 border border-border shadow-2xl z-10 space-y-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-brand-green font-semibold bg-surface-muted px-2.5 py-0.5 rounded-full inline-block mb-1.5">
                    {DEMO_CREDENTIALS[selectedPersonaForLogin].badge}
                  </span>
                  <h3 className="font-serif italic text-2xl text-text-primary">
                    {DEMO_CREDENTIALS[selectedPersonaForLogin].title}
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    {DEMO_CREDENTIALS[selectedPersonaForLogin].subtitle}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedPersonaForLogin(null)}
                  className="text-xs font-mono text-text-muted hover:text-text-primary p-1"
                >
                  ✕
                </button>
              </div>

              {loginError && (
                <div className="p-3 bg-critical-soft text-critical rounded-xl text-xs font-medium">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="text-[11px] font-mono uppercase tracking-wider text-text-secondary block mb-1">
                    Email Address:
                  </label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-border bg-background focus:outline-none focus:border-brand-green font-mono"
                    placeholder="name@veritybrand.demo"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase tracking-wider text-text-secondary block mb-1">
                    Password:
                  </label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-border bg-background focus:outline-none focus:border-brand-green font-mono"
                    placeholder="••••••••"
                  />
                </div>

                {/* Quick-fill helper button for evaluators/judges */}
                <button
                  type="button"
                  onClick={() => {
                    setLoginEmail(DEMO_CREDENTIALS[selectedPersonaForLogin].email);
                    setLoginPassword(DEMO_CREDENTIALS[selectedPersonaForLogin].pass);
                    setLoginError(null);
                  }}
                  className="w-full text-left p-2.5 rounded-xl bg-background-soft border border-border/80 text-[11px] font-mono text-text-muted hover:text-brand-green transition-colors flex items-center justify-between"
                >
                  <span>Auto-Fill Demo Credentials</span>
                  <span className="font-semibold text-text-secondary">{DEMO_CREDENTIALS[selectedPersonaForLogin].pass}</span>
                </button>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedPersonaForLogin(null)}
                    className="text-xs px-4 py-2 text-text-muted hover:text-text-primary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="text-xs px-6 py-2.5 rounded-pill bg-brand-green text-on-dark font-mono uppercase font-semibold tracking-wider hover:bg-brand-green-dark transition-all shadow-md"
                  >
                    Sign In
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ──────────────────────────────────────────────────────────────────────────
          MODAL 2: DISMISSAL JUSTIFICATION MODAL (Reviewer requirement)
      ────────────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showDismissModal && selectedFinding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDismissModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-surface rounded-2xl p-6 sm:p-8 max-w-lg w-full border border-border shadow-2xl z-10 space-y-4">
              <h4 className="font-serif italic text-2xl text-text-primary">Dismiss Finding with Justification</h4>
              <p className="text-xs text-text-muted">Dismissals require an auditable written rationale (min. 8 characters) to feed the Brand Brain learning loop.</p>
              <div className="p-3 bg-background-soft rounded-lg text-xs font-mono text-text-secondary">
                Dismissing: &quot;{selectedFinding.phrase}&quot; ({selectedFinding.ruleId || selectedFinding.factId})
              </div>
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-text-secondary block mb-1">Written Justification:</label>
                <textarea
                  rows={3}
                  value={dismissReason}
                  onChange={(e) => setDismissReason(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-border bg-background focus:outline-none focus:border-brand-green"
                  placeholder="e.g. Validated against accredited laboratory testing baseline or authorized legal review for regional distribution..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowDismissModal(false)} className="text-xs px-4 py-2 text-text-muted">Cancel</button>
                <button
                  type="button"
                  disabled={dismissReason.trim().length < 8}
                  onClick={() => handleConfirmDismiss(selectedFinding.id)}
                  className="text-xs px-5 py-2.5 rounded-pill bg-critical text-on-dark font-semibold uppercase tracking-wider disabled:opacity-40"
                >
                  Confirm Dismissal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ──────────────────────────────────────────────────────────────────────────
          MODAL 3: SCAN NEW CONTENT MODAL (Creator / Admin Intake)
      ────────────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showScanModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowScanModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-surface rounded-2xl p-6 sm:p-8 max-w-xl w-full border border-border shadow-2xl z-10 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border/80">
                <h4 className="font-serif italic text-2xl text-text-primary">Scan Marketing Copy</h4>
                <button onClick={() => setShowScanModal(false)} className="text-xs font-mono text-text-muted">✕</button>
              </div>
              <p className="text-xs text-text-muted">Test realistic marketing copy generated by agencies, external tools, or employees.</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setScanPreset("agency");
                    setCustomInputText(`NOVA AERORUN X1

Built for your fastest miles.

30% lighter than leading running shoes.

Up to 40 km tested durability.

India's #1 running shoe.

Guaranteed to make every run faster.

Now ₹3,999.`);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-mono ${scanPreset === "agency" ? "bg-brand-green text-on-dark border-brand-green" : "bg-background-soft text-text-secondary border-border"}`}
                >
                  NOVA AeroRun X1 (Default Campaign)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setScanPreset("marketing");
                    setCustomInputText("NOVA AERORUN X1 — Now ₹3,999 after 15 Nov campaign closing. Lasts 500 km on any road surface with injury-proof cushioning!");
                  }}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-mono ${scanPreset === "marketing" ? "bg-brand-green text-on-dark border-brand-green" : "bg-background-soft text-text-secondary border-border"}`}
                >
                  Expired Pricing &amp; Durability Test
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setScanPreset("custom");
                    setCustomInputText("NOVA AERORUN X1. Lightweight performance footwear designed for everyday running. Up to 40 km tested durability. Now ₹3,999 during the launch campaign.");
                  }}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-mono ${scanPreset === "custom" ? "bg-brand-green text-on-dark border-brand-green" : "bg-background-soft text-text-secondary border-border"}`}
                >
                  Approved Clean Copy
                </button>
              </div>
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-text-secondary block mb-1">Content Text:</label>
                <textarea
                  rows={4}
                  value={customInputText}
                  onChange={(e) => setCustomInputText(e.target.value)}
                  placeholder="Paste marketing copy here..."
                  className="w-full text-xs p-3.5 rounded-xl border border-border bg-background focus:outline-none focus:border-brand-green font-serif"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowScanModal(false)} className="text-xs px-4 py-2 text-text-muted">Cancel</button>
                <button
                  type="button"
                  disabled={!customInputText.trim()}
                  onClick={handleRunLiveScan}
                  className="text-xs px-5 py-2.5 rounded-pill bg-brand-green text-on-dark font-semibold uppercase tracking-wider hover:bg-brand-green-dark transition-all disabled:opacity-40"
                >
                  Run Dual-Engine Scan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ──────────────────────────────────────────────────────────────────────────
          MODAL 4: PRIVACY, CONFIDENTIALITY & AI DISCLOSURE PROTOCOL
      ────────────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showPrivacyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPrivacyModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-surface rounded-2xl p-6 sm:p-8 max-w-xl w-full border border-border shadow-2xl z-10 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border/80">
                <h4 className="font-serif italic text-2xl text-text-primary">Data Privacy &amp; AI Disclosure</h4>
                <button onClick={() => setShowPrivacyModal(false)} className="text-xs font-mono text-text-muted">✕</button>
              </div>
              <div className="space-y-3 text-xs text-text-secondary leading-relaxed">
                <div className="p-3 bg-background-soft rounded-xl border border-border">
                  <span className="font-semibold text-text-primary block mb-1">Sovereign Localized Enclave (Zero Model Training)</span>
                  <p>Customer copy and creative banners are analyzed strictly inside dedicated environments. Content is never shared with third parties or used for AI retraining.</p>
                </div>
                <div className="p-3 bg-background-soft rounded-xl border border-border">
                  <span className="font-semibold text-text-primary block mb-1">Dual-Engine Architecture: AI Proposes, Humans Decide</span>
                  <p>Deterministic regex handles statutory rules with 100% precision, while vector search verifies factual claims against timestamped source documents.</p>
                </div>
                <div className="p-3 bg-background-soft rounded-xl border border-border">
                  <span className="font-semibold text-text-primary block mb-1">Strict AI Abstention Invariant</span>
                  <p>When documentary evidence is absent, the AI explicitly abstains and flags for human review instead of inventing false or unverified verdicts.</p>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button type="button" onClick={() => setShowPrivacyModal(false)} className="text-xs px-5 py-2.5 rounded-pill bg-brand-green text-on-dark font-medium">Understood</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ──────────────────────────────────────────────────────────────────────────
          MODAL 5: ADD RULE MODAL (Admin action)
      ────────────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showAddRuleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddRuleModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-surface rounded-2xl p-6 sm:p-8 max-w-lg w-full border border-border shadow-2xl z-10 space-y-4">
              <h4 className="font-serif italic text-2xl text-text-primary">Define New Brand Guideline Rule</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-text-secondary block mb-1">Rule Title:</label>
                  <input
                    type="text"
                    value={newRuleData.title}
                    onChange={(e) => setNewRuleData({ ...newRuleData, title: e.target.value })}
                    placeholder="e.g. Mandatory Disclaimer for Derivative Instruments"
                    className="w-full text-xs p-3 rounded-lg border border-border bg-background focus:outline-none focus:border-brand-green"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-text-secondary block mb-1">Summary / Policy:</label>
                  <textarea
                    rows={2}
                    value={newRuleData.summary}
                    onChange={(e) => setNewRuleData({ ...newRuleData, summary: e.target.value })}
                    placeholder="Statutory or brand policy details..."
                    className="w-full text-xs p-3 rounded-lg border border-border bg-background focus:outline-none focus:border-brand-green"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddRuleModal(false)} className="text-xs px-4 py-2 text-text-muted">Cancel</button>
                <button
                  type="button"
                  disabled={!newRuleData.title.trim()}
                  onClick={handleCreateRule}
                  className="text-xs px-5 py-2.5 rounded-pill bg-brand-green text-on-dark font-semibold uppercase tracking-wider disabled:opacity-40"
                >
                  Publish Rule v1.0
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ──────────────────────────────────────────────────────────────────────────
          MODAL 6: ADD FACT MODAL (Admin action)
      ────────────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showAddFactModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddFactModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-surface rounded-2xl p-6 sm:p-8 max-w-lg w-full border border-border shadow-2xl z-10 space-y-4">
              <h4 className="font-serif italic text-2xl text-text-primary">Register Audited Fact</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-text-secondary block mb-1">Metric Label:</label>
                  <input
                    type="text"
                    value={newFactData.label}
                    onChange={(e) => setNewFactData({ ...newFactData, label: e.target.value })}
                    placeholder="e.g. Q3 FY27 Equity Fund AUM"
                    className="w-full text-xs p-3 rounded-lg border border-border bg-background focus:outline-none focus:border-brand-green"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-text-secondary block mb-1">Audited Value:</label>
                  <input
                    type="text"
                    value={newFactData.value}
                    onChange={(e) => setNewFactData({ ...newFactData, value: e.target.value })}
                    placeholder="e.g. ₹5,200 crore"
                    className="w-full text-xs p-3 rounded-lg border border-border bg-background focus:outline-none focus:border-brand-green"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddFactModal(false)} className="text-xs px-4 py-2 text-text-muted">Cancel</button>
                <button
                  type="button"
                  disabled={!newFactData.label.trim() || !newFactData.value.trim()}
                  onClick={handleCreateFact}
                  className="text-xs px-5 py-2.5 rounded-pill bg-brand-green text-on-dark font-semibold uppercase tracking-wider disabled:opacity-40"
                >
                  Commit Fact
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}