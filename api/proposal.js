import { connectDB } from "../lib/mongodb.js";
import { askAI, extractJSON } from "../lib/ai.js";
import Proposal from "../models/Proposal.js";
import AILog from "../models/AILog.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { client_name, budget, product_category } = req.body;
  if (!client_name || !budget || !product_category) {
    return res.status(400).json({ error: "client_name, budget, and product_category are required" });
  }

  const budgetNum = parseFloat(budget);
  if (isNaN(budgetNum) || budgetNum <= 0) {
    return res.status(400).json({ error: "budget must be a positive number" });
  }

  try {
    await connectDB();

    const prompt = `You are a B2B sustainable commerce proposal AI.
Generate a product proposal for the following client. Return ONLY valid JSON, no extra text.

Client Name: ${client_name}
Total Budget: $${budgetNum}
Product Category: ${product_category}

Return this exact JSON structure:
{
  "product_mix": ["Product A", "Product B", "Product C"],
  "budget_allocation": {
    "Product A": 0.4,
    "Product B": 0.35,
    "Product C": 0.25
  },
  "cost_breakdown": {
    "Product A": ${(budgetNum * 0.4).toFixed(2)},
    "Product B": ${(budgetNum * 0.35).toFixed(2)},
    "Product C": ${(budgetNum * 0.25).toFixed(2)}
  },
  "impact_positioning": "A short paragraph explaining the sustainability impact and value for the client."
}

IMPORTANT: The sum of all cost_breakdown values must equal exactly $${budgetNum}.`;

    const raw = await askAI(prompt);
    const result = extractJSON(raw);

    const proposal = await Proposal.create({
      client_name,
      budget: budgetNum,
      product_category,
      ...result,
    });

    await AILog.create({
      module: "B2B Proposal Generator",
      prompt,
      response: JSON.stringify(result),
    });

    return res.status(200).json({ success: true, proposal });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to generate proposal", details: err.message });
  }
}
