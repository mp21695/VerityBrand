import datetime
import uuid
from sqlalchemy import (
    Column, String, Text, Integer, Float, DateTime, Boolean, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from backend.app.database import Base

def gen_uuid(prefix: str = "") -> str:
    uid = str(uuid.uuid4())[:8]
    return f"{prefix}{uid}" if prefix else str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(50), primary_key=True)
    email = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    role = Column(String(30), nullable=False, default="reviewer")  # creator | reviewer | compliance_owner | admin
    password_hash = Column(String(200), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Brand(Base):
    __tablename__ = "brands"
    
    id = Column(String(50), primary_key=True)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    rules = relationship("Rule", back_populates="brand", cascade="all, delete-orphan")
    facts = relationship("Fact", back_populates="brand", cascade="all, delete-orphan")
    drafts = relationship("Draft", back_populates="brand", cascade="all, delete-orphan")
    sources = relationship("SourceDoc", back_populates="brand", cascade="all, delete-orphan")

class Rule(Base):
    __tablename__ = "rules"
    
    id = Column(String(50), primary_key=True)  # e.g. R-07
    brand_id = Column(String(50), ForeignKey("brands.id"), nullable=False)
    name = Column(String(200), nullable=False)
    type = Column(String(50), nullable=False)  # banned_term | required_phrase | regex | number_format | tone
    current_version = Column(String(20), nullable=False, default="1.0")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    brand = relationship("Brand", back_populates="rules")
    versions = relationship("RuleVersion", back_populates="rule", cascade="all, delete-orphan", order_by="desc(RuleVersion.created_at)")

class RuleVersion(Base):
    __tablename__ = "rule_versions"
    
    id = Column(String(60), primary_key=True)  # e.g. rv-r07-2.0
    rule_id = Column(String(50), ForeignKey("rules.id"), nullable=False)
    version = Column(String(20), nullable=False)  # e.g. "2.0"
    pattern_params = Column(JSON, nullable=False, default=dict)  # JSON with regex, triggers, required_phrase, etc.
    description = Column(Text, nullable=False)
    severity = Column(String(20), nullable=False, default="high")  # high | medium | low
    effective_from = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
    effective_to = Column(DateTime, nullable=True)
    created_by = Column(String(100), nullable=False, default="compliance_owner")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    rule = relationship("Rule", back_populates="versions")

class SourceDoc(Base):
    __tablename__ = "source_docs"
    
    id = Column(String(50), primary_key=True)  # e.g. E-014
    brand_id = Column(String(50), ForeignKey("brands.id"), nullable=False)
    title = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False)  # KIM | Finance Ledger | Brand Rules
    file_uri = Column(String(255), nullable=True)
    hash = Column(String(64), nullable=False)  # SHA-256
    content = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    brand = relationship("Brand", back_populates="sources")
    fact_versions = relationship("FactVersion", back_populates="source_doc")

class Fact(Base):
    __tablename__ = "facts"
    
    id = Column(String(50), primary_key=True)  # e.g. F-021
    brand_id = Column(String(50), ForeignKey("brands.id"), nullable=False)
    key = Column(String(100), nullable=False, index=True)  # e.g. fund.gold.aum
    name = Column(String(200), nullable=False)
    current_version = Column(String(20), nullable=False, default="1.0")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    brand = relationship("Brand", back_populates="facts")
    versions = relationship("FactVersion", back_populates="fact", cascade="all, delete-orphan", order_by="desc(FactVersion.created_at)")

class FactVersion(Base):
    __tablename__ = "fact_versions"
    
    id = Column(String(60), primary_key=True)
    fact_id = Column(String(50), ForeignKey("facts.id"), nullable=False)
    version = Column(String(20), nullable=False, default="1.0")
    value = Column(String(100), nullable=False)  # e.g. "3,850 crore" or "3.85e10"
    unit = Column(String(30), nullable=True)   # e.g. "₹ crore"
    scope = Column(String(200), nullable=False) # e.g. "Arthaa Gold Savings Fund Q1 FY26"
    source_doc_id = Column(String(50), ForeignKey("source_docs.id"), nullable=True)
    valid_from = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
    valid_until = Column(DateTime, nullable=False)  # e.g. 2026-06-30
    embedding = Column(JSON, nullable=True)         # vector embeddings or normalized tokens
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    fact = relationship("Fact", back_populates="versions")
    source_doc = relationship("SourceDoc", back_populates="fact_versions")

class GlossaryTerm(Base):
    __tablename__ = "glossary_terms"
    
    id = Column(String(50), primary_key=True)
    brand_id = Column(String(50), ForeignKey("brands.id"), nullable=False)
    preferred = Column(String(100), nullable=False)
    disallowed_variants = Column(JSON, nullable=False, default=list)  # list of strings
    category = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Draft(Base):
    __tablename__ = "drafts"
    
    id = Column(String(50), primary_key=True)
    brand_id = Column(String(50), ForeignKey("brands.id"), nullable=False)
    title = Column(String(200), nullable=False)
    campaign = Column(String(100), nullable=False)
    creator_id = Column(String(50), ForeignKey("users.id"), nullable=False)
    current_version_number = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    brand = relationship("Brand", back_populates="drafts")
    versions = relationship("DraftVersion", back_populates="draft", cascade="all, delete-orphan", order_by="DraftVersion.version_number")

class DraftVersion(Base):
    __tablename__ = "draft_versions"
    
    id = Column(String(60), primary_key=True)
    draft_id = Column(String(50), ForeignKey("drafts.id"), nullable=False)
    version_number = Column(Integer, nullable=False)
    text = Column(Text, nullable=False)
    status = Column(String(30), nullable=False, default="draft")  # draft | in_review | changes_requested | approved
    content_hash = Column(String(64), nullable=False)
    locked_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    draft = relationship("Draft", back_populates="versions")
    findings = relationship("Finding", back_populates="draft_version", cascade="all, delete-orphan")
    approvals = relationship("Approval", back_populates="draft_version")

class Finding(Base):
    __tablename__ = "findings"
    
    id = Column(String(60), primary_key=True)
    draft_version_id = Column(String(60), ForeignKey("draft_versions.id"), nullable=False)
    span_start = Column(Integer, nullable=False)
    span_end = Column(Integer, nullable=False)
    span_text = Column(Text, nullable=False)
    check_type = Column(String(30), nullable=False)  # rule | claim | expiry | tone
    status = Column(String(30), nullable=False)      # confirmed | expired | needs_verification | human_review
    resolution = Column(String(30), nullable=False, default="unresolved") # unresolved | accepted | edited | dismissed | changes_requested
    severity = Column(String(20), nullable=False, default="medium")        # high | medium | low
    
    rule_version_id = Column(String(60), nullable=True)
    fact_version_id = Column(String(60), nullable=True)
    evidence_ids = Column(JSON, nullable=False, default=list)  # list of source_doc / rule / fact IDs
    
    confidence = Column(Float, nullable=False, default=1.0)
    suggested_fix = Column(Text, nullable=True)
    explanation = Column(Text, nullable=False)
    intent_note = Column(Text, nullable=True)
    model_meta = Column(JSON, nullable=False, default=dict)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    draft_version = relationship("DraftVersion", back_populates="findings")
    actions = relationship("ReviewAction", back_populates="finding", cascade="all, delete-orphan")

class ReviewAction(Base):
    __tablename__ = "review_actions"
    
    id = Column(String(60), primary_key=True)
    finding_id = Column(String(60), ForeignKey("findings.id"), nullable=False)
    action = Column(String(30), nullable=False)  # accept | edit | dismiss | request_changes
    edited_text = Column(Text, nullable=True)
    reason = Column(Text, nullable=True)
    user_id = Column(String(50), nullable=False)
    ts = Column(DateTime, default=datetime.datetime.utcnow)
    
    finding = relationship("Finding", back_populates="actions")

class Approval(Base):
    __tablename__ = "approvals"
    
    id = Column(String(60), primary_key=True)
    draft_version_id = Column(String(60), ForeignKey("draft_versions.id"), nullable=False)
    approver_id = Column(String(50), ForeignKey("users.id"), nullable=False)
    approver_name = Column(String(100), nullable=False)
    content_hash = Column(String(64), nullable=False)
    ts = Column(DateTime, default=datetime.datetime.utcnow)
    
    draft_version = relationship("DraftVersion", back_populates="approvals")

class AuditEvent(Base):
    __tablename__ = "audit_events"
    
    id = Column(String(60), primary_key=True)
    actor_id = Column(String(50), nullable=False)
    actor_name = Column(String(100), nullable=False)
    verb = Column(String(50), nullable=False)       # create | analyze | accept_fix | edit_claim | dismiss_rule | approve | upload_source
    object_type = Column(String(50), nullable=False) # draft | draft_version | finding | rule | fact
    object_id = Column(String(60), nullable=False)
    payload = Column(JSON, nullable=False, default=dict)
    ts = Column(DateTime, default=datetime.datetime.utcnow)
    prev_hash = Column(String(64), nullable=False)
    curr_hash = Column(String(64), nullable=False)  # SHA-256 tamper-evident hash
