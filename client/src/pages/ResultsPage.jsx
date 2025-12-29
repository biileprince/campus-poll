import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useGetResults } from "../hooks/useApi";

import ResultsHeader from "../components/Results/ResultsHeader";
import MetricsCard from "../components/Results/MetricsCard";
import VoteDistribution from "../components/Results/VoteDistribution";
import TurnoutChart from "../components/Results/TurnoutChart";
import ResultsSkeleton from "../components/Results/ResultsSkeleton";

export default function ResultsPage() {
  const { id: resultsId } = useParams();
  const { data, loading, error, execute } = useGetResults();
  const [results, setResults] = useState(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!resultsId) return;
    if (hasFetched.current) return;

    hasFetched.current = true;

    execute(resultsId)
      .then((res) => {
        if (res) setResults(res);
      })
      .catch(() => {});
  }, [resultsId, execute]);

  /* ---------- LOADING ---------- */
  if (loading) {
    return (
      <div className="p-6">
        <ResultsSkeleton />
      </div>
    );
  }

  /* ---------- ERROR ---------- */
  if (error) {
    return (
      <div className="p-6 text-red-500">Failed to load results: {error}</div>
    );
  }

  /* ---------- NO DATA ---------- */
  if (!results) {
    return <div className="p-6">No results found.</div>;
  }

  /* ---------- SAFE DATA MAPPING ---------- */
  const options = results.options || [];

  const turnoutData = options.map((opt) => ({
    label: opt.option,
    value: opt.votes || 0,
  }));

  const totalVotes = options.reduce((sum, opt) => sum + (opt.votes || 0), 0);

  return (
    <div className="p-6 space-y-6">
      <ResultsHeader title={results.question || "Poll Results"} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricsCard title="Total Votes" value={totalVotes} />
        <MetricsCard title="Options" value={options.length} />
        <MetricsCard title="Status" value={results.status || "Closed"} />
      </div>

      {options.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          No votes have been cast yet 📭
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <VoteDistribution data={options} />
          <TurnoutChart data={turnoutData} />
        </div>
      )}
    </div>
  );
}
