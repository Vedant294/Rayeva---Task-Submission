import { connectDB } from "../lib/mongodb.js";
import { askAI, extractJSON } from "../lib/ai.js";
import ImpactReport from "../models/ImpactReport.js";
import AILog from "../models/AILog.js";

const HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Deterministic sustainability estimates per product keyword (synced with api/impact.js)
const ESTIMATES = {
  toothbrush: { plastic_kg: 0.02,  carbon_kg: 0.05 },
  cup:        { plastic_kg: 0.005, carbon_kg: 0.02 },
  bag:        { plastic_kg: 0.03,  carbon_kg: 0.04 },
  bottle:     { plastic_kg: 0.025, carbon_kg: 0.06 },
  straw:      { plastic_kg: 0.002, carbon_kg: 0.005 },
  packaging:  { plastic_kg: 0.05,  carbon_kg: 0.08 },
  container:  { plastic_kg: 0.04,  carbon_kg: 0.07 },
  default:    { plastic_kg: 0.01,  carbon_kg: 0.03 },
};

function estimateImpact(products) {
  let plastic = 0, carbon = 0;
  for (const p of products) {
    const key = Object.keys(ESTIMATES).find((k) => p.name.toLowerCase().includes(k)) || "default";
    plastic += ESTIMATES[key].plastic_kg * p.quantity;
    carbon  += ESTIMATES[key].carbon_kg  * p.quantity;
  }
  return { plastic_saved_kg: parseFloat(plastic.toFixed(4)), carbon_avoided_kg: parseFloat(carbon.toFixed(4)) };
}

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: HEADERS, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let body = {};
  try { body = JSON.parse(event.body || "{}"); } catch (_) {}

  const { order_id, products } = body;
  if (!order_id || !products || !Array.isArray(products) || products.length === 0) {
    return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: "order_id and a non-empty products array are required" }) };
  }

  try {
    await connectDB();

    const { plastic_saved_kg, carbon_avoided_kg } = estimateImpact(products);
    const productList = products.map((p) => `- ${p.name} x${p.quantity}`).join("\n");

    const prompt = `You are a sustainability impact reporting AI.
Based on the following order, generate a human-readable impact report. Return ONLY valid JSON, no extra text.

Order ID: ${order_id}
Products:
${productList}

Calculated estimates:
- Plastic saved: ${plastic_saved_kg} kg
- Carbon avoided: ${carbon_avoided_kg} kg

Return this exact JSON structure:
{
  "plastic_saved_kg": ${plastic_saved_kg},
  "carbon_avoided_kg": ${carbon_avoided_kg},
  "local_sourcing_impact": "One sentence about local sourcing benefits for these products.",
  "impact_statement": "Two to three sentences celebrating the customer's positive environmental impact in an engaging way."
}`;

    const raw = await askAI(prompt);
    const result = extractJSON(raw);

    const report = await ImpactReport.create({
      order_id,
      products,
      plastic_saved_kg: result.plastic_saved_kg,
      carbon_avoided_kg: result.carbon_avoided_kg,
      local_sourcing_impact: result.local_sourcing_impact,
      impact_statement: result.impact_statement,
    });

    await AILog.create({ module: "Impact Report Generator", prompt, response: JSON.stringify(result) });

    return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ success: true, report }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: "Failed to generate impact report", details: err.message }) };
  }
};
