import mongoose from "mongoose";

const ProposalSchema = new mongoose.Schema({
  client_name: { type: String, required: true },
  budget: { type: Number, required: true },
  product_category: { type: String, required: true },
  product_mix: [String],
  budget_allocation: { type: mongoose.Schema.Types.Mixed },
  cost_breakdown: { type: mongoose.Schema.Types.Mixed },
  impact_positioning: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Proposal || mongoose.model("Proposal", ProposalSchema);
