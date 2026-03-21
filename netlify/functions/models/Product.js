import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  material: { type: String, required: true },
  primary_category: String,
  sub_category: String,
  seo_tags: [String],
  sustainability_filters: [String],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
