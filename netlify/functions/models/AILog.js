import mongoose from "mongoose";

const AILogSchema = new mongoose.Schema({
  module: { type: String, required: true },
  prompt: { type: String, required: true },
  response: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.AILog || mongoose.model("AILog", AILogSchema);
