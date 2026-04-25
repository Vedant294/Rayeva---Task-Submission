import { connectDB } from "./lib/mongodb.js";
import Product from "./models/Product.js";
import Proposal from "./models/Proposal.js";
import ImpactReport from "./models/ImpactReport.js";

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

  // Debug: check env vars are present
  if (!process.env.MONGO_URI) {
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: "MONGO_URI not set" }) };
  }

  try {
    await connectDB();

    const [totalProducts, totalProposals, totalReports, recentReports] = await Promise.all([
      Product.countDocuments(),
      Proposal.countDocuments(),
      ImpactReport.countDocuments(),
      ImpactReport.find().sort({ createdAt: -1 }).limit(5)
        .select("order_id plastic_saved_kg carbon_avoided_kg createdAt"),
    ]);

    const aggregated = await ImpactReport.aggregate([
      { $group: { _id: null, total_plastic_kg: { $sum: "$plastic_saved_kg" }, total_carbon_kg: { $sum: "$carbon_avoided_kg" } } },
    ]);

    const totals = aggregated[0] || { total_plastic_kg: 0, total_carbon_kg: 0 };

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({
        success: true,
        stats: {
          total_products_categorized: totalProducts,
          total_proposals_generated: totalProposals,
          total_impact_reports_created: totalReports,
          total_plastic_saved_kg: parseFloat(totals.total_plastic_kg.toFixed(4)),
          total_carbon_avoided_kg: parseFloat(totals.total_carbon_kg.toFixed(4)),
        },
        recent_reports: recentReports,
      }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: "Failed to fetch dashboard data", details: err.message }) };
  }
};
