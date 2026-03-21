export default function Spinner({ text = "Processing with AI..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-green-900" />
        <div className="absolute inset-0 rounded-full border-4 border-green-500 border-t-transparent animate-spin" />
      </div>
      <p className="text-gray-400 text-sm animate-pulse">{text}</p>
    </div>
  );
}
