"""
Generate multi-page enterprise PDF documents for NOVA Footwear.
Creates real, formatted multi-page PDFs with tables, headers, footers, and metadata:
- 01_NOVA_Brand_Guidelines.pdf
- 02_NOVA_Product_Facts.pdf
- 03_NOVA_Pricing_Master.pdf
- 04_NOVA_Approved_Claims.pdf

Also copies them to their canonical short names in public/docs/.
"""

import os
import sys
import shutil

sys.stdout.reconfigure(encoding='utf-8')
from reportlab.lib.pagesizes import letter
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

# Register TrueType fonts for proper Unicode and symbol support
try:
    pdfmetrics.registerFont(TTFont('Arial', 'C:/Windows/Fonts/arial.ttf'))
    pdfmetrics.registerFont(TTFont('Arial-Bold', 'C:/Windows/Fonts/arialbd.ttf'))
    pdfmetrics.registerFont(TTFont('Arial-Italic', 'C:/Windows/Fonts/ariali.ttf'))
    MAIN_FONT = 'Arial'
    BOLD_FONT = 'Arial-Bold'
    ITALIC_FONT = 'Arial-Italic'
except Exception:
    MAIN_FONT = 'Helvetica'
    BOLD_FONT = 'Helvetica-Bold'
    ITALIC_FONT = 'Helvetica-Oblique'

class NumberedCanvas(canvas.Canvas):
    """Two-pass canvas to dynamically compute and stamp 'Page X of Y' on all pages."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        # Top Header line
        self.setStrokeColor(colors.HexColor("#264831"))
        self.setLineWidth(1)
        self.line(40, 755, 572, 755)

        self.setFont(MAIN_FONT, 8)
        self.setFillColor(colors.HexColor("#666666"))
        self.drawString(40, 762, "NOVA FOOTWEAR — BRAND GOVERNANCE STUDIO")
        self.drawRightString(572, 762, "CONFIDENTIAL / INTERNAL STANDARD")

        # Bottom Footer line
        self.setStrokeColor(colors.HexColor("#CCCCCC"))
        self.setLineWidth(0.5)
        self.line(40, 45, 572, 45)

        self.drawString(40, 32, "Tamper-evident verification hash attached to master repository")
        self.drawRightString(572, 32, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()

def get_nova_styles():
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'NovaTitle',
        parent=styles['Heading1'],
        fontName=BOLD_FONT,
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#1C1A18"),
        spaceAfter=4
    )
    
    subtitle_style = ParagraphStyle(
        'NovaSubtitle',
        parent=styles['Normal'],
        fontName=ITALIC_FONT,
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#264831"),
        spaceAfter=12
    )

    h2_style = ParagraphStyle(
        'NovaH2',
        parent=styles['Heading2'],
        fontName=BOLD_FONT,
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#1C1A18"),
        spaceBefore=10,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'NovaBody',
        parent=styles['BodyText'],
        fontName=MAIN_FONT,
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#2A2825")
    )

    bullet_style = ParagraphStyle(
        'NovaBullet',
        parent=body_style,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=4
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName=BOLD_FONT,
        fontSize=8.5,
        leading=11,
        textColor=colors.white
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName=MAIN_FONT,
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#1C1A18")
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=table_cell_style,
        fontName=BOLD_FONT
    )

    return {
        'title': title_style,
        'subtitle': subtitle_style,
        'h2': h2_style,
        'body': body_style,
        'bullet': bullet_style,
        'th': table_header_style,
        'td': table_cell_style,
        'td_bold': table_cell_bold,
    }

def build_pdf(filepath, story):
    doc = SimpleDocTemplate(
        filepath,
        pagesize=letter,
        leftMargin=40,
        rightMargin=40,
        topMargin=55,
        bottomMargin=55
    )
    doc.build(story, canvasmaker=NumberedCanvas)

# ==============================================================================
# 01. NOVA Brand Guidelines (Multi-Page: 2 Pages)
# ==============================================================================
def make_brand_guidelines(filepath):
    s = get_nova_styles()
    story = []

    # Title & Metadata
    story.append(Paragraph("NOVA BRAND GUIDELINES & CLAIMS POLICY", s['title']))
    story.append(Paragraph("Doc ID: 01_NOVA_Brand_Guidelines.pdf · Version 2.1 · Effective: 01 Oct 2026", s['subtitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#264831"), spaceAfter=10))

    # Section 1: Brand Voice
    story.append(Paragraph("1. Brand Voice & Positioning Persona", s['h2']))
    story.append(Paragraph(
        "NOVA Footwear crafts high-performance athletic footwear designed specifically for everyday athletes. "
        "Every piece of published communication must reflect our core brand voice pillars:",
        s['body']
    ))
    story.append(Spacer(1, 4))
    story.append(Paragraph("• <b>Confident & Energetic:</b> Inspire athletes to achieve their personal milestones without hyperbole.", s['bullet']))
    story.append(Paragraph("• <b>Practical & Grounded:</b> Highlight technical specifications and real road performance over abstract lifestyle promises.", s['bullet']))
    story.append(Paragraph("• <b>Athlete-Focused:</b> Address runners directly, emphasizing durability, breathable fit, and responsive cushioning.", s['bullet']))
    story.append(Paragraph("• <b>Clear & Concise:</b> Deliver claims with precision; avoid exaggerated or absolute guarantees.", s['bullet']))

    # Section 2: Preferred Terminology Matrix
    story.append(Spacer(1, 8))
    story.append(Paragraph("2. Approved Terminology & Phrasing Standards", s['h2']))
    
    term_data = [
        [Paragraph("Category", s['th']), Paragraph("Preferred Terminology", s['th']), Paragraph("Prohibited Language", s['th']), Paragraph("Policy Rationale", s['th'])],
        [Paragraph("Product Class", s['td_bold']), Paragraph("Lightweight performance footwear", s['td']), Paragraph("World's best shoe / India's #1", s['td']), Paragraph("Superlatives require unexpired audited market ranking.", s['td'])],
        [Paragraph("Durability", s['td_bold']), Paragraph("Tested durability (up to 40 km)", s['td']), Paragraph("Lasts 500 km / indestructible", s['td']), Paragraph("Claims must reflect certified test limits (PT-2026-041).", s['td'])],
        [Paragraph("Cushioning", s['td_bold']), Paragraph("Responsive everyday cushioning", s['td']), Paragraph("Injury-proof / prevents injuries", s['td']), Paragraph("Medical and injury prevention claims require clinical trials.", s['td'])],
        [Paragraph("Performance", s['td_bold']), Paragraph("Engineered for everyday training", s['td']), Paragraph("Guaranteed to make you faster", s['td']), Paragraph("Absolute speed guarantees are prohibited by claims policy.", s['td'])],
        [Paragraph("Upper Material", s['td_bold']), Paragraph("Engineered mesh breathable upper", s['td']), Paragraph("Miracle fabric / revolutionary upper", s['td']), Paragraph("Adhere to factual material definitions.", s['td'])],
    ]
    t = Table(term_data, colWidths=[85, 140, 140, 167])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#264831")),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#D0D0D0")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#FBF9F4"), colors.white]),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t)

    # PAGE BREAK -> Page 2
    story.append(PageBreak())

    # Section 3: 10 Claims Policy Rules
    story.append(Paragraph("3. The 10 In-Force Claims Policy Rules", s['h2']))
    story.append(Paragraph(
        "All customer-facing advertising copy, social media creative, packaging, and catalog assets must comply with these ten immutable policies:",
        s['body']
    ))
    story.append(Spacer(1, 6))

    rules_data = [
        [Paragraph("Rule #", s['th']), Paragraph("Rule Name", s['th']), Paragraph("Requirement & Evidence Threshold", s['th']), Paragraph("Severity", s['th'])],
        [Paragraph("R-01", s['td_bold']), Paragraph("Comparative Claims", s['td']), Paragraph("Comparative claims (% lighter, faster) require an approved comparison baseline and test methodology.", s['td']), Paragraph("High", s['td'])],
        [Paragraph("R-02", s['td_bold']), Paragraph("Quantified Claims", s['td']), Paragraph("All numeric metrics (weight, mileage, hours) must reference an approved product fact.", s['td']), Paragraph("High", s['td'])],
        [Paragraph("R-03", s['td_bold']), Paragraph("Superlative Claims", s['td']), Paragraph("#1, Best, Leading claims require accredited market-share or third-party ranking documentation.", s['td']), Paragraph("High", s['td'])],
        [Paragraph("R-04", s['td_bold']), Paragraph("Prohibited Guarantees", s['td']), Paragraph("Content must never state or imply guaranteed speed, performance, or running outcomes.", s['td']), Paragraph("Critical", s['td'])],
        [Paragraph("R-05", s['td_bold']), Paragraph("Pricing Validity", s['td']), Paragraph("Promotional pricing must match the current active pricing window in Pricing_Master.pdf.", s['td']), Paragraph("High", s['td'])],
        [Paragraph("R-06", s['td_bold']), Paragraph("Expired Campaigns", s['td']), Paragraph("Post-campaign assets citing promotional pricing must be flagged as Expired Promotional Claims.", s['td']), Paragraph("Medium", s['td'])],
        [Paragraph("R-07", s['td_bold']), Paragraph("Medical Claims", s['td']), Paragraph("Claims of injury prevention or orthopedic cure are strictly prohibited without clinical certification.", s['td']), Paragraph("Critical", s['td'])],
        [Paragraph("R-08", s['td_bold']), Paragraph("Product Specs", s['td']), Paragraph("Descriptions of materials, foam density, and outsole traction must match engineering specs.", s['td']), Paragraph("High", s['td'])],
        [Paragraph("R-09", s['td_bold']), Paragraph("Visual Logo Safety", s['td']), Paragraph("NOVA wordmark requires minimum 24px exclusion margin on all banners and digital assets.", s['td']), Paragraph("Low", s['td'])],
        [Paragraph("R-10", s['td_bold']), Paragraph("Limited Results", s['td']), Paragraph("Content must not imply guarantees where the approved source only supports a limited test result.", s['td']), Paragraph("High", s['td'])],
    ]
    t_rules = Table(rules_data, colWidths=[45, 115, 312, 60])
    t_rules.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#264831")),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#D0D0D0")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#FBF9F4"), colors.white]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_rules)

    # Section 4: Visual & Accessibility Standards
    story.append(Spacer(1, 10))
    story.append(Paragraph("4. Visual & Accessibility Governance (WCAG 2.1 AA)", s['h2']))
    story.append(Paragraph("• <b>Color Contrast:</b> Body copy over images must meet a minimum 4.5:1 contrast ratio; display headers require 3.0:1.", s['bullet']))
    story.append(Paragraph("• <b>Screen-Reader Alt Text:</b> All campaign creative banners require descriptive alternative text before publishing.", s['bullet']))
    story.append(Paragraph("• <b>Master Logo Clearspace:</b> 24px exclusion zone around the NOVA emblem; no typography may intrude.", s['bullet']))

    build_pdf(filepath, story)

# ==============================================================================
# 02. NOVA Product Facts (Multi-Page: 2 Pages)
# ==============================================================================
def make_product_facts(filepath):
    s = get_nova_styles()
    story = []

    # Title & Header
    story.append(Paragraph("NOVA PRODUCT SPECIFICATIONS & TECHNICAL FACTS", s['title']))
    story.append(Paragraph("Doc ID: 02_NOVA_Product_Facts.pdf · Engineering Dossier · Effective: 15 Oct 2026", s['subtitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#264831"), spaceAfter=10))

    story.append(Paragraph("1. Certified Product Specifications", s['h2']))
    story.append(Paragraph("Authoritative engineering bill of materials and physical specifications for the NOVA AeroRun X1 shoe:", s['body']))
    story.append(Spacer(1, 6))

    # EXACT Table 1 from user prompt: Product Specifications
    specs_data = [
        [Paragraph("Field", s['th']), Paragraph("Approved Value", s['th']), Paragraph("Engineering Reference / Standard", s['th'])],
        [Paragraph("Product", s['td_bold']), Paragraph("NOVA AeroRun X1", s['td']), Paragraph("Master SKU: NF-AR-X1-2026", s['td'])],
        [Paragraph("Weight", s['td_bold']), Paragraph("218 g per shoe (Men's Size 9)", s['td']), Paragraph("Laboratory scale test (ISO 20871)", s['td'])],
        [Paragraph("Upper", s['td_bold']), Paragraph("Engineered mesh", s['td']), Paragraph("Monofilament high-breathability weave", s['td'])],
        [Paragraph("Midsole", s['td_bold']), Paragraph("EVA foam", s['td']), Paragraph("Responsive everyday cushioning compound", s['td'])],
        [Paragraph("Outsole", s['td_bold']), Paragraph("Rubber traction outsole", s['td']), Paragraph("Multi-surface monsoon road compound", s['td'])],
        [Paragraph("Sizes", s['td_bold']), Paragraph("6–11 (UK / India standard)", s['td']), Paragraph("Production size mold specification", s['td'])],
        [Paragraph("Intended use", s['td_bold']), Paragraph("Everyday running and training", s['td']), Paragraph("Road & track training category", s['td'])],
    ]
    t_specs = Table(specs_data, colWidths=[120, 190, 222])
    t_specs.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#264831")),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#D0D0D0")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#FBF9F4"), colors.white]),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_specs)

    story.append(Spacer(1, 10))
    story.append(Paragraph("Product Launch Details", s['h2']))
    story.append(Paragraph("• <b>Launch Date:</b> 01 November 2026", s['bullet']))
    story.append(Paragraph("• <b>Primary Campaign:</b> Monsoon Running Campaign 2026", s['bullet']))
    story.append(Paragraph("• <b>Target Cadence:</b> Daily training miles (5K to 15K weekly road mileage)", s['bullet']))

    # PAGE BREAK -> Page 2
    story.append(PageBreak())

    story.append(Paragraph("2. Performance Evidence Dossier", s['h2']))
    story.append(Paragraph("Certified testing results recorded at NOVA Footwear Performance Laboratory (Bengaluru, India):", s['body']))
    story.append(Spacer(1, 6))

    # EXACT Table 2 from user prompt: Performance Evidence
    evidence_data = [
        [Paragraph("Claim", s['th']), Paragraph("Result", s['th']), Paragraph("Evidence", s['th'])],
        [Paragraph("Tested durability", s['td_bold']), Paragraph("Up to 40 km", s['td']), Paragraph("Performance Test PT-2026-041", s['td'])],
        [Paragraph("Lightweight", s['td_bold']), Paragraph("218 g", s['td']), Paragraph("Product Specification PS-2026-018", s['td'])],
        [Paragraph("Injury prevention", s['td_bold']), Paragraph("Not tested", s['td']), Paragraph("— (Prohibited from marketing claims)", s['td'])],
        [Paragraph("Guaranteed speed improvement", s['td_bold']), Paragraph("Not tested", s['td']), Paragraph("— (Prohibited from marketing claims)", s['td'])],
    ]
    t_ev = Table(evidence_data, colWidths=[150, 140, 242])
    t_ev.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#264831")),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#D0D0D0")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#FBF9F4"), colors.white]),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_ev)

    story.append(Spacer(1, 14))
    story.append(Paragraph("3. Laboratory Testing Notes & Certification Sign-Off", s['h2']))
    story.append(Paragraph(
        "<b>Performance Test PT-2026-041:</b> Multi-stage accelerated road simulator protocol. "
        "Ten production samples completed 40 kilometers of continuous tarmac impact at 12 km/h. "
        "Outsole lug wear remained below 0.8 mm; midsole EVA foam retained 94.2% energy absorption elasticity. "
        "Testing certified up to 40 km. Projections beyond 40 km are unverified.",
        s['body']
    ))
    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>Certifying Engineer:</b> Dr. K. Ramanathan, Head of Materials Engineering", s['body']))
    story.append(Paragraph("<b>Accreditation:</b> National Footwear Testing Laboratory · Registration NFTL-2026-88", s['body']))

    build_pdf(filepath, story)

# ==============================================================================
# 03. NOVA Pricing Master (Multi-Page: 2 Pages)
# ==============================================================================
def make_pricing_master(filepath):
    s = get_nova_styles()
    story = []

    # Title & Header
    story.append(Paragraph("NOVA COMMERCIAL PRICING & PROMOTIONS SCHEDULE", s['title']))
    story.append(Paragraph("Doc ID: 03_NOVA_Pricing_Master.pdf · Commercial Operations · Q4 2026", s['subtitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#264831"), spaceAfter=10))

    story.append(Paragraph("1. Regional Pricing & Promotional Validity Schedule", s['h2']))
    story.append(Paragraph("Authoritative retail and promotional pricing matrix for the NOVA AeroRun X1 launch campaign:", s['body']))
    story.append(Spacer(1, 6))

    # EXACT Table from user prompt: 03_NOVA_Pricing_Master.pdf
    pricing_data = [
        [Paragraph("Region", s['th']), Paragraph("Standard Price", s['th']), Paragraph("Campaign Price", s['th']), Paragraph("Valid From", s['th']), Paragraph("Valid Until", s['th'])],
        [Paragraph("India", s['td_bold']), Paragraph("₹4,499", s['td']), Paragraph("₹3,999", s['td']), Paragraph("01 Nov 2026", s['td']), Paragraph("15 Nov 2026", s['td'])],
        [Paragraph("Export (SAARC)", s['td_bold']), Paragraph("₹4,999", s['td']), Paragraph("₹4,499", s['td']), Paragraph("01 Nov 2026", s['td']), Paragraph("15 Nov 2026", s['td'])],
    ]
    t_price = Table(pricing_data, colWidths=[100, 105, 105, 110, 112])
    t_price.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#264831")),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#D0D0D0")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#FBF9F4"), colors.white]),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_price)

    story.append(Spacer(1, 12))
    story.append(Paragraph("2. Expiry Radar Governance Rules", s['h2']))
    story.append(Paragraph(
        "<b>Strict Temporal Window:</b> The campaign promotional price of <b>₹3,999</b> is strictly valid from "
        "<b>01 November 2026</b> to <b>15 November 2026 (23:59:59 IST)</b>.",
        s['body']
    ))
    story.append(Spacer(1, 4))
    story.append(Paragraph("• <b>Active Period (1–15 Nov 2026):</b> Marketing copy citing ₹3,999 is verified as compliant. Disclosures must state validity window.", s['bullet']))
    story.append(Paragraph("• <b>Post-Expiry Period (After 15 Nov 2026):</b> Any advertisement, landing page, or creative copy claiming ₹3,999 is flagged as an <b>EXPIRED PROMOTIONAL CLAIM</b>.", s['bullet']))
    story.append(Paragraph("• <b>Mandatory Standard Price:</b> After 15 November 2026, the standard retail price of <b>₹4,499</b> must be displayed.", s['bullet']))

    # PAGE BREAK -> Page 2
    story.append(PageBreak())

    story.append(Paragraph("3. Channel-Specific Pricing Guardrails", s['h2']))
    story.append(Paragraph("Authorized distribution channels and maximum allowed discount thresholds:", s['body']))
    story.append(Spacer(1, 6))

    channel_data = [
        [Paragraph("Channel", s['th']), Paragraph("Base Price", s['th']), Paragraph("Max Promotional Discount", s['th']), Paragraph("Authorized Pricing Lead", s['th'])],
        [Paragraph("NOVA D2C Web Store", s['td_bold']), Paragraph("₹4,499", s['td']), Paragraph("₹500 (Launch Campaign Only)", s['td']), Paragraph("Director of E-Commerce", s['td'])],
        [Paragraph("Brand Retail Stores", s['td_bold']), Paragraph("₹4,499", s['td']), Paragraph("₹500 (Launch Campaign Only)", s['td']), Paragraph("Head of Retail Operations", s['td'])],
        [Paragraph("Authorized Marketplaces", s['td_bold']), Paragraph("₹4,499", s['td']), Paragraph("₹500 (Launch Campaign Only)", s['td']), Paragraph("Marketplace Channel Lead", s['td'])],
    ]
    t_chan = Table(channel_data, colWidths=[130, 90, 162, 150])
    t_chan.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#264831")),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#D0D0D0")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#FBF9F4"), colors.white]),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_chan)

    story.append(Spacer(1, 14))
    story.append(Paragraph("4. Price Governance Audit Sign-Off", s['h2']))
    story.append(Paragraph("<b>Finance Authority:</b> Rajeshwar Sen, VP Commercial Finance", s['body']))
    story.append(Paragraph("<b>Audit Ledger Hash:</b> sha256:7f4a8b29c91d8e3301a2c3b889e102f4a56b82918239019238e819a12c3d4e5f", s['body']))

    build_pdf(filepath, story)

# ==============================================================================
# 04. NOVA Approved Claims (Multi-Page: 2 Pages)
# ==============================================================================
def make_approved_claims(filepath):
    s = get_nova_styles()
    story = []

    # Title & Header
    story.append(Paragraph("NOVA APPROVED & UNAPPROVED CLAIMS REGISTER", s['title']))
    story.append(Paragraph("Doc ID: 04_NOVA_Approved_Claims.pdf · Legal & Regulatory Affairs · Effective: 28 Oct 2026", s['subtitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#264831"), spaceAfter=10))

    story.append(Paragraph("1. Master Claims Adjudication Matrix", s['h2']))
    story.append(Paragraph("The authoritative decision register used by VerityBrand reviewers and compliance approvers:", s['body']))
    story.append(Spacer(1, 6))

    # EXACT Table from user prompt: 04_NOVA_Approved_Claims.pdf
    claims_data = [
        [Paragraph("Claim", s['th']), Paragraph("Status", s['th']), Paragraph("Evidence", s['th'])],
        [Paragraph("Designed for everyday running", s['td_bold']), Paragraph("<font color='#1b5e20'><b>Approved</b></font>", s['td']), Paragraph("Product Brief (Intended use classification)", s['td'])],
        [Paragraph("Lightweight performance footwear", s['td_bold']), Paragraph("<font color='#1b5e20'><b>Approved</b></font>", s['td']), Paragraph("Product Specification PS-2026-018 (218 g)", s['td'])],
        [Paragraph("Up to 40 km tested durability", s['td_bold']), Paragraph("<font color='#1b5e20'><b>Approved</b></font>", s['td']), Paragraph("Performance Test PT-2026-041", s['td'])],
        [Paragraph("India's #1 running shoe", s['td_bold']), Paragraph("<font color='#b71c1c'><b>Not approved</b></font>", s['td']), Paragraph("No evidence (requires accredited ranking)", s['td'])],
        [Paragraph("30% lighter than leading shoes", s['td_bold']), Paragraph("<font color='#b71c1c'><b>Not approved</b></font>", s['td']), Paragraph("No comparison baseline against named competitors", s['td'])],
        [Paragraph("Guaranteed to make you faster", s['td_bold']), Paragraph("<font color='#b71c1c'><b>Not approved</b></font>", s['td']), Paragraph("No evidence (guarantees banned by claims policy)", s['td'])],
        [Paragraph("Injury-proof cushioning", s['td_bold']), Paragraph("<font color='#b71c1c'><b>Not approved</b></font>", s['td']), Paragraph("No clinical evidence (medical claims strictly banned)", s['td'])],
    ]
    t_claims = Table(claims_data, colWidths=[180, 100, 252])
    t_claims.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#264831")),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#D0D0D0")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#FBF9F4"), colors.white]),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_claims)

    # PAGE BREAK -> Page 2
    story.append(PageBreak())

    story.append(Paragraph("2. Adjudication Guidelines & The Strict Abstention Invariant", s['h2']))
    story.append(Paragraph(
        "<b>Strict AI Abstention Standard:</b> When a marketing claim lacks approved documentary proof in the NOVA Evidence Repository, "
        "the VerityBrand engine must classify it as <b>NEEDS VERIFICATION / UNSUPPORTED CLAIM</b>. "
        "The system must explicitly explain what documentation is missing rather than inventing false verdicts.",
        s['body']
    ))
    story.append(Spacer(1, 8))

    story.append(Paragraph("3. Required Substantiation Pathways for Unapproved Claims", s['h2']))
    pathways_data = [
        [Paragraph("Unapproved Claim Type", s['th']), Paragraph("Required Evidence to Seek Approval", s['th']), Paragraph("Approving Authority", s['th'])],
        [Paragraph("Comparative claims (% lighter, faster)", s['td_bold']), Paragraph("Accredited head-to-head lab testing methodology comparing at least 3 market leading brands.", s['td']), Paragraph("VP Product Engineering", s['td'])],
        [Paragraph("Superlative ranking (#1 in India)", s['td_bold']), Paragraph("Published, dated independent retail audit or industry market-share report (e.g. Euromonitor/Crisil).", s['td']), Paragraph("General Counsel", s['td'])],
        [Paragraph("Extended durability (>40 km)", s['td_bold']), Paragraph("Certified lab report certifying mileage beyond 40 km under ASTM athletic footwear standards.", s['td']), Paragraph("Director of QA Testing", s['td'])],
    ]
    t_path = Table(pathways_data, colWidths=[140, 252, 140])
    t_path.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#264831")),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#D0D0D0")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#FBF9F4"), colors.white]),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_path)

    story.append(Spacer(1, 14))
    story.append(Paragraph("4. Regulatory Compliance Attestation", s['h2']))
    story.append(Paragraph("<b>Regulatory Signatory:</b> Meenakshi Iyer, Lead Compliance Counsel", s['body']))
    story.append(Paragraph("<b>Cryptographic Repository Seal:</b> sha256:d19e8302f891a274b091823901a892b19283019283a091823901928391823a01", s['body']))

    build_pdf(filepath, story)

def main():
    out_dir = os.path.join("public", "docs")
    os.makedirs(out_dir, exist_ok=True)

    files = [
        ("01_NOVA_Brand_Guidelines.pdf", "Brand_Guidelines.pdf", make_brand_guidelines),
        ("02_NOVA_Product_Facts.pdf", "Product_Facts.pdf", make_product_facts),
        ("03_NOVA_Pricing_Master.pdf", "Pricing_Master.pdf", make_pricing_master),
        ("04_NOVA_Approved_Claims.pdf", "Approved_Claims.pdf", make_approved_claims),
    ]

    for primary_name, canonical_name, builder in files:
        primary_path = os.path.join(out_dir, primary_name)
        canonical_path = os.path.join(out_dir, canonical_name)
        
        print(f"Generating {primary_name}...")
        builder(primary_path)
        shutil.copyfile(primary_path, canonical_path)
        print(f"✓ Saved {primary_name} & synced to {canonical_name}")

    print("\nAll 4 multi-page enterprise PDFs generated successfully in public/docs/!")

if __name__ == "__main__":
    main()
