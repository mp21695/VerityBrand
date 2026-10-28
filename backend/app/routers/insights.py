import datetime
from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.database import get_db
from backend.app.models import Finding, ReviewAction, Fact, FactVersion, Rule, Draft, DraftVersion
from backend.app.schemas import InsightsSummaryOut

router = APIRouter(prefix="/insights", tags=["insights"])

@router.get("/summary", response_model=InsightsSummaryOut)
def get_governance_insights(db: Session = Depends(get_db)):
    now = datetime.datetime.utcnow()
    fourteen_days_later = now + datetime.timedelta(days=14)

    # 1. Top Violated Rules
    violation_counts = (
        db.query(Finding.rule_version_id, func.count(Finding.id))
        .filter(Finding.rule_version_id != None)
        .group_by(Finding.rule_version_id)
        .all()
    )
    
    top_violated_rules = []
    for rv_id, count in sorted(violation_counts, key=lambda x: x[1], reverse=True)[:5]:
        top_violated_rules.append({
            "rule_version_id": rv_id,
            "rule_code": rv_id.split("-")[1].upper() if "-" in rv_id else rv_id,
            "violation_count": count
        })

    # 2. Most Dismissed Rules (Learning Loop: Unclear Rules)
    dismissals = (
        db.query(Finding.rule_version_id, Finding.check_type, func.count(Finding.id))
        .filter(Finding.resolution == "dismissed")
        .group_by(Finding.rule_version_id, Finding.check_type)
        .all()
    )

    most_dismissed = []
    for rv_id, ctype, count in dismissals:
        # Get total findings for this rule to compute dismissal percentage
        total_rule_findings = db.query(Finding).filter(Finding.rule_version_id == rv_id).count() or 1
        dismissal_rate = round((count / total_rule_findings) * 100, 1)

        # Get recent dismissal reasons
        reasons = (
            db.query(ReviewAction.reason)
            .join(Finding, ReviewAction.finding_id == Finding.id)
            .filter(Finding.rule_version_id == rv_id, ReviewAction.action == "dismiss")
            .limit(3)
            .all()
        )
        sample_reasons = [r[0] for r in reasons if r[0]]

        rule_code = rv_id.split("-")[1].upper() if rv_id and "-" in rv_id else (rv_id or ctype)
        most_dismissed.append({
            "rule_code": rule_code,
            "rule_version_id": rv_id,
            "check_type": ctype,
            "dismissal_count": count,
            "dismissal_rate_pct": dismissal_rate,
            "is_unclear_rule": dismissal_rate >= 30.0 or count >= 2,
            "sample_reasons": sample_reasons
        })

    # 3. Expiring Facts (Radar for validity < 14 days)
    facts = db.query(Fact).all()
    expiring_facts = []
    for fact in facts:
        latest = (
            db.query(FactVersion)
            .filter(FactVersion.fact_id == fact.id)
            .order_by(FactVersion.created_at.desc())
            .first()
        )
        if latest:
            delta = (latest.valid_until - now).days
            status_badge = "green"
            if delta < 0:
                status_badge = "red"
            elif delta <= 14:
                status_badge = "amber"

            if delta <= 14 or status_badge in ["amber", "red"]:
                expiring_facts.append({
                    "fact_id": fact.id,
                    "key": fact.key,
                    "name": fact.name,
                    "current_value": latest.value,
                    "valid_until": latest.valid_until.strftime("%Y-%m-%d"),
                    "days_remaining": delta,
                    "status_badge": status_badge,
                    "source_doc_id": latest.source_doc_id
                })

    # Drafts summary
    total_drafts = db.query(Draft).count()
    total_approved = db.query(DraftVersion).filter(DraftVersion.status == "approved").count()
    total_findings = db.query(Finding).count()
    resolved_findings = db.query(Finding).filter(Finding.resolution != "unresolved").count()
    avg_resolution_rate = round((resolved_findings / max(total_findings, 1)) * 100, 1)

    return {
        "top_violated_rules": top_violated_rules,
        "most_dismissed_rules": most_dismissed,
        "expiring_facts": expiring_facts,
        "total_drafts": total_drafts,
        "total_approved": total_approved,
        "avg_resolution_rate": avg_resolution_rate
    }
