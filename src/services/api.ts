/**
 * BrandProof Intelligent Brand-Governance Platform
 * API Integration Service - FastAPI Backend Client
 */

export interface UserPersona {
  id: string;
  name: string;
  role: "creator" | "compliance_owner" | "reviewer" | "admin";
  email: string;
  title: string;
  badge: string;
}

export const PRESET_PERSONAS: UserPersona[] = [
  {
    id: "user_riya",
    name: "Riya Sharma",
    role: "creator",
    email: "riya@arthaa.com",
    title: "Campaign Creator & Copywriter",
    badge: "Creator (Draft & Edit)",
  },
  {
    id: "user_arjun",
    name: "Arjun Patel",
    role: "compliance_owner",
    email: "arjun@arthaa.com",
    title: "SEBI & Brand Compliance Officer",
    badge: "Compliance Approver (Final Gate)",
  },
  {
    id: "user_priya",
    name: "Priya Nair",
    role: "reviewer",
    email: "priya@arthaa.com",
    title: "Brand Governance Manager",
    badge: "Manager / Reviewer",
  },
  {
    id: "user_admin",
    name: "System Administrator",
    role: "admin",
    email: "admin@brandproof.io",
    title: "Platform & Security Administrator",
    badge: "Admin (Full Control)",
  },
];

let currentActivePersona: UserPersona = PRESET_PERSONAS[0]; // Default to Riya

export function getActivePersona(): UserPersona {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("brandproof_persona");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const match = PRESET_PERSONAS.find((p) => p.id === parsed.id);
        if (match) {
          currentActivePersona = match;
          return match;
        }
      } catch (e) {
        // ignore
      }
    }
  }
  return currentActivePersona;
}

export function setActivePersona(persona: UserPersona): void {
  currentActivePersona = persona;
  if (typeof window !== "undefined") {
    localStorage.setItem("brandproof_persona", JSON.stringify(persona));
  }
}

const API_BASE = "/api";
const DIRECT_API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const persona = getActivePersona();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-User-Id": persona.id,
    "X-User-Role": persona.role,
    ...(options.headers as Record<string, string>),
  };

  const finalOptions: RequestInit = {
    ...options,
    headers,
  };

  // First try proxy route (/api/...)
  const url = `${API_BASE}${endpoint.startsWith("/") ? endpoint : "/" + endpoint}`;
  try {
    const res = await fetch(url, finalOptions);
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(errBody.detail || `API Error: ${res.status} ${res.statusText}`);
    }
    return (await res.json()) as T;
  } catch (err: any) {
    // If proxy failed due to CORS or host resolution, try direct localhost:8000
    if (
      err.message?.includes("Failed to fetch") ||
      err.message?.includes("NetworkError") ||
      err.message?.includes("404")
    ) {
      const directUrl = `${DIRECT_API_BASE}${endpoint.startsWith("/") ? endpoint : "/" + endpoint}`;
      const directRes = await fetch(directUrl, finalOptions);
      if (!directRes.ok) {
        const errBody = await directRes.json().catch(() => ({ detail: directRes.statusText }));
        throw new Error(errBody.detail || `Direct API Error: ${directRes.status} ${directRes.statusText}`);
      }
      return (await directRes.json()) as T;
    }
    throw err;
  }
}

export const BrandProofAPI = {
  // 1. Health & Server Status
  async checkHealth(): Promise<{
    ok: boolean;
    service?: string;
    version?: string;
    status?: string;
    latencyMs?: number;
    error?: string;
  }> {
    const start = Date.now();
    try {
      const res = await fetch("/api/brands", {
        headers: { "X-User-Id": "system", "X-User-Role": "admin" },
        cache: "no-store",
      }).catch(async () => {
        return await fetch("http://127.0.0.1:8000/api/brands", {
          headers: { "X-User-Id": "system", "X-User-Role": "admin" },
          cache: "no-store",
        });
      });

      if (res && res.ok) {
        return {
          ok: true,
          service: "BrandProof FastAPI",
          version: "2.0.0",
          status: "operational",
          latencyMs: Date.now() - start,
        };
      }
      return { ok: false, error: `HTTP ${res.status}` };
    } catch (e: any) {
      return { ok: false, error: e.message || "Unreachable" };
    }
  },

  // 2. Module 1: Brands / Organizations
  async getBrands(): Promise<any[]> {
    return request<any[]>("/brands");
  },

  async createBrand(name: string, description: string): Promise<any> {
    return request<any>("/brands", {
      method: "POST",
      body: JSON.stringify({ name, description }),
    });
  },

  // 3. Module 2: Brand Brain — Rules
  async getBrandRules(brandId: string = "brand_arthaa"): Promise<any[]> {
    return request<any[]>(`/brands/${brandId}/rules`);
  },

  async createOrVersionRule(data: {
    id: string;
    brand_id: string;
    name: string;
    type: string;
    version: string;
    description: string;
    severity: string;
    pattern_params: any;
  }): Promise<any> {
    return request<any>("/rules", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // 4. Module 2: Brand Brain — Facts
  async getBrandFacts(brandId: string = "brand_arthaa"): Promise<any[]> {
    return request<any[]>(`/brands/${brandId}/facts`);
  },

  async createOrVersionFact(data: {
    id: string;
    brand_id: string;
    key: string;
    name: string;
    version: string;
    value: string;
    unit?: string;
    scope: string;
    source_doc_id?: string;
    valid_until: string;
  }): Promise<any> {
    return request<any>("/facts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // 5. Module 2: Brand Brain — Sources & Asset Upload
  async getBrandSources(brandId: string = "brand_arthaa"): Promise<any[]> {
    return request<any[]>(`/sources/brand/${brandId}`);
  },

  async uploadSource(formData: FormData): Promise<any> {
    const persona = getActivePersona();
    const res = await fetch("/api/sources/upload", {
      method: "POST",
      headers: {
        "X-User-Id": persona.id,
        "X-User-Role": persona.role,
      },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || "Source upload failed");
    }
    return res.json();
  },

  // 6. Module 2: Brand Brain — Glossary
  async getBrandGlossary(brandId: string = "brand_arthaa"): Promise<any[]> {
    return request<any[]>(`/brands/${brandId}/glossary`);
  },

  async createGlossaryTerm(data: {
    brand_id: string;
    preferred: string;
    disallowed_variants: string[];
    category?: string;
  }): Promise<any> {
    return request<any>("/glossary", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // 7. Module 3: Content Studio — Drafts
  async getDrafts(brandId?: string): Promise<any[]> {
    const q = brandId ? `?brand_id=${brandId}` : "";
    return request<any[]>(`/drafts${q}`);
  },

  async getDraft(draftId: string): Promise<any> {
    return request<any>(`/drafts/${draftId}`);
  },

  async createDraft(data: {
    brand_id: string;
    title: string;
    campaign: string;
    text: string;
  }): Promise<any> {
    return request<any>("/drafts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async createDraftVersion(
    draftId: string,
    data: { text: string }
  ): Promise<any> {
    return request<any>(`/drafts/${draftId}/versions`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // 8. Module 4: AI Review Engine — Analyze
  async analyzeDraft(versionId: string): Promise<any> {
    return request<any>(`/drafts/${versionId}/analyze`, {
      method: "POST",
    });
  },

  async getVersionFindings(versionId: string): Promise<any[]> {
    return request<any[]>(`/drafts/${versionId}/findings`);
  },

  // 9. Module 5: Correction Studio — Finding Actions (Accept, Edit, Dismiss)
  async takeFindingAction(
    findingId: string,
    data: {
      action: "accept" | "edit" | "dismiss";
      edited_text?: string;
      reason?: string;
    }
  ): Promise<any> {
    return request<any>(`/findings/${findingId}/actions`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // 10. Module 6: Review & Approval Workflow
  async requestChanges(versionId: string, reason?: string): Promise<any> {
    return request<any>(`/drafts/${versionId}/request-changes`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },

  async approveDraft(versionId: string): Promise<any> {
    return request<any>(`/drafts/${versionId}/approve`, {
      method: "POST",
    });
  },

  async resetDemo(): Promise<any> {
    return request<any>("/drafts/reset-demo", {
      method: "POST",
    });
  },

  // 11. Module 7: Governance Analytics & Learning Loop
  async getGovernanceInsights(): Promise<any> {
    return request<any>("/insights/summary");
  },

  // 12. Module 8: Cryptographic Audit Trail
  async getAuditTrail(params?: {
    object_id?: string;
    object_type?: string;
  }): Promise<any[]> {
    const searchParams = new URLSearchParams();
    if (params?.object_id) searchParams.set("object_id", params.object_id);
    if (params?.object_type)
      searchParams.set("object_type", params.object_type);
    const qs = searchParams.toString() ? `?${searchParams.toString()}` : "";
    return request<any[]>(`/audit${qs}`);
  },

  async verifyChainIntegrity(): Promise<{
    status: string;
    total_blocks_verified: number;
    latest_block_hash: string;
    genesis_block_hash: string;
    verified_at: string;
    tamper_evident: boolean;
  }> {
    return request<any>("/audit/verify");
  },
};
