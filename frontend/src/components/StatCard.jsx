export default function StatCard({ icon, label, value, color = "green", suffix = "" }) {
  const palette = {
    green:  { border: "border-green-500/30",  bg: "bg-green-500/10",  text: "text-green-400",  glow: "shadow-green-900/20" },
    blue:   { border: "border-blue-500/30",   bg: "bg-blue-500/10",   text: "text-blue-400",   glow: "shadow-blue-900/20" },
    purple: { border: "border-purple-500/30", bg: "bg-purple-500/10", text: "text-purple-400", glow: "shadow-purple-900/20" },
    teal:   { border: "border-teal-500/30",   bg: "bg-teal-500/10",   text: "text-teal-400",   glow: "shadow-teal-900/20" },
    yellow: { border: "border-yellow-500/30", bg: "bg-yellow-500/10", text: "text-yellow-400", glow: "shadow-yellow-900/20" },
  };
  const c = palette[color] || palette.green;

  return (
    <div className={`card p-5 flex items-center gap-4 shadow-lg ${c.glow} hover:scale-[1.02] transition-transform duration-200`}>
      <div className={`w-12 h-12 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center text-2xl shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-gray-400 text-xs font-medium uppercase tracking-wide truncate">{label}</p>
        <p className={`text-2xl font-bold ${c.text} mt-0.5`}>{value}{suffix}</p>
      </div>
    </div>
  );
}
