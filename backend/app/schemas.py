from typing import List, Optional, Any, Dict
from datetime import datetime
from pydantic import BaseModel, Field

# User & Auth
class UserLogin(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: str
    email: str
    name: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

# Brand
class BrandCreate(BaseModel):
    name: str
    description: Optional[str] = None

class BrandOut(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Rule & Rule Version
class RuleVersionCreate(BaseModel):
    rule_id: str
    version: str
    pattern_params: Dict[str, Any]
    description: str
    severity: str = "high"
    effective_from: Optional[datetime] = None
    effective_to: Optional[datetime] = None

class RuleVersionOut(BaseModel):
    id: str
    rule_id: str
    version: str
    pattern_params: Dict[str, Any]
    description: str
    severity: str
    effective_from: datetime
    effective_to: Optional[datetime] = None
    created_by: str
    created_at: datetime

    class Config:
        from_attributes = True

class RuleCreate(BaseModel):
    id: str  # e.g. R-07
    brand_id: str
    name: str
    type: str  # banned_term | required_phrase | regex | number_format | tone
    version: str = "1.0"
    pattern_params: Dict[str, Any]
    description: str
    severity: str = "high"

class RuleOut(BaseModel):
    id: str
    brand_id: str
    name: str
    type: str
    current_version: str
    created_at: datetime
    versions: List[RuleVersionOut] = []

    class Config:
        from_attributes = True

# Fact & Fact Version
class FactVersionCreate(BaseModel):
    fact_id: str
    version: str
    value: str
    unit: Optional[str] = None
    scope: str
    source_doc_id: Optional[str] = None
    valid_from: Optional[datetime] = None
    valid_until: datetime
    embedding: Optional[List[float]] = None

class FactVersionOut(BaseModel):
    id: str
    fact_id: str
    version: str
    value: str
    unit: Optional[str] = None
    scope: str
    source_doc_id: Optional[str] = None
    valid_from: datetime
    valid_until: datetime
    created_at: datetime

    class Config:
        from_attributes = True

class FactCreate(BaseModel):
    id: str  # e.g. F-021
    brand_id: str
    key: str
    name: str
    version: str = "1.0"
    value: str
    unit: Optional[str] = None
    scope: str
    source_doc_id: Optional[str] = None
    valid_until: datetime

class FactOut(BaseModel):
    id: str
    brand_id: str
    key: str
    name: str
    current_version: str
    created_at: datetime
    versions: List[FactVersionOut] = []

    class Config:
        from_attributes = True

# Source Doc
class SourceDocCreate(BaseModel):
    id: str
    brand_id: str
    title: str
    type: str
    content: Optional[str] = None
    file_uri: Optional[str] = None

class SourceDocOut(BaseModel):
    id: str
    brand_id: str
    title: str
    type: str
    file_uri: Optional[str] = None
    hash: str
    content: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Glossary
class GlossaryTermCreate(BaseModel):
    brand_id: str
    preferred: str
    disallowed_variants: List[str]
    category: Optional[str] = None

class GlossaryTermOut(BaseModel):
    id: str
    brand_id: str
    preferred: str
    disallowed_variants: List[str]
    category: Optional[str] = None

    class Config:
        from_attributes = True

# Finding & Action
class ReviewActionCreate(BaseModel):
    action: str  # accept | edit | dismiss | request_changes
    edited_text: Optional[str] = None
    reason: Optional[str] = None

class ReviewActionOut(BaseModel):
    id: str
    finding_id: str
    action: str
    edited_text: Optional[str] = None
    reason: Optional[str] = None
    user_id: str
    ts: datetime

    class Config:
        from_attributes = True

class FindingOut(BaseModel):
    id: str
    draft_version_id: str
    span_start: int
    span_end: int
    span_text: str
    check_type: str
    status: str
    resolution: str
    severity: str
    rule_version_id: Optional[str] = None
    fact_version_id: Optional[str] = None
    evidence_ids: List[str] = []
    confidence: float
    suggested_fix: Optional[str] = None
    explanation: str
    intent_note: Optional[str] = None
    model_meta: Dict[str, Any] = {}
    created_at: datetime
    actions: List[ReviewActionOut] = []

    class Config:
        from_attributes = True

# Draft & Version
class DraftCreate(BaseModel):
    brand_id: str
    title: str
    campaign: str
    text: str

class DraftVersionCreate(BaseModel):
    text: str

class DraftVersionOut(BaseModel):
    id: str
    draft_id: str
    version_number: int
    text: str
    status: str
    content_hash: str
    locked_at: Optional[datetime] = None
    created_at: datetime
    findings: List[FindingOut] = []

    class Config:
        from_attributes = True

class DraftOut(BaseModel):
    id: str
    brand_id: str
    title: str
    campaign: str
    creator_id: str
    current_version_number: Optional[int] = 1
    created_at: datetime
    versions: List[DraftVersionOut] = []

    class Config:
        from_attributes = True

# Approval
class ApprovalOut(BaseModel):
    id: str
    draft_version_id: str
    approver_id: str
    approver_name: str
    content_hash: str
    ts: datetime

    class Config:
        from_attributes = True

# Audit Event
class AuditEventOut(BaseModel):
    id: str
    actor_id: str
    actor_name: str
    verb: str
    object_type: str
    object_id: str
    payload: Dict[str, Any]
    ts: datetime
    prev_hash: str
    curr_hash: str

    class Config:
        from_attributes = True

# Job
class JobOut(BaseModel):
    job_id: str
    status: str  # pending | processing | completed | failed
    draft_version_id: str
    findings_count: int = 0
    created_at: datetime

# Insights Summary
class InsightsSummaryOut(BaseModel):
    top_violated_rules: List[Dict[str, Any]]
    most_dismissed_rules: List[Dict[str, Any]]
    expiring_facts: List[Dict[str, Any]]
    total_drafts: int
    total_approved: int
    avg_resolution_rate: float
