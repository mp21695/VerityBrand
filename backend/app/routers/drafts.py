import hashlib
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import Draft, DraftVersion, Finding, Approval, User, gen_uuid
from backend.app.schemas import (
    DraftCreate, DraftOut, DraftVersionCreate, DraftVersionOut, JobOut, ApprovalOut
)
from backend.app.auth import get_current_user, require_role
from backend.app.audit import record_audit_event
from backend.app.workers.tasks import run_analysis_pipeline, JOB_STORE

router = APIRouter(tags=["drafts"])

@router.get("/drafts", response_model=List[DraftOut])
def list_drafts(brand_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Draft)
    if brand_id:
        query = query.filter(Draft.brand_id == brand_id)
    return query.order_by(Draft.created_at.desc()).all()

@router.get("/drafts/{draft_id}", response_model=DraftOut)
def get_draft(draft_id: str, db: Session = Depends(get_db)):
    draft = db.query(Draft).filter(Draft.id == draft_id).first()
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")
    return draft

@router.post("/drafts", response_model=DraftOut)
def create_draft(
    data: DraftCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    draft_id = gen_uuid("draft-")
    version_id = f"dv-{draft_id}-v1"
    content_hash = hashlib.sha256(data.text.encode("utf-8")).hexdigest()

    draft = Draft(
        id=draft_id,
        brand_id=data.brand_id,
        title=data.title,
        campaign=data.campaign,
        creator_id=current_user.id,
        current_version_number=1
    )
    db.add(draft)

    draft_version = DraftVersion(
        id=version_id,
        draft_id=draft_id,
        version_number=1,
        text=data.text,
        status="draft",
        content_hash=content_hash
    )
    db.add(draft_version)

    record_audit_event(
        db=db,
        actor_id=current_user.id,
        actor_name=current_user.name,
        verb="create_draft",
        object_type="draft",
        object_id=draft_id,
        payload={
            "title": data.title,
            "campaign": data.campaign,
            "version_number": 1,
            "content_hash": content_hash
        }
    )
    db.commit()
    db.refresh(draft)
    return draft

@router.post("/drafts/{draft_id}/versions", response_model=DraftVersionOut)
def create_draft_version(
    draft_id: str,
    data: DraftVersionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    draft = db.query(Draft).filter(Draft.id == draft_id).first()
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")

    next_ver_num = (draft.current_version_number or 1) + 1
    draft.current_version_number = next_ver_num
    version_id = f"dv-{draft_id}-v{next_ver_num}"
    content_hash = hashlib.sha256(data.text.encode("utf-8")).hexdigest()

    new_version = DraftVersion(
        id=version_id,
        draft_id=draft_id,
        version_number=next_ver_num,
        text=data.text,
        status="draft",
        content_hash=content_hash
    )
    db.add(new_version)

    record_audit_event(
        db=db,
        actor_id=current_user.id,
        actor_name=current_user.name,
        verb="create_draft_version",
        object_type="draft_version",
        object_id=version_id,
        payload={
            "draft_id": draft_id,
            "version_number": next_ver_num,
            "content_hash": content_hash
        }
    )
    db.commit()
    db.refresh(new_version)
    return new_version

@router.get("/drafts/versions/{version_id}", response_model=DraftVersionOut)
def get_draft_version(version_id: str, db: Session = Depends(get_db)):
    version = db.query(DraftVersion).filter(DraftVersion.id == version_id).first()
    if not version:
        raise HTTPException(status_code=404, detail="Draft version not found")
    return version

@router.post("/drafts/{version_id}/analyze", response_model=JobOut)
def analyze_draft(
    version_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    version = db.query(DraftVersion).filter(DraftVersion.id == version_id).first()
    if not version:
        raise HTTPException(status_code=404, detail="Draft version not found")

    job_id = f"job-{gen_uuid()}"
    JOB_STORE[job_id] = {
        "job_id": job_id,
        "status": "processing",
        "draft_version_id": version_id,
        "findings_count": 0,
        "created_at": datetime.datetime.utcnow()
    }

    # Execute analysis pipeline synchronously or via background task
    try:
        res = run_analysis_pipeline(
            draft_version_id=version_id,
            actor_id=current_user.id,
            actor_name=current_user.name
        )
        JOB_STORE[job_id]["status"] = "completed"
        JOB_STORE[job_id]["findings_count"] = res["findings_count"]
    except Exception as e:
        JOB_STORE[job_id]["status"] = "failed"
        JOB_STORE[job_id]["error"] = str(e)
        raise HTTPException(status_code=500, detail=f"Analysis pipeline error: {str(e)}")

    return JOB_STORE[job_id]

@router.get("/jobs/{job_id}", response_model=JobOut)
def get_job_status(job_id: str):
    if job_id not in JOB_STORE:
        raise HTTPException(status_code=404, detail="Job not found")
    return JOB_STORE[job_id]

@router.get("/drafts/{version_id}/findings")
def get_version_findings(version_id: str, db: Session = Depends(get_db)):
    findings = db.query(Finding).filter(Finding.draft_version_id == version_id).all()
    return findings

@router.post("/drafts/{version_id}/request-changes", response_model=DraftVersionOut)
def request_changes(
    version_id: str,
    reason: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    version = db.query(DraftVersion).filter(DraftVersion.id == version_id).first()
    if not version:
        raise HTTPException(status_code=404, detail="Draft version not found")

    version.status = "changes_requested"
    record_audit_event(
        db=db,
        actor_id=current_user.id,
        actor_name=current_user.name,
        verb="request_changes",
        object_type="draft_version",
        object_id=version_id,
        payload={"reason": reason or "Revisions requested by reviewer"}
    )
    db.commit()
    db.refresh(version)
    return version

@router.post("/drafts/{version_id}/approve", response_model=ApprovalOut)
def approve_draft(
    version_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    CRITICAL EXIT GATE & COMPLIANCE LOCK:
    1. Checks user role: only 'compliance_owner' or 'admin' can approve.
    2. Checks resolution of all findings: 403 Forbidden if unresolved findings remain!
    3. Locks draft version and generates tamper-evident approval row + audit event.
    """
    # 1. Role Check
    if current_user.role not in ["compliance_owner", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Approval Blocked: Only Compliance Owners or Admins can give final named approval. Your current role is '{current_user.role}'."
        )

    version = db.query(DraftVersion).filter(DraftVersion.id == version_id).first()
    if not version:
        raise HTTPException(status_code=404, detail="Draft version not found")

    # 2. Unresolved Findings Check
    findings = db.query(Finding).filter(Finding.draft_version_id == version_id).all()
    unresolved = [f for f in findings if f.resolution == "unresolved"]
    
    if len(unresolved) > 0:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Approval Blocked: {len(unresolved)} unresolved finding(s) remain on this draft. Every finding must be Accepted, Edited, or Dismissed before compliance sign-off."
        )

    # 3. Named Approval Lock
    now = datetime.datetime.utcnow()
    version.status = "approved"
    version.locked_at = now
    
    content_hash = hashlib.sha256(version.text.encode("utf-8")).hexdigest()
    approval_id = gen_uuid("appr-")

    approval = Approval(
        id=approval_id,
        draft_version_id=version_id,
        approver_id=current_user.id,
        approver_name=current_user.name,
        content_hash=content_hash,
        ts=now
    )
    db.add(approval)

    # Cryptographic Audit Record
    record_audit_event(
        db=db,
        actor_id=current_user.id,
        actor_name=current_user.name,
        verb="approve",
        object_type="draft_version",
        object_id=version_id,
        payload={
            "approval_id": approval_id,
            "approver_role": current_user.role,
            "content_hash": content_hash,
            "locked_at": now.isoformat(),
            "total_findings_reviewed": len(findings)
        }
    )

    db.commit()
    db.refresh(approval)
    return approval

@router.post("/drafts/reset-demo")
def reset_demo_draft(db: Session = Depends(get_db)):
    """
    Resets the golden demo draft to initial state with 4 fresh unresolved findings
    for interactive evaluation of the exit gate & approval workflow.
    """
    draft = db.query(Draft).filter(Draft.id == "draft-gold-fund").first()
    if not draft:
        draft = Draft(
            id="draft-gold-fund",
            brand_id="brand_arthaa",
            title="Gold Savings Fund Launch Copy",
            campaign="Diwali Wealth Campaign 2026",
            creator_id="user_riya",
            current_version_number=1
        )
        db.add(draft)
        db.commit()

    demo_text = "Invest in Arthaa Gold Savings Fund today with guaranteed 12% returns. With an AUM of ₹4,200 crore, it is India's #1 fund for secure wealth generation."
    demo_hash = hashlib.sha256(demo_text.encode("utf-8")).hexdigest()

    draft_v1 = db.query(DraftVersion).filter(DraftVersion.id == "dv-draft-gold-fund-v1").first()
    if not draft_v1:
        draft_v1 = DraftVersion(
            id="dv-draft-gold-fund-v1",
            draft_id="draft-gold-fund",
            version_number=1,
            text=demo_text,
            status="draft",
            content_hash=demo_hash
        )
        db.add(draft_v1)
    else:
        draft_v1.text = demo_text
        draft_v1.status = "draft"
        draft_v1.content_hash = demo_hash
        draft_v1.locked_at = None

    # Delete existing approvals for this draft
    db.query(Approval).filter(Approval.draft_version_id == "dv-draft-gold-fund-v1").delete()
    db.commit()

    # Re-run analysis pipeline to generate 4 fresh findings
    res = run_analysis_pipeline("dv-draft-gold-fund-v1", actor_id="system", actor_name="Demo Reset")
    db.refresh(draft_v1)
    return {
        "status": "reset",
        "draft_id": "draft-gold-fund",
        "version_id": "dv-draft-gold-fund-v1",
        "findings_count": res.get("findings_count", 4)
    }
