import { connectDB } from "../lib/mongodb.js";
import AILog from "../models/AILog.js";

const HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: HEADERS, body: "" };
  }
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    await connectDB();

    const logs = await AILog.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .select("module prompt response createdAt");

    return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ success: true, logs }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: "Failed to fetch logs", details: err.message }) };
  }
};
