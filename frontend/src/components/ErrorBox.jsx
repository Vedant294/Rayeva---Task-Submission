export default function ErrorBox({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-3 bg-red-950/60 border border-red-700/60 text-red-300 rounded-xl px-4 py-3 text-sm mt-4 fade-up">
      <span className="text-lg shrink-0">⚠️</span>
      <div className="flex-1">{message}</div>
      {onClose && (
        <button onClick={onClose} className="text-red-400 hover:text-red-200 shrink-0">✕</button>
      )}
    </div>
  );
}
