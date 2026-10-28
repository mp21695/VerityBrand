import hashlib
import json
import datetime
from sqlalchemy.orm import Session
from backend.app.models import AuditEvent, gen_uuid

GENESIS_HASH = "0" * 64

def compute_hash(prev_hash: str, actor_id: str, verb: str, object_type: str, object_id: str, payload: dict, ts: datetime.datetime) -> str:
    serialized_payload = json.dumps(payload, sort_keys=True, default=str)
    raw_data = f"{prev_hash}|{actor_id}|{verb}|{object_type}|{object_id}|{serialized_payload}|{ts.isoformat()}"
    return hashlib.sha256(raw_data.encode("utf-8")).hexdigest()

def record_audit_event(
    db: Session,
    actor_id: str,
    actor_name: str,
    verb: str,
    object_type: str,
    object_id: str,
    payload: dict
) -> AuditEvent:
    """
    Creates an append-only, tamper-evident audit event inside the active database transaction.
    """
    # Fetch the last audit event to get prev_hash
    last_event = db.query(AuditEvent).order_by(AuditEvent.ts.desc(), AuditEvent.id.desc()).first()
    prev_hash = last_event.curr_hash if last_event else GENESIS_HASH
    
    now = datetime.datetime.utcnow()
    curr_hash = compute_hash(prev_hash, actor_id, verb, object_type, object_id, payload, now)
    
    event = AuditEvent(
        id=gen_uuid("ae-"),
        actor_id=actor_id,
        actor_name=actor_name,
        verb=verb,
        object_type=object_type,
        object_id=object_id,
        payload=payload,
        ts=now,
        prev_hash=prev_hash,
        curr_hash=curr_hash
    )
    db.add(event)
    return event

def verify_chain_integrity(db: Session) -> dict:
    """
    Validates every link in the cryptographic audit chain.
    Returns status: verified, broken_at_id, total_events.
    """
    events = db.query(AuditEvent).order_by(AuditEvent.ts.asc(), AuditEvent.id.asc()).all()
    if not events:
        return {"status": "verified", "total_events": 0, "message": "Audit chain empty"}
        
    expected_prev = GENESIS_HASH
    for ev in events:
        if ev.prev_hash != expected_prev:
            return {
                "status": "tampered",
                "broken_at_id": ev.id,
                "expected_prev": expected_prev,
                "found_prev": ev.prev_hash
            }
        recomputed = compute_hash(ev.prev_hash, ev.actor_id, ev.verb, ev.object_type, ev.object_id, ev.payload, ev.ts)
        if recomputed != ev.curr_hash:
            return {
                "status": "tampered",
                "broken_at_id": ev.id,
                "expected_curr": recomputed,
                "found_curr": ev.curr_hash
            }
        expected_prev = ev.curr_hash
        
    return {"status": "verified", "total_events": len(events), "latest_hash": expected_prev}
