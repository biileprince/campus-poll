export default function VoteTimeline() {
  return (
    <div className="bg-white border rounded-xl p-4">
      <div className="flex justify-between mb-3">
        <h3 className="font-medium">Vote Activity Timeline</h3>
        <select className="text-sm border rounded px-2 py-1">
          <option>Last 7 Days</option>
        </select>
      </div>

      <div className="h-48 bg-purple-50 rounded" />
    </div>
  );
}
