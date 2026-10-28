import datetime
import uuid
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app.database import SessionLocal
from backend.app.models import DraftVersion, Finding, AuditEvent
from backend.app.engine.rule_engine import RuleEngine
from backend.app.engine.claim_verifier import GroundedClaimVerifier
from backend.app.engine.finding_builder import FindingBuilder
from backend.app.engine.fix_generator import FixGenerator
from backend.app.audit import record_audit_event

# In-memory job state store (can connect to Redis if available)
JOB_STORE: Dict[str, Dict[str, Any]] = {}

def run_analysis_pipeline(draft_version_id: str, actor_id: str = "system", actor_name: str = "Analysis Worker") -> Dict[str, Any]:
    """
    Executes the full Round 2 analysis pipeline:
    1. Rule Engine (deterministic)
    2. Grounded AI (evidence retrieval & claim verification)
    3. Finding Builder (merge, span deduplication, citation enforcement)
    4. Fix Generator (intent-preserving fixes + rule re-check)
    """
    db: Session = SessionLocal()
    try:
        draft_version = db.query(DraftVersion).filter(DraftVersion.id == draft_version_id).first()
        if not draft_version:
            raise ValueError(f"DraftVersion {draft_version_id} not found")

        draft = draft_version.draft
        brand_id = draft.brand_id
        text = draft_version.text

        # 1. Rule Engine
        rule_engine = RuleEngine(db, brand_id)
        deterministic_findings = rule_engine.run(text)

        # 2. Grounded Claim Verification
        claim_verifier = GroundedClaimVerifier(db, brand_id)
        grounded_findings = claim_verifier.verify_claims(text)

        # 3. Finding Builder
        merged_findings = FindingBuilder.merge_and_deduplicate(
            deterministic_findings,
            grounded_findings,
            draft_version_id
        )

        # 4. Intent-Preserving Fix validation
        fix_generator = FixGenerator(rule_engine)
        final_findings = []
        for f in merged_findings:
            if f.get("suggested_fix"):
                fix_res = fix_generator.generate_and_validate_fix(
                    full_text=text,
                    span_text=f["span_text"],
                    violation_type=f["check_type"],
                    explanation=f["explanation"],
                    preliminary_fix=f["suggested_fix"]
                )
                f["suggested_fix"] = fix_res["suggested_fix"]
                if fix_res.get("intent_note"):
                    f["intent_note"] = fix_res["intent_note"]
            final_findings.append(f)

        # Clear existing findings for this version (if re-analyzing)
        db.query(Finding).filter(Finding.draft_version_id == draft_version_id).delete()

        # Insert new findings
        for f_data in final_findings:
            finding = Finding(
                id=f_data["id"],
                draft_version_id=draft_version_id,
                span_start=f_data["span_start"],
                span_end=f_data["span_end"],
                span_text=f_data["span_text"],
                check_type=f_data["check_type"],
                status=f_data["status"],
                resolution="unresolved",
                severity=f_data["severity"],
                rule_version_id=f_data["rule_version_id"],
                fact_version_id=f_data["fact_version_id"],
                evidence_ids=f_data["evidence_ids"],
                confidence=f_data["confidence"],
                suggested_fix=f_data["suggested_fix"],
                explanation=f_data["explanation"],
                intent_note=f_data["intent_note"],
                model_meta=f_data["model_meta"]
            )
            db.add(finding)

        # Update draft status
        draft_version.status = "in_review"

        # Record Audit Event inside same transaction
        record_audit_event(
            db=db,
            actor_id=actor_id,
            actor_name=actor_name,
            verb="analyze",
            object_type="draft_version",
            object_id=draft_version_id,
            payload={
                "findings_count": len(final_findings),
                "statuses": [f["status"] for f in final_findings],
                "rules_cited": [f["rule_version_id"] for f in final_findings if f["rule_version_id"]],
                "facts_cited": [f["fact_version_id"] for f in final_findings if f["fact_version_id"]]
            }
        )

        db.commit()
        return {
            "draft_version_id": draft_version_id,
            "status": "completed",
            "findings_count": len(final_findings)
        }
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()
