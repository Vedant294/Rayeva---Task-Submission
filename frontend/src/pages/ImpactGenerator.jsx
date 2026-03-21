import { useState } from "react";
import { api } from "../services/api";
import Spinner from "../components/Spinner";
import ErrorBox from "../components/ErrorBox";

const EXAMPLE_ORDERS = [
  { order_id: "ORD-2024-001", products: [{ name: "Bamboo Toothbrush", quantity: 50 }, { name: "Compostable Cup", quantity: 100 }] },
  { order_id: "ORD-2024-002", products: [{ name: "Recycled Bottle", quantity: 30 }, { name: "Eco Bag", quantity: 20 }] },
];

export default function ImpactGenerator() {
  const [orderId, setOrderId] = useState("");
  const [products, setProducts] = useState([{ name: "", quantity: 1 }]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addProduct = () => setProducts([...products, { name: "", quantity: 1 }]);
  const removeProduct = (i) => setProducts(products.filter((_, idx) => idx !== i));
  const updateProduct = (i, field, value) => {
    const updated = [...products];
    updated[i][field] = field === "quantity" ? Number(value) : value;
    setProducts(updated);
  };

  const loadExample = (ex) => {
    setOrderId(ex.order_id);
    setProducts(ex.products);
    setResult(null);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!orderId) { setError("Order ID is required."); return; }
    if (products.some((p) => !p.name || p.quantity < 1)) { setError("All products need a name and quantity ≥ 1."); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const data = await api.generateImpact({ order_id: orderId, products });
      setResult(data.report);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-purple-900/30 border border-purple-800/50 text-purple-400 text-xs px-3 py-1 rounded-full mb-3">🌍 Module 3</div>
        <h1 className="section-title">AI Impact Report Generator</h1>
        <p className="section-sub">Calculate plastic saved, carbon avoided, and generate a human-readable sustainability narrative for any order.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit} className="card p-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Order ID</label>
              <input className="input font-mono" placeholder="e.g. ORD-2024-001" value={orderId} onChange={(e) => setOrderId(e.target.value)} />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Products</label>
              <div className="space-y-2">
                {products.map((p, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input className="input flex-1 text-sm" placeholder="Product name (e.g. Bamboo Toothbrush)"
                      value={p.name} onChange={(e) => updateProduct(i, "name", e.target.value)} />
                    <input type="number" min="1" className="input w-20 text-sm text-center"
                      value={p.quantity} onChange={(e) => updateProduct(i, "quantity", e.target.value)} />
                    {products.length > 1 && (
                      <button type="button" onClick={() => removeProduct(i)}
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors shrink-0">✕</button>
                    )}
                  </div>
                ))}
              </div>
              <button type="button" onClick={addProduct}
                className="mt-2 text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors">
                + Add another product
              </button>
            </div>

            <button type="submit" disabled={loading} className="btn-purple w-full">
              {loading ? "Generating..." : "✨ Generate Impact Report"}
            </button>
          </form>
          <ErrorBox message={error} onClose={() => setError("")} />
        </div>

        <div className="lg:col-span-2 space-y-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Try an example</p>
          {EXAMPLE_ORDERS.map((ex) => (
            <button key={ex.order_id} onClick={() => loadExample(ex)}
              className="w-full text-left card p-4 hover:border-purple-700/50 hover:bg-purple-900/10 transition-all group">
              <p className="text-sm font-medium text-white font-mono group-hover:text-purple-400 transition-colors">{ex.order_id}</p>
              <p className="text-xs text-gray-500 mt-0.5">{ex.products.length} products · {ex.products.reduce((s, p) => s + p.quantity, 0)} units</p>
            </button>
          ))}
        </div>
      </div>

      {loading && <Spinner text="Calculating sustainability impact..." />}

      {result && (
        <div className="mt-8 fade-up space-y-4">
          <div className="card p-6 border-purple-700/40 bg-gradient-to-br from-purple-900/10 to-transparent">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-800">
              <div className="w-10 h-10 rounded-xl bg-purple-900/40 border border-purple-700/50 flex items-center justify-center text-xl">🌍</div>
              <div>
                <h2 className="text-lg font-bold text-white">Impact Report</h2>
                <p className="text-xs text-gray-500 font-mono">{result.order_id}</p>
              </div>
              <span className="ml-auto text-xs bg-purple-900/40 text-purple-400 border border-purple-700/50 px-2 py-1 rounded-full">✓ Generated</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="bg-teal-900/20 border border-teal-700/40 rounded-xl p-5 text-center">
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Plastic Saved</p>
                <p className="text-4xl font-extrabold text-teal-400">{result.plastic_saved_kg}</p>
                <p className="text-sm text-teal-600 font-medium">kilograms</p>
              </div>
              <div className="bg-green-900/20 border border-green-700/40 rounded-xl p-5 text-center">
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Carbon Avoided</p>
                <p className="text-4xl font-extrabold text-green-400">{result.carbon_avoided_kg}</p>
                <p className="text-sm text-green-600 font-medium">kilograms CO₂</p>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4 mb-3">
              <p className="text-xs text-gray-500 mb-1.5 uppercase tracking-wide">Local Sourcing Impact</p>
              <p className="text-gray-200 text-sm leading-relaxed">{result.local_sourcing_impact}</p>
            </div>

            <div className="bg-purple-900/20 border border-purple-700/40 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1.5 uppercase tracking-wide">🎉 Impact Statement</p>
              <p className="text-purple-200 text-sm leading-relaxed">{result.impact_statement}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
