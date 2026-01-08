import { useEffect } from "react";
import useApi from "../hooks/useApi";
import { getPollResults } from "../services/api";

import ResultsHeader from "../components/Results/ResultsHeader";
import MetricsCard from "../components/Results/MetricsCard";
import VoteDistribution from "../components/Results/VoteDistribution";
import TurnoutChart from "../components/Results/TurnoutChart";

export default function ResultsPage() {
  const { data: results, loading, error, execute } = useApi(getPollResults);

  useEffect(() => {
    execute("123"); // replace with real resultsId later
  }, [execute]);

  if (loading) return <div className="p-6">Loading results…</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!results) return null;

  const chartData = results.options.map((opt) => ({
    name: opt.text,
    value: opt.voteCount,
  }));

  return (
    <div className="p-6 space-y-6">
      <ResultsHeader title={results.question} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricsCard title="Total Votes" value={results.totalVotes} />
        <MetricsCard title="Options" value={results.options.length} />
        <MetricsCard title="Status" value="Closed" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VoteDistribution data={results.options} />
        <TurnoutChart data={chartData} />
      </div>
    </div>
  );
}
