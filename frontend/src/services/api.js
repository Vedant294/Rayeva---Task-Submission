const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const api = {
  getDashboard: () => request("/dashboard"),
  getLogs: () => request("/logs"),
  generateCategory: (body) =>
    request("/category", { method: "POST", body: JSON.stringify(body) }),
  generateProposal: (body) =>
    request("/proposal", { method: "POST", body: JSON.stringify(body) }),
  generateImpact: (body) =>
    request("/impact", { method: "POST", body: JSON.stringify(body) }),
};
