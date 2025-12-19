import { useState } from "react";
import {
  Check,
  ChevronRight,
  Calendar,
  Eye,
  Clock,
  Twitter,
  Facebook,
  Linkedin,
  Link2,
  User,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function VotingPage() {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState(null);

  const poll = {
    status: "Active Poll",
    question: "What's Your Preferred Design Tool?",
    description:
      "Help us understand which design tools are most popular among our community. Your input will guide our future tutorials and resources.",
    creator: {
      name: "Mr Owens",
      role: "Poll Creator",
    },
    createdDate: "Jul 15, 2025",
    views: "1,247",
    closesDate: "Jul 30, 2025",
    responses: {
      current: 342,
      target: 500,
    },
    options: [
      {
        id: 1,
        title: "Figma",
        description: "Collaborative interface design tool",
      },
      {
        id: 2,
        title: "Adobe XD",
        description: "Vector-based experience design platform",
      },
      {
        id: 3,
        title: "Sketch",
        description: "Digital design toolkit for Mac",
      },
      {
        id: 4,
        title: "Other",
        description: "Different tool or combination",
      },
    ],
    tags: ["Design", "Tools", "Community"],
    trendData: [
      { date: "Jan 10", responses: 45 },
      { date: "Jan 12", responses: 78 },
      { date: "Jan 14", responses: 132 },
      { date: "Jan 16", responses: 198 },
      { date: "Jan 18", responses: 267 },
      { date: "Jan 20", responses: 342 },
    ],
  };

  const handleSubmit = () => {
    if (selectedOption) {
      console.log("Submitting vote for option:", selectedOption);
    }
  };

  const progressPercentage =
    (poll.responses.current / poll.responses.target) * 100;

  return (
    <div className="bg-[#F3F4F6] min-h-screen">
      <main className="p-6 max-w-7xl mx-auto">
        <button
          onClick={() => navigate("/create-poll")}
          className="flex items-center gap-2 text-[#4F46E5] hover:text-[#4338CA] mb-6 text-sm font-medium"
        >
          <ArrowLeft size={16} />
          Back to Polls
        </button>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column  */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="inline-flex items-center gap-2 bg-[#DCFCE7] text-[#166534] px-3 py-1 rounded-full text-xs font-medium mb-4">
                <div className="w-2 h-2 bg-[#16A34A] rounded-full"></div>
                {poll.status}
              </div>

              <h1 className="text-3xl font-bold text-[#111827] mb-3">
                {poll.question}
              </h1>

              <p className="text-[#6B7280] text-sm mb-8">{poll.description}</p>

              {/* Poll Options */}
              <div className="space-y-3 mb-8">
                {poll.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedOption(option.id)}
                    className={`w-full flex items-center justify-between p-4 border-2 rounded-lg transition-all hover:border-[#4F46E5] hover:bg-[#F9FAFB] ${
                      selectedOption === option.id
                        ? "border-[#4F46E5] bg-[#EEF2FF]"
                        : "border-[#E5E7EB] bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedOption === option.id
                            ? "border-[#4F46E5] bg-[#4F46E5]"
                            : "border-[#9CA3AF]"
                        }`}
                      >
                        {selectedOption === option.id && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>

                      <div className="text-left">
                        <p className="text-sm font-semibold text-[#111827]">
                          {option.title}
                        </p>
                        <p className="text-xs text-[#6B7280]">
                          {option.description}
                        </p>
                      </div>
                    </div>

                    <ChevronRight
                      size={20}
                      className={`${
                        selectedOption === option.id
                          ? "text-[#4F46E5]"
                          : "text-[#9CA3AF]"
                      }`}
                    />
                  </button>
                ))}
              </div>

              <button
                onClick={handleSubmit}
                disabled={!selectedOption}
                className={`w-full py-3 rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${
                  selectedOption
                    ? "bg-[#4F46E5] text-white hover:bg-[#4338CA]"
                    : "bg-[#D1D5DB] text-[#6B7280] cursor-not-allowed"
                }`}
              >
                <Check size={18} />
                Submit Vote
              </button>
            </div>
          </div>

          {/* Right Column  */}
          <div className="space-y-6">
            {/* Poll Details Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-semibold text-[#111827] mb-4">
                Poll Details
              </h3>

              {/* Creator Info */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#E5E7EB] flex items-center justify-center">
                  <User size={20} className="text-[#6B7280]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#111827]">
                    {poll.creator.name}
                  </p>
                  <p className="text-xs text-[#6B7280]">{poll.creator.role}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-[#6B7280]">
                  <Calendar size={16} className="text-[#9CA3AF]" />
                  <span className="text-xs">Created: {poll.createdDate}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[#6B7280]">
                  <Eye size={16} className="text-[#9CA3AF]" />
                  <span className="text-xs">{poll.views} views</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[#6B7280]">
                  <Clock size={16} className="text-[#9CA3AF]" />
                  <span className="text-xs">Closes: {poll.closesDate}</span>
                </div>
              </div>
            </div>

            {/* Response Progress Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-semibold text-[#111827] mb-4">
                Response Progress
              </h3>

              <div className="mb-2">
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-3xl font-bold text-[#4F46E5]">
                    {poll.responses.current}
                  </span>
                  <span className="text-sm text-[#6B7280] mb-1">responses</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#E5E7EB] rounded-full h-2 mb-2">
                <div
                  className="bg-[#4F46E5] h-2 rounded-full transition-all"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-[#6B7280]">
                {progressPercentage.toFixed(0)}% of target (
                {poll.responses.target} responses)
              </p>
            </div>

            {/* Response Trend Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-semibold text-[#111827] mb-4">
                Response Trend
              </h3>

              {/* Simple Line Chart */}
              <div className="relative h-32">
                <svg
                  viewBox="0 0 300 100"
                  className="w-full h-full"
                  preserveAspectRatio="none"
                >
                  <polyline
                    fill="none"
                    stroke="#4F46E5"
                    strokeWidth="2"
                    points="0,80 50,65 100,45 150,30 200,15 250,5 300,0"
                  />
                  <defs>
                    <linearGradient
                      id="gradient"
                      x1="0%"
                      y1="0%"
                      x2="0%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <polygon
                    fill="url(#gradient)"
                    points="0,80 50,65 100,45 150,30 200,15 250,5 300,0 300,100 0,100"
                  />
                </svg>

                {/* X-axis labels */}
                <div className="flex justify-between text-xs text-[#6B7280] mt-2">
                  {poll.trendData.map((data, index) => (
                    <span key={index} className="text-[10px]">
                      {data.date.split(" ")[1]}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Tags Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-semibold text-[#111827] mb-3">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {poll.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-[#F3F4F6] text-[#374151] text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Share Poll Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-semibold text-[#111827] mb-3">
                Share Poll
              </h3>
              <div className="flex gap-2">
                <a
                  href=""
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 p-2 border border-[#E5E7EB] rounded-md hover:bg-[#F9FAFB] transition-colors flex items-center justify-center"
                >
                  <Twitter size={18} className="text-[#1DA1F2]" />
                </a>
                <a
                  href=""
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 p-2 border border-[#E5E7EB] rounded-md hover:bg-[#F9FAFB] transition-colors flex items-center justify-center"
                >
                  <Facebook size={18} className="text-[#1877F2]" />
                </a>
                <a
                  href=""
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 p-2 border border-[#E5E7EB] rounded-md hover:bg-[#F9FAFB] transition-colors flex items-center justify-center"
                >
                  <Linkedin size={18} className="text-[#0A66C2]" />
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Link copied to clipboard!");
                  }}
                  className="flex-1 p-2 border border-[#E5E7EB] rounded-md hover:bg-[#F9FAFB] transition-colors flex items-center justify-center"
                >
                  <Link2 size={18} className="text-[#6B7280]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default VotingPage;
