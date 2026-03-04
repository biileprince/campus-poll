import { useNavigate } from "react-router-dom";
import { Plus, BarChart3, Vote, ListChecks } from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Welcome to Campus Poll
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Create, share, and analyze polls with your community
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Create Poll Card */}
          <button
            onClick={() => navigate("/create-poll")}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow text-left group"
          >
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors mb-4">
              <Plus className="text-indigo-600" size={24} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Create New Poll
            </h2>
            <p className="text-gray-600 text-sm">
              Design a new poll and start gathering responses
            </p>
          </button>

          {/* Browse Polls Card */}
          <button
            onClick={() => navigate("/polls")}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow text-left group"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors mb-4">
              <ListChecks className="text-blue-600" size={24} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Browse Polls
            </h2>
            <p className="text-gray-600 text-sm">
              View all polls and interact with them
            </p>
          </button>

          {/* Vote Instructions Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Vote className="text-green-600" size={24} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Vote</h2>
            <p className="text-gray-600 text-sm">
              Use voting links from poll creators to cast your vote
            </p>
          </div>

          {/* Results Instructions Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="text-purple-600" size={24} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              View Results
            </h2>
            <p className="text-gray-600 text-sm">
              Access results links to see poll analytics and insights
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div>
              <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold mb-4">
                1
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Create Poll</h3>
              <p className="text-gray-600 text-sm">
                Click "Create New Poll" above, add your question and options
              </p>
            </div>
            <div>
              <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold mb-4">
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Share Links</h3>
              <p className="text-gray-600 text-sm">
                You'll get two links: one for voting and one for viewing results
              </p>
            </div>
            <div>
              <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold mb-4">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Analyze Results
              </h3>
              <p className="text-gray-600 text-sm">
                View real-time results with charts and insights after people
                vote
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
