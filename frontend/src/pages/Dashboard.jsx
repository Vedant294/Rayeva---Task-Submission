import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import StatCard from "../components/StatCard";
import ErrorBox from "../components/ErrorBox";

const modules = [
  { to: "/category", icon: "🏷️", title: "Category AI", desc: "Auto-classify products with SEO tags and sustainability filters.", color: "from-green-600/20 to-emerald-600/10", border: "border-green-700/40", btn: "text-green-400" },
  { to: "/proposal", icon: "📋", title: "Proposal AI", desc: "Generate tailored B2B product proposals within any budget.", color: "from-blue-600/20 to-indigo-600/10", border: "border-blue-700/40", btn: "text-blue-400" },
  { to: "/impact",   icon: "🌍", title: "Impact AI",   desc: "Calculate and narrate the sustainability impact of every order.", color: "from-purple-600/20 to-violet-600/10", border: "border-purple-700/40", btn: "text-purple-400" },
  { to: "/logs",     icon: "🔍", title: "AI Logs",     desc: "Inspect every AI prompt and response across all modules.", color: "from-yellow-600/20 to-orange-600/10", border: "border-yellow-700/40", btn: "text-yellow-400" },
];

function SkeletonCard() {
  return (
    <div className="card p-5 flex items-center gap-4 animate-pulse">
      <div className="w-12 h-12 rounded-xl bg-gray-800" />
      <div className="space-y-2 flex-1">
        <div className="h-3 bg-gray-800 rounded w-24" />
        <div className="h-6 bg-gray-800 rounded w-16" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getDashboard()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden mb-10 bg-gradient-to-br from-gray-900 via-gray-900 to-green-950 border border-gray-800 p-8 sm:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(34,197,94,0.12),_transparent_60%)]" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-green-900/40 border border-green-700/50 text-green-400 text-xs font-medium px-3 py-1 rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            AI-Powered Platform
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-3">
            Sustainable Commerce,<br />
            <span className="gradient-text">Automated by AI</span>
          </h1>
          <p className="text-gray-400 text-base leading-relaxed mb-6">
            Rayeva uses large language models to automate product categorization, generate B2B proposals, and produce sustainability impact reports — all in seconds.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/category" className="btn-primary inline-flex items-center gap-2 text-sm">
              Get Started <span>→</span>
            </Link>
            <Link to="/logs" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 px-5 py-3 rounded-xl transition-all">
              View AI Logs
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-10">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Platform Overview</h2>
        <ErrorBox message={error} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {loading ? (
            Array(5).fill(0).map((_, i) => <SkeletonCard key={i} />)
          ) : data ? (
            <>
              <StatCard icon="📦" label="Products Categorized" value={data.stats.total_products_categorized} color="green" />
              <StatCard icon="📋" label="Proposals Generated" value={data.stats.total_proposals_generated} color="blue" />
              <StatCard icon="🌍" label="Impact Reports" value={data.stats.total_impact_reports_created} color="purple" />
              <StatCard icon="♻️" label="Plastic Saved" value={data.stats.total_plastic_saved_kg} suffix=" kg" color="teal" />
              <StatCard icon="🌱" label="Carbon Avoided" value={data.stats.total_carbon_avoided_kg} suffix=" kg" color="yellow" />
            </>
          ) : null}
        </div>
      </div>

      {/* Module cards */}
      <div className="mb-10">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">AI Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map((m) => (
            <Link key={m.to} to={m.to}
              className={`group card p-6 bg-gradient-to-br ${m.color} border ${m.border} hover:scale-[1.02] transition-all duration-200 block`}>
              <div className="text-3xl mb-3">{m.icon}</div>
              <h3 className="text-white font-semibold mb-1">{m.title}</h3>
              <p className="text-gray-400 text-xs leading-relaxed mb-4">{m.desc}</p>
              <span className={`text-xs font-medium ${m.btn} group-hover:underline`}>Open module →</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent reports table */}
      {data?.recent_reports?.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Recent Impact Reports</h2>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wide">
                  <th className="text-left px-5 py-3">Order ID</th>
                  <th className="text-left px-5 py-3">Plastic Saved</th>
                  <th className="text-left px-5 py-3">Carbon Avoided</th>
                  <th className="text-left px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_reports.map((r, i) => (
                  <tr key={r._id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-3 text-green-400 font-mono font-medium">{r.order_id}</td>
                    <td className="px-5 py-3 text-teal-400 font-medium">{r.plastic_saved_kg} kg</td>
                    <td className="px-5 py-3 text-green-400 font-medium">{r.carbon_avoided_kg} kg</td>
                    <td className="px-5 py-3 text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
