import { useEffect, useState } from 'react';
import { getDashboardStats } from '../services/adminApi';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentPolls, setRecentPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      setStats(data.stats);
      setRecentPolls(data.recentPolls || []);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: '👥',
      color: 'bg-blue-500',
    },
    {
      title: 'Total Polls',
      value: stats?.totalPolls || 0,
      icon: '📋',
      color: 'bg-green-500',
    },
    {
      title: 'Total Votes',
      value: stats?.totalVotes || 0,
      icon: '🗳️',
      color: 'bg-purple-500',
    },
    {
      title: 'Total Options',
      value: stats?.totalOptions || 0,
      icon: '✅',
      color: 'bg-orange-500',
    },
  ];

  return (
    <div>
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">{card.title}</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {card.value.toLocaleString()}
                </p>
              </div>
              <div className={`${card.color} rounded-full p-4 text-2xl`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Polls */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Polls</h3>
        {recentPolls.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Question</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Options</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Created</th>
                </tr>
              </thead>
              <tbody>
                {recentPolls.map((poll) => (
                  <tr
                    key={poll.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <td className="py-3 px-4 text-gray-800">{poll.question}</td>
                    <td className="py-3 px-4 text-gray-600">{poll._count?.options || 0}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(poll.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No polls yet</p>
        )}
      </div>

      {/* Quick Stats Box */}
      <div className="mt-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-2">Platform Overview</h3>
        <p className="opacity-90">
          Your campus polling platform has {stats?.totalPolls} active polls with{' '}
          {stats?.totalVotes} total votes from {stats?.totalUsers} users.
        </p>
      </div>
    </div>
  );
}
