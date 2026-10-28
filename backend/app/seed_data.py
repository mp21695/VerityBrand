import datetime
import hashlib
from backend.app.database import SessionLocal
from backend.app.models import (
    User, Brand, Rule, RuleVersion, Fact, FactVersion, SourceDoc, GlossaryTerm,
    Draft, DraftVersion
)
from backend.app.auth import get_password_hash
from backend.app.audit import record_audit_event

def seed_database():
    db = SessionLocal()
    try:
        # Ensure all standard users exist
        standard_users = [
            ("user_riya", "riya@arthaa.com", "Riya Sharma", "creator"),
            ("user_arjun", "arjun@arthaa.com", "Arjun Patel", "compliance_owner"),
            ("user_priya", "priya@arthaa.com", "Priya Nair", "reviewer"),
            ("user_admin", "admin@brandproof.io", "System Administrator", "admin"),
        ]
        for u_id, u_email, u_name, u_role in standard_users:
            if not db.query(User).filter(User.id == u_id).first():
                db.add(User(
                    id=u_id,
                    email=u_email,
                    name=u_name,
                    role=u_role,
                    password_hash=get_password_hash("password123")
                ))
        db.commit()

        # Check if brand already seeded
        if db.query(Brand).filter(Brand.id == "brand_arthaa").first():
            return

        print("Seeding BrandProof initial governance data...")
        now = datetime.datetime.utcnow()

        # 2. Brand
        brand = Brand(
            id="brand_arthaa",
            name="Arthaa Finserv",
            description="Leading wealth management and mutual fund house in India."
        )
        db.add(brand)
        db.commit()

        # 3. Source Document E-014
        e014_content = (
            "Arthaa Gold Savings Fund (Direct Plan - Growth). "
            "Total Assets Under Management (AUM) as of audited ledger: ₹3,850 crore. "
            "Expense ratio: 0.45%. CRISIL Rank 2 (Gold Category). "
            "All return calculations are indicative and based on 5-year CAGR of 11.4%. "
            "Audited by S.R. Batliboi & Co. LLP."
        )
        e014_hash = hashlib.sha256(e014_content.encode("utf-8")).hexdigest()
        source_doc = SourceDoc(
            id="E-014",
            brand_id="brand_arthaa",
            title="Q1 FY26 Fund Factsheet & Finance Ledger",
            type="Finance Ledger",
            file_uri="/docs/E-014_Q1_FY26_Fund_Factsheet.pdf",
            hash=e014_hash,
            content=e014_content
        )
        db.add(source_doc)
        db.commit()

        # 4. Fact F-021 (with 30 Jun 2026 expiry per demo script)
        f021 = Fact(
            id="F-021",
            brand_id="brand_arthaa",
            key="fund.gold.aum",
            name="Arthaa Gold Savings Fund AUM",
            current_version="1.0"
        )
        db.add(f021)
        
        f021_ver = FactVersion(
            id="fv-f021-v10",
            fact_id="F-021",
            version="1.0",
            value="₹3,850 crore",
            unit="₹ crore",
            scope="Arthaa Gold Savings Fund Q1 FY26",
            source_doc_id="E-014",
            valid_from=datetime.datetime(2026, 1, 1),
            valid_until=datetime.datetime(2026, 6, 30, 23, 59, 59)  # 30 Jun 2026
        )
        db.add(f021_ver)
        db.commit()

        # 5. Rule R-07 (v2.0) - Prohibition on Guaranteed Returns
        r07 = Rule(
            id="R-07",
            brand_id="brand_arthaa",
            name="Prohibition on Guaranteed Returns",
            type="banned_term",
            current_version="2.0"
        )
        db.add(r07)

        # Deprecated v1.0
        r07_v1 = RuleVersion(
            id="rv-r07-v10",
            rule_id="R-07",
            version="1.0",
            pattern_params={"patterns": [r"guaranteed\s+returns?"]},
            description="SEBI Mutual Fund Regulations forbid promising guaranteed returns.",
            severity="high",
            effective_from=datetime.datetime(2025, 1, 1),
            effective_to=datetime.datetime(2026, 1, 1),
            created_by="Arjun Patel (Compliance Owner)"
        )
        # Active in-force v2.0
        r07_v2 = RuleVersion(
            id="rv-r07-v20",
            rule_id="R-07",
            version="2.0",
            pattern_params={
                "patterns": [
                    r"guaranteed\s+(\d+%)?\s*returns?",
                    r"assured\s+returns?",
                    r"risk-free\s+returns?"
                ],
                "suggested_fix": "target returns of 12% (historical average)",
                "intent_note": "Intent kept: growth appeal without illegal guarantee"
            },
            description="SEBI Mutual Fund Regulations (Clause 7B) strictly forbid promising or guaranteeing specific returns on market-linked schemes.",
            severity="high",
            effective_from=datetime.datetime(2026, 1, 1),
            effective_to=None,
            created_by="Arjun Patel (Compliance Owner)"
        )
        db.add_all([r07_v1, r07_v2])

        # 6. Rule R-02 (v1.0) - Mandatory Market Risk Disclaimer
        r02 = Rule(
            id="R-02",
            brand_id="brand_arthaa",
            name="Mandatory Market Risk Disclaimer",
            type="required_phrase",
            current_version="1.0"
        )
        db.add(r02)
        r02_v1 = RuleVersion(
            id="rv-r02-v10",
            rule_id="R-02",
            version="1.0",
            pattern_params={
                "trigger_regex": r"(?:returns?|fund|scheme|cagr|wealth|invest)",
                "required_phrase": "Mutual fund investments are subject to market risks, read all scheme related documents carefully."
            },
            description="Mandatory SEBI disclosure required on all promotional material that mentions returns, funds, or capital investment.",
            severity="high",
            effective_from=datetime.datetime(2026, 1, 1),
            created_by="Arjun Patel"
        )
        db.add(r02_v1)

        # 7. Rule R-12 (v1.0) - Tone / Unsubstantiated Ranking
        r12 = Rule(
            id="R-12",
            brand_id="brand_arthaa",
            name="Substantiation of Ranking Claims",
            type="tone",
            current_version="1.0"
        )
        db.add(r12)
        r12_v1 = RuleVersion(
            id="rv-r12-v10",
            rule_id="R-12",
            version="1.0",
            pattern_params={
                "patterns": [r"india'?s\s+#1\s+fund", r"best\s+fund\s+in\s+india", r"#1\s+fund"],
                "suggested_fix": "a leading fund in its category"
            },
            description="Ranking claims (#1, Best Fund) require verifiable third-party certification citation per ASCI / SEBI guidelines.",
            severity="medium",
            effective_from=datetime.datetime(2026, 1, 1),
            created_by="Arjun Patel"
        )
        db.add(r12_v1)

        # 8. Glossary Terms
        glossary1 = GlossaryTerm(
            id="gt-01",
            brand_id="brand_arthaa",
            preferred="Gold Savings Fund",
            disallowed_variants=["Gold Scheme", "Gold Chit"],
            category="Product Terminology"
        )
        db.add(glossary1)
        db.commit()

        # 9. Pre-seeded Draft: Gold Savings Fund Launch Copy (Golden Demo Text)
        demo_text = "Invest in Arthaa Gold Savings Fund today with guaranteed 12% returns. With an AUM of ₹4,200 crore, it is India's #1 fund for secure wealth generation."
        demo_hash = hashlib.sha256(demo_text.encode("utf-8")).hexdigest()

        demo_draft = Draft(
            id="draft-gold-fund",
            brand_id="brand_arthaa",
            title="Gold Savings Fund Launch Copy",
            campaign="Diwali Wealth Campaign 2026",
            creator_id="user_riya",
            current_version_number=1
        )
        db.add(demo_draft)

        draft_v1 = DraftVersion(
            id="dv-draft-gold-fund-v1",
            draft_id="draft-gold-fund",
            version_number=1,
            text=demo_text,
            status="draft",
            content_hash=demo_hash
        )
        db.add(draft_v1)
        db.commit()

        # Record Genesis Audit Event
        record_audit_event(
            db=db,
            actor_id="system",
            actor_name="VerityBrand Genesis",
            verb="seed_system",
            object_type="brand",
            object_id="brand_arthaa",
            payload={
                "brand": "Arthaa Finserv",
                "rules_seeded": ["R-07", "R-02", "R-12"],
                "facts_seeded": ["F-021"],
                "sources_seeded": ["E-014"]
            }
        )
        db.commit()
        print("VerityBrand initial governance seed completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    from backend.app.database import Base, engine
    Base.metadata.create_all(bind=engine)
    seed_database()
