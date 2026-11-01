const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export type PersonaKey = "arjun" | "riya";

export function getStoredPersona(): PersonaKey {
  if (typeof window === "undefined") return "arjun";
  const saved = localStorage.getItem("verity_persona");
  return saved === "riya" ? "riya" : "arjun";
}

export function setStoredPersona(persona: PersonaKey) {
  if (typeof window !== "undefined") {
    localStorage.setItem("verity_persona", persona);
  }
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const personaKey = getStoredPersona();
  const role = personaKey === "arjun" ? "compliance_owner" : "creator";
  const userId = personaKey === "arjun" ? "user_arjun" : "user_riya";

  const headers = {
    "Content-Type": "application/json",
    "X-User-Id": userId,
    "X-User-Role": role,
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response
      .json()
      .catch(() => ({ detail: response.statusText }));
    throw new Error(
      errorBody.detail || `Request failed with status ${response.status}`
    );
  }

  return response.json();
}

export const api = {
  // Health Check
  checkHealth: async () => {
    const res = await fetch(
      API_BASE.replace(/\/api$/, "") + "/",
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error("Backend unreachable");
    return res.json();
  },

  // Brands
  getBrands: () => fetchWithAuth("/brands"),

  // Rules
  getBrandRules: (brandId: string) =>
    fetchWithAuth(`/brands/${brandId}/rules`),
  createOrVersionRule: (data: Record<string, unknown>) =>
    fetchWithAuth("/rules", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Facts
  getBrandFacts: (brandId: string) =>
    fetchWithAuth(`/brands/${brandId}/facts`),
  createOrVersionFact: (data: Record<string, unknown>) =>
    fetchWithAuth("/facts", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Sources
  listSources: (brandId: string) =>
    fetchWithAuth(`/sources/brand/${brandId}`),

  // Drafts
  listDrafts: (brandId?: string) =>
    fetchWithAuth(brandId ? `/drafts?brand_id=${brandId}` : "/drafts"),
  getDraft: (draftId: string) => fetchWithAuth(`/drafts/${draftId}`),
  createDraft: (data: {
    brand_id: string;
    title: string;
    campaign: string;
    text: string;
  }) =>
    fetchWithAuth("/drafts", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  createDraftVersion: (draftId: string, data: { text: string }) =>
    fetchWithAuth(`/drafts/${draftId}/versions`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getDraftVersion: (versionId: string) =>
    fetchWithAuth(`/drafts/versions/${versionId}`),

  // Analysis & Findings
  analyzeDraft: (versionId: string) =>
    fetchWithAuth(`/drafts/${versionId}/analyze`, {
      method: "POST",
    }),
  getJobStatus: (jobId: string) => fetchWithAuth(`/jobs/${jobId}`),
  getVersionFindings: (versionId: string) =>
    fetchWithAuth(`/drafts/${versionId}/findings`),

  takeFindingAction: (
    findingId: string,
    data: { action: string; edited_text?: string; reason?: string }
  ) =>
    fetchWithAuth(`/findings/${findingId}/actions`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  requestChanges: (versionId: string, reason?: string) =>
    fetchWithAuth(
      `/drafts/${versionId}/request-changes?reason=${encodeURIComponent(
        reason || ""
      )}`,
      {
        method: "POST",
      }
    ),

  approveDraft: (versionId: string) =>
    fetchWithAuth(`/drafts/${versionId}/approve`, {
      method: "POST",
    }),

  resetDemoDraft: () =>
    fetchWithAuth("/drafts/reset-demo", {
      method: "POST",
    }),

  // Audit Log & Verification
  getAuditTrail: (objectId?: string) =>
    fetchWithAuth(objectId ? `/audit?object_id=${objectId}` : "/audit"),
  verifyAuditChain: () => fetchWithAuth("/audit/verify"),

  // Insights
  getInsightsSummary: () => fetchWithAuth("/insights/summary"),
};
