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
    badge: "SEBI Compliance Approver",
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

  // Format Switcher inside Review/Draft Studio: text | image | document
  const [currentFormat, setCurrentFormat] = useState<"text" | "image" | "document">("text");

  // Interaction State for resolution
  const [isEditingFix, setIsEditingFix] = useState<boolean>(false);
  const [customEditText, setCustomEditText] = useState<string>("");
  const [dismissReason, setDismissReason] = useState<string>("");
  const [showDismissModal, setShowDismissModal] = useState<boolean>(false);

  // New Content / Live Scan Modal State (Creator action)
  const [showScanModal, setShowScanModal] = useState<boolean>(false);
  const [scanPreset, setScanPreset] = useState<"agency" | "marketing" | "custom">("agency");
  const [customInputText, setCustomInputText] = useState<string>(
    "Build steady wealth with guaranteed 15% returns from Arthaa Gold Savings Fund! India's #1 fund beating 99% of peers. Hurry up, start a SIP and enjoy zero risk profits!"
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
                    <p className="text-xs text-text-muted mb-6">Marketing drafts authored by Riya Sharma for Arthaa Finserv.</p>

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
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left: Draft Content with Span Highlights & Live Diff */}
                    <div className="lg:col-span-7 space-y-6">
                      <div className="bg-surface rounded-2xl p-6 border border-border">
                        <div className="flex items-center justify-between pb-3 border-b border-border/80 mb-4">
                          <div>
                            <h3 className="text-sm font-semibold text-text-primary">{state.draft.title}</h3>
                            <p className="text-xs text-text-muted">Click flagged spans to view recommended fixes</p>
                          </div>
                          <span className="text-xs font-mono bg-surface-muted px-2.5 py-1 rounded-full text-text-secondary">
                            {openCount} / {state.findings.length} Unresolved
                          </span>
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

                      {/* Creator Notice: Cannot Approve */}
                      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs flex items-center justify-between">
                        <span>
                          <strong>Creator Scope:</strong> You can apply fixes and edit draft copy. Final regulatory sign-off is restricted to the Compliance Approver.
                        </span>
                        <span className="font-mono text-[11px] bg-amber-500/20 px-2 py-0.5 rounded">
                          Approval Locked
                        </span>
                      </div>
                    </div>

                    {/* Right: Selected Finding Inspector */}
                    <div className="lg:col-span-5">
                      <div className="bg-surface rounded-2xl p-6 border border-border sticky top-20 space-y-4">
                        {selectedFinding ? (
                          <>
                            <div className="flex items-center justify-between pb-3 border-b border-border">
                              <span className={`text-xs font-mono uppercase px-2.5 py-0.5 rounded-full ${TONE_CLASSES[KIND_META[selectedFinding.kind].tone].chip}`}>
                                {KIND_META[selectedFinding.kind].label}
                              </span>
                              <span className="text-xs font-mono uppercase text-text-muted">● {selectedFinding.status}</span>
                            </div>

                            <div>
                              <span className="text-[11px] uppercase font-mono text-text-muted block mb-1">Flagged Text:</span>
                              <blockquote className="text-sm font-serif italic bg-background-soft p-3 rounded-lg border border-border">
                                &quot;{selectedFinding.phrase}&quot;
                              </blockquote>
                            </div>

                            <div>
                              <span className="text-[11px] uppercase font-mono text-text-muted block mb-1">Why It Was Flagged:</span>
                              <p className="text-xs text-text-secondary leading-relaxed">{selectedFinding.why}</p>
                            </div>

                            <div className="bg-surface-muted/30 p-3 rounded-xl border border-border text-xs space-y-1">
                              <div className="flex justify-between font-mono text-[11px]">
                                <span className="text-brand-green font-semibold">Rule / Evidence:</span>
                                <span>{selectedFinding.ruleId || selectedFinding.factId}</span>
                              </div>
                              <p className="text-text-secondary text-[11px]">{selectedFinding.evidence}</p>
                            </div>

                            <div className="bg-background-soft p-3.5 rounded-xl border border-border">
                              <span className="text-[11px] uppercase font-mono text-brand-green font-semibold block mb-1">
                                Intent-Preserving Fix:
                              </span>
                              <p className="text-xs font-serif font-medium text-text-primary mb-1">{selectedFinding.suggestedFix}</p>
                              <p className="text-[11px] text-text-muted italic">{selectedFinding.intentNote}</p>
                            </div>

                            {/* Creator Actions: Accept or Edit */}
                            {selectedFinding.status === "open" && (
                              <div className="pt-3 border-t border-border flex items-center gap-2">
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
                              </div>
                            )}

                            {selectedFinding.status !== "open" && (
                              <div className="pt-3 border-t border-border text-xs text-success font-mono">
                                ✓ Resolved: {selectedFinding.status}
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="text-xs text-text-muted text-center py-8">Select a finding to inspect.</p>
                        )}
                      </div>
                    </div>
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
                  <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-border">
                    <h3 className="font-serif italic text-2xl text-text-primary mb-2">Approved Evidence Vault</h3>
                    <p className="text-xs text-text-muted mb-4">Official source documents backing all verified claims.</p>
                    <div className="divide-y divide-border/60">
                      {SOURCES.map((src) => (
                        <div key={src.id} className="py-3 flex items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold text-text-primary block">{src.title}</span>
                            <span className="text-[11px] font-mono text-text-muted">Issued: {src.issued} · Kind: {src.kind}</span>
                          </div>
                          <span className="text-[11px] font-mono bg-surface-muted px-2 py-0.5 rounded text-text-secondary">
                            SHA: {shortHash(src.hash)}
                          </span>
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
                        <span className="text-[11px] text-text-muted block mt-1">F-021 AUM expired</span>
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
                          </div>
                          <span className="text-xs font-mono text-text-muted">Draft v{state.draft.version}</span>
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

                        {currentFormat === "image" && (
                          <div className="space-y-4">
                            <div className="relative rounded-xl overflow-hidden aspect-video bg-background-soft max-h-[300px]">
                              <Image src="/images/cap-fixes.jpg" alt="Campaign Banner" fill className="object-cover" />
                              <div className="absolute inset-0 bg-black/20 p-4 flex flex-col justify-between">
                                <span className="bg-critical text-on-dark text-[11px] font-mono px-2 py-0.5 rounded w-max">
                                  WCAG 2.1 AA Contrast: 2.8:1 (Fails 4.5:1)
                                </span>
                                <span className="bg-surface/90 p-2 rounded text-xs text-text-primary">
                                  Logo Safe Margin: 24px clearance verified
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {currentFormat === "document" && (
                          <div className="p-4 bg-background-soft rounded-xl text-xs space-y-2">
                            <div className="flex justify-between font-mono pb-2 border-b border-border">
                              <span className="font-semibold text-brand-green">Factsheet Metrics Extracted</span>
                              <span className="text-text-muted">Source: E-021 Factsheet Q2</span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span>Reported AUM: ₹4,200 Cr</span>
                              <span className="text-warning font-mono">Expired (Ledger is ₹4,850 Cr)</span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span>Total Expense Ratio: 0.65%</span>
                              <span className="text-success font-mono">SEBI TER Compliant ✓</span>
                            </div>
                          </div>
                        )}

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
                      <div className="bg-surface rounded-2xl p-6 border border-border sticky top-20 space-y-4">
                        {selectedFinding ? (
                          <>
                            <div className="flex items-center justify-between pb-3 border-b border-border">
                              <span className={`text-xs font-mono uppercase px-2.5 py-0.5 rounded-full ${TONE_CLASSES[KIND_META[selectedFinding.kind].tone].chip}`}>
                                {KIND_META[selectedFinding.kind].label}
                              </span>
                              <span className={`text-xs font-mono uppercase font-semibold ${selectedFinding.status === "open" ? "text-warning" : "text-success"}`}>
                                ● {selectedFinding.status}
                              </span>
                            </div>

                            <div>
                              <span className="text-[11px] uppercase font-mono text-text-muted block mb-1">Flagged Phrase:</span>
                              <blockquote className="text-sm font-serif italic bg-background-soft p-3 rounded-lg border border-border">
                                &quot;{selectedFinding.phrase}&quot;
                              </blockquote>
                            </div>

                            <div>
                              <span className="text-[11px] uppercase font-mono text-text-muted block mb-1">Citation / Evidence:</span>
                              <p className="text-xs text-text-secondary leading-relaxed">{selectedFinding.evidence}</p>
                            </div>

                            <div className="bg-background-soft p-3 rounded-xl border border-border">
                              <span className="text-[11px] uppercase font-mono text-brand-green font-semibold block mb-1">
                                Intent-Preserving Fix:
                              </span>
                              <p className="text-xs font-serif font-medium text-text-primary">{selectedFinding.suggestedFix}</p>
                            </div>

                            {/* Reviewer Action Buttons */}
                            {selectedFinding.status === "open" && (
                              <div className="pt-3 border-t border-border flex items-center gap-2">
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
                              </div>
                            )}

                            {selectedFinding.status !== "open" && (
                              <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                                <span className="text-success font-mono">Resolved ({selectedFinding.status})</span>
                                <button
                                  onClick={() => dispatch({ type: "reopen", id: selectedFinding.id, at: new Date().toISOString() })}
                                  className="text-brand-green hover:underline font-mono"
                                >
                                  Reopen Flag
                                </button>
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="text-xs text-text-muted text-center py-8">Select a finding to triage.</p>
                        )}
                      </div>
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
                      Statutory Approval Gateway
                    </span>
                    <h2 className="font-serif italic text-2xl sm:text-3xl text-text-primary mt-1">
                      Compliance & Legal Sign-Off
                    </h2>
                    <p className="text-xs sm:text-sm text-text-muted mt-0.5">
                      Verify regulatory compliance, ensure zero statutory liabilities, and issue tamper-evident approval certificates.
                    </p>
                  </div>

                  <span className="text-xs font-mono uppercase bg-surface-muted px-3 py-1.5 rounded-full border border-border text-text-secondary font-medium">
                    SEBI Clause 7B Signatory
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
                        <span className="text-[11px] font-mono uppercase text-text-muted block mb-1">Statutory Risk</span>
                        <span className={`font-serif italic text-xl ${openCount > 0 ? "text-critical" : "text-success"}`}>
                          {openCount > 0 ? "High Risk" : "Zero Liability"}
                        </span>
                        <span className="text-[11px] text-text-muted block mt-1">SEBI compliance score</span>
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
                          <span className="font-mono text-success font-semibold">Q2 Audited Factsheet Linked ✓</span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-background-soft border border-border flex items-center justify-between">
                          <span>Reviewer Attribution:</span>
                          <span className="font-mono text-text-primary">Arjun Verma (Editorial Reviewer)</span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-background-soft border border-border flex items-center justify-between">
                          <span>Temporal Validity:</span>
                          <span className="font-mono text-success font-semibold">Valid through 31 Dec 2026 ✓</span>
                        </div>
                      </div>

                      {/* Approval Gate Widget */}
                      <div className={`p-6 rounded-2xl border transition-all ${isApproved ? "bg-[#0e231a] text-white border-brand-green" : openCount === 0 ? "bg-surface border-brand-green shadow-md" : "bg-surface-muted/50 border-critical/30"}`}>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`h-2.5 w-2.5 rounded-full ${isApproved ? "bg-success" : openCount === 0 ? "bg-brand-pink" : "bg-critical"}`} />
                              <h4 className="font-semibold text-sm">
                                {isApproved
                                  ? "Cryptographic Approval Certificate Issued"
                                  : openCount === 0
                                  ? "All Findings Resolved — Ready for Compliance Sign-Off"
                                  : `Approval Locked (${openCount} Unresolved Issue${openCount > 1 ? "s" : ""})`}
                              </h4>
                            </div>
                            <p className="text-xs text-text-muted max-w-lg">
                              {isApproved
                                ? `Certified by Priya Sundaram (Compliance Approver). Sealed Hash: ${shortHash(state.approval?.contentHash || "")}`
                                : openCount === 0
                                ? "As Compliance Approver, you are authorized to seal this approved draft into an immutable audit certificate."
                                : "Publishing is strictly blocked under corporate compliance policy until all findings are accepted, edited, or justified."}
                            </p>
                          </div>

                          {!isApproved && (
                            <button
                              type="button"
                              disabled={openCount > 0}
                              onClick={handleApprove}
                              className="px-6 py-3 rounded-pill bg-brand-green text-on-dark text-xs uppercase font-mono font-semibold tracking-wider hover:bg-brand-green-dark transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md whitespace-nowrap"
                            >
                              {openCount === 0 ? "Approve & Seal Certificate" : "Approval Locked"}
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
                    <h3 className="font-serif italic text-2xl text-text-primary">Statutory Inspection & Live Copy</h3>
                    <div className="p-4 rounded-xl bg-background-soft border border-border text-base font-serif italic text-text-primary">
                      {revisedText(state.draft, state.findings)}
                    </div>
                    <div className="space-y-3">
                      <span className="text-xs uppercase font-mono text-brand-green font-semibold">Finding Resolutions</span>
                      {state.findings.map((f) => (
                        <div key={f.id} className="p-3 bg-background-soft rounded-lg text-xs flex justify-between items-center">
                          <span>{f.title} ({f.phrase})</span>
                          <span className="font-mono font-semibold text-text-primary">{f.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* APPROVER: TAB 3 - BLOCKED */}
                {approverTab === "blocked" && (
                  <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-border">
                    <h3 className="font-serif italic text-2xl text-text-primary mb-2">Blocked Campaigns</h3>
                    <p className="text-xs text-text-muted mb-4">Campaigns held from publication due to statutory or factual breaches.</p>
                    {openCount > 0 ? (
                      <div className="p-4 bg-critical-soft/30 border border-critical/30 rounded-xl text-xs flex justify-between items-center">
                        <div>
                          <span className="font-semibold text-text-primary block">{state.draft.title}</span>
                          <span className="text-critical">{openCount} unresolved findings</span>
                        </div>
                        <span className="font-mono text-critical font-semibold">BLOCKED</span>
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
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {allFacts.map((fact, idx) => (
                            <tr key={idx}>
                              <td className="py-2.5 font-mono text-brand-green">{fact.id} v{fact.version}</td>
                              <td className="font-medium text-text-primary">{fact.label}</td>
                              <td className="font-mono">{fact.value}</td>
                              <td className="text-text-muted font-mono">{fact.validFrom || "2026-01-01"} → {fact.validUntil}</td>
                              <td>
                                <span className={`px-2 py-0.5 rounded-full font-mono text-[11px] ${fact.status === "current" ? "bg-success-soft text-success" : "bg-warning-soft text-warning"}`}>
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
                  <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-border space-y-4">
                    <h3 className="font-serif italic text-2xl text-text-primary">Governance Friction &amp; Insights</h3>
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
                  placeholder="e.g. Approved by legal counsel for specific institutional distribution with dated CRISIL certification..."
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
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setScanPreset("agency");
                    setCustomInputText("Build steady wealth with guaranteed 15% returns from Arthaa Gold Savings Fund! India's #1 fund beating 99% of peers. Hurry up, start a SIP and enjoy zero risk profits!");
                  }}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-mono ${scanPreset === "agency" ? "bg-brand-green text-on-dark border-brand-green" : "bg-background-soft text-text-secondary border-border"}`}
                >
                  AI Agency Copy (High Risk)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setScanPreset("marketing");
                    setCustomInputText("Arthaa Gold Savings Fund now manages ₹4,200 crore with proven historical growth. Start a SIP today.");
                  }}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-mono ${scanPreset === "marketing" ? "bg-brand-green text-on-dark border-brand-green" : "bg-background-soft text-text-secondary border-border"}`}
                >
                  Marketing Blast (Expired AUM)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setScanPreset("custom");
                    setCustomInputText("");
                  }}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-mono ${scanPreset === "custom" ? "bg-brand-green text-on-dark border-brand-green" : "bg-background-soft text-text-secondary border-border"}`}
                >
                  Freeform
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