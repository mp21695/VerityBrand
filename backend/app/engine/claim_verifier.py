import re
import datetime
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from backend.app.models import Fact, FactVersion, SourceDoc, Rule, RuleVersion
from backend.app.engine.rule_engine import normalize_indian_currency

def cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
    if not vec_a or not vec_b or len(vec_a) != len(vec_b):
        return 0.0
    dot = sum(a * b for a, b in zip(vec_a, vec_b))
    norm_a = sum(a * a for a in vec_a) ** 0.5
    norm_b = sum(b * b for b in vec_b) ** 0.5
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)

def text_to_simple_embedding(text: str, dim: int = 64) -> List[float]:
    """Lightweight deterministic hashing vector for offline/local vector hybrid search"""
    tokens = re.findall(r"\w+", text.lower())
    vec = [0.0] * dim
    for tok in tokens:
        idx = hash(tok) % dim
        vec[idx] += 1.0
    # Normalize
    norm = sum(x * x for x in vec) ** 0.5
    if norm > 0:
        vec = [x / norm for x in vec]
    return vec

class GroundedClaimVerifier:
    def __init__(self, db: Session, brand_id: str):
        self.db = db
        self.brand_id = brand_id

    def extract_claims(self, text: str) -> List[Dict[str, Any]]:
        """
        Extracts candidate claims from the draft text.
        Every span is strictly validated against the draft text.
        """
        claims = []
        
        # 1. Numeric claims (e.g. AUM, returns, figures)
        # e.g. "AUM of ₹4,200 crore", "₹4,200 crore", "12% returns"
        numeric_patterns = [
            (r"(?:aum\s+of\s+)?(₹\s*[\d,]+(?:\.\d+)?\s*(?:crore|lakh|cr)?)", "numeric"),
            (r"(\d+(?:\.\d+)?%\s*(?:returns?|cagr|yield)?)", "numeric"),
            (r"(guaranteed\s+\d+%\s*returns?)", "guarantee"),
            (r"(india'?s\s+#1\s+fund|best\s+fund\s+in\s+india|highest\s+returns)", "ranking")
        ]
        
        for pat, ctype in numeric_patterns:
            for match in re.finditer(pat, text, re.IGNORECASE):
                claim_text = match.group(0).strip()
                start = match.start()
                end = match.end()
                
                # Strict span validation
                if text[start:end] == claim_text:
                    claims.append({
                        "span_start": start,
                        "span_end": end,
                        "text": claim_text,
                        "claim_type": ctype
                    })

        return claims

    def retrieve_evidence(self, query_text: str) -> List[Tuple[FactVersion, float]]:
        """
        Hybrid search: matches fact keys, scope, and vector embedding against active facts.
        Returns top fact_versions with relevance scores.
        """
        now = datetime.datetime.utcnow()
        query_vec = text_to_simple_embedding(query_text)
        query_tokens = set(re.findall(r"\w+", query_text.lower()))

        # Get all facts for the brand
        facts = self.db.query(Fact).filter(Fact.brand_id == self.brand_id).all()
        scored_facts = []

        for fact in facts:
            # Active in-force version
            latest = (
                self.db.query(FactVersion)
                .filter(FactVersion.fact_id == fact.id)
                .order_by(FactVersion.created_at.desc())
                .first()
            )
            if not latest:
                continue

            # 1. Keyword match on key, scope, value
            target_str = f"{fact.key} {fact.name} {latest.scope} {latest.value}".lower()
            target_tokens = set(re.findall(r"\w+", target_str))
            
            overlap = len(query_tokens.intersection(target_tokens))
            kw_score = overlap / max(len(query_tokens), 1)

            # 2. Embedding similarity
            fact_vec = latest.embedding or text_to_simple_embedding(target_str)
            vec_score = cosine_similarity(query_vec, fact_vec)

            # Hybrid blend: 60% keyword/entity match + 40% embedding
            combined_score = (kw_score * 0.6) + (vec_score * 0.4)
            if overlap > 0 or combined_score > 0.2:
                scored_facts.append((latest, combined_score))

        scored_facts.sort(key=lambda x: x[1], reverse=True)
        return scored_facts[:5]

    def verify_claims(self, text: str) -> List[Dict[str, Any]]:
        findings = []
        claims = self.extract_claims(text)
        now = datetime.datetime.utcnow()

        for claim in claims:
            span_text = claim["text"]
            start = claim["span_start"]
            end = claim["span_end"]
            ctype = claim["claim_type"]

            # Grounded retrieval
            evidence_matches = self.retrieve_evidence(span_text)

            # --- CASE 1: Numeric fact check (e.g. AUM figure) ---
            if "crore" in span_text.lower() or "aum" in text[max(0, start-20):end+20].lower():
                # Find matching fact (e.g. F-021 fund.gold.aum)
                matched_fact_ver = None
                for fv, score in evidence_matches:
                    if "aum" in fv.fact.key.lower() or "aum" in fv.scope.lower():
                        matched_fact_ver = fv
                        break

                if matched_fact_ver:
                    source_doc = matched_fact_ver.source_doc
                    source_title = source_doc.title if source_doc else "Approved Fund Ledger"
                    
                    # 1. Expiry Check
                    is_expired = now > matched_fact_ver.valid_until
                    
                    # 2. Value Comparison
                    draft_numeric = normalize_indian_currency(span_text)
                    fact_numeric = normalize_indian_currency(matched_fact_ver.value)
                    
                    if is_expired:
                        findings.append({
                            "span_start": start,
                            "span_end": end,
                            "span_text": span_text,
                            "check_type": "expiry",
                            "status": "expired",
                            "severity": "high",
                            "rule_version_id": None,
                            "fact_version_id": matched_fact_ver.id,
                            "evidence_ids": [matched_fact_ver.fact_id, matched_fact_ver.id, matched_fact_ver.source_doc_id or "E-014"],
                            "confidence": 1.0,
                            "suggested_fix": f"AUM of {matched_fact_ver.value}",
                            "explanation": f"Expired fact cited: Fact {matched_fact_ver.fact_id} expired on {matched_fact_ver.valid_until.strftime('%d %b %Y')}. Latest audited source required.",
                            "intent_note": "Intent kept: updates metric to current audited reporting cycle",
                            "model_meta": {"engine": "expiry_checker", "fact_id": matched_fact_ver.fact_id, "valid_until": str(matched_fact_ver.valid_until)}
                        })
                    elif draft_numeric and fact_numeric and abs(draft_numeric - fact_numeric) > 1e4:
                        # Value contradiction! e.g. draft claims ₹4,200 crore, but ledger states ₹3,850 crore
                        findings.append({
                            "span_start": start,
                            "span_end": end,
                            "span_text": span_text,
                            "check_type": "claim",
                            "status": "confirmed",
                            "severity": "high",
                            "rule_version_id": None,
                            "fact_version_id": matched_fact_ver.id,
                            "evidence_ids": [matched_fact_ver.fact_id, matched_fact_ver.id, matched_fact_ver.source_doc_id or "E-014"],
                            "confidence": 1.0,
                            "suggested_fix": f"AUM of {matched_fact_ver.value}",
                            "explanation": f"Factual Contradiction with {matched_fact_ver.fact_id} ({source_title}): Approved ledger states {matched_fact_ver.value}, but draft claims '{span_text}'.",
                            "intent_note": "Intent kept: preserves fund size narrative with verified official figures",
                            "model_meta": {"engine": "numeric_comparator", "fact_id": matched_fact_ver.fact_id, "approved_value": matched_fact_ver.value}
                        })
                else:
                    # No evidence retrieved for this numeric claim -> ABSTENTION
                    findings.append({
                        "span_start": start,
                        "span_end": end,
                        "span_text": span_text,
                        "check_type": "claim",
                        "status": "needs_verification",
                        "severity": "medium",
                        "rule_version_id": None,
                        "fact_version_id": None,
                        "evidence_ids": [],
                        "confidence": 0.65,
                        "suggested_fix": None,
                        "explanation": f"Unsupported numeric claim: No approved ledger or factsheet evidence found to verify '{span_text}'.",
                        "intent_note": "Requires factual documentation in Brand Brain",
                        "model_meta": {"engine": "abstention_guard", "retrieval_count": len(evidence_matches)}
                    })

            # --- CASE 2: Ranking / Superlative claims ---
            elif ctype == "ranking":
                findings.append({
                    "span_start": start,
                    "span_end": end,
                    "span_text": span_text,
                    "check_type": "tone",
                    "status": "human_review",
                    "severity": "medium",
                    "rule_version_id": "rv-r12-1.0",
                    "fact_version_id": None,
                    "evidence_ids": ["R-12"],
                    "confidence": 0.85,
                    "suggested_fix": "a leading fund in its category",
                    "explanation": f"Unsubstantiated ranking claim: '{span_text}' requires explicit third-party rating agency citation (e.g. CRISIL / Morningstar) per financial promotion rules.",
                    "intent_note": "Intent kept: maintains premium category standing without regulatory exposure",
                    "model_meta": {"engine": "ranking_classifier", "claim_type": "ranking"}
                })

        return findings
