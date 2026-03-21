import { useState } from "react";
import { api } from "../services/api";
import Spinner from "../components/Spinner";
import ErrorBox from "../components/ErrorBox";

const EXAMPLES = [
  { client_name: "GreenMart Retail", budget: "5000", product_category: "Eco Packaging" },
  { client_name: "NatureBox Co.", budget: "12000", product_category: "Sustainable Personal Care" },
  { client_name: "EcoOffice Ltd.", budget: "3500", product_category: "Zero-Waste Office Supplies" },
];

export default function ProposalGenerator() {
  const [form, setForm] = useState({ client_name: "", budget: "", product_category: "" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.client_name || !form.budget || !form.product_category) { setError("All fields are required."); return; }
    if (isNaN(form.budget) || Number(form.budget) <= 0) { setError("Budget must be a positive number."); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const data = await api.generateProposal({ ...form, budget: Number(form.budget) });
      setResult(data.proposal);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-blue-900/30 border border-blue-800/50 text-blue-400 text-xs px-3 py-1 rounded-full mb-3">📋 Module 2</div>
        <h1 className="section-title">AI B2B Proposal Generator</h1>
        <p className="section-sub">Generate tailored product proposals for B2B clients with budget allocation and impact positioning.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit} className="card p-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Client Name</label>
              <input className="input" placeholder="e.g. GreenMart Retail Co." value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Budget (USD)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                <input type="number" min="1" className="input pl-8" placeholder="5000" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Product Category</label>
              <input className="input" placeholder="e.g. Eco Personal Care" value={form.product_category} onChange={(e) => setForm({ ...form, product_category: e.target.value })} />
            </div>
            <button type="submit" disabled={loading} className="btn-blue w-full">
              {loading ? "Generating..." : "✨ Generate Proposal"}
            </button>
          </form>
          <ErrorBox message={error} onClose={() => setError("")} />
        </div>

        <div className="lg:col-span-2 space-y-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Try an example</p>
          {EXAMPLES.map((ex) => (
            <button key={ex.client_name} onClick={() => { setForm(ex); setResult(null); setError(""); }}
              className="w-full text-left card p-4 hover:border-blue-700/50 hover:bg-blue-900/10 transition-all group">
              <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">{ex.client_name}</p>
              <p className="text-xs text-gray-500 mt-0.5">${Number(ex.budget).toLocaleString()} · {ex.product_category}</p>
            </button>
          ))}
        </div>
      </div>

      {loading && <Spinner text="Building proposal with AI..." />}

      {result && (
        <div className="mt-8 fade-up card p-6 border-blue-700/40 bg-gradient-to-br from-blue-900/10 to-transparent">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-800">
            <div className="w-10 h-10 rounded-xl bg-blue-900/40 border border-blue-700/50 flex items-center justify-center text-xl">📋</div>
            <div>
              <h2 className="text-lg font-bold text-white">{result.client_name}</h2>
              <p className="text-xs text-gray-500">Total Budget: <span className="text-blue-400 font-semibold">${Number(result.budget).toLocaleString()}</span></p>
            </div>
            <span className="ml-auto text-xs bg-blue-900/40 text-blue-400 border border-blue-700/50 px-2 py-1 rounded-full">✓ Generated</span>
          </div>

          <div className="mb-5">
            <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Recommended Product Mix</p>
            <div className="flex flex-wrap gap-2">
              {result.product_mix?.map((p) => (
                <span key={p} className="bg-blue-900/30 border border-blue-700/50 text-blue-300 text-sm px-3 py-1.5 rounded-lg font-medium">{p}</span>
              ))}
            </div>
          </div>

          <div className="mb-5">
            <p className="text-xs text-gray-500 mb-3 uppercase tracking-wide">Budget Breakdown</p>
            <div className="space-y-3">
              {result.cost_breakdown && Object.entries(result.cost_breakdown).map(([product, cost]) => {
                const pct = result.budget ? Math.round((cost / result.budget) * 100) : 0;
                return (
                  <div key={product}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-gray-300 font-medium">{product}</span>
                      <span className="text-blue-400 font-semibold">${Number(cost).toLocaleString()} <span className="text-gray-500 font-normal">({pct}%)</span></span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-blue-900/20 border border-blue-800/40 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1.5 uppercase tracking-wide">Impact Positioning</p>
            <p className="text-gray-200 text-sm leading-relaxed">{result.impact_positioning}</p>
          </div>
        </div>
      )}
    </div>
  );
}
