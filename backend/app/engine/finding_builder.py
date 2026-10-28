from typing import List, Dict, Any
from backend.app.models import gen_uuid

class FindingBuilder:
    @staticmethod
    def merge_and_deduplicate(
        deterministic_findings: List[Dict[str, Any]],
        grounded_findings: List[Dict[str, Any]],
        draft_version_id: str
    ) -> List[Dict[str, Any]]:
        """
        Merges deterministic findings from the Rule Engine and Grounded AI findings.
        Deduplicates by span overlap and strictly enforces citation invariants.
        """
        # Pool all candidate findings
        candidates = list(deterministic_findings) + list(grounded_findings)
        
        # Sort candidates: longer spans first, then higher confidence
        candidates.sort(key=lambda x: (x["span_end"] - x["span_start"], x.get("confidence", 1.0)), reverse=True)
        
        selected: List[Dict[str, Any]] = []
        for cand in candidates:
            c_start = cand["span_start"]
            c_end = cand["span_end"]
            
            # Check if this candidate is subsumed by or heavily overlaps an already selected finding
            is_subsumed = False
            for sel in selected:
                s_start = sel["span_start"]
                s_end = sel["span_end"]
                
                # If cand is inside sel, or sel is inside cand
                overlap_start = max(s_start, c_start)
                overlap_end = min(s_end, c_end)
                if overlap_end > overlap_start:
                    overlap_len = overlap_end - overlap_start
                    c_len = c_end - c_start
                    # If overlap is > 60% of this candidate's length, it's subsumed by the larger span
                    if c_len > 0 and (overlap_len / c_len) >= 0.6:
                        is_subsumed = True
                        break
            
            if not is_subsumed:
                selected.append(cand)

        all_findings = selected

        # Enforce citation invariants & build final records
        processed_findings = []
        for f in all_findings:
            status = f.get("status", "human_review")
            rule_ver_id = f.get("rule_version_id")
            fact_ver_id = f.get("fact_version_id")
            evidence_ids = f.get("evidence_ids", [])

            # CRITICAL INVARIANT:
            # "A finding with no citation can only be needs_verification or human_review. Enforce that in the Finding Builder, not in the prompt."
            has_citation = bool(rule_ver_id or fact_ver_id or (evidence_ids and len(evidence_ids) > 0))
            if not has_citation and status in ["confirmed", "expired"]:
                status = "needs_verification"

            finding_id = gen_uuid("f-")
            processed_findings.append({
                "id": finding_id,
                "draft_version_id": draft_version_id,
                "span_start": f["span_start"],
                "span_end": f["span_end"],
                "span_text": f["span_text"],
                "check_type": f["check_type"],
                "status": status,
                "resolution": "unresolved",
                "severity": f.get("severity", "medium"),
                "rule_version_id": rule_ver_id,
                "fact_version_id": fact_ver_id,
                "evidence_ids": evidence_ids,
                "confidence": f.get("confidence", 1.0 if status == "confirmed" else 0.85),
                "suggested_fix": f.get("suggested_fix"),
                "explanation": f["explanation"],
                "intent_note": f.get("intent_note"),
                "model_meta": f.get("model_meta", {})
            })

        # Sort findings by span start position in text
        processed_findings.sort(key=lambda x: x["span_start"])
        return processed_findings
