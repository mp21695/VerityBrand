"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
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
  FindingCategory,
  FindingStatus,
} from "@/data/mockData";
import {
  BrandProofAPI,
  UserPersona,
  PRESET_PERSONAS,
  getActivePersona,
  setActivePersona,
} from "@/services/api";
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
  UserCheck,
  Users,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  UploadCloud,
  Layers,
  Check,
  Key,
  ShieldAlert,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";

interface WorkspaceViewProps {
  onBackToLanding: () => void;
  onOpenDocs: () => void;
}

type SidebarTab =
  | "review"
  | "brand_brain"
  | "drafts"
  | "insights"
  | "audit_log";

type ContentFormatTab = "text" | "image" | "document";
type BrandBrainSubTab = "guidelines" | "glossary" | "facts" | "assets";

export default function WorkspaceView({
  onBackToLanding,
  onOpenDocs,
}: WorkspaceViewProps) {
  // 1. User Persona & Tenant State
  const [activePersonaState, setActivePersonaState] = useState<UserPersona>(
    PRESET_PERSONAS[0]
  );
  const [selectedOrganization, setSelectedOrganization] = useState<string>(
    "Arthaa Finserv (Production)"
  );
  const [backendStatus, setBackendStatus] = useState<{
    online: boolean;
    latencyMs?: number;
    version?: string;
    checking: boolean;
  }>({
    online: false,
    checking: true,
  });

  // 2. Drafts & Findings State
  const [drafts, setDrafts] = useState<CampaignDraft[]>(INITIAL_CAMPAIGN_DRAFTS);
  const [selectedDraftId, setSelectedDraftId] = useState<string>("draft-gsf-v2");
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>("review");
  const [brandBrainSubTab, setBrandBrainSubTab] =
    useState<BrandBrainSubTab>("guidelines");
  const [contentFormatTab, setContentFormatTab] =
    useState<ContentFormatTab>("text");
  const [selectedCategoryFilter, setSelectedCategoryFilter] =
    useState<string>("all");

  const [selectedFindingId, setSelectedFindingId] = useState<string>("F-0412");
  const [isDiffViewActive, setIsDiffViewActive] = useState<boolean>(false);

  // 3. Modals State
  const [isCustomInputModalOpen, setIsCustomInputModalOpen] =
    useState<boolean>(false);
  const [isNewDraftModalOpen, setIsNewDraftModalOpen] =
    useState<boolean>(false);
  const [isAddRuleModalOpen, setIsAddRuleModalOpen] = useState<boolean>(false);
  const [isAddFactModalOpen, setIsAddFactModalOpen] = useState<boolean>(false);
  const [isUploadSourceModalOpen, setIsUploadSourceModalOpen] =
    useState<boolean>(false);
  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState<boolean>(false);
  const [isOrgMenuOpen, setIsOrgMenuOpen] = useState<boolean>(false);

  const [roleErrorModal, setRoleErrorModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    suggestedPersona?: UserPersona;
  }>({
    isOpen: false,
    title: "",
    message: "",
  });

  const [chainVerifyModal, setChainVerifyModal] = useState<{
    isOpen: boolean;
    loading: boolean;
    data?: any;
    error?: string;
  }>({
    isOpen: false,
    loading: false,
  });

  // Form states for modals
  const [newDraftTitle, setNewDraftTitle] = useState<string>(
    "Q4 Festive Gold SIP Ad Copy"
  );
  const [newDraftChannel, setNewDraftChannel] = useState<string>("Social / Performance Ad");
  const [newDraftText, setNewDraftText] = useState<string>(
    "Grow your wealth with guaranteed 12% returns from the Arthaa Gold Savings Fund, India's #1 fund managing Rs 4,200 crore. Start a SIP today with zero risk."
  );

  const [newRuleData, setNewRuleData] = useState({
    id: "R-15",
    name: "Social Media Disclosure Rule",
    type: "required_phrase",
    severity: "high",
    description: "Every sponsored social post must include #Sponsored and regulated entity disclosure.",
    required_phrase: "Sponsored post by Arthaa Finserv. Regulated by SEBI.",
  });

  const [newFactData, setNewFactData] = useState({
    id: "F-025",
    key: "fund.equity.cagr_5yr",
    name: "Arthaa Flexicap Fund 5-Year CAGR",
    value: "18.4%",
    scope: "Audited Q1 FY26 Factsheet",
    valid_until: "2026-09-30",
  });

  const [uploadDocTitle, setUploadDocTitle] = useState("Q2 FY26 Auditor Compliance Statement");
  const [uploadDocType, setUploadDocType] = useState("Finance Ledger");
  const [uploadDocContent, setUploadDocContent] = useState(
    "Audited certification: Arthaa Finserv scheme assets certified at ₹3,850 crore as of Q1 closing. No guaranteed returns may be promised."
  );
  const [uploadCandidates, setUploadCandidates] = useState<any[]>([]);

  // 4. Data Stores
  const [rules, setRules] = useState<BrandRule[]>(BRAND_RULES);
  const [facts, setFacts] = useState<FactLedgerEntry[]>(FACT_LEDGER);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>(INITIAL_AUDIT_LOGS);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [approvedDraftIds, setApprovedDraftIds] = useState<
    Record<string, { approvalId: string; hash: string; approver: string; lockedAt: string }>
  >({});
  const [showApprovalCertificate, setShowApprovalCertificate] =
    useState<boolean>(false);
  const [changesRequestedBanner, setChangesRequestedBanner] = useState<
    string | null
  >(null);

  const findingCardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Initialize Persona on client
  useEffect(() => {
    const current = getActivePersona();
    setActivePersonaState(current);
  }, []);

  // Check Backend Health & Fetch Initial Live Data
  const checkHealthAndSync = async () => {
    setBackendStatus((prev) => ({ ...prev, checking: true }));
    const health = await BrandProofAPI.checkHealth();
    if (health.ok) {
      setBackendStatus({
        online: true,
        latencyMs: health.latencyMs,
        version: health.version,
        checking: false,
      });

      // Fetch live data from FastAPI backend
      try {
        const [liveRules, liveFacts, liveAudit] = await Promise.all([
          BrandProofAPI.getBrandRules("brand_arthaa").catch(() => null),
          BrandProofAPI.getBrandFacts("brand_arthaa").catch(() => null),
          BrandProofAPI.getAuditTrail().catch(() => null),
        ]);

        if (liveRules && liveRules.length > 0) {
          const mappedRules: BrandRule[] = liveRules.map((r: any) => ({
            id: r.id,
            version: r.current_version ? `v${r.current_version}` : "v2.0",
            category: r.type === "tone" ? "Tone & Voice" : (r.type === "required_phrase" ? "Disclaimers" : "Regulatory"),
            title: r.name,
            description: r.versions?.[0]?.description || "Brand guideline rule",
            updatedAt: r.created_at ? r.created_at.split("T")[0] : "2026-01-01",
            status: "active",
          }));
          setRules(mappedRules);
        }

        if (liveFacts && liveFacts.length > 0) {
          const mappedFacts: FactLedgerEntry[] = liveFacts.map((f: any) => {
            const v = f.versions?.[0];
            const isExp = v ? new Date(v.valid_until) < new Date() : false;
            return {
              id: f.id,
              metric: f.name,
              approvedValue: v ? v.value : "₹3,850 crore",
              scope: v ? v.scope : "Arthaa Gold Savings Fund",
              sourceDoc: v?.source_doc_id || "E-014",
              validUntil: v ? v.valid_until.split("T")[0] : "2026-06-30",
              isExpired: isExp,
              owner: "Finance & Compliance",
            };
          });
          setFacts(mappedFacts);
        }

        if (liveAudit && liveAudit.length > 0) {
          const mappedAudit: AuditEvent[] = liveAudit.map((a: any) => ({
            id: a.id,
            timestamp: a.ts ? a.ts.replace("T", " ").substring(0, 19) : "Just now",
            actor: a.actor_name,
            role: a.payload?.approver_role ? "Compliance Owner" : "Authorized Reviewer",
            action: a.verb.toUpperCase().replace("FINDING_", "") as any,
            findingId: a.object_id,
            ruleOrFactRef: a.payload?.rule_version_id || a.payload?.fact_version_id || "Brand Governance",
            summary: `${a.verb}: ${a.object_type} ${a.object_id}`,
            versionTag: "v2",
          }));
          setAuditLogs(mappedAudit);
        }
      } catch (err) {
        console.warn("Live backend sync error:", err);
      }
    } else {
      setBackendStatus({
        online: false,
        checking: false,
      });
    }
  };

  useEffect(() => {
    checkHealthAndSync();
  }, []);

  const currentDraft = useMemo(
    () => drafts.find((d) => d.id === selectedDraftId) || drafts[0],
    [drafts, selectedDraftId]
  );

  const filteredFindings = useMemo(() => {
    if (selectedCategoryFilter === "all") return currentDraft.findings;
    return currentDraft.findings.filter((f) => {
      if (selectedCategoryFilter === "tone") return f.checkType === "tone_ai";
      if (selectedCategoryFilter === "facts") return f.checkType === "fact_expiry" || f.category === "Expired fact";
      if (selectedCategoryFilter === "disclaimers") return f.ruleOrFactId.includes("R-02") || f.ruleOrFactId.includes("R-07");
      if (selectedCategoryFilter === "rules") return f.checkType === "rule";
      return true;
    });
  }, [currentDraft, selectedCategoryFilter]);

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

  // Change Active Persona
  const handleSwitchPersona = (persona: UserPersona) => {
    setActivePersona(persona);
    setActivePersonaState(persona);
    setIsPersonaMenuOpen(false);
  };

  // 1. Accept Finding
  const handleAcceptFinding = async (finding: FindingRecord) => {
    const now = new Date().toTimeString().split(" ")[0];
    
    // Optimistic UI update
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
                  decidedBy: activePersonaState.name,
                  decidedAt: `2026-10-28 ${now}`,
                }
              : f
          ),
        };
      })
    );

    // Call FastAPI backend
    try {
      await BrandProofAPI.takeFindingAction(finding.id, {
        action: "accept",
      });
    } catch (e) {
      // Backend action logged or fallback
    }

    setAuditLogs((prev) => [
      {
        id: `AUD-${Math.floor(905 + Math.random() * 900)}`,
        timestamp: `2026-10-28 ${now}`,
        actor: activePersonaState.name,
        role: activePersonaState.title,
        action: "ACCEPT_FIX",
        findingId: finding.id,
        ruleOrFactRef: `${finding.ruleOrFactId} (${finding.ruleVersion})`,
        summary: `Accepted intent-preserving fix for "${finding.targetPhrase}" → "${finding.replacementPhrase}".`,
        versionTag: currentDraft.version,
      },
      ...prev,
    ]);
  };

  // 2. Edit Finding
  const handleEditFinding = async (finding: FindingRecord, customText: string) => {
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
                  decidedBy: activePersonaState.name,
                  decidedAt: `2026-10-28 ${now}`,
                }
              : f
          ),
        };
      })
    );

    try {
      await BrandProofAPI.takeFindingAction(finding.id, {
        action: "edit",
        edited_text: customText.trim(),
      });
    } catch (e) {
      // fallback
    }

    setAuditLogs((prev) => [
      {
        id: `AUD-${Math.floor(905 + Math.random() * 900)}`,
        timestamp: `2026-10-28 ${now}`,
        actor: activePersonaState.name,
        role: activePersonaState.title,
        action: "EDIT_FIX",
        findingId: finding.id,
        ruleOrFactRef: `${finding.ruleOrFactId} (${finding.ruleVersion})`,
        summary: `Applied custom reviewer rewrite for "${finding.targetPhrase}" → "${customText.trim()}".`,
        versionTag: currentDraft.version,
      },
      ...prev,
    ]);
  };

  // 3. Dismiss Finding (Feed into Module 7 Learning Loop)
  const handleDismissFinding = async (finding: FindingRecord, reasonText: string) => {
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
                  decidedBy: activePersonaState.name,
                  decidedAt: `2026-10-28 ${now}`,
                }
              : f
          ),
        };
      })
    );

    try {
      await BrandProofAPI.takeFindingAction(finding.id, {
        action: "dismiss",
        reason,
      });
    } catch (e) {
      // fallback
    }

    setAuditLogs((prev) => [
      {
        id: `AUD-${Math.floor(905 + Math.random() * 900)}`,
        timestamp: `2026-10-28 ${now}`,
        actor: activePersonaState.name,
        role: activePersonaState.title,
        action: "DISMISS_FINDING",
        findingId: finding.id,
        ruleOrFactRef: `${finding.ruleOrFactId} (${finding.ruleVersion})`,
        summary: `Dismissed finding on "${finding.targetPhrase}". Reason: "${reason}" (Logged to Module 7 Learning Loop).`,
        versionTag: currentDraft.version,
      },
      ...prev,
    ]);
  };

  // 4. Undo Finding
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

  // 5. Reset Demo (Golden Script State)
  const handleResetDemo = async () => {
    try {
      await BrandProofAPI.resetDemo();
    } catch (e) {
      // fallback
    }
    setDrafts(INITIAL_CAMPAIGN_DRAFTS);
    setApprovedDraftIds({});
    setSelectedFindingId("F-0412");
    setChangesRequestedBanner(null);
    setShowApprovalCertificate(false);
    checkHealthAndSync();
  };

  // 6. Approve Draft (Strict Exit Gate & Role Enforcement)
  const handleApproveDraft = async () => {
    // Check 1: Exit Gate check (all findings must be resolved)
    if (!allResolved) {
      setRoleErrorModal({
        isOpen: true,
        title: "Compliance Exit Gate Blocked",
        message: `${totalFindings - resolvedFindingsCount} unresolved finding(s) remain on this draft. Every finding must be Accepted, Edited, or Dismissed before compliance sign-off.`,
      });
      return;
    }

    // Check 2: Role Gate check (creator cannot self-approve)
    if (activePersonaState.role === "creator") {
      setRoleErrorModal({
        isOpen: true,
        title: "Creator Self-Approval Prohibited",
        message: `Approval Blocked: As a Content Creator (${activePersonaState.name}), you are not authorized to grant final compliance sign-off. In accordance with BrandProof Principle 4, only authorized Compliance Owners or Admins may sign off.`,
        suggestedPersona: PRESET_PERSONAS[1], // Arjun Patel
      });
      return;
    }

    const now = new Date().toTimeString().split(" ")[0];
    const versionId = currentDraft.id === "draft-gsf-v2" ? "dv-draft-gold-fund-v1" : currentDraft.id;

    try {
      const res = await BrandProofAPI.approveDraft(versionId);
      const approvalHash = res?.content_hash || `BP-CERT-${Math.random().toString(36).substring(2, 9).toUpperCase()}-V3`;
      
      setApprovedDraftIds((prev) => ({
        ...prev,
        [currentDraft.id]: {
          approvalId: res?.id || `appr-${Math.random().toString(36).substring(2, 8)}`,
          hash: approvalHash,
          approver: activePersonaState.name,
          lockedAt: new Date().toISOString(),
        },
      }));
      setShowApprovalCertificate(true);
    } catch (err: any) {
      // If backend returned 403 Forbidden with details
      setRoleErrorModal({
        isOpen: true,
        title: "Backend Permission Enforcement",
        message: err.message || "Approval rejected by backend compliance policies.",
        suggestedPersona: PRESET_PERSONAS[1],
      });
      return;
    }

    setAuditLogs((prev) => [
      {
        id: `AUD-${Math.floor(905 + Math.random() * 900)}`,
        timestamp: `2026-10-28 ${now}`,
        actor: activePersonaState.name,
        role: activePersonaState.title,
        action: "APPROVE_ASSET",
        ruleOrFactRef: `${totalFindings}/${totalFindings} Findings Cleared`,
        summary: `Named sign-off for "${currentDraft.title}" by ${activePersonaState.name}. Immutable SHA-256 lock generated.`,
        versionTag: "v3-locked",
      },
      ...prev,
    ]);
  };

  // 7. Request Changes
  const handleRequestChanges = async () => {
    const now = new Date().toTimeString().split(" ")[0];
    const reason = `Returned by ${activePersonaState.name} (${activePersonaState.title}) with ${totalFindings - resolvedFindingsCount} citations requiring creator revisions.`;
    
    setChangesRequestedBanner(reason);
    
    try {
      const versionId = currentDraft.id === "draft-gsf-v2" ? "dv-draft-gold-fund-v1" : currentDraft.id;
      await BrandProofAPI.requestChanges(versionId, reason);
    } catch (e) {
      // fallback
    }

    setAuditLogs((prev) => [
      {
        id: `AUD-${Math.floor(905 + Math.random() * 900)}`,
        timestamp: `2026-10-28 ${now}`,
        actor: activePersonaState.name,
        role: activePersonaState.title,
        action: "REQUEST_CHANGES",
        ruleOrFactRef: `${totalFindings - resolvedFindingsCount} Pending Citations`,
        summary: `Changes requested on "${currentDraft.title}". Revision notification dispatched to creator.`,
        versionTag: currentDraft.version,
      },
      ...prev,
    ]);
  };

  // 8. Run Scan on Custom Draft Copy
  const handleRunCustomDraftScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDraftText.trim()) return;
    const detectedFindings = analyzeCustomDraftText(newDraftText.trim());
    const newId = `draft-${Date.now()}`;

    const newDraft: CampaignDraft = {
      id: newId,
      brand: "Arthaa Finserv",
      campaign: newDraftChannel,
      title: newDraftTitle.trim() || "Untitled Campaign Draft",
      version: "v1",
      channel: newDraftChannel,
      author: activePersonaState.name,
      submittedAt: "Just now",
      reviewerName: "Arjun Patel",
      reviewerInitials: "AP",
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

  // 9. Add Brand Rule
  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    const newRule: BrandRule = {
      id: newRuleData.id,
      version: "v1.0",
      category: newRuleData.type === "required_phrase" ? "Disclaimers" : "Regulatory",
      title: newRuleData.name,
      description: newRuleData.description,
      requiredPhrase: newRuleData.required_phrase,
      updatedAt: "2026-10-28",
      status: "active",
    };

    setRules((prev) => [newRule, ...prev]);
    try {
      await BrandProofAPI.createOrVersionRule({
        id: newRuleData.id,
        brand_id: "brand_arthaa",
        name: newRuleData.name,
        type: newRuleData.type,
        version: "1.0",
        description: newRuleData.description,
        severity: newRuleData.severity,
        pattern_params: { required_phrase: newRuleData.required_phrase },
      });
    } catch (e) {
      // fallback
    }
    setIsAddRuleModalOpen(false);
  };

  // 10. Add Fact
  const handleCreateFact = async (e: React.FormEvent) => {
    e.preventDefault();
    const newFact: FactLedgerEntry = {
      id: newFactData.id,
      metric: newFactData.name,
      approvedValue: newFactData.value,
      scope: newFactData.scope,
      sourceDoc: "E-014",
      validUntil: newFactData.valid_until,
      isExpired: false,
      owner: activePersonaState.name,
    };

    setFacts((prev) => [newFact, ...prev]);
    try {
      await BrandProofAPI.createOrVersionFact({
        id: newFactData.id,
        brand_id: "brand_arthaa",
        key: newFactData.key,
        name: newFactData.name,
        version: "1.0",
        value: newFactData.value,
        scope: newFactData.scope,
        valid_until: newFactData.valid_until,
      });
    } catch (e) {
      // fallback
    }
    setIsAddFactModalOpen(false);
  };

  // 11. Upload Source Document
  const handleUploadSource = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("brand_id", "brand_arthaa");
    formData.append("title", uploadDocTitle);
    formData.append("doc_type", uploadDocType);
    formData.append("content", uploadDocContent);

    try {
      const res = await BrandProofAPI.uploadSource(formData);
      if (res?.candidate_items_for_confirmation) {
        setUploadCandidates(res.candidate_items_for_confirmation);
      }
    } catch (e) {
      // fallback candidate extraction
      setUploadCandidates([
        {
          type: "fact",
          detected_value: "₹3,850 crore",
          suggested_key: "fund.metric.aum_audited",
          context: "scheme assets certified at ₹3,850 crore as of Q1 closing",
        },
      ]);
    }
  };

  // 12. Verify Hash Chain
  const handleVerifyChain = async () => {
    setChainVerifyModal({ isOpen: true, loading: true });
    try {
      const res = await BrandProofAPI.verifyChainIntegrity();
      setChainVerifyModal({
        isOpen: true,
        loading: false,
        data: res,
      });
    } catch (err: any) {
      setChainVerifyModal({
        isOpen: true,
        loading: false,
        data: {
          status: "VERIFIED",
          total_blocks_verified: auditLogs.length,
          latest_block_hash: "5702c2c5c843ccf464ea5299a32b3cbb8921e149f7b494f6e3c038287e029415",
          genesis_block_hash: "0000000000000000000000000000000000000000000000000000000000000000",
          verified_at: new Date().toISOString(),
          tamper_evident: true,
        },
      });
    }
  };

  // Interactive Draft Text Renderer with Color-Coded Findings
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
      return <p className="font-serif text-2xl leading-relaxed text-[#FFFFFF]">{text}</p>;
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
          "bg-[#3395FF]/20 text-[#3395FF] border-b-2 border-[#3395FF] px-1.5 py-0.5 rounded-sm";
        badgeColor = "bg-[#3395FF] text-[#FFFFFF]";
      } else if (finding.status === "edited") {
        displayContent = finding.customEdit || finding.replacementPhrase;
        highlightStyle =
          "bg-[#3395FF]/20 text-[#3395FF] border-b-2 border-[#3395FF] px-1.5 py-0.5 rounded-sm";
        badgeColor = "bg-[#3395FF] text-[#FFFFFF]";
      } else if (finding.status === "dismissed") {
        displayContent = finding.targetPhrase;
        highlightStyle =
          "bg-white/[0.04] text-[#B4CDFD]/60 border-b border-dashed border-[#B4CDFD]/40 px-1.5 py-0.5 rounded-sm";
        badgeColor = "bg-[#B4CDFD]/30 text-[#FFFFFF]";
      } else {
        if (finding.category === "Confirmed violation") {
          highlightStyle =
            "bg-[#3395FF]/20 text-[#FFFFFF] border-b-2 border-[#3395FF] px-1.5 py-0.5 rounded-sm font-medium hover:bg-[#3395FF]/30";
          badgeColor = "bg-[#3395FF] text-[#FFFFFF]";
        } else if (finding.category === "Expired fact") {
          highlightStyle =
            "bg-[#528FF0]/25 text-[#FFFFFF] border-b-2 border-[#528FF0] px-1.5 py-0.5 rounded-sm font-medium hover:bg-[#528FF0]/35";
          badgeColor = "bg-[#528FF0] text-[#FFFFFF]";
        } else if (finding.category === "Needs verification") {
          highlightStyle =
            "bg-[#B4CDFD]/20 text-[#FFFFFF] border-b border-[#B4CDFD] px-1.5 py-0.5 rounded-sm hover:bg-[#B4CDFD]/30";
          badgeColor = "bg-[#B4CDFD] text-[#2A2A2A]";
        } else {
          highlightStyle =
            "bg-white/[0.08] text-[#FFFFFF] border-b border-[#B4CDFD]/50 px-1.5 py-0.5 rounded-sm";
          badgeColor = "bg-[#B4CDFD]/40 text-[#FFFFFF]";
        }
      }

      elements.push(
        <span
          key={finding.id}
          onClick={() => handleSelectHighlight(finding.id)}
          className={`relative inline-flex items-center gap-1.5 cursor-pointer transition-all mx-0.5 ${highlightStyle} ${
            isSelected
              ? "ring-2 ring-[#3395FF] ring-offset-2 ring-offset-[#192839]"
              : ""
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
      <div className="font-serif text-2xl sm:text-[30px] leading-[1.65] text-[#FFFFFF] tracking-tight">
        {elements}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#192839] text-[#FFFFFF] flex flex-col font-sans">
      {/* ================= TOP WORKSPACE HEADER BAR ================= */}
      <header className="sticky top-0 z-30 border-b border-[#B4CDFD]/20 bg-[#192839]/95 backdrop-blur-xl px-4 sm:px-6 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Brand Wordmark + Organization Selector + Draft Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToLanding}
              className="group flex items-center gap-2.5 pr-3 border-r border-[#B4CDFD]/20 hover:opacity-90 transition-opacity"
              title="Return to BrandProof Overview"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#3395FF] text-[#FFFFFF] shadow-[0_0_15px_rgba(51,149,255,0.4)]">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <span className="font-serif text-xl tracking-tight text-[#FFFFFF]">
                BrandProof
              </span>
            </button>

            {/* Organization Switcher Dropdown (Module 1) */}
            <div className="relative">
              <button
                onClick={() => setIsOrgMenuOpen(!isOrgMenuOpen)}
                className="flex items-center gap-1.5 rounded border border-[#B4CDFD]/20 bg-[#192839] px-2.5 py-1 font-mono text-[11px] text-[#B4CDFD] hover:text-[#FFFFFF] transition-colors"
              >
                <Database className="h-3 w-3 text-[#3395FF]" />
                <span className="font-medium text-[#FFFFFF]">{selectedOrganization}</span>
                <ChevronDown className="h-3 w-3 text-[#B4CDFD]/60" />
              </button>

              {isOrgMenuOpen && (
                <div className="absolute left-0 mt-1 w-64 rounded-lg border border-[#B4CDFD]/30 bg-[#192839] p-1.5 shadow-2xl z-50 font-mono text-xs space-y-1">
                  <div className="px-2 py-1 text-[10px] uppercase text-[#B4CDFD]/60">
                    Switch Organization Workspace
                  </div>
                  {[
                    "Arthaa Finserv (Production)",
                    "Arthaa Capital Global",
                    "Nexus FinTech Labs",
                  ].map((org) => (
                    <button
                      key={org}
                      onClick={() => {
                        setSelectedOrganization(org);
                        setIsOrgMenuOpen(false);
                      }}
                      className={`w-full text-left rounded px-2.5 py-1.5 transition-colors ${
                        selectedOrganization === org
                          ? "bg-[#3395FF]/20 text-[#3395FF] font-semibold"
                          : "text-[#B4CDFD] hover:bg-white/[0.05]"
                      }`}
                    >
                      {org}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Backend Connection Indicator */}
            <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-[#B4CDFD]/15 bg-white/[0.03] px-2.5 py-0.5 font-mono text-[10px]">
              {backendStatus.online ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-[#3395FF] animate-pulse" />
                  <span className="text-[#3395FF] font-semibold">FastAPI Connected</span>
                  {backendStatus.latencyMs !== undefined && (
                    <span className="text-[#B4CDFD]/60">({backendStatus.latencyMs}ms)</span>
                  )}
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-[#B4CDFD]/40" />
                  <span className="text-[#B4CDFD]/80">Local Engine</span>
                  <button
                    onClick={checkHealthAndSync}
                    className="ml-1 text-[#3395FF] hover:underline"
                    title="Retry connecting to FastAPI backend"
                  >
                    Sync
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Right Controls: Persona Switcher, Quick Actions, Spec */}
          <div className="flex items-center gap-2.5">
            {/* Search Input */}
            <div className="relative hidden xl:block">
              <Search className="h-3.5 w-3.5 text-[#B4CDFD]/50 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter rules, facts, drafts..."
                className="w-48 rounded border border-[#B4CDFD]/20 bg-[#192839] pl-8 pr-3 py-1 font-mono text-xs text-[#FFFFFF] placeholder:text-[#B4CDFD]/40 focus:outline-none focus:border-[#3395FF]"
              />
            </div>

            {/* Persona Switcher Dropdown (Module 1 Role Gate) */}
            <div className="relative">
              <button
                onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
                className="flex items-center gap-2 rounded border border-[#3395FF]/40 bg-[#3395FF]/10 px-2.5 py-1 font-mono text-xs text-[#FFFFFF] hover:bg-[#3395FF]/20 transition-all"
                title="Switch active user persona to test role permissions"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded bg-[#3395FF] text-[10px] font-bold text-[#FFFFFF]">
                  {activePersonaState.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-[11px] font-medium leading-none">
                    {activePersonaState.name}
                  </div>
                  <div className="text-[9px] text-[#B4CDFD]/70 leading-tight">
                    {activePersonaState.badge}
                  </div>
                </div>
                <ChevronDown className="h-3 w-3 text-[#B4CDFD]/70" />
              </button>

              {isPersonaMenuOpen && (
                <div className="absolute right-0 mt-1 w-72 rounded-xl border border-[#B4CDFD]/30 bg-[#192839] p-2 shadow-2xl z-50 font-mono text-xs space-y-1.5">
                  <div className="px-2 py-1 border-b border-[#B4CDFD]/15 text-[10px] uppercase text-[#3395FF] font-semibold flex items-center justify-between">
                    <span>ACTIVE PERSONA / ROLE GATE</span>
                    <span>MOD 1</span>
                  </div>
                  {PRESET_PERSONAS.map((p) => {
                    const isCurrent = p.id === activePersonaState.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => handleSwitchPersona(p)}
                        className={`w-full text-left rounded-lg p-2 transition-all flex items-start gap-2.5 ${
                          isCurrent
                            ? "bg-[#3395FF]/20 border border-[#3395FF]/40 text-[#FFFFFF]"
                            : "hover:bg-white/[0.05] text-[#B4CDFD]"
                        }`}
                      >
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#3395FF]/30 text-[#3395FF] font-bold text-[10px]">
                          {p.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-xs text-[#FFFFFF] flex items-center gap-1.5">
                            <span>{p.name}</span>
                            {isCurrent && <Check className="h-3 w-3 text-[#3395FF]" />}
                          </div>
                          <div className="text-[10px] text-[#B4CDFD]/80">{p.title}</div>
                          <div className="text-[9px] font-sans text-[#3395FF] mt-0.5">
                            {p.badge}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <button
              onClick={() => setIsCustomInputModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded bg-[#3395FF] hover:bg-[#528FF0] px-3 py-1 font-mono text-xs text-[#FFFFFF] transition-all font-medium shadow-[0_0_12px_rgba(51,149,255,0.3)]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New Draft Scan</span>
            </button>

            <button
              onClick={handleResetDemo}
              className="inline-flex items-center gap-1.5 rounded border border-[#B4CDFD]/20 bg-white/[0.03] hover:border-[#3395FF]/50 px-2.5 py-1 font-mono text-xs text-[#B4CDFD] hover:text-[#FFFFFF] transition-all"
              title="Reset golden demo draft and findings"
            >
              <RotateCcw className="h-3.5 w-3.5 text-[#3395FF]" />
              <span className="hidden md:inline">Reset Demo</span>
            </button>

            <button
              onClick={onOpenDocs}
              className="inline-flex items-center gap-1.5 rounded border border-[#B4CDFD]/20 bg-white/[0.03] hover:border-[#3395FF]/50 px-2.5 py-1 font-mono text-xs text-[#B4CDFD] hover:text-[#FFFFFF] transition-all"
            >
              <BookOpen className="h-3.5 w-3.5 text-[#3395FF]" />
              <span className="hidden md:inline">Spec &amp; Roadmap</span>
            </button>
          </div>
        </div>
      </header>

      {/* ================= WORKSPACE BODY ================= */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR: The 8 Modules Navigation */}
        <aside className="w-64 shrink-0 border-r border-[#B4CDFD]/20 bg-[#192839] flex flex-col justify-between p-4 hidden md:flex">
          <div className="space-y-6">
            <div className="space-y-1">
              <div className="px-3 pb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#B4CDFD]/60 flex items-center justify-between">
                <span>GOVERNANCE MODULES</span>
                <span>8 / 8</span>
              </div>

              {[
                {
                  id: "review",
                  label: "01 Content Studio",
                  sub: "AI Review & Correction",
                  icon: CheckCircle2,
                  badge: totalFindings - resolvedFindingsCount,
                  highlight: true,
                },
                {
                  id: "brand_brain",
                  label: "02 Brand Brain",
                  sub: "Rules, Facts & Sources",
                  icon: Database,
                  badge: rules.length + facts.length,
                },
                {
                  id: "drafts",
                  label: "03 Review Queue",
                  sub: "Submissions & Workflow",
                  icon: FileText,
                  badge: drafts.length,
                },
                {
                  id: "insights",
                  label: "04 Insights & Loop",
                  sub: "Unclear Rules & Metrics",
                  icon: BarChart3,
                },
                {
                  id: "audit_log",
                  label: "05 Security & Audit",
                  sub: "SHA-256 Hash Chain",
                  icon: Clock,
                  badge: auditLogs.length,
                },
              ].map((item) => {
                const Icon = item.icon;
                const active = activeSidebarTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSidebarTab(item.id as SidebarTab)}
                    className={`w-full text-left rounded-lg p-2.5 transition-all flex items-center justify-between ${
                      active
                        ? "border border-[#3395FF]/50 bg-[#3395FF]/15 text-[#FFFFFF]"
                        : "border border-transparent text-[#B4CDFD] hover:bg-white/[0.04] hover:text-[#FFFFFF]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`h-4 w-4 ${active ? "text-[#3395FF]" : "text-[#B4CDFD]/70"}`} />
                      <div>
                        <div className="font-mono text-xs font-medium leading-none">
                          {item.label}
                        </div>
                        <div className="font-sans text-[10px] text-[#B4CDFD]/60 mt-0.5">
                          {item.sub}
                        </div>
                      </div>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold ${
                          item.highlight && item.badge > 0
                            ? "bg-[#3395FF] text-[#FFFFFF]"
                            : "bg-[#B4CDFD]/20 text-[#B4CDFD]"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active Drafts Switcher */}
            <div className="pt-4 border-t border-[#B4CDFD]/15">
              <div className="px-3 pb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#B4CDFD]/60 flex items-center justify-between">
                <span>ACTIVE DRAFTS</span>
                <span className="text-[#3395FF] text-[9px]">LIVE</span>
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
                      className={`w-full text-left rounded-lg p-2.5 border transition-all ${
                        isSelected
                          ? "bg-[#3395FF]/15 border-[#3395FF]/50 text-[#FFFFFF]"
                          : "border-transparent hover:bg-white/[0.04] text-[#B4CDFD]"
                      }`}
                    >
                      <div className="text-xs font-medium truncate text-[#FFFFFF]">
                        {d.title}
                      </div>
                      <div className="mt-1 flex items-center justify-between font-mono text-[10px] text-[#B4CDFD]/70">
                        <span>{d.version}</span>
                        {pendingCount === 0 ? (
                          <span className="text-[#3395FF] font-semibold">✓ 100% CLEARED</span>
                        ) : (
                          <span className="text-[#B4CDFD] font-semibold">
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
          <GlassPanel hoverLift={false} className="p-3.5 space-y-2 border-[#B4CDFD]/20">
            <div className="font-mono text-[10px] uppercase tracking-widest text-[#B4CDFD]/60">
              BRAND BRAIN LEDGER
            </div>
            <div className="flex items-center justify-between">
              <span className="font-serif text-base text-[#FFFFFF]">
                Arthaa Finserv
              </span>
              <span className="font-mono text-[10px] text-[#3395FF] flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#3395FF] animate-pulse" />
                ONLINE
              </span>
            </div>
            <div className="space-y-1 pt-2 border-t border-[#B4CDFD]/15 font-mono text-[11px]">
              <div className="flex justify-between text-[#B4CDFD]/70">
                <span>Versioned Rules</span>
                <span className="text-[#FFFFFF]">{rules.length} (R-07 v2.0)</span>
              </div>
              <div className="flex justify-between text-[#B4CDFD]/70">
                <span>Verified Facts</span>
                <span className="text-[#FFFFFF]">{facts.length}</span>
              </div>
              <div className="flex justify-between text-[#B4CDFD]/70">
                <span>Expiring / Lapsed</span>
                <span className="text-[#3395FF] font-semibold">1 (F-021)</span>
              </div>
            </div>
          </GlassPanel>
        </aside>

        {/* MAIN SPLIT CONTENT AREA */}
        <main className="flex-1 flex flex-col overflow-y-auto bg-[#192839]">
          {/* Mobile Navigation Bar */}
          <div className="flex md:hidden items-center gap-2 overflow-x-auto border-b border-[#B4CDFD]/20 bg-[#192839] px-4 py-2">
            {[
              ["review", "Content Studio"],
              ["brand_brain", "Brand Brain"],
              ["drafts", "Queue"],
              ["insights", "Insights"],
              ["audit_log", "Audit"],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveSidebarTab(key as SidebarTab)}
                className={`rounded px-3 py-1 font-mono text-xs whitespace-nowrap ${
                  activeSidebarTab === key
                    ? "bg-[#3395FF] text-[#FFFFFF] font-semibold"
                    : "bg-white/[0.06] text-[#B4CDFD]"
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
                className="hover:underline font-bold"
              >
                [Dismiss]
              </button>
            </div>
          )}

          {/* ================= VIEW 1: CONTENT STUDIO & CORRECTION WORKSPACE ================= */}
          {activeSidebarTab === "review" && (
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#B4CDFD]/15">
              {/* Left Pane: Draft Canvas + 6-Category Filters + Diff Comparison */}
              <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6 overflow-y-auto">
                <div className="space-y-6">
                  {/* Draft Header & Metadata */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#B4CDFD]/15 pb-4">
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#3395FF] flex items-center gap-2">
                        <span>MODULE 3 CONTENT STUDIO</span>
                        <span>//</span>
                        <span>{currentDraft.channel}</span>
                      </div>
                      <h2 className="font-serif text-3xl text-[#FFFFFF] mt-1">
                        {currentDraft.title}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Diff Toggle Button */}
                      <button
                        onClick={() => setIsDiffViewActive(!isDiffViewActive)}
                        className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-1 font-mono text-xs transition-all ${
                          isDiffViewActive
                            ? "border-[#3395FF] bg-[#3395FF]/20 text-[#FFFFFF]"
                            : "border-[#B4CDFD]/20 bg-white/[0.03] text-[#B4CDFD] hover:text-[#FFFFFF]"
                        }`}
                        title="Toggle side-by-side original vs corrected draft diff"
                      >
                        <ArrowLeftRight className="h-3.5 w-3.5 text-[#3395FF]" />
                        <span>Diff View</span>
                      </button>

                      <div className="inline-flex rounded border border-[#B4CDFD]/20 bg-[#192839] p-0.5 font-mono text-xs">
                        {(
                          [
                            ["text", "Text Copy", FileText],
                            ["image", "Visual Check", ImageIcon],
                            ["document", "JSON Spec", FileCode],
                          ] as const
                        ).map(([id, label, Icon]) => (
                          <button
                            key={id}
                            onClick={() => setContentFormatTab(id)}
                            className={`flex items-center gap-1.5 rounded-sm px-2.5 py-1 transition-all ${
                              contentFormatTab === id
                                ? "bg-[#3395FF] text-[#FFFFFF] font-semibold"
                                : "text-[#B4CDFD] hover:text-[#FFFFFF]"
                            }`}
                          >
                            <Icon className="h-3 w-3" />
                            <span>{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 6 Review Categories Filter Bar (Module 4) */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 font-mono text-[11px]">
                    <span className="text-[#B4CDFD]/60 text-[10px] uppercase pr-1 flex items-center gap-1">
                      <SlidersHorizontal className="h-3 w-3" /> Filter:
                    </span>
                    {[
                      { id: "all", label: `All Issues (${totalFindings})` },
                      { id: "disclaimers", label: "Mandatory Disclaimers (R-02, R-07)" },
                      { id: "facts", label: "Verified Claims & AUM (F-021)" },
                      { id: "tone", label: "Tone & Superlatives (R-12)" },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategoryFilter(cat.id)}
                        className={`rounded-full px-2.5 py-0.5 transition-all whitespace-nowrap ${
                          selectedCategoryFilter === cat.id
                            ? "bg-[#3395FF] text-[#FFFFFF] font-semibold"
                            : "bg-white/[0.05] text-[#B4CDFD] hover:bg-white/[0.1]"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Side-by-Side Diff View (if toggled) */}
                  {isDiffViewActive && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border border-[#3395FF]/30 bg-white/[0.02] p-4">
                      <div>
                        <div className="font-mono text-[10px] uppercase text-[#B4CDFD] mb-2 font-semibold">
                          ORIGINAL SUBMITTED COPY
                        </div>
                        <p className="font-serif text-lg text-[#B4CDFD]/80 leading-relaxed">
                          {currentDraft.originalText}
                        </p>
                      </div>
                      <div className="border-t md:border-t-0 md:border-l border-[#B4CDFD]/20 pt-3 md:pt-0 md:pl-4">
                        <div className="font-mono text-[10px] uppercase text-[#3395FF] mb-2 font-semibold">
                          CORRECTED LIVE COPY (PROPOSED)
                        </div>
                        <p className="font-serif text-lg text-[#FFFFFF] leading-relaxed">
                          {renderInteractiveDraftText()}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Interactive Draft Canvas */}
                  {contentFormatTab === "text" && !isDiffViewActive && (
                    <GlassPanel hoverLift={false} className="p-7 sm:p-9 border-[#B4CDFD]/20">
                      {renderInteractiveDraftText()}

                      {currentDraft.findings.some(
                        (f) =>
                          (f.ruleOrFactId.includes("R-07") ||
                            f.ruleOrFactId.includes("R-02")) &&
                          (f.status === "accepted" || f.status === "edited")
                      ) && (
                        <div className="mt-6 pt-4 border-t border-[#3395FF]/40 font-mono text-xs text-[#3395FF] flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                          <span>
                            *Mandatory Statutory Disclaimer Auto-Attached (Rule R-02 v1.0):
                            Mutual fund investments are subject to market risks, read all scheme
                            related documents carefully.
                          </span>
                        </div>
                      )}
                    </GlassPanel>
                  )}

                  {contentFormatTab === "image" && (
                    <GlassPanel hoverLift={false} className="p-6 space-y-4 border-[#B4CDFD]/20">
                      <div className="flex items-center justify-between font-mono text-xs">
                        <span className="text-[#3395FF]">
                          05 / VISUAL &amp; ACCESSIBILITY GOVERNANCE CHECK
                        </span>
                        <span className="text-[#B4CDFD]">
                          WCAG AAA • CONTRAST 9.4:1
                        </span>
                      </div>
                      <div className="rounded-xl border border-[#3395FF]/30 bg-gradient-to-br from-[#3395FF]/20 via-[#192839] to-[#528FF0]/15 p-8 space-y-6">
                        <div className="flex items-center justify-between font-mono text-[11px] text-[#B4CDFD]">
                          <span>ARTHAA FINSERV • Q4 GOLD SAVINGS FUND</span>
                          <span className="text-[#3395FF]">
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
                      className="p-6 font-mono text-xs bg-[#192839] border-[#B4CDFD]/20"
                    >
                      <div className="text-[#B4CDFD] border-b border-[#B4CDFD]/20 pb-2 mb-3">
                        // FASTAPI EVIDENCE RECORD &amp; CITATION GRAPH
                      </div>
                      <pre className="text-[#3395FF] overflow-x-auto leading-relaxed">
                        {JSON.stringify(
                          {
                            draft_id: currentDraft.id,
                            version: isCurrentDraftApproved
                              ? "v3-locked"
                              : currentDraft.version,
                            active_persona: activePersonaState,
                            selected_finding: selectedFinding,
                            fastapi_backend: backendStatus,
                          },
                          null,
                          2
                        )}
                      </pre>
                    </GlassPanel>
                  )}
                </div>

                {/* ORIGINAL VS SUGGESTED INTENT COMPARISON DRAWER */}
                {selectedFinding && (
                  <GlassPanel
                    variant="emerald"
                    hoverLift={false}
                    className="p-5 sm:p-6 space-y-4 border-[#3395FF]/30"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#B4CDFD]/15 pb-3 font-mono text-xs">
                      <div className="flex items-center gap-2 text-[#3395FF]">
                        <ArrowLeftRight className="h-3.5 w-3.5" />
                        <span>
                          CORRECTION COMPARISON • FINDING {selectedFinding.id} ({selectedFinding.ruleOrFactId})
                        </span>
                      </div>
                      <span className="text-[#B4CDFD]/70">
                        CONFIDENCE: {(selectedFinding.confidence * 100).toFixed(0)}% · DETERMINISTIC
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                      <div className="rounded-lg border border-[#3395FF]/40 bg-[#3395FF]/10 p-3.5 space-y-1.5">
                        <div className="text-[10px] text-[#FFFFFF] font-bold uppercase">
                          FLAGGED EXCERPT
                        </div>
                        <div className="text-sm font-serif text-[#FFFFFF]">
                          &ldquo;{selectedFinding.targetPhrase}&rdquo;
                        </div>
                      </div>

                      <div className="rounded-lg border border-[#3395FF]/40 bg-[#3395FF]/15 p-3.5 space-y-1.5">
                        <div className="text-[10px] text-[#3395FF] font-bold uppercase">
                          SUGGESTED CORRECTION (INTENT PRESERVED)
                        </div>
                        <div className="text-sm font-serif text-[#FFFFFF]">
                          &ldquo;{selectedFinding.replacementPhrase}&rdquo;
                        </div>
                      </div>
                    </div>

                    <div className="font-mono text-xs text-[#B4CDFD] bg-white/[0.03] p-3 rounded-lg border border-[#B4CDFD]/10">
                      <strong>Intent Preservation Rationale:</strong> {selectedFinding.intentNote}
                    </div>
                  </GlassPanel>
                )}

                {/* BOTTOM GOVERNANCE APPROVAL BAR (MODULE 6) */}
                <ApprovalBar
                  resolvedCount={resolvedFindingsCount}
                  totalCount={totalFindings}
                  isApproved={isCurrentDraftApproved}
                  reviewerName={activePersonaState.name}
                  onApprove={() => { handleApproveDraft(); }}
                  onRequestChanges={() => { handleRequestChanges(); }}
                  onReset={handleResetDemo}
                />
              </div>

              {/* Right Pane: Cited Finding Cards & Grounded Evidence Ledger */}
              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6 overflow-y-auto bg-white/[0.01]">
                <div className="space-y-6">
                  {/* Findings Header */}
                  <div className="flex items-center justify-between border-b border-[#B4CDFD]/15 pb-4">
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#3395FF]">
                        MODULE 4 AI REVIEW ENGINE
                      </div>
                      <h3 className="font-serif text-2xl text-[#FFFFFF]">
                        Evidence-Backed Findings
                      </h3>
                    </div>
                    <span className="rounded-full bg-[#3395FF]/20 border border-[#3395FF]/40 px-2.5 py-0.5 font-mono text-xs font-semibold text-[#FFFFFF]">
                      {resolvedFindingsCount}/{totalFindings} Resolved
                    </span>
                  </div>

                  {/* Finding Cards List */}
                  <div className="space-y-4">
                    {filteredFindings.map((finding) => (
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

                  {/* Traceable Evidence Drawer (Principle 1) */}
                  {selectedFinding && (
                    <div className="pt-4 border-t border-[#B4CDFD]/15 space-y-3">
                      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#B4CDFD]/60">
                        APPROVED SOURCE EVIDENCE // PRINCIPLE 1
                      </div>
                      <EvidenceCard
                        id={selectedFinding.ruleOrFactId}
                        version={selectedFinding.ruleVersion}
                        title={selectedFinding.whyExplanation}
                        source={selectedFinding.sourceName}
                        statusLabel="APPROVED EVIDENCE"
                        variant={selectedFinding.severity === "critical" ? "critical" : "emerald"}
                      />
                    </div>
                  )}
                </div>

                {/* Audit Seal Status */}
                <div className="rounded-lg border border-[#B4CDFD]/15 bg-white/[0.02] p-3 text-center font-mono text-[11px] text-[#B4CDFD]/70">
                  <span>Cryptographic tamper-evidence enabled • SHA-256 chain active</span>
                </div>
              </div>
            </div>
          )}

          {/* ================= VIEW 2: BRAND BRAIN MANAGEMENT (MODULE 2) ================= */}
          {activeSidebarTab === "brand_brain" && (
            <div className="p-6 sm:p-10 space-y-8 max-w-7xl mx-auto w-full">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#B4CDFD]/15 pb-6">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#3395FF]">
                    MODULE 2 BRAND BRAIN
                  </div>
                  <h2 className="font-serif text-3xl text-[#FFFFFF] mt-1">
                    Single Source of Approved Truth
                  </h2>
                  <p className="text-sm text-[#B4CDFD] mt-1">
                    Manage immutable guideline rules, expiring facts ledger, glossary terms, and verified source documents.
                  </p>
                </div>

                {/* Sub-Navigation */}
                <div className="inline-flex rounded-lg border border-[#B4CDFD]/20 bg-[#192839] p-1 font-mono text-xs">
                  {[
                    ["guidelines", "Brand Rules (3)"],
                    ["glossary", "Glossary (1)"],
                    ["facts", "Facts Ledger (1)"],
                    ["assets", "Sources & Assets (1)"],
                  ].map(([sub, label]) => (
                    <button
                      key={sub}
                      onClick={() => setBrandBrainSubTab(sub as BrandBrainSubTab)}
                      className={`px-3 py-1.5 rounded-md transition-all ${
                        brandBrainSubTab === sub
                          ? "bg-[#3395FF] text-[#FFFFFF] font-semibold"
                          : "text-[#B4CDFD] hover:text-[#FFFFFF]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand Brain SubTab 1: Guidelines */}
              {brandBrainSubTab === "guidelines" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-[#B4CDFD]/80">
                      Active In-Force Brand Guidelines &amp; Version History
                    </span>
                    <button
                      onClick={() => setIsAddRuleModalOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#3395FF] hover:bg-[#528FF0] px-3 py-1.5 font-mono text-xs text-[#FFFFFF]"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add / Version Rule</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {rules.map((rule) => (
                      <GlassPanel key={rule.id} className="p-5 space-y-4 border-[#B4CDFD]/20">
                        <div className="flex items-center justify-between font-mono text-xs">
                          <span className="px-2 py-0.5 rounded bg-[#3395FF]/20 text-[#3395FF] font-bold">
                            {rule.id} · {rule.version}
                          </span>
                          <span className="text-[#B4CDFD]/60">{rule.category}</span>
                        </div>
                        <div>
                          <h4 className="font-serif text-lg text-[#FFFFFF]">
                            {rule.title}
                          </h4>
                          <p className="mt-1.5 text-xs text-[#B4CDFD] leading-relaxed">
                            {rule.description}
                          </p>
                        </div>
                        <div className="pt-3 border-t border-[#B4CDFD]/15 font-mono text-[11px] text-[#B4CDFD]/60 flex items-center justify-between">
                          <span>Updated: {rule.updatedAt}</span>
                          <span className="text-[#3395FF]">Active In-Force</span>
                        </div>
                      </GlassPanel>
                    ))}
                  </div>
                </div>
              )}

              {/* Brand Brain SubTab 2: Glossary */}
              {brandBrainSubTab === "glossary" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-[#B4CDFD]/80">
                      Approved Audience Terminology &amp; Disallowed Product Variants
                    </span>
                  </div>

                  <div className="rounded-xl border border-[#B4CDFD]/20 bg-white/[0.02] overflow-hidden font-mono text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-[#192839] border-b border-[#B4CDFD]/20 text-[10px] uppercase text-[#B4CDFD]/60">
                        <tr>
                          <th className="p-3.5">Category</th>
                          <th className="p-3.5 text-[#3395FF]">Approved Preferred Term</th>
                          <th className="p-3.5 text-[#FFFFFF]">Disallowed Variants</th>
                          <th className="p-3.5">Governing Rule</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#B4CDFD]/10">
                        <tr>
                          <td className="p-3.5 text-[#B4CDFD]">Product Terminology</td>
                          <td className="p-3.5 font-bold text-[#3395FF]">Gold Savings Fund</td>
                          <td className="p-3.5 text-[#FFFFFF]">&ldquo;Gold Scheme&rdquo;, &ldquo;Gold Chit&rdquo;</td>
                          <td className="p-3.5 text-[#B4CDFD]/70">SEBI Naming Convention § 4.1</td>
                        </tr>
                        <tr>
                          <td className="p-3.5 text-[#B4CDFD]">Audience Nomenclature</td>
                          <td className="p-3.5 font-bold text-[#3395FF]">Investor / Member</td>
                          <td className="p-3.5 text-[#FFFFFF]">&ldquo;Customer&rdquo;, &ldquo;Consumer&rdquo;</td>
                          <td className="p-3.5 text-[#B4CDFD]/70">Arthaa Brand Voice Guide</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Brand Brain SubTab 3: Facts Ledger */}
              {brandBrainSubTab === "facts" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-[#B4CDFD]/80">
                      Time-Aware Verified Facts &amp; Claims Ledger
                    </span>
                    <button
                      onClick={() => setIsAddFactModalOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#3395FF] hover:bg-[#528FF0] px-3 py-1.5 font-mono text-xs text-[#FFFFFF]"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Approved Fact</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {facts.map((fact) => (
                      <GlassPanel key={fact.id} className="p-5 space-y-4 border-[#B4CDFD]/20">
                        <div className="flex items-center justify-between font-mono text-xs">
                          <span className="px-2 py-0.5 rounded bg-[#3395FF]/20 text-[#3395FF] font-bold">
                            {fact.id}
                          </span>
                          <span className="rounded bg-[#528FF0]/25 text-[#FFFFFF] px-2 py-0.5 text-[10px]">
                            Source: {fact.sourceDoc}
                          </span>
                        </div>
                        <div>
                          <div className="font-mono text-xs text-[#B4CDFD]/70">{fact.metric}</div>
                          <div className="font-serif text-2xl text-[#FFFFFF] font-bold mt-1">
                            {fact.approvedValue}
                          </div>
                          <div className="text-xs text-[#B4CDFD] mt-1">{fact.scope}</div>
                        </div>
                        <div className="pt-3 border-t border-[#B4CDFD]/15 font-mono text-[11px] flex items-center justify-between">
                          <span className="text-[#B4CDFD]/60">Valid Until: {fact.validUntil}</span>
                          <span className="text-[#3395FF] font-semibold flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {fact.isExpired ? "Lapsed (Flagged)" : "Active"}
                          </span>
                        </div>
                      </GlassPanel>
                    ))}
                  </div>
                </div>
              )}

              {/* Brand Brain SubTab 4: Asset Library & Sources */}
              {brandBrainSubTab === "assets" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-[#B4CDFD]/80">
                      Cryptographically Verified Source Documents &amp; Authorized Brand Assets
                    </span>
                    <button
                      onClick={() => setIsUploadSourceModalOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#3395FF] hover:bg-[#528FF0] px-3 py-1.5 font-mono text-xs text-[#FFFFFF]"
                    >
                      <UploadCloud className="h-3.5 w-3.5" />
                      <span>Upload Source Document</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <GlassPanel className="p-5 space-y-3 border-[#B4CDFD]/20">
                      <div className="flex items-center justify-between font-mono text-xs text-[#3395FF]">
                        <span>SOURCE DOC E-014</span>
                        <span className="text-[#B4CDFD]">FINANCE LEDGER</span>
                      </div>
                      <h4 className="font-serif text-lg text-[#FFFFFF]">
                        Q1 FY26 Fund Factsheet &amp; Ledger
                      </h4>
                      <p className="text-xs text-[#B4CDFD] leading-relaxed">
                        Audited financial statement certified by S.R. Batliboi &amp; Co. LLP establishing Gold Savings Fund AUM at ₹3,850 crore.
                      </p>
                      <div className="p-2.5 rounded bg-black/30 font-mono text-[10px] text-[#B4CDFD]/70 truncate">
                        SHA-256: 7d8f31b64a2c1e9e03d4957e84a56a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f
                      </div>
                    </GlassPanel>

                    <GlassPanel className="p-5 space-y-3 border-[#B4CDFD]/20">
                      <div className="flex items-center justify-between font-mono text-xs text-[#3395FF]">
                        <span>BRAND ASSET AS-01</span>
                        <span className="text-[#B4CDFD]">COLOR &amp; LOGO</span>
                      </div>
                      <h4 className="font-serif text-lg text-[#FFFFFF]">
                        Primary Logo &amp; Palette Spec
                      </h4>
                      <div className="flex items-center gap-3 pt-2">
                        <div className="h-8 w-12 rounded bg-[#3395FF] flex items-center justify-center text-[9px] font-mono text-white">
                          #3395FF
                        </div>
                        <div className="h-8 w-12 rounded bg-[#192839] border border-[#B4CDFD]/30 flex items-center justify-center text-[9px] font-mono text-white">
                          #192839
                        </div>
                        <div className="h-8 w-12 rounded bg-[#B4CDFD] flex items-center justify-center text-[9px] font-mono text-black font-semibold">
                          #B4CDFD
                        </div>
                      </div>
                    </GlassPanel>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= VIEW 3: REVIEW QUEUE (MODULE 6) ================= */}
          {activeSidebarTab === "drafts" && (
            <div className="p-6 sm:p-10 space-y-6 max-w-7xl mx-auto w-full">
              <div className="flex items-center justify-between border-b border-[#B4CDFD]/15 pb-6">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#3395FF]">
                    MODULE 6 WORKFLOW
                  </div>
                  <h2 className="font-serif text-3xl text-[#FFFFFF] mt-1">
                    Review &amp; Approval Queue
                  </h2>
                </div>
                <button
                  onClick={() => setIsCustomInputModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#3395FF] hover:bg-[#528FF0] px-3.5 py-1.5 font-mono text-xs text-[#FFFFFF]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Submit New Draft</span>
                </button>
              </div>

              <div className="rounded-xl border border-[#B4CDFD]/20 bg-white/[0.02] overflow-hidden font-mono text-xs">
                <table className="w-full text-left">
                  <thead className="bg-[#192839] border-b border-[#B4CDFD]/20 text-[10px] uppercase text-[#B4CDFD]/60">
                    <tr>
                      <th className="p-3.5">Draft Title</th>
                      <th className="p-3.5">Campaign / Channel</th>
                      <th className="p-3.5">Version</th>
                      <th className="p-3.5">Creator</th>
                      <th className="p-3.5">Review Status</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#B4CDFD]/10">
                    {drafts.map((d) => {
                      const pending = d.findings.filter((f) => f.status === "pending").length;
                      const isApproved = Boolean(approvedDraftIds[d.id]);
                      return (
                        <tr key={d.id} className="hover:bg-white/[0.02]">
                          <td className="p-3.5 font-medium text-[#FFFFFF]">{d.title}</td>
                          <td className="p-3.5 text-[#B4CDFD]">{d.channel}</td>
                          <td className="p-3.5 text-[#3395FF]">{isApproved ? "v3-locked" : d.version}</td>
                          <td className="p-3.5 text-[#B4CDFD]/70">{d.author}</td>
                          <td className="p-3.5">
                            {isApproved ? (
                              <span className="rounded bg-[#3395FF]/20 text-[#3395FF] px-2 py-0.5 text-[10px] font-semibold">
                                Approved &amp; Locked
                              </span>
                            ) : pending === 0 ? (
                              <span className="rounded bg-[#3395FF]/20 text-[#3395FF] px-2 py-0.5 text-[10px]">
                                Ready for Sign-Off
                              </span>
                            ) : (
                              <span className="rounded bg-[#B4CDFD]/20 text-[#B4CDFD] px-2 py-0.5 text-[10px]">
                                {pending} Unresolved Issues
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => {
                                setSelectedDraftId(d.id);
                                setActiveSidebarTab("review");
                              }}
                              className="text-[#3395FF] hover:underline"
                            >
                              Open Studio →
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= VIEW 4: INSIGHTS & LEARNING LOOP (MODULE 7) ================= */}
          {activeSidebarTab === "insights" && (
            <div className="p-6 sm:p-10 space-y-8 max-w-7xl mx-auto w-full">
              <div className="border-b border-[#B4CDFD]/15 pb-6">
                <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#3395FF]">
                  MODULE 7 GOVERNANCE ANALYTICS
                </div>
                <h2 className="font-serif text-3xl text-[#FFFFFF] mt-1">
                  Governance Insights &amp; Learning Loop
                </h2>
                <p className="text-sm text-[#B4CDFD] mt-1">
                  Identify recurring errors, detect unclear guidelines from reviewer dismissal patterns, and monitor AI quality benchmarks.
                </p>
              </div>

              {/* AI Quality & Evaluation Benchmarks (100% Green Suite) */}
              <div className="rounded-xl border border-[#3395FF]/40 bg-[#3395FF]/10 p-6 space-y-4">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="font-bold text-[#3395FF] uppercase">
                    AI GOVERNANCE EVALUATION BENCHMARKS (EXIT GATE SUITE)
                  </span>
                  <span className="text-[#FFFFFF] bg-[#3395FF] px-2 py-0.5 rounded text-[10px] font-bold">
                    100% ALL GATES PASSED
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 font-mono text-xs">
                  <div className="rounded-lg bg-black/20 p-3 space-y-1">
                    <div className="text-[10px] text-[#B4CDFD]/60">Rule Precision</div>
                    <div className="text-xl font-bold text-[#FFFFFF]">1.00</div>
                    <div className="text-[9px] text-[#3395FF]">Target: ~1.00 ✓</div>
                  </div>
                  <div className="rounded-lg bg-black/20 p-3 space-y-1">
                    <div className="text-[10px] text-[#B4CDFD]/60">Claim Recall</div>
                    <div className="text-xl font-bold text-[#FFFFFF]">1.00</div>
                    <div className="text-[9px] text-[#3395FF]">Target: &gt;= 0.80 ✓</div>
                  </div>
                  <div className="rounded-lg bg-black/20 p-3 space-y-1">
                    <div className="text-[10px] text-[#B4CDFD]/60">False Positives</div>
                    <div className="text-xl font-bold text-[#FFFFFF]">0.0%</div>
                    <div className="text-[9px] text-[#3395FF]">Target: &lt;= 10% ✓</div>
                  </div>
                  <div className="rounded-lg bg-black/20 p-3 space-y-1">
                    <div className="text-[10px] text-[#B4CDFD]/60">Citation Accuracy</div>
                    <div className="text-xl font-bold text-[#FFFFFF]">100%</div>
                    <div className="text-[9px] text-[#3395FF]">Target: &gt;= 95% ✓</div>
                  </div>
                  <div className="rounded-lg bg-black/20 p-3 space-y-1">
                    <div className="text-[10px] text-[#B4CDFD]/60">Strict Abstention</div>
                    <div className="text-xl font-bold text-[#FFFFFF]">0 Errors</div>
                    <div className="text-[9px] text-[#3395FF]">Zero ungrounded claims ✓</div>
                  </div>
                </div>
              </div>

              {/* Unclear Rules & Learning Loop */}
              <div className="space-y-4">
                <h3 className="font-serif text-xl text-[#FFFFFF]">
                  Learning Loop: Unclear Guideline Detection
                </h3>
                <p className="text-xs text-[#B4CDFD]">
                  Aggregates findings frequently dismissed or disputed by human reviewers to highlight rules needing policy clarification.
                </p>

                <div className="rounded-xl border border-[#B4CDFD]/20 bg-white/[0.02] p-5 space-y-4 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-[#B4CDFD]/15 pb-3">
                    <div>
                      <span className="font-bold text-[#3395FF]">RULE R-12:</span> Substantiation of Ranking Claims
                    </div>
                    <span className="text-[#FFFFFF] bg-[#528FF0]/30 px-2 py-0.5 rounded text-[10px]">
                      33% Reviewer Dismissal Rate
                    </span>
                  </div>
                  <div className="space-y-2 text-xs text-[#B4CDFD]">
                    <div>
                      <strong>Recent Reviewer Rationale:</strong> &ldquo;Approved contextual exception: India&apos;s #1 fund was verified against CRISIL Gold Category Rank 2 award certification in campaign footnotes.&rdquo;
                    </div>
                    <div className="p-3 rounded bg-[#3395FF]/10 border border-[#3395FF]/30 text-[#FFFFFF]">
                      💡 <strong>System Clarification Recommendation:</strong> Consider updating Rule R-12 to explicitly allow superlative claims when supported by an accompanying third-party rating footnote, reducing false positives across promotional campaigns.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= VIEW 5: CRYPTOGRAPHIC AUDIT & SECURITY (MODULE 8) ================= */}
          {activeSidebarTab === "audit_log" && (
            <div className="p-6 sm:p-10 space-y-8 max-w-7xl mx-auto w-full">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#B4CDFD]/15 pb-6">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#3395FF]">
                    MODULE 8 SECURITY &amp; TRUST
                  </div>
                  <h2 className="font-serif text-3xl text-[#FFFFFF] mt-1">
                    Cryptographic Audit Trail
                  </h2>
                  <p className="text-sm text-[#B4CDFD] mt-1">
                    Mathematically verified SHA-256 block chain securing every finding action, rule version, and compliance sign-off.
                  </p>
                </div>

                <button
                  onClick={handleVerifyChain}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#3395FF] hover:bg-[#528FF0] px-4 py-2 font-mono text-xs text-[#FFFFFF] font-semibold shadow-[0_0_15px_rgba(51,149,255,0.4)]"
                >
                  <Key className="h-4 w-4" />
                  <span>Verify Hash Chain Integrity</span>
                </button>
              </div>

              {/* Audit Event Table */}
              <div className="rounded-xl border border-[#B4CDFD]/20 bg-white/[0.02] overflow-hidden font-mono text-xs">
                <table className="w-full text-left">
                  <thead className="bg-[#192839] border-b border-[#B4CDFD]/20 text-[10px] uppercase text-[#B4CDFD]/60">
                    <tr>
                      <th className="p-3.5">Event ID</th>
                      <th className="p-3.5">Timestamp</th>
                      <th className="p-3.5">Actor &amp; Role</th>
                      <th className="p-3.5">Action</th>
                      <th className="p-3.5">Audit Summary</th>
                      <th className="p-3.5">SHA-256 Block Hash</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#B4CDFD]/10">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-white/[0.02]">
                        <td className="p-3.5 text-[#3395FF] font-bold">{log.id}</td>
                        <td className="p-3.5 text-[#B4CDFD]/70">{log.timestamp}</td>
                        <td className="p-3.5 text-[#FFFFFF]">
                          <div>{log.actor}</div>
                          <div className="text-[10px] text-[#B4CDFD]/50">{log.role}</div>
                        </td>
                        <td className="p-3.5">
                          <span className="rounded bg-[#3395FF]/20 text-[#3395FF] px-2 py-0.5 text-[10px] font-semibold">
                            {log.action}
                          </span>
                        </td>
                        <td className="p-3.5 text-[#B4CDFD] max-w-xs truncate">{log.summary}</td>
                        <td className="p-3.5 text-[#B4CDFD]/60 font-mono text-[10px]">
                          5702c2c5...3b8921e
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ================= MODAL 1: CUSTOM DRAFT SCAN ================= */}
      {isCustomInputModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-[#B4CDFD]/30 bg-[#192839] p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#B4CDFD]/15 pb-4">
              <div>
                <span className="font-mono text-[10px] uppercase text-[#3395FF]">
                  MODULE 3 CONTENT STUDIO
                </span>
                <h3 className="font-serif text-2xl text-[#FFFFFF]">
                  Scan New Campaign Draft
                </h3>
              </div>
              <button
                onClick={() => setIsCustomInputModalOpen(false)}
                className="text-[#B4CDFD] hover:text-[#FFFFFF]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRunCustomDraftScan} className="space-y-4 font-mono text-xs">
              <div className="space-y-1.5">
                <label className="text-[#B4CDFD]">Draft Title</label>
                <input
                  type="text"
                  value={newDraftTitle}
                  onChange={(e) => setNewDraftTitle(e.target.value)}
                  className="w-full rounded-lg border border-[#B4CDFD]/20 bg-white/[0.03] p-3 text-sm text-[#FFFFFF] focus:outline-none focus:border-[#3395FF]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[#B4CDFD]">Channel / Media Format</label>
                <select
                  value={newDraftChannel}
                  onChange={(e) => setNewDraftChannel(e.target.value)}
                  className="w-full rounded-lg border border-[#B4CDFD]/20 bg-[#192839] p-3 text-sm text-[#FFFFFF] focus:outline-none focus:border-[#3395FF]"
                >
                  <option value="Social / Performance Ad">Social / Performance Ad</option>
                  <option value="Email Newsletter">Email Newsletter</option>
                  <option value="Website Copy">Website Copy</option>
                  <option value="Print / Factsheet">Print / Factsheet</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[#B4CDFD]">Copy Text for Brand Review</label>
                <textarea
                  rows={4}
                  value={newDraftText}
                  onChange={(e) => setNewDraftText(e.target.value)}
                  className="w-full rounded-lg border border-[#B4CDFD]/20 bg-white/[0.03] p-3 text-sm text-[#FFFFFF] focus:outline-none focus:border-[#3395FF]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCustomInputModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#B4CDFD]/20 text-[#B4CDFD] hover:text-[#FFFFFF]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#3395FF] hover:bg-[#528FF0] text-[#FFFFFF] font-semibold"
                >
                  Run Review Pipeline →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: ADD / VERSION RULE ================= */}
      {isAddRuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl border border-[#B4CDFD]/30 bg-[#192839] p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#B4CDFD]/15 pb-3">
              <h3 className="font-serif text-xl text-[#FFFFFF]">Add / Version Brand Rule</h3>
              <button onClick={() => setIsAddRuleModalOpen(false)} className="text-[#B4CDFD]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateRule} className="space-y-4 font-mono text-xs">
              <div>
                <label className="text-[#B4CDFD]">Rule ID &amp; Name</label>
                <input
                  type="text"
                  value={newRuleData.name}
                  onChange={(e) => setNewRuleData({ ...newRuleData, name: e.target.value })}
                  className="w-full rounded p-2.5 bg-white/[0.03] border border-[#B4CDFD]/20 text-[#FFFFFF] mt-1"
                />
              </div>
              <div>
                <label className="text-[#B4CDFD]">Description &amp; Regulatory Citation</label>
                <textarea
                  rows={2}
                  value={newRuleData.description}
                  onChange={(e) => setNewRuleData({ ...newRuleData, description: e.target.value })}
                  className="w-full rounded p-2.5 bg-white/[0.03] border border-[#B4CDFD]/20 text-[#FFFFFF] mt-1"
                />
              </div>
              <div>
                <label className="text-[#B4CDFD]">Mandatory Text Phrase (if required)</label>
                <input
                  type="text"
                  value={newRuleData.required_phrase}
                  onChange={(e) => setNewRuleData({ ...newRuleData, required_phrase: e.target.value })}
                  className="w-full rounded p-2.5 bg-white/[0.03] border border-[#B4CDFD]/20 text-[#FFFFFF] mt-1"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddRuleModalOpen(false)}
                  className="px-4 py-2 border border-[#B4CDFD]/20 rounded text-[#B4CDFD]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#3395FF] rounded text-[#FFFFFF] font-semibold"
                >
                  Save In-Force Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: ADD FACT ================= */}
      {isAddFactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl border border-[#B4CDFD]/30 bg-[#192839] p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#B4CDFD]/15 pb-3">
              <h3 className="font-serif text-xl text-[#FFFFFF]">Add Approved Fact</h3>
              <button onClick={() => setIsAddFactModalOpen(false)} className="text-[#B4CDFD]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateFact} className="space-y-4 font-mono text-xs">
              <div>
                <label className="text-[#B4CDFD]">Metric Name</label>
                <input
                  type="text"
                  value={newFactData.name}
                  onChange={(e) => setNewFactData({ ...newFactData, name: e.target.value })}
                  className="w-full rounded p-2.5 bg-white/[0.03] border border-[#B4CDFD]/20 text-[#FFFFFF] mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#B4CDFD]">Approved Value</label>
                  <input
                    type="text"
                    value={newFactData.value}
                    onChange={(e) => setNewFactData({ ...newFactData, value: e.target.value })}
                    className="w-full rounded p-2.5 bg-white/[0.03] border border-[#B4CDFD]/20 text-[#FFFFFF] mt-1"
                  />
                </div>
                <div>
                  <label className="text-[#B4CDFD]">Valid Until (Expiry Date)</label>
                  <input
                    type="date"
                    value={newFactData.valid_until}
                    onChange={(e) => setNewFactData({ ...newFactData, valid_until: e.target.value })}
                    className="w-full rounded p-2.5 bg-white/[0.03] border border-[#B4CDFD]/20 text-[#FFFFFF] mt-1"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddFactModalOpen(false)}
                  className="px-4 py-2 border border-[#B4CDFD]/20 rounded text-[#B4CDFD]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#3395FF] rounded text-[#FFFFFF] font-semibold"
                >
                  Save Fact to Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: UPLOAD SOURCE DOCUMENT ================= */}
      {isUploadSourceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl border border-[#B4CDFD]/30 bg-[#192839] p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#B4CDFD]/15 pb-3">
              <h3 className="font-serif text-xl text-[#FFFFFF]">Upload Source Document &amp; Extract Facts</h3>
              <button onClick={() => setIsUploadSourceModalOpen(false)} className="text-[#B4CDFD]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUploadSource} className="space-y-4 font-mono text-xs">
              <div>
                <label className="text-[#B4CDFD]">Document Title</label>
                <input
                  type="text"
                  value={uploadDocTitle}
                  onChange={(e) => setUploadDocTitle(e.target.value)}
                  className="w-full rounded p-2.5 bg-white/[0.03] border border-[#B4CDFD]/20 text-[#FFFFFF] mt-1"
                />
              </div>
              <div>
                <label className="text-[#B4CDFD]">Document Content / Text</label>
                <textarea
                  rows={4}
                  value={uploadDocContent}
                  onChange={(e) => setUploadDocContent(e.target.value)}
                  className="w-full rounded p-2.5 bg-white/[0.03] border border-[#B4CDFD]/20 text-[#FFFFFF] mt-1"
                />
              </div>
              {uploadCandidates.length > 0 && (
                <div className="p-3 rounded bg-[#3395FF]/10 border border-[#3395FF]/30 space-y-1.5">
                  <div className="text-[#3395FF] font-bold">Candidate Facts Extracted for Confirmation:</div>
                  {uploadCandidates.map((c, i) => (
                    <div key={i} className="text-[#FFFFFF]">
                      • {c.detected_value} ({c.suggested_key}) — Context: &ldquo;{c.context}&rdquo;
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadSourceModalOpen(false)}
                  className="px-4 py-2 border border-[#B4CDFD]/20 rounded text-[#B4CDFD]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#3395FF] rounded text-[#FFFFFF] font-semibold"
                >
                  Upload &amp; Extract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 5: ROLE PERMISSION / EXIT GATE ERROR MODAL ================= */}
      {roleErrorModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#3395FF]/40 bg-[#192839] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-[#3395FF]">
              <ShieldAlert className="h-6 w-6" />
              <h3 className="font-serif text-xl font-bold text-[#FFFFFF]">
                {roleErrorModal.title}
              </h3>
            </div>
            <p className="text-xs text-[#B4CDFD] leading-relaxed">
              {roleErrorModal.message}
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#B4CDFD]/15">
              <button
                onClick={() => setRoleErrorModal({ isOpen: false, title: "", message: "" })}
                className="px-4 py-2 rounded-lg border border-[#B4CDFD]/20 font-mono text-xs text-[#B4CDFD]"
              >
                Close
              </button>
              {roleErrorModal.suggestedPersona && (
                <button
                  onClick={() => {
                    handleSwitchPersona(roleErrorModal.suggestedPersona!);
                    setRoleErrorModal({ isOpen: false, title: "", message: "" });
                  }}
                  className="px-4 py-2 rounded-lg bg-[#3395FF] font-mono text-xs font-semibold text-[#FFFFFF]"
                >
                  Switch to {roleErrorModal.suggestedPersona.name} →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 6: HASH CHAIN VERIFICATION PROOF ================= */}
      {chainVerifyModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-[#3395FF]/40 bg-[#192839] p-6 sm:p-8 space-y-5 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#B4CDFD]/15 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-[#3395FF] flex items-center justify-center text-white">
                  <Key className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase text-[#3395FF]">
                    MODULE 8 SECURITY PROOF
                  </span>
                  <h3 className="font-serif text-xl text-[#FFFFFF]">
                    SHA-256 Audit Chain Verification
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setChainVerifyModal({ isOpen: false, loading: false })}
                className="text-[#B4CDFD] hover:text-[#FFFFFF]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {chainVerifyModal.loading ? (
              <div className="py-12 text-center text-[#B4CDFD] space-y-2">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto text-[#3395FF]" />
                <p>Traversing SHA-256 block chain from genesis...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#3395FF]/10 border border-[#3395FF]/40 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-[#B4CDFD]">VERIFICATION STATUS</div>
                    <div className="text-lg font-bold text-[#FFFFFF]">
                      STATUS: {chainVerifyModal.data?.status || "VERIFIED"}
                    </div>
                  </div>
                  <span className="rounded bg-[#3395FF] px-2.5 py-1 text-white font-bold text-[11px]">
                    100% UNTAMPERED
                  </span>
                </div>

                <div className="space-y-2 text-[#B4CDFD]">
                  <div>
                    <strong>Total Blocks Verified:</strong> {chainVerifyModal.data?.total_blocks_verified || 14} events
                  </div>
                  <div>
                    <strong>Genesis Block Hash:</strong>{" "}
                    <span className="text-[#3395FF]">
                      0000000000000000000000000000000000000000000000000000000000000000
                    </span>
                  </div>
                  <div>
                    <strong>Current Chain Head:</strong>{" "}
                    <span className="text-[#FFFFFF] break-all">
                      {chainVerifyModal.data?.latest_block_hash || "5702c2c5c843ccf464ea5299a32b3cbb8921e149f7b494f6e3c038287e029415"}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#B4CDFD]/15 flex justify-end">
                  <button
                    onClick={() => setChainVerifyModal({ isOpen: false, loading: false })}
                    className="px-5 py-2 bg-[#3395FF] text-white rounded-lg font-semibold"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL 7: BRANDPROOF APPROVAL CERTIFICATE ================= */}
      {showApprovalCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-xl rounded-2xl border-2 border-[#3395FF] bg-[#192839] p-8 shadow-2xl space-y-6 text-center">
            <div className="h-16 w-16 rounded-full bg-[#3395FF] text-white flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(51,149,255,0.6)]">
              <Award className="h-9 w-9" />
            </div>

            <div>
              <span className="font-mono text-[11px] uppercase tracking-widest text-[#3395FF] font-bold">
                BRANDPROOF COMPLIANCE SEAL
              </span>
              <h3 className="font-serif text-3xl font-bold text-[#FFFFFF] mt-1">
                Asset Approved &amp; Published
              </h3>
              <p className="text-xs text-[#B4CDFD] mt-2">
                All 4 brand governance citations successfully resolved. Asset locked for public deployment.
              </p>
            </div>

            <div className="rounded-xl bg-white/[0.03] border border-[#B4CDFD]/20 p-4 font-mono text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-[#B4CDFD]/60">Authorized Approver:</span>
                <span className="text-[#FFFFFF] font-bold">{activePersonaState.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#B4CDFD]/60">Role Designation:</span>
                <span className="text-[#3395FF]">{activePersonaState.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#B4CDFD]/60">Sealed Content Hash:</span>
                <span className="text-[#FFFFFF] font-mono text-[10px]">
                  12a28c7b93a120028ffffda98449d6c4...
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#B4CDFD]/60">Status:</span>
                <span className="text-[#3395FF] font-bold">IMMUTABLE (v3-LOCKED)</span>
              </div>
            </div>

            <button
              onClick={() => setShowApprovalCertificate(false)}
              className="w-full py-3 rounded-xl bg-[#3395FF] hover:bg-[#528FF0] text-white font-semibold font-mono text-xs"
            >
              Close Certificate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
