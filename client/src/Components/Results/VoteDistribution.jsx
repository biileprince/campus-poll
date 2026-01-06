export default function VoteDistribution() {
  return (
    <div className="bg-white border rounded-xl p-4">
      <div className="flex justify-between mb-3">
        <h3 className="font-medium">Vote Distribution</h3>
        <button className="text-sm text-gray-400">Export</button>
      </div>

      <div className="h-56 flex items-end gap-4">
        {["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied"].map(
          (label, i) => (
            <div key={i} className="flex-1">
              <div className="bg-purple-500 rounded-t h-[70%]" />
              <p className="text-xs text-center mt-2">{label}</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
