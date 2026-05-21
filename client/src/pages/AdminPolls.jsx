import { useEffect, useState } from 'react';
import { getAdminPolls, getPollDetailsAdmin, deletePollAdmin, resetPollVotes } from '../services/adminApi';

export default function AdminPolls() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchPolls();
  }, [page, search]);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const data = await getAdminPolls(page, 10, search);
      setPolls(data.polls);
      setTotalPages(data.pages);
      setError(null);
    } catch (err) {
      setError('Failed to load polls');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (poll) => {
    try {
      const details = await getPollDetailsAdmin(poll.id);
      setSelectedPoll(details);
      setShowDetails(true);
    } catch (err) {
      setError('Failed to load poll details');
      console.error(err);
    }
  };

  const handleDeletePoll = async (pollId) => {
    if (confirm('Are you sure you want to delete this poll?')) {
      try {
        await deletePollAdmin(pollId);
        fetchPolls();
        setError(null);
      } catch (err) {
        setError('Failed to delete poll');
        console.error(err);
      }
    }
  };

  const handleResetVotes = async (pollId) => {
    if (confirm('Are you sure you want to reset all votes for this poll?')) {
      try {
        await resetPollVotes(pollId);
        fetchPolls();
        setError(null);
      } catch (err) {
        setError('Failed to reset poll votes');
        console.error(err);
      }
    }
  };

  if (loading && polls.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manage Polls</h1>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search polls by question..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Poll Details Modal */}
      {showDetails && selectedPoll && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">{selectedPoll.question}</h2>
            
            <div className="mb-4">
              <h3 className="font-semibold text-gray-700 mb-2">Stats</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Total Votes</p>
                  <p className="text-2xl font-bold text-blue-600">{selectedPoll.totalVotes}</p>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Options</p>
                  <p className="text-2xl font-bold text-green-600">{selectedPoll.options.length}</p>
                </div>
                <div className="bg-purple-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="text-sm font-semibold text-purple-600">
                    {new Date(selectedPoll.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold text-gray-700 mb-3">Vote Distribution</h3>
              <div className="space-y-3">
                {selectedPoll.options.map((option) => {
                  const percentage = selectedPoll.totalVotes > 0 
                    ? (option.voteCount / selectedPoll.totalVotes * 100).toFixed(1)
                    : 0;
                  
                  return (
                    <div key={option.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-700">{option.text}</span>
                        <span className="text-sm font-semibold text-gray-600">
                          {option.voteCount} votes ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {selectedPoll.createdBy && (
              <div className="mb-4 bg-gray-50 p-3 rounded">
                <h3 className="font-semibold text-gray-700 mb-2">Created By</h3>
                <p className="text-gray-700">{selectedPoll.createdBy.name}</p>
                <p className="text-sm text-gray-600">{selectedPoll.createdBy.email}</p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setShowDetails(false)}
                className="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Polls Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100 border-b-2 border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Question</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Votes</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Options</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Created By</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Created</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {polls.length > 0 ? (
                polls.map((poll) => (
                  <tr
                    key={poll.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <td className="py-3 px-4">
                      <div className="max-w-xs">
                        <p className="text-gray-800 font-medium truncate">{poll.question}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {poll.totalVotes}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{poll.optionCount}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {poll.createdBy ? poll.createdBy.name : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(poll.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetails(poll)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleResetVotes(poll.id)}
                          className="text-yellow-600 hover:text-yellow-800 font-medium text-sm"
                        >
                          Reset
                        </button>
                        <button
                          onClick={() => handleDeletePoll(poll.id)}
                          className="text-red-600 hover:text-red-800 font-medium text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    No polls found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-2 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-3 py-2 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
