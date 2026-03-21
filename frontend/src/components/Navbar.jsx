import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";

const links = [
  { to: "/", label: "Dashboard", icon: "⬡" },
  { to: "/category", label: "Category AI", icon: "🏷️" },
  { to: "/proposal", label: "Proposal AI", icon: "📋" },
  { to: "/impact", label: "Impact AI", icon: "🌍" },
  { to: "/logs", label: "AI Logs", icon: "🔍" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-sm font-bold shadow-lg shadow-green-900/40">
            R
          </div>
          <div>
            <span className="text-lg font-bold text-white tracking-tight">Rayeva</span>
            <span className="hidden sm:inline text-xs text-gray-500 ml-2 font-normal">AI Commerce</span>
          </div>
          <span className="hidden md:inline text-xs bg-green-900/40 text-green-400 border border-green-800 px-2 py-0.5 rounded-full font-medium">
            Beta
          </span>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-green-600/20 text-green-400 border border-green-700/50"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/60"
                }`
              }
            >
              <span className="text-xs">{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
            All systems operational
          </div>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden text-gray-400 hover:text-white p-2" onClick={() => setOpen(!open)}>
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-800 bg-gray-950 px-4 py-3 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive ? "bg-green-600/20 text-green-400" : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`
              }
            >
              <span>{l.icon}</span> {l.label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
}
