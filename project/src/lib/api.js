const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function request(path, init) {
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }
  if (init?.token) headers.set("Authorization", `Bearer ${init.token}`);

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      (data && (data.message || data.error)) || `Request failed (${res.status})`;
    throw new Error(String(message));
  }
  return data;
}

export const api = {
  baseUrl: API_URL,
  health: () => request("/api/health"),
  categories: () => request("/api/categories"),
  models: (params) => {
    const qs = new URLSearchParams();
    if (params?.category && params.category !== "all") {
      qs.set("category", params.category);
    }
    if (params?.q) qs.set("q", params.q);
    if (params?.tag) qs.set("tag", params.tag);
    if (params?.page) qs.set("page", String(params.page));
    if (params?.pageSize) qs.set("pageSize", String(params.pageSize));
    const query = qs.toString();
    return request(`/api/models${query ? `?${query}` : ""}`);
  },
  model: (slug) => request(`/api/models/${slug}`),
  createModel: (body, token) =>
    request("/api/models", {
      method: "POST",
      body: JSON.stringify(body),
      token,
    }),
  acquire: (slug, walletAddress, token) =>
    request(`/api/models/${slug}/acquire`, {
      method: "POST",
      body: JSON.stringify({ walletAddress }),
      token,
    }),
  infer: (slug, body) =>
    request(`/api/models/${slug}/infer`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  signup: (body) =>
    request("/api/auth/signup", { method: "POST", body: JSON.stringify(body) }),
  login: (body) =>
    request("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),
  wallet: (walletAddress, role) =>
    request("/api/auth/wallet", {
      method: "POST",
      body: JSON.stringify({ walletAddress, role }),
    }),
  dashboard: (token) => request("/api/dashboard", { token }),
  chainStatus: () => request("/api/chain/status"),
  chainListing: (slug) => request(`/api/chain/listing/${slug}`),
  chainList: (slug) =>
    request(`/api/chain/list/${slug}`, { method: "POST", body: "{}" }),
  chainAcquireConfirm: (slug, body) =>
    request(`/api/chain/acquire/${slug}`, {
      method: "POST",
      body: JSON.stringify({ mode: "confirm", ...body }),
    }),
};

export function saveToken(token) {
  if (typeof window !== "undefined") {
    localStorage.setItem("NuvyraHub_token", token);
  }
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("NuvyraHub_token");
}

export function clearToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("NuvyraHub_token");
  }
}
