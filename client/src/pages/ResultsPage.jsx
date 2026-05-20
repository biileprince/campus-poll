import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetResults } from "../hooks/useApi";

import ResultsHeader from "../Components/Results/ResultsHeader";
import MetricsCard from "../Components/Results/MetricsCard";
import VoteDistribution from "../Components/Results/VoteDistribution";
import TurnoutChart from "../Components/Results/TurnoutChart";
import ResultsSkeleton from "../Components/Results/ResultsSkeleton";
import {
  Clock,
  ArrowLeft,
  BarChart3,
  PieChart,
  Copy,
  Check,
  Link2,
} from "lucide-react";

const CHART_TYPES = [
  { value: "pie", label: "Pie", icon: PieChart },
  { value: "donut", label: "Donut", icon: PieChart },
  { value: "bar", label: "Bar", icon: BarChart3 },
];

export default function ResultsPage() {
  const { id: resultsId } = useParams();
  const navigate = useNavigate();
  const { data, loading, error, execute } = useGetResults();
  const [results, setResults] = useState(null);
  const [chartType, setChartType] = useState("pie");
  const [copiedLink, setCopiedLink] = useState(false);
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

  const copyResultsLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      /* silent */
    }
  };

  if (loading) {
    return <ResultsSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="card-flat p-8 max-w-md text-center animate-scale-in">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <BarChart3 size={24} style={{ color: "var(--error-500)" }} />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Failed to Load Results
          </h2>
          <p className="text-sm text-gray-500 mb-5">{error}</p>
          <button onClick={() => navigate("/polls")} className="btn-primary">
            Browse Polls
          </button>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-400 text-sm">No results found.</p>
      </div>
    );
  }

  const options = results.options || [];
  const turnoutData = options.map((opt) => ({
    label: opt.text,
    value: opt.voteCount || 0,
  }));
  const totalVotes =
    results.totalVotes ||
    options.reduce((sum, opt) => sum + (opt.voteCount || 0), 0);

  return (
    <div className="page-enter max-w-5xl mx-auto px-4 sm:px-6 py-6">
      {/* Back Button */}
      <button
        onClick={() => navigate("/polls")}
        className="btn-ghost text-sm mb-5"
        style={{ color: "var(--brand-600)" }}
      >
        <ArrowLeft size={16} />
        Back to Polls
      </button>

      {/* Header + Share */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
        <ResultsHeader title={results.question || "Poll Results"} />
        <button
          onClick={copyResultsLink}
          className={`btn-secondary text-xs flex-shrink-0 ${
            copiedLink ? "!border-green-500 !text-green-700 !bg-green-50" : ""
          }`}
        >
          {copiedLink ? <Check size={14} /> : <Link2 size={14} />}
          {copiedLink ? "Copied!" : "Share Results"}
        </button>
      </div>

      {/* Expiration Notice */}
      {results.expiresAt && (
        <div
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium mb-5 animate-fade-in ${
            results.status === "Expired"
              ? "bg-gray-100 text-gray-600"
              : "bg-amber-50 text-amber-700 border border-amber-100"
          }`}
        >
          <Clock size={14} />
          {results.status === "Expired"
            ? `Poll expired on ${formatDate(results.expiresAt)}`
            : `Poll expires on ${formatDate(results.expiresAt)}`}
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <MetricsCard title="Total Votes" value={totalVotes} />
        <MetricsCard title="Options" value={options.length} />
        <MetricsCard title="Status" value={results.status || "Closed"} />
      </div>

      {options.length === 0 ? (
        <div className="card-flat p-12 text-center">
          <p className="text-gray-400 text-sm">
            No votes have been cast yet 📭
          </p>
          <p className="text-gray-300 text-xs mt-1">
            Share the voting link to start collecting responses.
          </p>
        </div>
      ) : (
        <>
          {/* Chart Type Selector */}
          <div className="card-flat p-3 mb-5 animate-fade-in-up delay-1">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <span className="text-xs font-medium text-gray-500 px-1">
                Chart Type
              </span>
              <div className="flex gap-1.5 bg-gray-100 p-1 rounded-lg">
                {CHART_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setChartType(type.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                      chartType === type.value
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <type.icon size={12} />
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <VoteDistribution data={options} />
            <TurnoutChart data={turnoutData} chartType={chartType} />
          </div>
        </>
      )}
    </div>
  );
}
