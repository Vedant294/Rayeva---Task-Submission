import { useEffect, useState } from "react";
import { api } from "../services/api";
import Spinner from "../components/Spinner";
import ErrorBox from "../components/ErrorBox";

const MODULE_STYLES = {
  "Category Generator":     { bg: "bg-green-900/30",  text: "text-green-400",  border: "border-green-700/50",  dot: "bg-green-400" },
  "B2B Proposal Generator": { bg: "bg-blue-900/30",   text: "text-blue-400",   border: "border-blue-700/50",   dot: "bg-blue-400" },
  "Impact Report Generator":{ bg: "bg-purple-900/30", text: "text-purple-400", border: "border-purple-700/50", dot: "bg-purple-400" },
};

export default function LogsViewer() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    api.getLogs()
      .then((d) => setLogs(d.logs))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const modules = ["All", "Category Generator", "B2B Proposal Generator", "Impact Report Generator"];
  const filtered = filter === "All" ? logs : logs.filter((l) => l.module === filter);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-yellow-900/30 border border-yellow-800/50 text-yellow-400 text-xs px-3 py-1 rounded-full mb-3">🔍 AI Logs</div>
        <h1 className="section-title">AI Logs Viewer</h1>
        <p className="section-sub">Full audit trail of every AI prompt and response across all modules.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {modules.map((m) => (
          <button key={m} onClick={() => setFilter(m)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all border ${
              filter === m
                ? "bg-gray-700 text-white border-gray-600"
                : "text-gray-400 border-gray-800 hover:text-white hover:border-gray-700"
            }`}>
            {m}
            {m !== "All" && (
              <span className="ml-1.5 text-gray-500">({logs.filter((l) => l.module === m).length})</span>
            )}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-600 self-center">{filtered.length} entries</span>
      </div>

      {loading && <Spinner text="Loading AI logs..." />}
      <ErrorBox message={error} />

      {!loading && filtered.length === 0 && (
        <div className="card p-12 text-center">
          <p className="text-4xl mb-3">🤖</p>
          <p className="text-gray-400 font-medium">No logs yet</p>
          <p className="text-gray-600 text-sm mt-1">Use the AI modules to generate some activity.</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((log, i) => {
          const style = MODULE_STYLES[log.module] || { bg: "bg-gray-800/30", text: "text-gray-400", border: "border-gray-700", dot: "bg-gray-400" };
          const isOpen = expanded === i;
          let parsed = null;
          try { parsed = JSON.parse(log.response); } catch {}

          return (
            <div key={log._id} className="card overflow-hidden fade-up">
              <button className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-800/40 transition-colors text-left"
                onClick={() => setExpanded(isOpen ? null : i)}>
                <span className={`w-2 h-2 rounded-full shrink-0 ${style.dot}`} />
                <span className={`text-xs px-2 py-0.5 rounded-md border font-medium shrink-0 ${style.bg} ${style.text} ${style.border}`}>
                  {log.module}
                </span>
                <span className="text-gray-400 text-sm truncate flex-1">{log.prompt.slice(0, 90)}...</span>
                <span className="text-xs text-gray-600 shrink-0 hidden sm:block">{new Date(log.createdAt).toLocaleString()}</span>
                <span className="text-gray-600 text-xs shrink-0">{isOpen ? "▲" : "▼"}</span>
              </button>

              {isOpen && (
                <div className="border-t border-gray-800 px-5 py-4 space-y-4 bg-gray-900/50">
                  <div>
                    <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide font-medium">Prompt</p>
                    <pre className="bg-gray-800/80 rounded-xl p-4 text-xs text-gray-300 whitespace-pre-wrap overflow-x-auto leading-relaxed">{log.prompt}</pre>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide font-medium">AI Response</p>
                    <pre className="bg-gray-800/80 rounded-xl p-4 text-xs text-green-300 whitespace-pre-wrap overflow-x-auto leading-relaxed">
                      {parsed ? JSON.stringify(parsed, null, 2) : log.response}
                    </pre>
                  </div>
                  <p className="text-xs text-gray-600">{new Date(log.createdAt).toLocaleString()}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
