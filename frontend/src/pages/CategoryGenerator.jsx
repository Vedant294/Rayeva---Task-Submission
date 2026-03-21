import { useState } from "react";
import { api } from "../services/api";
import Spinner from "../components/Spinner";
import ErrorBox from "../components/ErrorBox";

const BADGE_COLORS = {
  "plastic-free":  "bg-green-900/50 text-green-300 border-green-700",
  "compostable":   "bg-lime-900/50 text-lime-300 border-lime-700",
  "recyclable":    "bg-blue-900/50 text-blue-300 border-blue-700",
  "vegan":         "bg-purple-900/50 text-purple-300 border-purple-700",
  "biodegradable": "bg-teal-900/50 text-teal-300 border-teal-700",
  "organic":       "bg-yellow-900/50 text-yellow-300 border-yellow-700",
  "zero-waste":    "bg-orange-900/50 text-orange-300 border-orange-700",
  "eco-friendly":  "bg-emerald-900/50 text-emerald-300 border-emerald-700",
};

const EXAMPLES = [
  { name: "Bamboo Toothbrush", description: "Biodegradable toothbrush with charcoal bristles and bamboo handle", material: "Bamboo, Charcoal" },
  { name: "Compostable Coffee Cup", description: "Single-use cup made from plant-based PLA, fully compostable", material: "PLA Bioplastic" },
  { name: "Recycled Tote Bag", description: "Reusable shopping bag made from 100% recycled plastic bottles", material: "rPET Fabric" },
];

export default function CategoryGenerator() {
  const [form, setForm] = useState({ name: "", description: "", material: "" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.description || !form.material) { setError("All fields are required."); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const data = await api.generateCategory(form);
      setResult(data.product);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-green-900/30 border border-green-800/50 text-green-400 text-xs px-3 py-1 rounded-full mb-3">🏷️ Module 1</div>
        <h1 className="section-title">AI Category Generator</h1>
        <p className="section-sub">Automatically classify products, generate SEO tags, and assign sustainability filters using AI.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit} className="card p-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Product Name</label>
              <input className="input" placeholder="e.g. Bamboo Toothbrush" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Description</label>
              <textarea className="input h-24 resize-none" placeholder="Describe the product and its eco benefits..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Material</label>
              <input className="input" placeholder="e.g. Bamboo, Charcoal" value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Generating..." : "✨ Generate Category"}
            </button>
          </form>
          <ErrorBox message={error} onClose={() => setError("")} />
        </div>

        <div className="lg:col-span-2 space-y-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Try an example</p>
          {EXAMPLES.map((ex) => (
            <button key={ex.name} onClick={() => { setForm(ex); setResult(null); setError(""); }}
              className="w-full text-left card p-4 hover:border-green-700/50 hover:bg-green-900/10 transition-all group">
              <p className="text-sm font-medium text-white group-hover:text-green-400 transition-colors">{ex.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{ex.material}</p>
            </button>
          ))}
        </div>
      </div>

      {loading && <Spinner text="Classifying product with AI..." />}

      {result && (
        <div className="mt-8 fade-up card p-6 border-green-700/40 bg-gradient-to-br from-green-900/10 to-transparent">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-800">
            <div className="w-10 h-10 rounded-xl bg-green-900/40 border border-green-700/50 flex items-center justify-center text-xl">📦</div>
            <div>
              <h2 className="text-lg font-bold text-white">{result.name}</h2>
              <p className="text-xs text-gray-500">{result.material}</p>
            </div>
            <span className="ml-auto text-xs bg-green-900/40 text-green-400 border border-green-700/50 px-2 py-1 rounded-full">✓ Categorized</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-gray-800/60 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Primary Category</p>
              <p className="text-green-400 font-semibold">{result.primary_category}</p>
            </div>
            <div className="bg-gray-800/60 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Sub Category</p>
              <p className="text-green-400 font-semibold">{result.sub_category}</p>
            </div>
          </div>

          <div className="mb-5">
            <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">SEO Tags</p>
            <div className="flex flex-wrap gap-2">
              {result.seo_tags?.map((tag) => (
                <span key={tag} className="bg-gray-800 border border-gray-700 text-gray-300 text-xs px-3 py-1 rounded-full">#{tag}</span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Sustainability Filters</p>
            <div className="flex flex-wrap gap-2">
              {result.sustainability_filters?.map((f) => (
                <span key={f} className={`border text-xs px-3 py-1 rounded-full font-medium ${BADGE_COLORS[f] || "bg-gray-800 text-gray-300 border-gray-700"}`}>
                  🌿 {f}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
