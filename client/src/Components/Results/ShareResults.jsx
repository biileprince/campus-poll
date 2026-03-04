export default function ShareResults() {
  return (
    <div className="bg-white border rounded-xl p-4 space-y-3">
      <h3 className="font-medium">Share Results</h3>

      {[
        "Share on Twitter",
        "Share on Facebook",
        "Share via WhatsApp",
        "Copy Link",
        "Email Results",
      ].map((item) => (
        <button
          key={item}
          className="w-full text-left px-3 py-2 border rounded-lg text-sm"
        >
          {item}
        </button>
      ))}
    </div>
  );
}
