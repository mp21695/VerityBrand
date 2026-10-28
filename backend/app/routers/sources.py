import hashlib
import re
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import SourceDoc, User, gen_uuid
from backend.app.schemas import SourceDocOut
from backend.app.auth import get_current_user
from backend.app.audit import record_audit_event

router = APIRouter(prefix="/sources", tags=["sources"])

@router.get("/brand/{brand_id}", response_model=List[SourceDocOut])
def list_brand_sources(brand_id: str, db: Session = Depends(get_db)):
    return db.query(SourceDoc).filter(SourceDoc.brand_id == brand_id).all()

@router.post("/upload")
async def upload_source(
    brand_id: str = Form(...),
    title: str = Form(...),
    doc_type: str = Form(...),  # KIM | Finance Ledger | Brand Rules
    content: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Uploads a source document (Finance Ledger, KIM, Brand Rules).
    Extracts text, computes cryptographic hash, and suggests candidate facts/rules for human confirmation.
    """
    raw_content = content or ""
    if file:
        file_bytes = await file.read()
        try:
            raw_content = file_bytes.decode("utf-8", errors="replace")
        except Exception:
            raw_content = f"Uploaded binary document: {file.filename}"

    if not raw_content:
        raise HTTPException(status_code=400, detail="Document content cannot be empty")

    doc_hash = hashlib.sha256(raw_content.encode("utf-8")).hexdigest()
    doc_id = gen_uuid("E-")

    source_doc = SourceDoc(
        id=doc_id,
        brand_id=brand_id,
        title=title,
        type=doc_type,
        file_uri=file.filename if file else f"/docs/{doc_id}.txt",
        hash=doc_hash,
        content=raw_content
    )
    db.add(source_doc)

    # Extract candidate facts & rules for human review
    candidates = []
    
    # 1. Look for currency / numbers
    curr_matches = re.finditer(r"(?:₹|Rs\.?)\s*([\d,]+(?:\.\d+)?\s*(?:crore|lakh|cr)?)", raw_content, re.IGNORECASE)
    for m in curr_matches:
        candidates.append({
            "type": "fact",
            "detected_value": m.group(0),
            "suggested_key": "fund.metric." + str(len(candidates) + 1),
            "context": raw_content[max(0, m.start()-30):min(len(raw_content), m.end()+30)]
        })

    # 2. Look for disclaimers or prohibitions
    if "market risk" in raw_content.lower() or "disclaimer" in raw_content.lower():
        candidates.append({
            "type": "rule",
            "rule_type": "required_phrase",
            "description": "Mandatory Market Risk Disclaimer extracted from regulatory guidelines",
            "suggested_phrase": "Mutual fund investments are subject to market risks, read all scheme related documents carefully."
        })

    record_audit_event(
        db=db,
        actor_id=current_user.id,
        actor_name=current_user.name,
        verb="upload_source",
        object_type="source_doc",
        object_id=doc_id,
        payload={
            "title": title,
            "type": doc_type,
            "hash": doc_hash,
            "candidates_count": len(candidates)
        }
    )
    db.commit()
    db.refresh(source_doc)

    return {
        "source_doc": {
            "id": source_doc.id,
            "title": source_doc.title,
            "type": source_doc.type,
            "hash": source_doc.hash,
            "created_at": source_doc.created_at
        },
        "candidate_items_for_confirmation": candidates
    }
