import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import Finding, ReviewAction, DraftVersion, User, gen_uuid
from backend.app.schemas import ReviewActionCreate, FindingOut
from backend.app.auth import get_current_user
from backend.app.audit import record_audit_event

router = APIRouter(prefix="/findings", tags=["findings"])

@router.post("/{finding_id}/actions", response_model=FindingOut)
def take_finding_action(
    finding_id: str,
    action_data: ReviewActionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    finding = db.query(Finding).filter(Finding.id == finding_id).first()
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found")

    action_id = gen_uuid("ra-")
    now = datetime.datetime.utcnow()

    # Record Review Action
    action = ReviewAction(
        id=action_id,
        finding_id=finding.id,
        action=action_data.action,
        edited_text=action_data.edited_text,
        reason=action_data.reason,
        user_id=current_user.id,
        ts=now
    )
    db.add(action)

    # Update finding resolution status
    finding.resolution = action_data.action

    # If action is 'accept' or 'edit', optionally update the draft text
    draft_version = finding.draft_version
    if action_data.action == "accept" and finding.suggested_fix:
        # Replace the span text with suggested fix in the draft version text
        old_span = finding.span_text
        new_text = draft_version.text.replace(old_span, finding.suggested_fix, 1)
        draft_version.text = new_text
    elif action_data.action == "edit" and action_data.edited_text:
        old_span = finding.span_text
        new_text = draft_version.text.replace(old_span, action_data.edited_text, 1)
        draft_version.text = new_text

    # Record cryptographic audit event linked to rule/fact version
    record_audit_event(
        db=db,
        actor_id=current_user.id,
        actor_name=current_user.name,
        verb=f"finding_{action_data.action}",
        object_type="finding",
        object_id=finding.id,
        payload={
            "action": action_data.action,
            "span_text": finding.span_text,
            "edited_text": action_data.edited_text,
            "reason": action_data.reason,
            "rule_version_id": finding.rule_version_id,
            "fact_version_id": finding.fact_version_id,
            "draft_version_id": finding.draft_version_id
        }
    )

    db.commit()
    db.refresh(finding)
    return finding
