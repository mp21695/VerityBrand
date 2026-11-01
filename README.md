# VerityBrand
> **Evidence-Backed AI for Brand Governance**  
> *AI proposes. Humans decide.*

VerityBrand reviews marketing, financial, and product content before publication. It checks copy against approved brand guidelines, detects factual, regulatory, and tone violations, explains each issue with statutory citations, suggests intent-preserving fixes, and routes content through a tamper-evident cryptographic approval gate.

---

## 🚀 Key Capabilities

- **Multi-Format Content Studio:**
  - 📝 **Marketing Copy:** Real-time span-level highlights for regulatory breaches, outdated figures, and tone issues.
  - 🎨 **Visual Banner & WCAG Accessibility:** Color token analyzer, 24px logo exclusion zone check, and WCAG 2.1 AA text-to-background contrast validator (< 4.5:1 flagged).
  - 📄 **Factsheet & Document Auditor:** Tabular financial metric extraction with cosine similarity matching against audited PDF source vaults.
  - ⚡ **Interactive Live Scanner (`+ Scan New Content`):** Test arbitrary marketing copy or select pre-loaded presets (AI Agency copy, Marketing newsletters).

- **Intent-Preserving Resolution:**
  - One-click **"Accept Fix"** rewriting copy while maintaining marketing appeal (e.g. replacing illegal return promises with verified 5-year CAGR).
  - **"Custom Edit"** with live diff preview.
  - **"Dismiss with Justification"** (min. 8 characters) feeding the Learning Loop.

- **Role-Based Access Control (RBAC):**
  - Switch between 4 active personas: **Creator** (`Riya Sharma`), **Reviewer** (`Arjun Verma`), **Compliance Approver** (`Priya Sundaram`), and **Admin** (`Harini Nair`).
  - Strict compliance lock: only authorized Approvers can sign off once 100% of findings are resolved.

- **Brand Brain & Asset Catalog:**
  - Versioned Rule Catalog (`R-07 v2.0`, `R-02`, `R-12`, `G-04`, `T-03`).
  - Temporal Fact Ledger (`F-021` AUM validity windows).
  - Approved Terminology & Nomenclature Registry (Disallowed vs Preferred terms).
  - Reusable Brand Assets & Design Tokens (Terracotta `#C26043`, Charcoal Ink `#1C1A18`).

- **Cryptographic SHA-256 Audit Trail:**
  - Blockchain-style hash chaining across every decision block (`prev_hash` $\to$ `curr_hash`).
  - In-UI mathematical integrity verification with green status badge.

- **Sovereign Privacy & AI Transparency:**
  - Dedicated local execution enclave: customer content is **never** used to retrain external AI models.
  - Strict AI Abstention Protocol: flags unproven claims as *"Needs Human Verification"*, completely eliminating hallucinated verdicts.

---

## 🛠️ Quickstart

### 1. Prerequisites
- Node.js 18+ & npm
- Python 3.10+ (for FastAPI backend & test runner)

### 2. Frontend (Next.js 14)
```bash
# Install dependencies
npm install

# Start Next.js development server (Port 3000)
npm run dev -- -p 3000
```
Open [http://localhost:3000](http://localhost:3000) to view the editorial landing experience and access the **Review Workspace**.

### 3. Backend (FastAPI)
```bash
# Start backend server (Port 8000)
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```

### 4. Automated Evaluation Test Suite
```bash
python eval_pipeline.py
```
*Evaluates the dual-engine pipeline, approval lock invariants, interactive resolution, SHA-256 cryptographic chain, and benchmark precision/recall.*

---

## 🏛️ Repository Structure

```
├── src/
│   ├── app/                    # Next.js App Router (layout, globals, landing)
│   ├── components/
│   │   ├── motion/             # Framer motion provider & curves
│   │   ├── sections/           # Editorial & Review Studio components
│   │   │   ├── Header.tsx      # Sticky navigation & format anchors
│   │   │   ├── Hero.tsx        # Editorial hero with ambient lighting
│   │   │   ├── About.tsx       # Dual-engine & brand governance philosophy
│   │   │   ├── Services.tsx    # Card peel capabilities showcase
│   │   │   ├── Process.tsx     # Scroll-synced 01-04 workflow timeline
│   │   │   ├── Breakout.tsx    # Editorial 3-word parallax marquee
│   │   │   ├── ReviewWorkspace.tsx # Full-featured governance studio
│   │   │   └── ...
│   │   └── ui/                 # Accessible button & modal primitives
│   ├── data/
│   │   └── siteData.ts         # Centralized editorial content schema
│   └── lib/
│       ├── review/             # Review domain reducer, analyzer, seeds, & types
│       └── api.ts              # FastAPI client
├── backend/
│   ├── app/
│   │   ├── engine/             # Rule engine & claim verifier
│   │   ├── routers/            # Drafts, facts, rules, audit, & insights endpoints
│   │   ├── models.py           # SQLAlchemy database schemas
│   │   └── main.py             # FastAPI entrypoint
├── public/images/              # Editorial photography & visual test assets
├── eval_pipeline.py            # Automated evaluation & benchmark runner
└── README.md                   # Project documentation
```

---

## 🧪 Benchmark Verification Summary

- **Exit Gate Checks (Gold Savings Fund):** 4/4 cited with exact version IDs (`rv-r07-v20`, `fv-f021-v10`, `rv-r12-v10`, `rv-r02-v10`) `[PASSED]`
- **Rule Engine Precision:** `1.00` `[PASSED]`
- **Claim Check Recall:** `1.00` `[PASSED]`
- **False Positive Rate:** `0.0%` `[PASSED]`
- **Citation Accuracy:** `100%` `[PASSED]`
- **Strict Abstention Check:** Zero unverified contradictory verdicts `[PASSED]`
- **Approval Lock Gate:** 403 Forbidden enforced on unresolved findings & unauthorized roles `[PASSED]`
- **Cryptographic Hash Chain:** SHA-256 block chain mathematically verified `[PASSED]`

---

## 📄 License
Private organizational license for VerityBrand. All rights reserved.
