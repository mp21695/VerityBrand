import type { Role } from "@/lib/review";

export interface SiteData {
  promoBanner: {
    message: string;
    tag: string;
  };
  nav: {
    brand: string;
    links: { label: string; href: string }[];
    cta: {
      label: string;
      href: string;
    };
  };
  hero: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    description: string;
    primaryCta: {
      label: string;
      href: string;
    };
    secondaryCta: {
      label: string;
      href: string;
    };
  };
  about: {
    sectionLabel: string;
    headline: string;
    paragraphs: string[];
    cta: {
      label: string;
      href: string;
    };
  };
  services: {
    sectionLabel: string;
    headline: string;
    items: {
      id: string;
      title: string;
      description: string;
      image: string;
    }[];
  };
  process: {
    sectionLabel: string;
    headline: string;
    steps: {
      number: string;
      title: string;
      description: string;
    }[];
  };
  breakout: {
    word1: string;
    word2: string;
    word3: string;
    description: string;
    image: string;
  };
  stories: {
    sectionLabel: string;
    headline: string;
    testimonials: {
      id: string;
      quote: string;
      author: string;
      role: string;
    }[];
  };
  contact: {
    sectionLabel: string;
    headline: string;
    facts: string[];
    subtext: string;
    email: string;
  };
  journal: {
    sectionLabel: string;
    headline: string;
    articles: {
      id: string;
      date: string;
      readTime: string;
      title: string;
      summary: string;
      image: string;
    }[];
    cta: {
      label: string;
      href: string;
    };
  };
  faq: {
    sectionLabel: string;
    headline: string;
    questions: {
      q: string;
      a: string;
    }[];
  };
  footer: {
    brand: string;
    columns: {
      title: string;
      links: { label: string; href: string }[];
    }[];
    newsletter: {
      title: string;
      description: string;
      note: string;
    };
    copyright: string;
    legalLinks: { label: string; href: string }[];
  };
}

export const SITE_DATA: SiteData = {
  promoBanner: {
    message: "VerityBrand 2.0 — Evidence-Backed Brand Governance Platform",
    tag: "NOW IN EVALUATION",
  },
  nav: {
    brand: "VerityBrand",
    links: [
      { label: "HOME", href: "#" },
      { label: "ABOUT", href: "#about" },
      { label: "CAPABILITIES", href: "#capabilities" },
      { label: "PROCESS", href: "#process" },
      { label: "STORIES", href: "#stories" },
      { label: "INSIGHTS", href: "#journal" },
    ],
    cta: {
      label: "OPEN WORKSPACE",
      href: "/workspace",
    },
  },
  hero: {
    eyebrow: "Evidence-Backed AI",
    titleLine1: "Evidence-backed AI",
    titleLine2: "for brand governance.",
    description:
      "Find flaws, verify claims, explain every finding, and move approved content safely toward publication. AI proposes. Humans decide.",
    primaryCta: {
      label: "OPEN WORKSPACE",
      href: "/workspace",
    },
    secondaryCta: {
      label: "SEE HOW IT WORKS",
      href: "#process",
    },
  },
  about: {
    sectionLabel: "(Introduction)",
    headline:
      "I built VerityBrand so marketing, communications and compliance teams can drop the guesswork and review content with verifiable proof. Together, we move compliant campaigns safely to market.",
    paragraphs: [
      "Traditional brand review is exhausting. Marketing creates compelling copy, only to hit manual redlines, out-of-date guidelines, and endless compliance bottlenecks that make moving fast feel like a risk.",
      "VerityBrand is grounded, direct, and evidence-based. It couples deterministic rule checks with grounded claim verification against your audited fact ledger. When evidence is missing, it abstains into 'Needs Verification' — never inventing a false verdict.",
      "Every correction preserves creator intent. Every reviewer justification is sealed in an immutable audit chain. Whether you're navigating regulatory codes, financial claims, or tone guidelines, you have evidence behind every decision.",
    ],
    cta: {
      label: "ABOUT VERITYBRAND",
      href: "#capabilities",
    },
  },
  services: {
    sectionLabel: "(Capabilities)",
    headline: "Governance built around proof, not opinion.",
    items: [
      {
        id: "cap-1",
        title: "Evidence-Linked Findings",
        description:
          "Every finding connects the issue directly to its relevant regulatory code, brand guideline, or audited factsheet — complete with document hashes and exact clause citations.",
        image: "/images/cap-evidence.jpg",
      },
      {
        id: "cap-2",
        title: "Expiry-Aware Facts",
        description:
          "Facts carry temporal validity dates. AUM numbers, benchmark percentiles, and financial statistics automatically expire so outdated claims are intercepted before publication.",
        image: "/images/cap-expiry.jpg",
      },
      {
        id: "cap-3",
        title: "Intent-Preserving Fixes",
        description:
          "Suggested corrections preserve what the copywriter was trying to communicate rather than silently rewriting tone or flattening the marketing value proposition.",
        image: "/images/cap-fixes.jpg",
      },
    ],
  },
  process: {
    sectionLabel: "(My Process)",
    headline: "Governing promotional copy shouldn't feel complicated. Here's how it works.",
    steps: [
      {
        number: "01",
        title: "Configure the Brain",
        description:
          "Regulatory guidelines, brand voice parameters, and audited financial factsheets are versioned into the Brand Brain.",
      },
      {
        number: "02",
        title: "Submit Draft Copy",
        description:
          "Creators submit promotional copy, social ads, or press mailers for parallel deterministic and grounded verification.",
      },
      {
        number: "03",
        title: "Explain & Resolve",
        description:
          "The engine generates explainable cited findings. Reviewers accept intent-preserving fixes, edit wording, or dismiss with justification.",
      },
      {
        number: "04",
        title: "Approve & Seal",
        description:
          "Once unresolved findings reach zero, the Compliance Approver signs off, issuing a tamper-evident SHA-256 certificate.",
      },
    ],
  },
  breakout: {
    word1: "Evidence",
    word2: "over",
    word3: "guesswork",
    description:
      "Experience brand governance that goes beyond the checklist. We build an auditable partnership between AI and human reviewers — AI proposes, humans decide.",
    image: "/images/band-chairs.jpg",
  },
  stories: {
    sectionLabel: "(Previous Stories)",
    headline: "What it looks like to review with verifiable proof. Real stories from enterprise teams.",
    testimonials: [
      {
        id: "test-1",
        quote:
          "Before VerityBrand, our growth team spent days arguing with compliance over headline hooks. Now the engine cites the exact claims policy clause, verifies our product specifications against certified test sheets, and proposes fixes that keep our growth hook intact. We cut review turnaround by 70%.",
        author: "Riya S., 29",
        role: "HEAD OF GROWTH MARKETING",
      },
      {
        id: "test-2",
        quote:
          "As Compliance Lead, my biggest anxiety was unverified claims slipping into paid ads. The strict abstention principle gives me total peace of mind: if there's no citation, it flags for verification rather than hallucinating an approval.",
        author: "Arjun P., 38",
        role: "VP COMPLIANCE & RISK",
      },
      {
        id: "test-3",
        quote:
          "The tamper-evident SHA-256 audit chain changed our regulatory audits entirely. When regulators ask why a claim was published, we show the complete chain of cited sources and reviewer justifications.",
        author: "Meera K., 34",
        role: "GENERAL COUNSEL",
      },
    ],
  },
  contact: {
    sectionLabel: "(Contact me)",
    headline: "Ready to govern brand copy with evidence? We'll take it from there.",
    facts: [
      "Zero Training on Customer Data",
      "Tamper-Evident SHA-256 Hash Chain",
      "Role-Based Access Control (RBAC)",
    ],
    subtext:
      "Prefer to chat first? Drop us a line or connect with our governance specialists. We're always happy to help.",
    email: "compliance@veritybrand.ai",
  },
  journal: {
    sectionLabel: "(My Journal)",
    headline: "Reflections on evidence-backed brand governance, compliance, and responsible AI.",
    articles: [
      {
        id: "art-1",
        date: "Feb 12, 2026",
        readTime: "7 min read",
        title: "Why Generic LLM Checkers Fail Brand Compliance",
        summary:
          "LLMs are probabilistic word predictors. Brand governance demands deterministic adherence to regulatory clauses and verifiable fact ledgers.",
        image: "/images/future-multimodal.jpg",
      },
      {
        id: "art-2",
        date: "Jan 22, 2026",
        readTime: "6 min read",
        title: "The Strict Abstention Invariant: Why AI Should Never Guess",
        summary:
          "When ground truth evidence is absent, an enterprise governance engine must flag 'Needs Verification', never hallucinate an unsupported verdict.",
        image: "/images/future-rules.jpg",
      },
      {
        id: "art-3",
        date: "Jan 5, 2026",
        readTime: "8 min read",
        title: "Adaptive Rule Modernisation: Closing the Governance Learning Loop",
        summary:
          "How recurring reviewer dismissal justifications surface ambiguous brand rules and automatically propose human-approved rule upgrades.",
        image: "/images/future-gateway.jpg",
      },
    ],
    cta: {
      label: "VIEW ALL ARTICLES",
      href: "#",
    },
  },
  faq: {
    sectionLabel: "(FAQs)",
    headline: "Questions you might be wondering about.",
    questions: [
      {
        q: "How is VerityBrand different from a generic AI grammar or style checker?",
        a: "Generic AI tools guess or silently rewrite copy based on statistical patterns. VerityBrand operates on a deterministic rule engine paired with grounded verification against your audited Fact Ledger. Every finding cites the exact regulatory code, source document ID, and validity window.",
      },
      {
        q: "What is the Strict Abstention Invariant?",
        a: "In brand governance, an unfounded rejection is just as damaging as an unverified approval. If the Brand Brain lacks documentation to verify a claim, the system classifies it as 'Needs Verification' rather than falsely claiming it is wrong.",
      },
      {
        q: "Can AI publish marketing copy automatically?",
        a: "Never. Our core principle is 'AI proposes. Humans decide.' Nothing is approved while a finding remains unresolved, and final certification requires sign-off from designated Compliance Approvers.",
      },
      {
        q: "Is customer data used to train AI models?",
        a: "No. All brand guidelines, proprietary fact sheets, and campaign drafts remain strictly isolated within your organization's workspace and are never used for model training.",
      },
      {
        q: "How does the tamper-evident audit trail work?",
        a: "Every intake, finding generation, fix acceptance, custom edit, dismissal justification, and compliance sign-off is linked via a cryptographic SHA-256 block chain. Any alteration to historical records breaks the mathematical hash chain.",
      },
    ],
  },
  footer: {
    brand: "VerityBrand",
    columns: [
      {
        title: "Navigate",
        links: [
          { label: "Home", href: "#" },
          { label: "About", href: "#about" },
          { label: "Capabilities", href: "#capabilities" },
          { label: "Process", href: "#process" },
          { label: "Review Workspace", href: "#workspace" },
        ],
      },
      {
        title: "Focus Areas",
        links: [
          { label: "Evidence-Linked Findings", href: "#capabilities" },
          { label: "Expiry-Aware Facts", href: "#capabilities" },
          { label: "Intent-Preserving Fixes", href: "#capabilities" },
          { label: "Tamper-Evident Audit", href: "#workspace" },
        ],
      },
      {
        title: "Contact",
        links: [
          { label: "compliance@veritybrand.ai", href: "mailto:compliance@veritybrand.ai" },
          { label: "+1 (555) 019-2834", href: "tel:+15550192834" },
          { label: "100 Governance Way, Suite 400", href: "#" },
        ],
      },
    ],
    newsletter: {
      title: "Newsletter",
      description: "Subscribe for evidence-based governance frameworks, regulatory updates, and AI ethics research.",
      note: "No spam. Unsubscribe anytime.",
    },
    copyright: "© 2026 VerityBrand Inc. All rights reserved.",
    legalLinks: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms & Conditions", href: "#" },
    ],
  },
};
