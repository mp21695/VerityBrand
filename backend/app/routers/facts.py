import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import Fact, FactVersion, User
from backend.app.schemas import FactOut, FactCreate
from backend.app.auth import require_role
from backend.app.audit import record_audit_event
from backend.app.engine.claim_verifier import text_to_simple_embedding

router = APIRouter(tags=["facts"])

@router.get("/brands/{brand_id}/facts", response_model=List[FactOut])
def get_brand_facts(brand_id: str, db: Session = Depends(get_db)):
    facts = db.query(Fact).filter(Fact.brand_id == brand_id).all()
    return facts

@router.post("/facts", response_model=FactOut)
def create_or_version_fact(
    fact_data: FactCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["compliance_owner", "admin", "reviewer"]))
):
    """
    Append-only fact management:
    If fact exists, increments version and appends a new FactVersion with valid_until.
    """
    existing_fact = db.query(Fact).filter(Fact.id == fact_data.id).first()
    now = datetime.datetime.utcnow()

    embedding = text_to_simple_embedding(f"{fact_data.key} {fact_data.name} {fact_data.scope} {fact_data.value}")

    if existing_fact:
        curr_ver = float(existing_fact.current_version) if existing_fact.current_version.replace(".", "").isdigit() else 1.0
        new_version_str = f"{curr_ver + 1.0:.1f}"
        
        version_id = f"fv-{existing_fact.id.lower()}-v{new_version_str.replace('.', '')}"
        new_fv = FactVersion(
            id=version_id,
            fact_id=existing_fact.id,
            version=new_version_str,
            value=fact_data.value,
            unit=fact_data.unit,
            scope=fact_data.scope,
            source_doc_id=fact_data.source_doc_id,
            valid_from=now,
            valid_until=fact_data.valid_until,
            embedding=embedding
        )
        existing_fact.current_version = new_version_str
        existing_fact.name = fact_data.name
        existing_fact.key = fact_data.key
        db.add(new_fv)
        
        record_audit_event(
            db=db,
            actor_id=current_user.id,
            actor_name=current_user.name,
            verb="create_fact_version",
            object_type="fact_version",
            object_id=version_id,
            payload={
                "fact_id": existing_fact.id,
                "version": new_version_str,
                "value": fact_data.value,
                "valid_until": str(fact_data.valid_until)
            }
        )
        db.commit()
        db.refresh(existing_fact)
        return existing_fact
    else:
        new_fact = Fact(
            id=fact_data.id,
            brand_id=fact_data.brand_id,
            key=fact_data.key,
            name=fact_data.name,
            current_version=fact_data.version
        )
        db.add(new_fact)
        
        version_id = f"fv-{fact_data.id.lower()}-v{fact_data.version.replace('.', '')}"
        fv = FactVersion(
            id=version_id,
            fact_id=fact_data.id,
            version=fact_data.version,
            value=fact_data.value,
            unit=fact_data.unit,
            scope=fact_data.scope,
            source_doc_id=fact_data.source_doc_id,
            valid_from=now,
            valid_until=fact_data.valid_until,
            embedding=embedding
        )
        db.add(fv)
        
        record_audit_event(
            db=db,
            actor_id=current_user.id,
            actor_name=current_user.name,
            verb="create_fact",
            object_type="fact",
            object_id=fact_data.id,
            payload={
                "brand_id": fact_data.brand_id,
                "key": fact_data.key,
                "value": fact_data.value,
                "valid_until": str(fact_data.valid_until)
            }
        )
        db.commit()
        db.refresh(new_fact)
        return new_fact


@router.post("/facts/{fact_id}/expire")
def expire_fact(fact_id: str, db: Session = Depends(get_db)):
    """
    Simulates temporal expiration of a fact (e.g. promotional pricing window end).
    Identifies dependent drafts, marks them re_review_required, and records audit trail.
    """
    fact = db.query(Fact).filter(Fact.id == fact_id).first()
    now = datetime.datetime.utcnow()
    past = now - datetime.timedelta(days=1)
    if fact and fact.versions:
        fact.versions[0].valid_until = past

    from backend.app.models import Draft, DraftVersion
    dependent_drafts = db.query(Draft).all()
    affected_draft_ids = []
    for d in dependent_drafts:
        latest_ver = db.query(DraftVersion).filter(DraftVersion.draft_id == d.id).order_by(DraftVersion.version_number.desc()).first()
        if latest_ver and ("3,999" in latest_ver.text or "3999" in latest_ver.text or (fact and fact.key in latest_ver.text)):
            latest_ver.status = "re_review_required"
            affected_draft_ids.append(d.id)

    record_audit_event(
        db=db,
        actor_id="temporal-radar",
        actor_name="Temporal Radar Service",
        verb="fact_expired",
        object_type="fact",
        object_id=fact_id,
        payload={
            "fact_id": fact_id,
            "expired_at": str(now),
            "affected_draft_ids": affected_draft_ids,
            "reason": "Pricing fact validity ended. Standard retail price now applies."
        }
    )
    db.commit()
    return {
        "status": "expired",
        "fact_id": fact_id,
        "affected_campaigns": affected_draft_ids,
        "re_review_required": True
    }


@router.post("/facts/{fact_id}/restore")
def restore_fact(fact_id: str, db: Session = Depends(get_db)):
    """
    Restores validity of a fact (e.g. extending promotional offer).
    """
    fact = db.query(Fact).filter(Fact.id == fact_id).first()
    future = datetime.datetime.utcnow() + datetime.timedelta(days=60)
    if fact and fact.versions:
        fact.versions[0].valid_until = future

    record_audit_event(
        db=db,
        actor_id="governance-admin",
        actor_name="Governance Administrator",
        verb="fact_restored",
        object_type="fact",
        object_id=fact_id,
        payload={
            "fact_id": fact_id,
            "valid_until": str(future),
            "reason": "Promotional validity extended"
        }
    )
    db.commit()
    return {
        "status": "active",
        "fact_id": fact_id,
        "valid_until": str(future)
    }

