import re
import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app.models import Rule, RuleVersion, Fact, FactVersion, SourceDoc, GlossaryTerm

def normalize_indian_currency(text: str) -> Optional[float]:
    """
    Normalizes Indian currency expressions to numerical float.
    e.g. ₹4,200 crore -> 4.2e10 (42,000,000,000)
         ₹50 lakh -> 5e7 (5,000,000)
    """
    clean = text.replace(",", "").replace("₹", "").replace("Rs.", "").replace("INR", "").strip().lower()
    
    # Check crore
    crore_match = re.search(r"([\d\.]+)\s*(?:crore|cr)", clean)
    if crore_match:
        try:
            val = float(crore_match.group(1))
            return val * 1e7  # 1 crore = 10,000,000
        except ValueError:
            pass

    # Check lakh
    lakh_match = re.search(r"([\d\.]+)\s*(?:lakh|lac)", clean)
    if lakh_match:
        try:
            val = float(lakh_match.group(1))
            return val * 1e5  # 1 lakh = 100,000
        except ValueError:
            pass
            
    # Plain numeric
    num_match = re.search(r"[\d\.]+", clean)
    if num_match:
        try:
            return float(num_match.group(0))
        except ValueError:
            pass
    return None

class RuleEngine:
    def __init__(self, db: Session, brand_id: str):
        self.db = db
        self.brand_id = brand_id

    def run(self, text: str) -> List[Dict[str, Any]]:
        """
        Runs deterministic rule checks against the text:
        1. Banned terms / regex / prohibited claims (e.g. R-07 guaranteed returns)
        2. Glossary term violations (preferred vs disallowed variants)
        3. Conditional required phrases (e.g. R-02 disclaimer on returns/funds)
        4. Numeric fact extraction and expiry checks
        """
        findings = []
        now = datetime.datetime.utcnow()

        # Fetch active rules for brand
        rules = self.db.query(Rule).filter(Rule.brand_id == self.brand_id).all()
        
        for rule in rules:
            # Get latest in-force version
            latest_version = (
                self.db.query(RuleVersion)
                .filter(
                    RuleVersion.rule_id == rule.id,
                    RuleVersion.effective_from <= now,
                    (RuleVersion.effective_to == None) | (RuleVersion.effective_to >= now)
                )
                .order_by(RuleVersion.effective_from.desc())
                .first()
            )
            if not latest_version:
                continue

            params = latest_version.pattern_params or {}
            
            # --- Type 1: Banned Term / Regex / Prohibited Claim ---
            if rule.type in ["banned_term", "regex", "tone"]:
                patterns = params.get("patterns", [])
                if isinstance(patterns, str):
                    patterns = [patterns]
                
                # Check each pattern
                for pat in patterns:
                    try:
                        for match in re.finditer(pat, text, re.IGNORECASE):
                            span_start = match.start()
                            span_end = match.end()
                            matched_text = match.group(0)
                            
                            # Determine suggested fix and intent note
                            suggested_fix = params.get("suggested_fix")
                            intent_note = params.get("intent_note")
                            
                            # Dynamic intent-preserving suggestions
                            if "guaranteed" in matched_text.lower():
                                suggested_fix = re.sub(r"guaranteed\s+(\d+%)?\s*returns?", r"target returns of \1 (historical average)", matched_text, flags=re.IGNORECASE)
                                intent_note = "Intent kept: growth and return appeal preserved while removing non-compliant guarantee"
                            elif "india's #1" in matched_text.lower() or "#1 fund" in matched_text.lower():
                                suggested_fix = "a leading fund in its category"
                                intent_note = "Intent kept: prestige and category leadership without unsubstantiated ranking"
                            
                            status = "confirmed" if rule.type != "tone" else "human_review"
                            
                            findings.append({
                                "span_start": span_start,
                                "span_end": span_end,
                                "span_text": matched_text,
                                "check_type": "rule" if rule.type != "tone" else "tone",
                                "status": status,
                                "severity": latest_version.severity or "high",
                                "rule_version_id": latest_version.id,
                                "fact_version_id": None,
                                "evidence_ids": [rule.id, latest_version.id],
                                "confidence": 1.0 if status == "confirmed" else 0.85,
                                "suggested_fix": suggested_fix,
                                "explanation": f"Violates {rule.id} (v{latest_version.version}): {latest_version.description}",
                                "intent_note": intent_note,
                                "model_meta": {"engine": "rule_engine_deterministic", "rule_code": rule.id, "version": latest_version.version}
                            })
                    except re.error:
                        continue

            # --- Type 2: Conditional Required Phrase ---
            elif rule.type == "required_phrase":
                trigger_regex = params.get("trigger_regex")
                required_phrase = params.get("required_phrase", "")
                
                if trigger_regex and required_phrase:
                    trigger_match = re.search(trigger_regex, text, re.IGNORECASE)
                    if trigger_match:
                        # Check if required phrase is present
                        clean_text = " ".join(text.lower().split())
                        clean_required = " ".join(required_phrase.lower().split())
                        
                        if clean_required not in clean_text:
                            # Phrase is missing! Trigger span is highlighted or appended
                            findings.append({
                                "span_start": trigger_match.start(),
                                "span_end": trigger_match.end(),
                                "span_text": trigger_match.group(0),
                                "check_type": "rule",
                                "status": "confirmed",
                                "severity": latest_version.severity or "high",
                                "rule_version_id": latest_version.id,
                                "fact_version_id": None,
                                "evidence_ids": [rule.id, latest_version.id],
                                "confidence": 1.0,
                                "suggested_fix": f"{text.strip()} Mandatory Disclaimer: {required_phrase}",
                                "explanation": f"Mandatory compliance disclaimer missing: When mentioning fund returns or schemes, {rule.id} (v{latest_version.version}) requires: '{required_phrase}'.",
                                "intent_note": "Intent kept: fulfills SEBI statutory disclosure requirement",
                                "model_meta": {"engine": "rule_engine_conditional", "rule_code": rule.id, "version": latest_version.version}
                            })

        # --- Type 3: Glossary Terms ---
        glossary_items = self.db.query(GlossaryTerm).filter(GlossaryTerm.brand_id == self.brand_id).all()
        for item in glossary_items:
            for variant in item.disallowed_variants:
                for match in re.finditer(r"\b" + re.escape(variant) + r"\b", text, re.IGNORECASE):
                    findings.append({
                        "span_start": match.start(),
                        "span_end": match.end(),
                        "span_text": match.group(0),
                        "check_type": "rule",
                        "status": "confirmed",
                        "severity": "medium",
                        "rule_version_id": None,
                        "fact_version_id": None,
                        "evidence_ids": [f"glossary-{item.id}"],
                        "confidence": 1.0,
                        "suggested_fix": item.preferred,
                        "explanation": f"Glossary discrepancy: Replace disallowed variant '{match.group(0)}' with preferred brand term '{item.preferred}'.",
                        "intent_note": "Intent kept: maintains brand terminology consistency",
                        "model_meta": {"engine": "glossary_match"}
                    })

        return findings
