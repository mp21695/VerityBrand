"use client";

import React from "react";
import { X, ShieldCheck, Database, Cpu, Lock } from "lucide-react";

interface DocsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchWorkspace: () => void;
}

export default function DocsModal({ isOpen, onClose, onLaunchWorkspace }: DocsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#192839]/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bento-card w-full max-w-4xl rounded-2xl border border-[#B4CDFD]/30 bg-[#192839] p-6 sm:p-8 shadow-2xl my-8 max-h-[90vh] overflow-y-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#B4CDFD]/20 pb-4 sticky top-0 bg-[#192839]/95 backdrop-blur py-2 z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3395FF] text-[#FFFFFF]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase text-[#3395FF]">
                BRANDPROOF APPLICATION SPECIFICATION &amp; ROADMAP
              </span>
              <h3 className="text-xl font-bold text-[#FFFFFF]">
                Evidence-Backed Brand Governance Architecture
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#B4CDFD] hover:text-[#FFFFFF] hover:bg-[#528FF0]/15"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 30-Second Judge Walkthrough */}
        <div className="rounded-2xl border border-[#3395FF]/45 bg-[#3395FF]/10 p-5 space-y-3">
          <div className="font-mono text-xs font-bold uppercase text-[#3395FF]">
            ⚡ 30-SECOND JUDGE WALKTHROUGH (CORE SCORED PATH)
          </div>
          <ol className="list-decimal list-inside space-y-1.5 text-xs sm:text-sm text-[#FFFFFF] leading-relaxed">
            <li>
              <strong>Inspect Pre-Loaded Campaign:</strong> Open the{" "}
              <code className="text-[#B4CDFD]">Arthaa Finserv / Q4 Campaign / Gold Savings Fund v2</code> workspace.
            </li>
            <li>
              <strong>Click Inline Highlights:</strong> Click <code className="text-[#3395FF]">guaranteed 12% returns</code>, <code className="text-[#B4CDFD]">India&apos;s #1 fund</code>, or <code className="text-[#528FF0]">Rs 4,200 crore</code> highlights to focus the corresponding cited finding card and side-by-side diff drawer.
            </li>
            <li>
              <strong>Resolve Findings (Human-in-the-Loop):</strong> Click{" "}
              <code className="text-[#3395FF]">[Accept]</code> to apply intent-preserving fixes live in the draft, <code className="text-[#FFFFFF]">[Edit]</code> to customize copy, or <code className="text-[#B4CDFD]">[Dismiss]</code> with a logged compliance justification.
            </li>
            <li>
              <strong>Unlock Final Sign-Off:</strong> Once all 4 findings reach <code className="text-[#3395FF]">4 of 4 resolved</code>, the locked <strong>&ldquo;Approve &amp; Sign Off&rdquo;</strong> button unlocks. Click it to issue a versioned v3 sign-off certificate and inspect the <strong>Audit Log</strong>.
            </li>
          </ol>
        </div>

        {/* Architecture Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-[#B4CDFD]/20 bg-[#FFFFFF] p-4 space-y-2">
            <div className="flex items-center gap-2 font-mono text-xs font-semibold text-[#3395FF]">
              <Cpu className="h-4 w-4" />
              <span>1. PARALLEL ANALYZER</span>
            </div>
            <p className="text-xs text-[#2A2A2A] leading-relaxed">
              Combines a deterministic <strong>Rule Engine</strong> (banned phrases, mandatory SEBI disclaimers, expiry date math) with <strong>Grounded AI</strong> (claim extraction, pgvector evidence retrieval, tone checks).
            </p>
          </div>

          <div className="rounded-xl border border-[#B4CDFD]/20 bg-[#FFFFFF] p-4 space-y-2">
            <div className="flex items-center gap-2 font-mono text-xs font-semibold text-[#528FF0]">
              <Database className="h-4 w-4" />
              <span>2. EXPIRING FACT LEDGER</span>
            </div>
            <p className="text-xs text-[#2A2A2A] leading-relaxed">
              Every statistic (e.g., <code>Fact F-021</code> AUM) stores a <code>valid_until</code> timestamp. Lapsed figures are intercepted before publication and paired with refreshed audited numbers.
            </p>
          </div>

          <div className="rounded-xl border border-[#B4CDFD]/20 bg-[#FFFFFF] p-4 space-y-2">
            <div className="flex items-center gap-2 font-mono text-xs font-semibold text-[#3395FF]">
              <Lock className="h-4 w-4" />
              <span>3. ABSTENTION &amp; LOCK</span>
            </div>
            <p className="text-xs text-[#2A2A2A] leading-relaxed">
              When no approved source supports a claim (<code>India&apos;s #1 fund</code>), BrandProof abstains from an unsupported verdict and flags <strong>Needs Verification</strong>.
            </p>
          </div>
        </div>

        {/* Finding Record Schema */}
        <div className="rounded-xl bg-[#192839] border border-[#B4CDFD]/25 p-4 font-mono text-xs">
          <div className="text-[#B4CDFD] mb-2">
            // POSTGRESQL + PGVECTOR FINDING RECORD SCHEMA
          </div>
          <pre className="text-[#3395FF] overflow-x-auto">
{`{
  "finding_id": "F-0412",
  "draft_version": "v2",
  "span": [22, 44],
  "check_type": "rule",
  "status": "confirmed_violation",
  "severity": "critical",
  "rule_id": "R-07",
  "rule_version": "3.0",
  "evidence_ids": ["E-014"],
  "confidence": 1.00,
  "suggested_fix": "long-term, market-linked investing*",
  "reviewer_action": "accept | edit | dismiss",
  "decided_by": "arjun_m"
}`}
          </pre>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="rounded-xl border border-[#B4CDFD]/30 px-4 py-2 text-xs font-mono text-[#B4CDFD] hover:text-[#FFFFFF]"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onLaunchWorkspace();
            }}
            className="rounded-xl bg-[#3395FF] hover:bg-[#528FF0] px-5 py-2 text-xs font-semibold text-[#FFFFFF]"
          >
            Launch Interactive Workspace →
          </button>
        </div>
      </div>
    </div>
  );
}
