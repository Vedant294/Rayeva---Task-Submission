import { connectDB } from "../../lib/mongodb.js";
import AILog from "../../models/AILog.js";

export const handler = async (event) => {
  if (event.httpMethod !== "GET")
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };

  try {
    await connectDB();

    const logs = await AILog.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .select("module prompt response createdAt");

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, logs }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: "Failed to fetch logs", details: err.message }) };
  }
};
