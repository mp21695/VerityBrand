import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import Rule, RuleVersion, gen_uuid, User
from backend.app.schemas import RuleOut, RuleCreate, RuleVersionCreate, RuleVersionOut
from backend.app.auth import get_current_user, require_role
from backend.app.audit import record_audit_event

router = APIRouter(tags=["rules"])

@router.get("/brands/{brand_id}/rules", response_model=List[RuleOut])
def get_brand_rules(brand_id: str, db: Session = Depends(get_db)):
    rules = db.query(Rule).filter(Rule.brand_id == brand_id).all()
    return rules

@router.post("/rules", response_model=RuleOut)
def create_or_version_rule(
    rule_data: RuleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["compliance_owner", "admin", "reviewer"]))
):
    """
    Append-only rule creation:
    If rule exists, increments version (e.g. 1.0 -> 2.0) and creates a new RuleVersion.
    If new rule, creates Rule and RuleVersion.
    """
    existing_rule = db.query(Rule).filter(Rule.id == rule_data.id).first()
    now = datetime.datetime.utcnow()

    if existing_rule:
        # Determine next version
        curr_ver = float(existing_rule.current_version) if existing_rule.current_version.replace(".", "").isdigit() else 1.0
        new_version_str = f"{curr_ver + 1.0:.1f}"
        
        # Expire older active versions
        for v in existing_rule.versions:
            if not v.effective_to or v.effective_to > now:
                v.effective_to = now
                
        version_id = f"rv-{existing_rule.id.lower()}-v{new_version_str.replace('.', '')}"
        new_ver = RuleVersion(
            id=version_id,
            rule_id=existing_rule.id,
            version=new_version_str,
            pattern_params=rule_data.pattern_params,
            description=rule_data.description,
            severity=rule_data.severity,
            effective_from=now,
            created_by=current_user.name
        )
        existing_rule.current_version = new_version_str
        existing_rule.name = rule_data.name
        existing_rule.type = rule_data.type
        db.add(new_ver)
        
        # Record Audit Event
        record_audit_event(
            db=db,
            actor_id=current_user.id,
            actor_name=current_user.name,
            verb="create_rule_version",
            object_type="rule_version",
            object_id=version_id,
            payload={
                "rule_id": existing_rule.id,
                "version": new_version_str,
                "description": rule_data.description,
                "severity": rule_data.severity
            }
        )
        db.commit()
        db.refresh(existing_rule)
        return existing_rule

    else:
        new_rule = Rule(
            id=rule_data.id,
            brand_id=rule_data.brand_id,
            name=rule_data.name,
            type=rule_data.type,
            current_version=rule_data.version
        )
        db.add(new_rule)
        
        version_id = f"rv-{rule_data.id.lower()}-v{rule_data.version.replace('.', '')}"
        rule_version = RuleVersion(
            id=version_id,
            rule_id=rule_data.id,
            version=rule_data.version,
            pattern_params=rule_data.pattern_params,
            description=rule_data.description,
            severity=rule_data.severity,
            effective_from=now,
            created_by=current_user.name
        )
        db.add(rule_version)
        
        # Audit event
        record_audit_event(
            db=db,
            actor_id=current_user.id,
            actor_name=current_user.name,
            verb="create_rule",
            object_type="rule",
            object_id=rule_data.id,
            payload={
                "brand_id": rule_data.brand_id,
                "version": rule_data.version,
                "type": rule_data.type
            }
        )
        db.commit()
        db.refresh(new_rule)
        return new_rule

@router.get("/brands/{brand_id}/glossary")
def get_brand_glossary(brand_id: str, db: Session = Depends(get_db)):
    from backend.app.models import GlossaryTerm
    return db.query(GlossaryTerm).filter(GlossaryTerm.brand_id == brand_id).all()

@router.post("/glossary")
def create_glossary_term(
    term_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["compliance_owner", "admin", "reviewer"]))
):
    from backend.app.models import GlossaryTerm, gen_uuid
    term = GlossaryTerm(
        id=gen_uuid("gt-"),
        brand_id=term_data.get("brand_id", "brand_arthaa"),
        preferred=term_data.get("preferred", ""),
        disallowed_variants=term_data.get("disallowed_variants", []),
        category=term_data.get("category", "General Terminology")
    )
    db.add(term)
    db.commit()
    db.refresh(term)
    return term
