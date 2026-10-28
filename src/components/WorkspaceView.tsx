"use client";

import React, { useState, useRef, useMemo } from "react";
import {
  INITIAL_CAMPAIGN_DRAFTS,
  BRAND_RULES,
  FACT_LEDGER,
  INITIAL_AUDIT_LOGS,
  CampaignDraft,
  FindingRecord,
  BrandRule,
  FactLedgerEntry,
  AuditEvent,
} from "@/data/mockData";
import { analyzeCustomDraftText } from "@/utils/analyzer";
import {
  GlassPanel,
  FindingCard,
  ApprovalBar,
  EvidenceCard,
} from "@/components/ui/GovernancePrimitives";
import {
  ShieldCheck,
  Search,
  Lock,
  Unlock,
  CheckCircle2,
  Info,
  FileText,
  Image as ImageIcon,
  FileCode,
  Sparkles,
  RotateCcw,
  Plus,
  X,
  ChevronRight,
  Database,
  BarChart3,
  Clock,
  ArrowLeftRight,
  Award,
  BookOpen,
} from "lucide-react";

interface WorkspaceViewProps {
  onBackToLanding: () => void;
  onOpenDocs: () => void;
}

type SidebarTab = "review" | "brand_brain" | "drafts" | "insights" | "audit_log";
type ContentFormatTab = "text" | "image" | "document";

export default function WorkspaceView({
  onBackToLanding,
  onOpenDocs,
}: WorkspaceViewProps) {
  const [drafts, setDrafts] = useState<CampaignDraft[]>(INITIAL_CAMPAIGN_DRAFTS);
  const [selectedDraftId, setSelectedDraftId] = useState<string>("draft-gsf-v2");
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>("review");
  const [contentFormatTab, setContentFormatTab] =
    useState<ContentFormatTab>("text");

  const [selectedFindingId, setSelectedFindingId] = useState<string>("F-0412");

  // Live Custom Copy Sandbox Modal
  const [isCustomInputModalOpen, setIsCustomInputModalOpen] =
    useState<boolean>(false);
  const [newDraftTitle, setNewDraftTitle] = useState<string>(
    "Q4 Festive Gold SIP Ad Copy"
  );
  const [newDraftText, setNewDraftText] = useState<string>(
    "Grow your wealth with guaranteed 12% returns from the Arthaa Gold Savings Fund, India's #1 fund managing Rs 4,200 crore. Start a SIP today with zero risk."
  );

  const [rules] = useState<BrandRule[]>(BRAND_RULES);
  const [facts] = useState<FactLedgerEntry[]>(FACT_LEDGER);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>(INITIAL_AUDIT_LOGS);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [approvedDraftIds, setApprovedDraftIds] = useState<
    Record<string, string>
  >({});
  const [showApprovalCertificate, setShowApprovalCertificate] =
    useState<boolean>(false);
  const [changesRequestedBanner, setChangesRequestedBanner] = useState<
    string | null
  >(null);

  const findingCardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const currentDraft = useMemo(
    () => drafts.find((d) => d.id === selectedDraftId) || drafts[0],
    [drafts, selectedDraftId]
  );

  const selectedFinding = useMemo(
    () =>
      currentDraft.findings.find((f) => f.id === selectedFindingId) ||
      currentDraft.findings[0] ||
      null,
    [currentDraft, selectedFindingId]
  );

  const totalFindings = currentDraft.findings.length;
  const resolvedFindingsCount = currentDraft.findings.filter(
    (f) => f.status !== "pending"
  ).length;
  const allResolved =
    totalFindings > 0 && resolvedFindingsCount === totalFindings;
  const isCurrentDraftApproved = Boolean(approvedDraftIds[currentDraft.id]);

  const handleSelectHighlight = (findingId: string) => {
    setSelectedFindingId(findingId);
    const el = findingCardRefs.current[findingId];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  // Accept Finding
  const handleAcceptFinding = (finding: FindingRecord) => {
    const now = new Date().toTimeString().split(" ")[0];
    setDrafts((prev) =>
      prev.map((d) => {
        if (d.id !== currentDraft.id) return d;
        return {
          ...d,
          findings: d.findings.map((f) =>
            f.id === finding.id
              ? {
                  ...f,
                  status: "accepted",
                  decidedBy: d.reviewerName,
                  decidedAt: `2026-10-27 ${now}`,
                }
              : f
          ),
        };
      })
    );

    setAuditLogs((prev) => [
      {
        id: `AUD-${Math.floor(905 + Math.random() * 900)}`,
        timestamp: `2026-10-27 ${now}`,
        actor: currentDraft.reviewerName,
        role: "Authorized Reviewer",
        action: "ACCEPT_FIX",
        findingId: finding.id,
        ruleOrFactRef: `${finding.ruleOrFactId} (${finding.ruleVersion})`,
        summary: `Accepted intent-preserving fix for "${finding.targetPhrase}" → "${finding.replacementPhrase}".`,
        versionTag: currentDraft.version,
      },
      ...prev,
    ]);
  };

  // Edit Finding
  const handleEditFinding = (finding: FindingRecord, customText: string) => {
    if (!customText.trim()) return;
    const now = new Date().toTimeString().split(" ")[0];
    setDrafts((prev) =>
      prev.map((d) => {
        if (d.id !== currentDraft.id) return d;
        return {
          ...d,
          findings: d.findings.map((f) =>
            f.id === finding.id
              ? {
                  ...f,
                  status: "edited",
                  customEdit: customText.trim(),
                  decidedBy: d.reviewerName,
                  decidedAt: `2026-10-27 ${now}`,
                }
              : f
          ),
        };
      })
    );

    setAuditLogs((prev) => [
      {
        id: `AUD-${Math.floor(905 + Math.random() * 900)}`,
        timestamp: `2026-10-27 ${now}`,
        actor: currentDraft.reviewerName,
        role: "Authorized Reviewer",
        action: "EDIT_FIX",
        findingId: finding.id,
        ruleOrFactRef: `${finding.ruleOrFactId} (${finding.ruleVersion})`,
        summary: `Applied custom reviewer rewrite for "${finding.targetPhrase}" → "${customText.trim()}".`,
        versionTag: currentDraft.version,
      },
      ...prev,
    ]);
  };

  // Dismiss Finding
  const handleDismissFinding = (finding: FindingRecord, reasonText: string) => {
    const reason =
      reasonText.trim() || "Approved contextual exception by reviewer.";
    const now = new Date().toTimeString().split(" ")[0];
    setDrafts((prev) =>
      prev.map((d) => {
        if (d.id !== currentDraft.id) return d;
        return {
          ...d,
          findings: d.findings.map((f) =>
            f.id === finding.id
              ? {
                  ...f,
                  status: "dismissed",
                  dismissReason: reason,
                  decidedBy: d.reviewerName,
                  decidedAt: `2026-10-27 ${now}`,
                }
              : f
          ),
        };
      })
    );

    setAuditLogs((prev) => [
      {
        id: `AUD-${Math.floor(905 + Math.random() * 900)}`,
        timestamp: `2026-10-27 ${now}`,
        actor: currentDraft.reviewerName,
        role: "Authorized Reviewer",
        action: "DISMISS_FINDING",
        findingId: finding.id,
        ruleOrFactRef: `${finding.ruleOrFactId} (${finding.ruleVersion})`,
        summary: `Dismissed finding on "${finding.targetPhrase}". Reason: "${reason}" (Fed into Learning Loop).`,
        versionTag: currentDraft.version,
      },
      ...prev,
    ]);
  };

  // Undo Finding
  const handleUndoFinding = (finding: FindingRecord) => {
    setDrafts((prev) =>
      prev.map((d) => {
        if (d.id !== currentDraft.id) return d;
        return {
          ...d,
          findings: d.findings.map((f) =>
            f.id === finding.id ? { ...f, status: "pending" } : f
          ),
        };
      })
    );
    setApprovedDraftIds((prev) => {
      const copy = { ...prev };
      delete copy[currentDraft.id];
      return copy;
    });
  };

  const handleResetDemo = () => {
    setDrafts(INITIAL_CAMPAIGN_DRAFTS);
    setApprovedDraftIds({});
    setSelectedFindingId("F-0412");
    setChangesRequestedBanner(null);
    setShowApprovalCertificate(false);
  };

  const handleApproveDraft = () => {
    if (!allResolved) return;
    const now = new Date().toTimeString().split(" ")[0];
    const approvalHash = `VB-SIG-${Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()}-V3`;
    setApprovedDraftIds((prev) => ({
      ...prev,
      [currentDraft.id]: approvalHash,
    }));
    setShowApprovalCertificate(true);

    setAuditLogs((prev) => [
      {
        id: `AUD-${Math.floor(905 + Math.random() * 900)}`,
        timestamp: `2026-10-27 ${now}`,
        actor: currentDraft.reviewerName,
        role: "Compliance & Brand Approver",
        action: "APPROVE_ASSET",
        ruleOrFactRef: `${totalFindings}/${totalFindings} Findings Cleared`,
        summary: `Signed off "${currentDraft.title}" (${currentDraft.version} → v3 Locked). Certificate: ${approvalHash}.`,
        versionTag: "v3-locked",
      },
      ...prev,
    ]);
  };

  const handleRequestChanges = () => {
    const now = new Date().toTimeString().split(" ")[0];
    setChangesRequestedBanner(
      `Changes requested by ${currentDraft.reviewerName} at ${now}. Creator notified with ${
        totalFindings - resolvedFindingsCount
      } unresolved citations.`
    );
    setAuditLogs((prev) => [
      {
        id: `AUD-${Math.floor(905 + Math.random() * 900)}`,
        timestamp: `2026-10-27 ${now}`,
        actor: currentDraft.reviewerName,
        role: "Authorized Reviewer",
        action: "REQUEST_CHANGES",
        ruleOrFactRef: `${totalFindings - resolvedFindingsCount} Pending Issues`,
        summary: `Returned "${currentDraft.title}" to creator with cited rule & fact findings.`,
        versionTag: currentDraft.version,
      },
      ...prev,
    ]);
  };

  const handleRunCustomDraftScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDraftText.trim()) return;
    const detectedFindings = analyzeCustomDraftText(newDraftText.trim());
    const newId = `draft-custom-${Date.now()}`;
    const newDraft: CampaignDraft = {
      id: newId,
      brand: "Arthaa Finserv",
      campaign: "Q4 Campaign",
      title: newDraftTitle.trim() || "Custom Campaign Copy",
      version: "v1",
      channel: "Live Sandbox Submission",
      author: "Judge / Live Evaluator",
      submittedAt: "Just now",
      reviewerName: "Arjun M.",
      reviewerInitials: "AM",
      originalText: newDraftText.trim(),
      findings: detectedFindings,
    };

    setDrafts((prev) => [newDraft, ...prev]);
    setSelectedDraftId(newId);
    if (detectedFindings[0]) {
      setSelectedFindingId(detectedFindings[0].id);
    }
    setActiveSidebarTab("review");
    setIsCustomInputModalOpen(false);
  };

  // Interactive Draft Renderer with Restrained Highlight Palette
  const renderInteractiveDraftText = () => {
    const text = currentDraft.originalText;
    const findings = currentDraft.findings;

    const positioned = findings
      .map((f) => {
        const idx = text.indexOf(f.targetPhrase);
        return {
          finding: f,
          start: idx,
          end: idx !== -1 ? idx + f.targetPhrase.length : -1,
        };
      })
      .filter((item) => item.start !== -1)
      .sort((a, b) => a.start - b.start);

    if (positioned.length === 0) {
      return <p className="font-serif text-2xl leading-relaxed text-cannoli">{text}</p>;
    }

    const elements: React.ReactNode[] = [];
    let cursor = 0;

    positioned.forEach(({ finding, start, end }) => {
      if (start < cursor) return;
      if (start > cursor) {
        elements.push(
          <span key={`plain-${cursor}`}>{text.slice(cursor, start)}</span>
        );
      }

      const isSelected = selectedFinding?.id === finding.id;

      let highlightStyle = "";
      let badgeColor = "";
      let displayContent = finding.targetPhrase;

      if (finding.status === "accepted") {
        displayContent = finding.replacementPhrase;
        highlightStyle =
          "bg-forest-vivid/15 text-forest-vivid border-b border-forest-vivid px-1.5 py-0.5 rounded-sm";
        badgeColor = "bg-forest-vivid text-obsidian";
      } else if (finding.status === "edited") {
        displayContent = finding.customEdit || finding.replacementPhrase;
        highlightStyle =
          "bg-forest-vivid/15 text-forest-vivid border-b border-forest-vivid px-1.5 py-0.5 rounded-sm";
        badgeColor = "bg-forest-vivid text-obsidian";
      } else if (finding.status === "dismissed") {
        displayContent = finding.targetPhrase;
        highlightStyle =
          "bg-white/[0.04] text-cannoli-muted border-b border-dashed border-cannoli/35 px-1.5 py-0.5 rounded-sm";
        badgeColor = "bg-cannoli-dim text-obsidian";
      } else {
        if (finding.category === "Confirmed violation") {
          highlightStyle =
            "bg-[#FFFFFF] text-[#2A2A2A] border-b-2 border-[#3395FF] px-1.5 py-0.5 rounded-sm font-medium hover:bg-[#B4CDFD]";
          badgeColor = "bg-[#3395FF] text-[#FFFFFF]";
        } else if (finding.category === "Expired fact") {
          highlightStyle =
            "bg-[#B4CDFD] text-[#2A2A2A] border-b-2 border-[#528FF0] px-1.5 py-0.5 rounded-sm font-medium hover:bg-[#FFFFFF]";
          badgeColor = "bg-[#528FF0] text-[#FFFFFF]";
        } else if (finding.category === "Needs verification") {
          highlightStyle =
            "bg-[#3395FF]/25 text-[#FFFFFF] border-b border-[#3395FF] px-1.5 py-0.5 rounded-sm hover:bg-[#3395FF]/35";
          badgeColor = "bg-[#3395FF] text-[#FFFFFF]";
        } else {
          highlightStyle =
            "bg-[#528FF0]/25 text-[#FFFFFF] border-b border-[#B4CDFD] px-1.5 py-0.5 rounded-sm hover:bg-[#528FF0]/35";
          badgeColor = "bg-[#B4CDFD] text-[#2A2A2A]";
        }
      }

      elements.push(
        <span
          key={finding.id}
          onClick={() => handleSelectHighlight(finding.id)}
          className={`relative inline-flex items-center gap-1.5 cursor-pointer transition-all mx-0.5 ${highlightStyle} ${
            isSelected ? "ring-1 ring-forest-vivid ring-offset-2 ring-offset-obsidian" : ""
          }`}
          title={`Inspect Finding #${finding.number}: ${finding.category} (${finding.ruleOrFactId})`}
        >
          <span>{displayContent}</span>
          <sup
            className={`inline-flex h-4 w-4 items-center justify-center rounded-sm font-mono text-[9px] font-bold ${badgeColor}`}
          >
            {finding.status === "accepted" || finding.status === "edited"
              ? "✓"
              : finding.number}
          </sup>
        </span>
      );

      cursor = end;
    });

    if (cursor < text.length) {
      elements.push(<span key="plain-end">{text.slice(cursor)}</span>);
    }

    return (
      <div className="font-serif text-2xl sm:text-[32px] leading-[1.65] text-cannoli tracking-tight">
        {elements}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-obsidian text-cannoli flex flex-col">
      {/* TOP WORKSPACE HEADER BAR */}
      <header className="sticky top-0 z-30 border-b border-cannoli/[0.15] bg-[#192839]/95 backdrop-blur-xl px-4 sm:px-6 py-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Left: Brand Wordmark + Breadcrumb Selector */}
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToLanding}
              className="group flex items-center gap-2.5 pr-4 border-r border-cannoli/[0.15] hover:opacity-90 transition-opacity"
              title="Return to Landing Experience"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded bg-[#3395FF] text-[#FFFFFF]">
                <ShieldCheck className="h-3.5 w-3.5" />
              </span>
              <span className="font-serif text-xl tracking-tight text-cannoli">
                VerityBrand
              </span>
            </button>

            <div className="hidden xl:flex items-center gap-2 font-mono text-xs text-cannoli-muted">
              <span className="text-cannoli">{currentDraft.brand}</span>
              <ChevronRight className="h-3.5 w-3.5 text-cannoli-dim" />
              <span>{currentDraft.campaign}</span>
              <ChevronRight className="h-3.5 w-3.5 text-cannoli-dim" />
              <select
                value={selectedDraftId}
                onChange={(e) => {
                  const nextId = e.target.value;
                  setSelectedDraftId(nextId);
                  const found = drafts.find((d) => d.id === nextId);
                  if (found && found.findings[0]) {
                    setSelectedFindingId(found.findings[0].id);
                  }
                }}
                aria-label="Select Campaign Draft"
                className="rounded border border-cannoli/[0.2] bg-[#192839] px-2.5 py-1 font-mono text-xs text-cannoli focus:outline-none focus:border-forest-vivid cursor-pointer"
              >
                {drafts.map((d) => (
                  <option
                    key={d.id}
                    value={d.id}
                    className="bg-obsidian text-cannoli"
                  >
                    {d.title} ({d.version})
                  </option>
                ))}
              </select>
              <ChevronRight className="h-3.5 w-3.5 text-cannoli-dim" />
              <span className="rounded bg-[#B4CDFD] px-1.5 py-0.5 text-[11px] font-semibold text-[#2A2A2A]">
                {isCurrentDraftApproved ? "v3-locked" : currentDraft.version}
              </span>
            </div>

            {/* Status Indicator */}
            {isCurrentDraftApproved ? (
              <span className="inline-flex items-center gap-1.5 rounded border border-forest-vivid/40 bg-forest-vivid/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-[#FFFFFF]">
                <CheckCircle2 className="h-3 w-3 text-[#3395FF]" />
                Approved &amp; Locked
              </span>
            ) : allResolved ? (
              <span className="inline-flex items-center gap-1.5 rounded border border-forest-vivid/35 bg-forest-vivid/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-[#FFFFFF]">
                <Unlock className="h-3 w-3 text-[#3395FF]" />
                Ready for Sign-Off
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded bg-[#B4CDFD] px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#2A2A2A]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#3395FF] animate-pulse" />
                Under Review
              </span>
            )}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2.5">
            <div className="relative hidden md:block">
              <Search className="h-3.5 w-3.5 text-cannoli-dim absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter rules, facts, drafts..."
                className="w-52 rounded border border-cannoli/[0.2] bg-[#192839] pl-8 pr-7 py-1.5 font-mono text-xs text-cannoli placeholder:text-cannoli-dim focus:outline-none focus:border-forest-vivid"
              />
            </div>

            <button
              onClick={() => setIsCustomInputModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded bg-[#3395FF] hover:bg-[#528FF0] px-3 py-1.5 font-mono text-xs text-[#FFFFFF] transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Scan</span>
            </button>

            <button
              onClick={handleResetDemo}
              className="inline-flex items-center gap-1.5 rounded border border-cannoli/[0.1] bg-white/[0.02] hover:border-cannoli/30 px-2.5 py-1.5 font-mono text-xs text-cannoli-muted hover:text-cannoli transition-all"
              title="Reset findings"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            <button
              onClick={onOpenDocs}
              className="inline-flex items-center gap-1.5 rounded border border-cannoli/[0.1] bg-white/[0.02] hover:border-cannoli/30 px-2.5 py-1.5 font-mono text-xs text-cannoli-muted hover:text-cannoli transition-all"
            >
              <BookOpen className="h-3.5 w-3.5 text-forest-vivid" />
              <span className="hidden lg:inline">Spec</span>
            </button>

            <div className="flex items-center gap-2 pl-2 border-l border-cannoli/[0.08]">
              <div className="flex h-7 w-7 items-center justify-center rounded border border-forest-vivid/40 bg-forest-dark font-mono text-[11px] text-forest-vivid">
                {currentDraft.reviewerInitials}
              </div>
              <div className="hidden sm:block text-left">
                <div className="font-mono text-xs text-cannoli leading-none">
                  {currentDraft.reviewerName}
                </div>
                <div className="font-mono text-[10px] text-cannoli-dim">
                  Reviewer
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* WORKSPACE BODY */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR: Brand | Drafts | Review | Insights | Audit Log */}
        <aside className="w-60 shrink-0 border-r border-cannoli/[0.15] bg-[#192839] flex flex-col justify-between p-4 hidden md:flex">
          <div className="space-y-6">
            <div className="space-y-1">
              <div className="px-3 pb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-cannoli-dim">
                SYSTEM VIEWS
              </div>

              {(
                [
                  {
                    id: "brand_brain",
                    label: "Brand",
                    icon: Database,
                    badge: rules.length + facts.length,
                  },
                  {
                    id: "drafts",
                    label: "Drafts",
                    icon: FileText,
                    badge: drafts.length,
                  },
                  {
                    id: "review",
                    label: "Review",
                    icon: CheckCircle2,
                    badge: totalFindings - resolvedFindingsCount,
                    highlight: true,
                  },
                  {
                    id: "insights",
                    label: "Insights",
                    icon: BarChart3,
                  },
                  {
                    id: "audit_log",
                    label: "Audit Log",
                    icon: Clock,
                    badge: auditLogs.length,
                  },
                ] as const
              ).map((item) => {
                const Icon = item.icon;
                const active = activeSidebarTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSidebarTab(item.id)}
                    className={`w-full flex items-center justify-between rounded px-3 py-2.5 font-mono text-xs transition-all ${
                      active
                        ? "border border-forest-vivid/40 bg-forest-vivid/15 text-[#FFFFFF]"
                        : "border border-transparent text-cannoli-muted hover:bg-white/[0.04] hover:text-cannoli"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className="h-3.5 w-3.5" />
                      <span>{item.label}</span>
                    </span>
                    {"badge" in item && item.badge !== undefined && (
                      <span
                        className={`rounded-sm px-1.5 py-0.5 text-[10px] font-semibold ${
                          "highlight" in item &&
                          item.highlight &&
                          item.badge > 0
                            ? "bg-[#3395FF] text-[#FFFFFF]"
                            : "bg-[#B4CDFD]/20 text-cannoli-muted"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active Queue Switcher */}
            <div className="pt-4 border-t border-cannoli/[0.12]">
              <div className="px-3 pb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-cannoli-dim">
                ACTIVE DRAFTS
              </div>
              <div className="space-y-1.5">
                {drafts.map((d) => {
                  const pendingCount = d.findings.filter(
                    (f) => f.status === "pending"
                  ).length;
                  const isSelected = d.id === currentDraft.id;
                  return (
                    <button
                      key={d.id}
                      onClick={() => {
                        setSelectedDraftId(d.id);
                        if (d.findings[0]) setSelectedFindingId(d.findings[0].id);
                        setActiveSidebarTab("review");
                      }}
                      className={`w-full text-left rounded p-2.5 border transition-all ${
                        isSelected
                          ? "bg-[#3395FF]/15 border-[#3395FF]/40"
                          : "border-transparent hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="text-xs text-cannoli truncate">
                        {d.title}
                      </div>
                      <div className="mt-1 flex items-center justify-between font-mono text-[10px] text-cannoli-dim">
                        <span>{d.version}</span>
                        {pendingCount === 0 ? (
                          <span className="text-forest-vivid">✓ CLEARED</span>
                        ) : (
                          <span className="text-[#B4CDFD]">
                            {pendingCount} ISSUES
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Brand Brain Telemetry Summary */}
          <GlassPanel hoverLift={false} className="p-3.5 space-y-2.5">
            <div className="font-mono text-[10px] uppercase tracking-widest text-cannoli-dim">
              ACTIVE BRAND BRAIN
            </div>
            <div className="flex items-center justify-between">
              <span className="font-serif text-lg text-cannoli">
                Arthaa Finserv
              </span>
              <span className="font-mono text-[10px] text-forest-vivid">
                ONLINE
              </span>
            </div>
            <div className="space-y-1 pt-2 border-t border-cannoli/[0.12] font-mono text-[11px]">
              <div className="flex justify-between text-cannoli-muted">
                <span>Versioned Rules</span>
                <span className="text-cannoli">28</span>
              </div>
              <div className="flex justify-between text-cannoli-muted">
                <span>Fact Ledger</span>
                <span className="text-cannoli">52</span>
              </div>
              <div className="flex justify-between text-cannoli-muted">
                <span>Lapsed Facts</span>
                <span className="text-[#3395FF]">1 (F-021)</span>
              </div>
            </div>
          </GlassPanel>
        </aside>

        {/* MAIN SPLIT CONTENT AREA */}
        <main className="flex-1 flex flex-col overflow-y-auto bg-[#192839]">
          {/* Mobile Navigation Bar */}
          <div className="flex md:hidden items-center gap-2 overflow-x-auto border-b border-cannoli/[0.15] bg-[#192839] px-4 py-2">
            {(
              [
                ["review", "Review"],
                ["brand_brain", "Brand"],
                ["drafts", "Drafts"],
                ["insights", "Insights"],
                ["audit_log", "Audit Log"],
              ] as [SidebarTab, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveSidebarTab(key)}
                className={`rounded px-3 py-1 font-mono text-xs whitespace-nowrap ${
                  activeSidebarTab === key
                    ? "bg-forest-vivid text-[#FFFFFF] font-semibold"
                    : "bg-white/[0.06] text-cannoli-muted"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {changesRequestedBanner && (
            <div className="bg-[#B4CDFD] border-b border-[#528FF0] px-6 py-2.5 flex items-center justify-between font-mono text-xs text-[#2A2A2A] font-medium">
              <span>{changesRequestedBanner}</span>
              <button
                onClick={() => setChangesRequestedBanner(null)}
                className="hover:underline"
              >
                [Dismiss]
              </button>
            </div>
          )}

          {/* VIEW 1: SPLIT-SCREEN REVIEW WORKSPACE */}
          {activeSidebarTab === "review" && (
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-cannoli/[0.08]">
              {/* Left Pane: Draft + Suggested Fixes + Evidence */}
              <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6 overflow-y-auto">
                <div className="space-y-6">
                  {/* Draft Header */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-cannoli/[0.08] pb-4">
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-forest-vivid">
                        MONITORED ASSET // {currentDraft.channel}
                      </div>
                      <h2 className="font-serif text-3xl text-cannoli mt-0.5">
                        {currentDraft.title}
                      </h2>
                    </div>

                    <div className="inline-flex rounded border border-cannoli/[0.15] bg-[#192839] p-1 font-mono text-xs">
                      {(
                        [
                          ["text", "Text", FileText],
                          ["image", "Visual Check", ImageIcon],
                          ["document", "JSON Record", FileCode],
                        ] as const
                      ).map(([id, label, Icon]) => (
                        <button
                          key={id}
                          onClick={() => setContentFormatTab(id)}
                          className={`flex items-center gap-1.5 rounded-sm px-3 py-1 transition-all ${
                            contentFormatTab === id
                              ? "bg-[#3395FF] text-[#FFFFFF] font-semibold"
                              : "text-cannoli-muted hover:text-cannoli"
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          <span>{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Draft Canvas */}
                  {contentFormatTab === "text" && (
                    <GlassPanel
                      hoverLift={false}
                      className="p-7 sm:p-9 border-cannoli/[0.15]"
                    >
                      {renderInteractiveDraftText()}

                      {currentDraft.findings.some(
                        (f) =>
                          (f.ruleOrFactId.includes("R-07") ||
                            f.ruleOrFactId.includes("R-02")) &&
                          (f.status === "accepted" || f.status === "edited")
                      ) && (
                        <div className="mt-6 pt-4 border-t border-forest-vivid/35 font-mono text-xs text-forest-vivid flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                          <span>
                            *Mandatory SEBI Risk Disclaimer Auto-Attached (Rule
                            R-07 v3.0): Mutual Fund investments are subject to
                            market risks, read all scheme related documents
                            carefully.
                          </span>
                        </div>
                      )}
                    </GlassPanel>
                  )}

                  {contentFormatTab === "image" && (
                    <GlassPanel hoverLift={false} className="p-6 space-y-4">
                      <div className="flex items-center justify-between font-mono text-xs">
                        <span className="text-forest-vivid">
                          05 / VISUAL &amp; ACCESSIBILITY GOVERNANCE CHECK
                        </span>
                        <span className="text-cannoli-muted">
                          WCAG AAA • CONTRAST 9.4:1
                        </span>
                      </div>
                      <div className="rounded border border-forest-vivid/40 bg-gradient-to-br from-[#3395FF]/20 via-[#192839] to-[#528FF0]/15 p-8 space-y-6">
                        <div className="flex items-center justify-between font-mono text-[11px] text-cannoli-muted">
                          <span>ARTHAA FINSERV • Q4 GOLD SAVINGS FUND</span>
                          <span className="text-forest-vivid">
                            SAFE ZONE VERIFIED ✓
                          </span>
                        </div>
                        {renderInteractiveDraftText()}
                      </div>
                    </GlassPanel>
                  )}

                  {contentFormatTab === "document" && (
                    <GlassPanel
                      hoverLift={false}
                      className="p-6 font-mono text-xs bg-[#192839]"
                    >
                      <div className="text-cannoli-dim border-b border-cannoli/[0.15] pb-2 mb-3">
                        // POSTGRESQL + PGVECTOR EVIDENCE RECORD
                      </div>
                      <pre className="text-forest-vivid overflow-x-auto leading-relaxed">
                        {JSON.stringify(
                          {
                            draft_id: currentDraft.id,
                            version: isCurrentDraftApproved
                              ? "v3-locked"
                              : currentDraft.version,
                            selected_finding: selectedFinding,
                          },
                          null,
                          2
                        )}
                      </pre>
                    </GlassPanel>
                  )}
                </div>

                {/* ORIGINAL VS SUGGESTED DIFF DRAWER */}
                {selectedFinding && (
                  <GlassPanel
                    variant="emerald"
                    hoverLift={false}
                    className="p-5 sm:p-6 space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cannoli/[0.15] pb-3 font-mono text-xs">
                      <div className="flex items-center gap-2 text-forest-vivid">
                        <ArrowLeftRight className="h-3.5 w-3.5" />
                        <span>
                          ORIGINAL VS SUGGESTED • FINDING {selectedFinding.id} (
                          {selectedFinding.ruleOrFactId})
                        </span>
                      </div>
                      <span className="text-cannoli-muted">
                        EVIDENCE [{selectedFinding.evidenceId}] • CONFIDENCE{" "}
                        {selectedFinding.confidence.toFixed(2)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="rounded border border-[#B4CDFD] bg-[#FFFFFF] p-3.5">
                        <div className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#528FF0] mb-1">
                          ORIGINAL CLAIM
                        </div>
                        <div className="font-serif text-xl text-[#2A2A2A]">
                          &ldquo;{selectedFinding.targetPhrase}&rdquo;
                        </div>
                      </div>

                      <div className="rounded border border-[#3395FF] bg-[#3395FF]/15 p-3.5">
                        <div className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#3395FF] mb-1">
                          SUGGESTED INTENT-PRESERVING FIX
                        </div>
                        <div className="font-serif text-xl text-[#FFFFFF]">
                          &ldquo;
                          {selectedFinding.customEdit ||
                            selectedFinding.replacementPhrase}
                          &rdquo;
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1 font-mono text-[11px] text-cannoli-muted">
                      <span>{selectedFinding.intentNote}</span>
                      {selectedFinding.status === "pending" && (
                        <button
                          onClick={() => handleAcceptFinding(selectedFinding)}
                          className="rounded bg-[#3395FF] hover:bg-[#528FF0] px-3 py-1 text-[#FFFFFF] font-semibold"
                        >
                          Accept Fix →
                        </button>
                      )}
                    </div>
                  </GlassPanel>
                )}
              </div>

              {/* Right Pane: FINDINGS LIST */}
              <div className="lg:col-span-5 bg-[#192839]/75 p-6 sm:p-7 space-y-4 overflow-y-auto">
                <div className="flex items-center justify-between border-b border-cannoli/[0.08] pb-4 font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-cannoli uppercase tracking-widest">
                      FINDINGS ({totalFindings})
                    </span>
                    <span className="rounded border border-cannoli/[0.1] px-2 py-0.5 text-[10px] text-cannoli-muted">
                      {resolvedFindingsCount} RESOLVED
                    </span>
                  </div>
                  {resolvedFindingsCount < totalFindings && (
                    <button
                      onClick={() => {
                        currentDraft.findings.forEach((f) => {
                          if (f.status === "pending") handleAcceptFinding(f);
                        });
                      }}
                      className="text-forest-vivid hover:underline"
                    >
                      Accept All ({totalFindings - resolvedFindingsCount})
                    </button>
                  )}
                </div>

                <div className="space-y-3.5">
                  {currentDraft.findings.map((finding) => (
                    <div
                      key={finding.id}
                      ref={(el) => {
                        findingCardRefs.current[finding.id] = el;
                      }}
                    >
                      <FindingCard
                        finding={finding}
                        isSelected={selectedFinding?.id === finding.id}
                        onSelect={() => setSelectedFindingId(finding.id)}
                        onAccept={handleAcceptFinding}
                        onEdit={handleEditFinding}
                        onDismiss={handleDismissFinding}
                        onUndo={handleUndoFinding}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: BRAND BRAIN */}
          {activeSidebarTab === "brand_brain" && (
            <div className="p-6 sm:p-8 space-y-8 max-w-6xl">
              <div className="flex items-end justify-between border-b border-cannoli/[0.08] pb-5">
                <div>
                  <div className="font-mono text-xs text-forest-vivid uppercase tracking-widest">
                    // VERSIONED BRAND BRAIN
                  </div>
                  <h2 className="font-serif text-4xl text-cannoli mt-1">
                    Approved Rules &amp; Expiring Facts Ledger
                  </h2>
                </div>
                <button
                  onClick={() => setActiveSidebarTab("review")}
                  className="rounded bg-forest-vivid px-4 py-2 font-mono text-xs font-semibold text-obsidian"
                >
                  Return to Review →
                </button>
              </div>

              <div className="space-y-4">
                <h3 className="font-mono text-xs uppercase tracking-widest text-cannoli-muted">
                  EXPIRING FACTS LEDGER (TIME-BOUNDED EVIDENCE)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {facts.map((fact) => (
                    <EvidenceCard
                      key={fact.id}
                      id={fact.id}
                      version={fact.owner}
                      title={`${fact.metric} — ${fact.approvedValue}`}
                      source={fact.sourceDoc}
                      statusLabel={
                        fact.isExpired
                          ? "LAPSED 30 JUN 2026"
                          : `VALID UNTIL ${fact.validUntil}`
                      }
                      variant={fact.isExpired ? "amber" : "emerald"}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-mono text-xs uppercase tracking-widest text-cannoli-muted">
                  DETERMINISTIC &amp; TONE GOVERNANCE RULES
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rules.map((rule) => (
                    <EvidenceCard
                      key={rule.id}
                      id={rule.id}
                      version={rule.version}
                      title={`${rule.title}: ${rule.description}`}
                      source={rule.category}
                      statusLabel={rule.status.toUpperCase()}
                      variant="emerald"
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW 3: DRAFTS QUEUE */}
          {activeSidebarTab === "drafts" && (
            <div className="p-6 sm:p-8 space-y-6 max-w-5xl">
              <div className="flex items-center justify-between border-b border-cannoli/[0.08] pb-5">
                <h2 className="font-serif text-4xl text-cannoli">
                  Submitted Campaign Drafts
                </h2>
                <button
                  onClick={() => setIsCustomInputModalOpen(true)}
                  className="rounded bg-forest-vivid px-4 py-2 font-mono text-xs font-semibold text-obsidian"
                >
                  + Submit New Draft
                </button>
              </div>
              <div className="space-y-3">
                {drafts.map((d) => {
                  const resolved = d.findings.filter(
                    (f) => f.status !== "pending"
                  ).length;
                  return (
                    <GlassPanel
                      key={d.id}
                      className="p-5 flex items-center justify-between gap-4"
                      onClick={() => {
                        setSelectedDraftId(d.id);
                        setActiveSidebarTab("review");
                      }}
                    >
                      <div className="space-y-1">
                        <div className="font-mono text-xs text-forest-vivid">
                          {d.version} • {d.channel} • {d.submittedAt}
                        </div>
                        <h3 className="font-serif text-2xl text-cannoli">
                          {d.title}
                        </h3>
                        <p className="text-xs text-cannoli-muted line-clamp-1">
                          {d.originalText}
                        </p>
                      </div>
                      <div className="font-mono text-xs text-right shrink-0">
                        <div className="text-cannoli">
                          {resolved}/{d.findings.length} resolved
                        </div>
                        <div className="text-forest-vivid mt-1">
                          Open Review →
                        </div>
                      </div>
                    </GlassPanel>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 4: INSIGHTS DASHBOARD */}
          {activeSidebarTab === "insights" && (
            <div className="p-6 sm:p-8 space-y-8 max-w-6xl">
              <div className="border-b border-cannoli/[0.08] pb-5">
                <div className="font-mono text-xs text-forest-vivid uppercase tracking-widest">
                  // GOVERNANCE INTELLIGENCE
                </div>
                <h2 className="font-serif text-4xl text-cannoli mt-1">
                  Recurring Violations &amp; Rule Clarity Telemetry
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <GlassPanel className="p-6">
                  <div className="font-mono text-[10px] text-cannoli-dim">
                    DETECTION PRECISION
                  </div>
                  <div className="font-serif text-5xl text-forest-vivid mt-2">
                    96.4%
                  </div>
                  <div className="font-mono text-xs text-cannoli-muted mt-1">
                    Across 412 verified claims
                  </div>
                </GlassPanel>
                <GlassPanel className="p-6">
                  <div className="font-mono text-[10px] text-cannoli-dim">
                    EXPIRED FACTS INTERCEPTED
                  </div>
                  <div className="font-serif text-5xl text-[#528FF0] mt-2">
                    19
                  </div>
                  <div className="font-mono text-xs text-cannoli-muted mt-1">
                    Primary: Fact F-021 (AUM)
                  </div>
                </GlassPanel>
                <GlassPanel className="p-6">
                  <div className="font-mono text-[10px] text-cannoli-dim">
                    RULE CLARITY ALERT
                  </div>
                  <div className="font-serif text-4xl text-[#B4CDFD] mt-2">
                    Tone Rule T-03
                  </div>
                  <div className="font-mono text-xs text-cannoli-muted mt-1">
                    6 dismissals logged → Refinement suggested
                  </div>
                </GlassPanel>
              </div>
            </div>
          )}

          {/* VIEW 5: AUDIT LOG */}
          {activeSidebarTab === "audit_log" && (
            <div className="p-6 sm:p-8 space-y-6 max-w-5xl">
              <div className="border-b border-cannoli/[0.15] pb-5">
                <div className="font-mono text-xs text-forest-vivid uppercase tracking-widest">
                  // IMMUTABLE ACCOUNTABILITY TRAIL
                </div>
                <h2 className="font-serif text-4xl text-cannoli mt-1">
                  Versioned Evidence &amp; Human Decision Log
                </h2>
              </div>
              <div className="space-y-3">
                {auditLogs.map((log) => (
                  <GlassPanel
                    key={log.id}
                    hoverLift={false}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5 font-mono text-xs">
                        <span className="text-forest-vivid">{log.id}</span>
                        <span className="rounded border border-cannoli/20 px-1.5 py-0.5 text-[10px] text-cannoli">
                          {log.action}
                        </span>
                        {log.ruleOrFactRef && (
                          <span className="text-[#528FF0]">
                            {log.ruleOrFactRef}
                          </span>
                        )}
                        <span className="text-cannoli-dim">
                          • {log.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-cannoli-muted">{log.summary}</p>
                    </div>
                    <div className="font-mono text-xs text-right shrink-0">
                      <div className="text-cannoli">{log.actor}</div>
                      <div className="text-[10px] text-cannoli-dim">
                        {log.role}
                      </div>
                    </div>
                  </GlassPanel>
                ))}
              </div>
            </div>
          )}

          {/* STICKY BOTTOM HUMAN AUTHORITY LOCK BAR */}
          <div className="sticky bottom-0 z-20 border-t border-cannoli/[0.15] bg-[#192839]/95 backdrop-blur-xl px-6 py-3">
            <ApprovalBar
              resolvedCount={resolvedFindingsCount}
              totalCount={totalFindings}
              isApproved={isCurrentDraftApproved}
              reviewerName={currentDraft.reviewerName}
              onRequestChanges={handleRequestChanges}
              onApprove={handleApproveDraft}
              onReset={handleResetDemo}
            />
          </div>
        </main>
      </div>

      {/* MODAL 1: CUSTOM DRAFT SCAN SANDBOX */}
      {isCustomInputModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#192839]/85 backdrop-blur-md p-4">
          <GlassPanel
            variant="emerald"
            hoverLift={false}
            className="w-full max-w-2xl p-6 sm:p-8 space-y-5 bg-[#192839]"
          >
            <div className="flex items-center justify-between border-b border-cannoli/[0.15] pb-4">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-forest-vivid">
                  // LIVE SANDBOX SCANNER
                </div>
                <h3 className="font-serif text-3xl text-cannoli">
                  Submit Custom Copy for Governance Verification
                </h3>
              </div>
              <button
                onClick={() => setIsCustomInputModalOpen(false)}
                className="text-cannoli-muted hover:text-cannoli"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRunCustomDraftScan} className="space-y-4">
              <div>
                <label className="block font-mono text-xs text-cannoli-muted mb-1.5">
                  Asset Title
                </label>
                <input
                  type="text"
                  value={newDraftTitle}
                  onChange={(e) => setNewDraftTitle(e.target.value)}
                  className="w-full rounded border border-cannoli/30 bg-[#FFFFFF] px-3.5 py-2 text-sm text-[#2A2A2A] focus:outline-none focus:border-forest-vivid"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-cannoli-muted mb-1.5">
                  Campaign Copy
                </label>
                <textarea
                  rows={4}
                  value={newDraftText}
                  onChange={(e) => setNewDraftText(e.target.value)}
                  className="w-full rounded border border-cannoli/30 bg-[#FFFFFF] p-3.5 text-sm text-[#2A2A2A] leading-relaxed focus:outline-none focus:border-forest-vivid"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCustomInputModalOpen(false)}
                  className="rounded border border-cannoli/25 px-4 py-2 font-mono text-xs text-cannoli-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-[#3395FF] hover:bg-[#528FF0] px-5 py-2 font-mono text-xs font-semibold text-[#FFFFFF]"
                >
                  Run Governance Engine →
                </button>
              </div>
            </form>
          </GlassPanel>
        </div>
      )}

      {/* MODAL 2: SIGN-OFF CERTIFICATE */}
      {showApprovalCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#192839]/85 backdrop-blur-md p-4">
          <GlassPanel
            variant="emerald"
            hoverLift={false}
            className="w-full max-w-xl p-7 space-y-5 bg-[#192839]"
          >
            <div className="flex items-center justify-between border-b border-cannoli/[0.15] pb-4">
              <div className="flex items-center gap-3">
                <Award className="h-6 w-6 text-forest-vivid" />
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-forest-vivid">
                    IMMUTABLE APPROVAL RECORDED
                  </div>
                  <h3 className="font-serif text-2xl text-cannoli">
                    Human Sign-Off Certificate
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setShowApprovalCertificate(false)}
                className="text-cannoli-muted hover:text-cannoli"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded border border-[#B4CDFD] bg-[#FFFFFF] p-4 font-mono text-xs text-[#2A2A2A] space-y-2">
              <div className="flex justify-between">
                <span className="text-[#528FF0] font-semibold">CERTIFICATE HASH</span>
                <span className="text-[#3395FF] font-bold">
                  {approvedDraftIds[currentDraft.id]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#528FF0] font-semibold">AUTHORIZED APPROVER</span>
                <span className="text-[#2A2A2A] font-medium">{currentDraft.reviewerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#528FF0] font-semibold">VERSION LOCK</span>
                <span className="text-[#2A2A2A] font-medium">
                  {currentDraft.version} → v3-locked
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowApprovalCertificate(false);
                  setActiveSidebarTab("audit_log");
                }}
                className="rounded border border-forest-vivid/40 px-4 py-2 font-mono text-xs text-forest-vivid"
              >
                Inspect Audit Trail →
              </button>
              <button
                onClick={() => setShowApprovalCertificate(false)}
                className="rounded bg-[#3395FF] hover:bg-[#528FF0] px-5 py-2 font-mono text-xs font-semibold text-[#FFFFFF]"
              >
                Done
              </button>
            </div>
          </GlassPanel>
        </div>
      )}
    </div>
  );
}
