import mongoose from "mongoose";

const ImpactReportSchema = new mongoose.Schema({
  order_id: { type: String, required: true },
  products: [{ name: String, quantity: Number }],
  plastic_saved_kg: Number,
  carbon_avoided_kg: Number,
  local_sourcing_impact: String,
  impact_statement: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.ImpactReport || mongoose.model("ImpactReport", ImpactReportSchema);
