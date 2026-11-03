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
        # Check if already seeded with brand_nova
        if db.query(Brand).filter(Brand.id == "brand_nova").first():
            return

        print("Seeding VerityBrand governance data for NOVA Footwear...")
        now = datetime.datetime.utcnow()

        # 1. Users (Matching 4 RBAC Personas)
        users = [
            User(id="user_riya", email="creator@veritybrand.demo", name="Riya Sharma", role="creator", password_hash=get_password_hash("creator123")),
            User(id="user_arjun", email="reviewer@veritybrand.demo", name="Arjun Verma", role="reviewer", password_hash=get_password_hash("reviewer123")),
            User(id="user_priya", email="approver@veritybrand.demo", name="Priya Sundaram", role="approver", password_hash=get_password_hash("approver123")),
            User(id="user_harini", email="admin@veritybrand.demo", name="Harini Nair", role="admin", password_hash=get_password_hash("admin123")),
        ]
        for u in users:
            existing = db.query(User).filter(User.id == u.id).first()
            if existing:
                existing.email = u.email
                existing.name = u.name
                existing.role = u.role
                existing.password_hash = u.password_hash
            else:
                db.add(u)
        db.commit()

        # 2. Brand
        brand = Brand(
            id="brand_nova",
            name="NOVA Footwear",
            description="Performance footwear for everyday athletes."
        )
        db.add(brand)
        db.commit()

        # 3. Source Documents
        src_product_facts = (
            "NOVA Footwear Technical Specification — NOVA AeroRun X1.\n"
            "Weight: 218 g per shoe.\n"
            "Upper: Engineered mesh for breathability.\n"
            "Midsole: EVA foam responsive everyday cushioning.\n"
            "Outsole: Rubber traction outsole for all-weather grip.\n"
            "Sizes: 6, 7, 8, 9, 10, 11.\n"
            "Intended use: Everyday running and training.\n"
            "Performance Testing: Up to 40 km tested durability certified in road running laboratory tests.\n"
            "Product launch date: 1 November 2026."
        )
        src_pricing = (
            "NOVA Footwear Master Pricing Catalog.\n"
            "Product: NOVA AeroRun X1.\n"
            "Standard retail price: ₹4,499.\n"
            "Launch campaign price: ₹3,999 (Monsoon Running Campaign).\n"
            "Campaign price validity window: 1 November 2026 to 15 November 2026.\n"
            "After 15 November 2026, standard price of ₹4,499 applies across all retail channels."
        )
        src_guidelines = (
            "NOVA Footwear Brand Guidelines & Claims Policy.\n"
            "Brand voice: Confident, energetic, practical, athlete-focused, clear and concise. Avoid exaggerated promises.\n"
            "Preferred terms: lightweight, performance, designed for everyday running, tested durability, responsive cushioning, breathable upper.\n"
            "Avoid terms: miracle, guaranteed performance, injury-proof, prevents injuries, world's best, India's #1, unbeatable, guaranteed to make you faster.\n"
            "Claims Policy 1: Quantified claims require approved evidence.\n"
            "Claims Policy 2: Comparative claims require an approved comparison baseline.\n"
            "Claims Policy 3: Superlative claims require approved ranking or market evidence.\n"
            "Claims Policy 4: Performance claims must reference an approved test or product document.\n"
            "Claims Policy 5: Pricing claims must be checked against valid pricing source."
        )

        doc1 = SourceDoc(
            id="SRC-02",
            brand_id="brand_nova",
            title="Product_Facts.pdf",
            type="Technical Specification",
            file_uri="/docs/Product_Facts.pdf",
            hash=hashlib.sha256(src_product_facts.encode("utf-8")).hexdigest(),
            content=src_product_facts
        )
        doc2 = SourceDoc(
            id="SRC-03",
            brand_id="brand_nova",
            title="Pricing_Master.pdf",
            type="Pricing Ledger",
            file_uri="/docs/Pricing_Master.pdf",
            hash=hashlib.sha256(src_pricing.encode("utf-8")).hexdigest(),
            content=src_pricing
        )
        doc3 = SourceDoc(
            id="SRC-01",
            brand_id="brand_nova",
            title="Brand_Guidelines.pdf",
            type="Brand Guidelines",
            file_uri="/docs/Brand_Guidelines.pdf",
            hash=hashlib.sha256(src_guidelines.encode("utf-8")).hexdigest(),
            content=src_guidelines
        )
        db.add_all([doc1, doc2, doc3])
        db.commit()

        # 4. Product Facts
        facts_data = [
            ("F-01", "shoe.weight", "Weight per shoe", "218 g per shoe", "NOVA AeroRun X1 Specifications", "SRC-02", datetime.datetime(2026, 10, 1), datetime.datetime(2027, 12, 31)),
            ("F-02", "shoe.upper", "Upper material", "Engineered mesh", "NOVA AeroRun X1 Materials", "SRC-02", datetime.datetime(2026, 10, 1), datetime.datetime(2027, 12, 31)),
            ("F-03", "shoe.midsole", "Midsole cushioning", "EVA foam (Responsive everyday cushioning)", "NOVA AeroRun X1 Cushioning", "SRC-02", datetime.datetime(2026, 10, 1), datetime.datetime(2027, 12, 31)),
            ("F-05", "shoe.durability", "Tested durability", "Up to 40 km tested durability", "Performance Testing", "SRC-02", datetime.datetime(2026, 10, 1), datetime.datetime(2027, 12, 31)),
            ("F-07", "price.standard", "Standard price", "₹4,499", "NOVA AeroRun X1 Standard Catalog", "SRC-03", datetime.datetime(2026, 10, 1), datetime.datetime(2027, 12, 31)),
            ("F-08", "price.launch", "Launch campaign price", "₹3,999", "Monsoon Running Campaign", "SRC-03", datetime.datetime(2026, 11, 1), datetime.datetime(2026, 11, 15, 23, 59, 59)),
        ]

        for fid, fkey, fname, fval, fscope, fsrc, vfrom, vuntil in facts_data:
            fact_obj = Fact(id=fid, brand_id="brand_nova", key=fkey, name=fname, current_version="1.0")
            db.add(fact_obj)
            fver = FactVersion(
                id=f"fv-{fid.lower()}-v10",
                fact_id=fid,
                version="1.0",
                value=fval,
                unit="",
                scope=fscope,
                source_doc_id=fsrc,
                valid_from=vfrom,
                valid_until=vuntil
            )
            db.add(fver)
        db.commit()

        # 5. Rules
        # R-01: Comparative claims require approved comparison baseline
        r01 = Rule(id="R-01", brand_id="brand_nova", name="Comparative Claims Baseline", type="regex", current_version="2.0")
        r01_v2 = RuleVersion(
            id="rv-r01-v20",
            rule_id="R-01",
            version="2.0",
            pattern_params={
                "patterns": [r"\d+%\s*lighter", r"\d+%\s*faster"],
                "suggested_fix": "Lightweight performance footwear designed for everyday running",
                "intent_note": "Replaces unverified comparative metric with approved product positioning"
            },
            description="Comparative claims ('% lighter') require an approved comparison baseline and test methodology.",
            severity="high",
            effective_from=datetime.datetime(2026, 10, 1),
            created_by="Harini Nair (Admin)"
        )

        # R-03: Superlative claims require market evidence
        r03 = Rule(id="R-03", brand_id="brand_nova", name="Superlative Claims Substantiation", type="tone", current_version="1.0")
        r03_v1 = RuleVersion(
            id="rv-r03-v10",
            rule_id="R-03",
            version="1.0",
            pattern_params={
                "patterns": [r"india'?s\s+#1\s+running\s+shoe", r"#1\s+running\s+shoe", r"the\s+world'?s\s+best\s+running\s+shoe"],
                "suggested_fix": "Designed for everyday running"
            },
            description="Superlative ranking claims require approved market ranking or independent third-party certification.",
            severity="high",
            effective_from=datetime.datetime(2026, 10, 1),
            created_by="Harini Nair (Admin)"
        )

        # R-04: No guaranteed performance claims
        r04 = Rule(id="R-04", brand_id="brand_nova", name="Prohibition on Guaranteed Performance", type="banned_term", current_version="2.1")
        r04_v2 = RuleVersion(
            id="rv-r04-v21",
            rule_id="R-04",
            version="2.1",
            pattern_params={
                "patterns": [r"guaranteed\s+to\s+make\s+every\s+run\s+faster", r"guaranteed\s+performance", r"guaranteed\s+speed"],
                "suggested_fix": "Engineered for responsive everyday training",
                "intent_note": "Replaces absolute speed guarantee with approved training specification"
            },
            description="Content must never state or imply guaranteed speed or performance.",
            severity="critical",
            effective_from=datetime.datetime(2026, 10, 1),
            created_by="Harini Nair (Admin)"
        )

        db.add_all([r01, r01_v2, r03, r03_v1, r04, r04_v2])
        db.commit()

        # 6. Glossary Terms
        glossary_items = [
            ("gt-nova-01", "Designed for Everyday Running", ["Guaranteed Performance", "Guaranteed to make you faster"], "Claims"),
            ("gt-nova-02", "Responsive Cushioning", ["Injury-Proof", "Prevents Injuries"], "Medical/Claims"),
            ("gt-nova-03", "Lightweight Performance Footwear", ["India's #1", "World's Best", "Unbeatable"], "Superlatives"),
            ("gt-nova-04", "Up to 40 km Tested Durability", ["Lasts 500 km"], "Durability"),
        ]
        for gid, pref, dis, cat in glossary_items:
            existing_gt = db.query(GlossaryTerm).filter(GlossaryTerm.id == gid).first()
            if existing_gt:
                existing_gt.preferred = pref
                existing_gt.disallowed_variants = dis
                existing_gt.category = cat
            else:
                db.add(GlossaryTerm(id=gid, brand_id="brand_nova", preferred=pref, disallowed_variants=dis, category=cat))
        db.commit()

        # 7. Seeded Demo Draft: NOVA AeroRun X1
        demo_text = (
            "NOVA AERORUN X1\n\n"
            "Built for your fastest miles.\n\n"
            "30% lighter than leading running shoes.\n\n"
            "Up to 40 km tested durability.\n\n"
            "India's #1 running shoe.\n\n"
            "Guaranteed to make every run faster.\n\n"
            "Now ₹3,999."
        )
        demo_hash = hashlib.sha256(demo_text.encode("utf-8")).hexdigest()

        demo_draft = Draft(
            id="draft-nova-aerorun",
            brand_id="brand_nova",
            title="NOVA AeroRun X1 — Monsoon Running Campaign",
            campaign="Monsoon Running Campaign 2026",
            creator_id="user_riya",
            current_version_number=1
        )
        db.add(demo_draft)

        draft_v1 = DraftVersion(
            id="dv-draft-nova-aerorun-v1",
            draft_id="draft-nova-aerorun",
            version_number=1,
            text=demo_text,
            status="draft",
            content_hash=demo_hash
        )
        db.add(draft_v1)
        db.commit()

        # 8. Record Genesis Audit Event
        record_audit_event(
            db=db,
            actor_id="system",
            actor_name="VerityBrand Genesis",
            verb="seed_system",
            object_type="brand",
            object_id="brand_nova",
            payload={
                "brand": "NOVA Footwear",
                "rules_seeded": ["R-01", "R-03", "R-04"],
                "facts_seeded": ["F-01", "F-05", "F-07", "F-08"],
                "sources_seeded": ["SRC-01", "SRC-02", "SRC-03"]
            }
        )
        db.commit()

        # Pre-run analysis pipeline on initial demo draft
        from backend.app.workers.tasks import run_analysis_pipeline
        run_analysis_pipeline(
            draft_version_id="dv-draft-nova-aerorun-v1",
            actor_id="user_riya",
            actor_name="Riya Sharma"
        )
        print("NOVA Footwear governance seed completed successfully!")

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
