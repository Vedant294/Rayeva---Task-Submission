import { connectDB } from "../lib/mongodb.js";
import { askAI, extractJSON } from "../lib/ai.js";
import Proposal from "../models/Proposal.js";
import AILog from "../models/AILog.js";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const { client_name, budget, product_category } = JSON.parse(event.body || "{}");
  if (!client_name || !budget || !product_category) {
    return { statusCode: 400, body: JSON.stringify({ error: "client_name, budget, and product_category are required" }) };
  }

  const budgetNum = parseFloat(budget);
  if (isNaN(budgetNum) || budgetNum <= 0) {
    return { statusCode: 400, body: JSON.stringify({ error: "budget must be a positive number" }) };
  }

  try {
    await connectDB();

    const prompt = `You are a B2B sustainable commerce proposal AI.
Generate a product proposal. Return ONLY valid JSON, no extra text.

Client Name: ${client_name}
Total Budget: $${budgetNum}
Product Category: ${product_category}

Return this exact JSON:
{
  "product_mix": ["Product A", "Product B", "Product C"],
  "budget_allocation": { "Product A": 0.4, "Product B": 0.35, "Product C": 0.25 },
  "cost_breakdown": { "Product A": ${(budgetNum * 0.4).toFixed(2)}, "Product B": ${(budgetNum * 0.35).toFixed(2)}, "Product C": ${(budgetNum * 0.25).toFixed(2)} },
  "impact_positioning": "Short paragraph on sustainability value for the client."
}`;

    const raw = await askAI(prompt);
    const result = extractJSON(raw);

    const proposal = await Proposal.create({ client_name, budget: budgetNum, product_category, ...result });
    await AILog.create({ module: "B2B Proposal Generator", prompt, response: JSON.stringify(result) });

    return { statusCode: 200, body: JSON.stringify({ success: true, proposal }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: "Failed to generate proposal", details: err.message }) };
  }
};
