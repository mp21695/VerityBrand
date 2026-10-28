# VerityBrand
> **Evidence-Backed AI for Brand Governance**  
> *Team L.O.V.E M.U.F.F.I.N* • Round 2 MVP

VerityBrand checks promotional content against approved brand rules, verifies financial claims against audited ledgers and factsheets, and keeps every compliance approval provably traceable with cryptographic tamper-evidence.

---

## 🚀 Key Highlights & Architecture

| Layer | Technology | Role & Invariants |
|---|---|---|
| **Frontend** | Next.js 14 (App Router) + TypeScript + Tailwind CSS | Hero Review Workspace, Brand Brain, Drafts Registry, Cryptographic Audit Trail, Governance Insights |
| **API** | FastAPI + Pydantic v2 | Versioned rule management, role-based access control (RBAC), and audit transaction middleware |
| **Data Engine** | Append-Only SQLite & PostgreSQL 16 (pgvector) | Strict append-only versioning for rules (`R-07 v2.0`), facts (`F-021`), and audit chain (`prev_hash` $\to$ `curr_hash`) |
| **Analysis Pipeline** | Rule Engine + Grounded AI + Finding Builder | Parallel deterministic regex/phrase checks, hybrid vector retrieval, and intent-preserving fixes |
| **Security & AI Ethics** | Strict Abstention & SHA-256 Hash Chain | Never outputs unsupported "false" verdicts; brand data is never used for model training |

---

## 🎬 3-Minute Demo Walkthrough Script

Follow these steps for the evaluation demonstration:

1. **Brand Brain Exploration (`/brand-brain`)**:
   - Inspect rule **`R-07`**: prohibition on guaranteed returns (in-force **v2.0**, with deprecated v1.0 history preserved).
   - Inspect fact **`F-021`** (`fund.gold.aum`): audited ledger value `₹3,850 crore` carrying a **30 Jun 2026** expiry badge.
   - Inspect source document **`E-014`**: audited Q1 FY26 factsheet with its cryptographic SHA-256 hash.

2. **Draft Submission & Analysis (`/`)**:
   - Creator **Riya Sharma** pastes the *Arthaa Gold Savings Fund* promotional copy:
     > *"Invest in Arthaa Gold Savings Fund today with guaranteed 12% returns. With an AUM of ₹4,200 crore, it is India's #1 fund for secure wealth generation."*
   - Click **"Analyze Copy"**: The pipeline runs deterministic checks and grounded claim verification, yielding **4 cited findings**:
     1. `R-07 v2.0`: Confirmed violation on *"guaranteed 12% returns"* (SEBI Clause 7B).
     2. `F-021`: Factual contradiction on *"₹4,200 crore"* against audited ledger `₹3,850 crore`.
     3. `R-12 v1.0`: Tone / ranking check on *"India's #1 fund"* flagged for human review.
     4. `R-02 v1.0`: Missing mandatory statutory SEBI market risk disclaimer.

3. **Interactive Resolution (Human-in-the-Loop)**:
   - Accept the intent-preserving fix for **`R-07`** (diff shows: *"target returns of 12% (historical average)"* — growth appeal preserved!).
   - Click **Edit** on **`F-021`** to update the AUM figure to `₹3,850 crore`.
   - Click **Dismiss** on **`R-12`** with reason: *"Approved by VP Legal for festive campaign"* (feeds into the Learning Loop!).
   - Accept the statutory disclaimer for **`R-02`**.

4. **Compliance Sign-Off & Approval Lock**:
   - While any finding is unresolved, the **Approve Button** is locked.
   - When Riya (Creator) is active, approval is restricted to Compliance Owners.
   - Switch persona to **Arjun Patel (Compliance Owner)** in the top navbar: Click **"Sign & Lock Compliance Approval"**.
   - The version is sealed with an immutable content hash.

5. **Tamper-Evident Audit Log (`/audit`) & Insights (`/insights`)**:
   - In `/audit`, view the SHA-256 cryptographic hash chain verifying each human decision linked to `R-07 v2.0` and `F-021`. Click **"Verify Hash Chain Integrity"**.
   - In `/insights`, observe the **Learning Loop** flagging `R-12` as an **Unclear Rule** (dismissed > 30% of the time).

---

## 🛠️ Quickstart & Execution

### Option 1: Docker Compose (One Command)
```bash
docker compose up --build
```
- Web Application: **http://localhost:3001**
- API & Swagger Docs: **http://localhost:8000/docs**

### Option 2: Local Development (Windows / macOS / Linux)

#### 1. Backend (FastAPI)
```bash
# In project root
python -m venv backend/venv
backend\venv\Scripts\activate
pip install -r backend/requirements.txt
python -m backend.app.seed_data
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### 2. Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:3001
```

---

## 🧪 Automated Evaluation Suite & CI Gate

Run the automated evaluation test suite to verify Round 2 quality metrics:
```bash
python eval_pipeline.py
```

### Benchmark Results
- **Round 2 Exit Gate (Gold Savings Fund)**: All 4 findings cited with exact version IDs (`rv-r07-v20`, `fv-f021-v10`, `rv-r12-v10`, `rv-r02-v10`) `[PASSED]`
- **Rule Engine Precision**: `1.00` (Target: near 1.0) `[PASSED]`
- **Claim Check Recall**: `1.00` (Target: >= 0.8) `[PASSED]`
- **False Positive Rate**: `0.0%` (Target: <= 10%) `[PASSED]`
- **Citation Accuracy**: `100%` (Target: >= 95%) `[PASSED]`
- **Strict Abstention Check**: Zero unverified contradictory verdicts `[PASSED]`
- **Approval Lock Gate**: 403 Forbidden enforced on unresolved findings & unauthorized roles `[PASSED]`
- **Cryptographic Hash Chain**: SHA-256 block chain mathematically verified `[PASSED]`

---

## 🔒 Responsible AI & Privacy Notice
- **Zero Training On User Data**: Brand guidelines, finance ledgers, and marketing copy are strictly isolated within workspace tenants and are never used for model training.
- **Strict Abstention**: Lack of evidence produces a *"Needs Verification"* state, never an unsupported hallucinated verdict.
- **Explainability**: Every finding clearly states **What**, **Why**, and cites the exact approved **Source/Rule Version**.
