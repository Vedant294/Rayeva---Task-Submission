import { connectDB } from "../lib/mongodb.js";
import { askAI, extractJSON } from "../lib/ai.js";
import Product from "../models/Product.js";
import AILog from "../models/AILog.js";

const HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: HEADERS, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let body = {};
  try { body = JSON.parse(event.body || "{}"); } catch (_) {}

  const { name, description, material } = body;
  if (!name || !description || !material) {
    return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: "name, description, and material are required" }) };
  }

  try {
    await connectDB();

    const prompt = `You are a sustainable product categorization AI.
Given the following product details, return ONLY a valid JSON object with no extra text.

Product Name: ${name}
Description: ${description}
Material: ${material}

Return this exact JSON structure:
{
  "primary_category": "string",
  "sub_category": "string",
  "seo_tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "sustainability_filters": ["filter1", "filter2"]
}

sustainability_filters must only include values from: plastic-free, compostable, recyclable, vegan, biodegradable, organic, zero-waste, eco-friendly.`;

    const raw = await askAI(prompt);
    const result = extractJSON(raw);

    const product = await Product.create({ name, description, material, ...result });
    await AILog.create({ module: "Category Generator", prompt, response: JSON.stringify(result) });

    return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ success: true, product }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: "Failed to generate category", details: err.message }) };
  }
};
