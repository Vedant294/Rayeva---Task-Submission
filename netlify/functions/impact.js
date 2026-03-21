import { connectDB } from "../../lib/mongodb.js";
import { askAI, extractJSON } from "../../lib/ai.js";
import ImpactReport from "../../models/ImpactReport.js";
import AILog from "../../models/AILog.js";

const ESTIMATES = {
  toothbrush: { plastic_kg: 0.02, carbon_kg: 0.05 },
  cup:        { plastic_kg: 0.005, carbon_kg: 0.02 },
  bag:        { plastic_kg: 0.03, carbon_kg: 0.04 },
  bottle:     { plastic_kg: 0.025, carbon_kg: 0.06 },
  straw:      { plastic_kg: 0.002, carbon_kg: 0.005 },
  default:    { plastic_kg: 0.01, carbon_kg: 0.03 },
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
  if (event.httpMethod !== "POST")
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };

  const { order_id, products } = JSON.parse(event.body || "{}");
  if (!order_id || !products || !Array.isArray(products) || products.length === 0)
    return { statusCode: 400, body: JSON.stringify({ error: "order_id and products array are required" }) };

  try {
    await connectDB();
    const { plastic_saved_kg, carbon_avoided_kg } = estimateImpact(products);
    const productList = products.map((p) => `- ${p.name} x${p.quantity}`).join("\n");
    const prompt = `You are a sustainability impact AI. Return ONLY valid JSON.\nOrder: ${order_id}\nProducts:\n${productList}\nPlastic saved: ${plastic_saved_kg} kg, Carbon avoided: ${carbon_avoided_kg} kg\nReturn: {"plastic_saved_kg":${plastic_saved_kg},"carbon_avoided_kg":${carbon_avoided_kg},"local_sourcing_impact":"One sentence about local sourcing.","impact_statement":"Two sentences celebrating the customer impact."}`;
    const raw = await askAI(prompt);
    const result = extractJSON(raw);
    const report = await ImpactReport.create({ order_id, products, ...result });
    await AILog.create({ module: "Impact Report Generator", prompt, response: JSON.stringify(result) });
    return { statusCode: 200, body: JSON.stringify({ success: true, report }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: "Failed to generate impact report", details: err.message }) };
  }
};
