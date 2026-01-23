import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetResults } from "../hooks/useApi";

import ResultsHeader from "../Components/Results/ResultsHeader";
import MetricsCard from "../Components/Results/MetricsCard";
import VoteDistribution from "../Components/Results/VoteDistribution";
import TurnoutChart from "../Components/Results/TurnoutChart";
import ResultsSkeleton from "../Components/Results/ResultsSkeleton";
import { Clock, PieChart, ArrowLeft } from "lucide-react";

export default function ResultsPage() {
  const { id: resultsId } = useParams();
  const navigate = useNavigate();
  const { data, loading, error, execute } = useGetResults();
  const [results, setResults] = useState(null);
  const [chartType, setChartType] = useState("pie");
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

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
    label: opt.text,
    value: opt.voteCount || 0,
  }));

  const totalVotes =
    results.totalVotes ||
    options.reduce((sum, opt) => sum + (opt.voteCount || 0), 0);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate("/polls")}
        className="flex items-center gap-2 text-[#4F46E5] hover:text-[#4338CA] mb-4 text-sm font-medium"
      >
        <ArrowLeft size={16} />
        Back to Polls
      </button>

      <ResultsHeader title={results.question || "Poll Results"} />

      {/* Expiration Notice */}
      {results.expiresAt && (
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
            results.status === "Expired"
              ? "bg-gray-100 text-gray-600"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          <Clock size={16} />
          {results.status === "Expired"
            ? `Poll expired on ${formatDate(results.expiresAt)}`
            : `Poll expires on ${formatDate(results.expiresAt)}`}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <MetricsCard title="Total Votes" value={totalVotes} />
        <MetricsCard title="Options" value={options.length} />
        <MetricsCard title="Status" value={results.status || "Closed"} />
      </div>

      {options.length === 0 ? (
        <div className="text-center text-gray-500 py-10 text-sm sm:text-base">
          No votes have been cast yet 📭
        </div>
      ) : (
        <>
          {/* Chart Type Selector */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <PieChart size={16} />
                <span>Chart Type</span>
              </div>
              <div className="flex gap-2">
                {[
                  { value: "pie", label: "Pie Chart" },
                  { value: "donut", label: "Donut Chart" },
                  { value: "bar", label: "Bar Chart" },
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setChartType(type.value)}
                    className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                      chartType === type.value
                        ? "bg-[#6366F1] text-white border-[#6366F1]"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <VoteDistribution data={options} />
            <TurnoutChart data={turnoutData} chartType={chartType} />
          </div>
        </>
      )}
    </div>
  );
}
