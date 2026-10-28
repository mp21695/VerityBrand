from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import AuditEvent
from backend.app.schemas import AuditEventOut
from backend.app.audit import verify_chain_integrity

router = APIRouter(prefix="/audit", tags=["audit"])

@router.get("", response_model=List[AuditEventOut])
def get_audit_trail(
    object_id: Optional[str] = None,
    object_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(AuditEvent)
    if object_id:
        query = query.filter(AuditEvent.object_id == object_id)
    if object_type:
        query = query.filter(AuditEvent.object_type == object_type)
    return query.order_by(AuditEvent.ts.desc()).all()

@router.get("/verify")
def verify_audit_trail_integrity(db: Session = Depends(get_db)):
    """
    Cryptographic verification endpoint:
    Traverses the full SHA-256 hash chain from genesis to the latest event, proving tamper-evidence.
    """
    return verify_chain_integrity(db)
