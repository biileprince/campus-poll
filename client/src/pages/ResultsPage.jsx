import ResultsHeader from "../components/Results/ResultsHeader";
import MetricsCard from "../components/Results/MetricsCard";
import VoteDistribution from "../components/Results/VoteDistribution";
import VoteTimeline from "../components/Results/VoteTimeline";
import ShareResults from "../components/Results/ShareResults";

export default function ResultsPage() {
  return (
    <div className="p-6">
      <ResultsHeader />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <MetricsCard title="Total Votes" value="2,847" subtitle="+12%" />
        <MetricsCard title="Very Satisfied" value="45.2%" />
        <MetricsCard title="Time Active" value="7 Days" />
        <MetricsCard title="Engagement Rate" value="68.3%" subtitle="+8%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <VoteDistribution />
          <VoteTimeline />
        </div>

        <ShareResults />
      </div>
    </div>
  );
}
