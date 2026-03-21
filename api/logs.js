import { connectDB } from "../lib/mongodb.js";
import AILog from "../models/AILog.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    await connectDB();

    const logs = await AILog.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .select("module prompt response createdAt");

    return res.status(200).json({ success: true, logs });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch logs", details: err.message });
  }
}
