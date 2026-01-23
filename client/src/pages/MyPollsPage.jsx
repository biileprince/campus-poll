import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    BarChart3,
    Edit2,
    Trash2,
    ExternalLink,
    Copy,
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Plus,
    Vote,
    Calendar,
    Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function MyPollsPage() {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteModal, setDeleteModal] = useState({ show: false, poll: null });
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: { pathname: '/my-polls' } } });
            return;
        }
        fetchMyPolls();
    }, [isAuthenticated, navigate]);

    const fetchMyPolls = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await api.get('/my-polls');
            setPolls(response.data.polls);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load your polls');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.poll) return;

        try {
            setDeleting(true);
            await api.delete(`/polls/${deleteModal.poll.resultsId}`);
            setPolls(polls.filter(p => p.id !== deleteModal.poll.id));
            setDeleteModal({ show: false, poll: null });
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete poll');
        } finally {
            setDeleting(false);
        }
    };

    const copyToClipboard = (text, type) => {
        navigator.clipboard.writeText(text);
        alert(`${type} link copied to clipboard!`);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Active':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <CheckCircle2 className="w-3 h-3" />
                        Active
                    </span>
                );
            case 'Expired':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        <Clock className="w-3 h-3" />
                        Expired
                    </span>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="bg-gray-50 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading your polls...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <main className="p-4 sm:p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                            My Polls
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Welcome back, {user?.name || 'User'}! Manage your polls here.
                        </p>
                    </div>
                    <Link
                        to="/create-poll"
                        className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Create Poll
                    </Link>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                {/* Empty State */}
                {polls.length === 0 && !error && (
                    <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-12 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                            <BarChart3 className="w-8 h-8 text-gray-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            No polls yet
                        </h2>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            Create your first poll to start gathering insights from your audience.
                        </p>
                        <Link
                            to="/create-poll"
                            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Create Your First Poll
                        </Link>
                    </div>
                )}

                {/* Polls Grid */}
                {polls.length > 0 && (
                    <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {polls.map((poll) => (
                            <div
                                key={poll.id}
                                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
                            >
                                {/* Poll Header */}
                                <div className="flex items-start justify-between gap-3 mb-4">
                                    <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">
                                        {poll.question}
                                    </h3>
                                    {getStatusBadge(poll.status)}
                                </div>

                                {/* Poll Stats */}
                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                    <span className="flex items-center gap-1">
                                        <Users className="w-4 h-4" />
                                        {poll.totalVotes} votes
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Vote className="w-4 h-4" />
                                        {poll.optionCount} options
                                    </span>
                                </div>

                                {/* Dates */}
                                <div className="text-xs text-gray-400 mb-4">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        Created: {formatDate(poll.createdAt)}
                                    </div>
                                    {poll.expiresAt && (
                                        <div className="flex items-center gap-1 mt-1">
                                            <Clock className="w-3 h-3" />
                                            Expires: {formatDate(poll.expiresAt)}
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                                    {/* View Results */}
                                    <Link
                                        to={`/results/${poll.resultsId}`}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-medium rounded-lg transition-colors"
                                    >
                                        <BarChart3 className="w-4 h-4" />
                                        Results
                                    </Link>

                                    {/* Copy Vote Link */}
                                    <button
                                        onClick={() => copyToClipboard(`${window.location.origin}/poll/${poll.voteId}`, 'Vote')}
                                        className="flex items-center justify-center gap-1.5 py-2 px-3 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                                        title="Copy voting link"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>

                                    {/* Open Vote Page */}
                                    <Link
                                        to={`/poll/${poll.voteId}`}
                                        className="flex items-center justify-center gap-1.5 py-2 px-3 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                                        title="Open voting page"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </Link>

                                    {/* Edit (only if no votes) */}
                                    {poll.canEdit && (
                                        <Link
                                            to={`/edit-poll/${poll.resultsId}`}
                                            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-700 text-sm font-medium rounded-lg transition-colors"
                                            title="Edit poll"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Link>
                                    )}

                                    {/* Delete */}
                                    <button
                                        onClick={() => setDeleteModal({ show: true, poll })}
                                        className="flex items-center justify-center gap-1.5 py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium rounded-lg transition-colors"
                                        title="Delete poll"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteModal.show && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                    <Trash2 className="w-5 h-5 text-red-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Delete Poll?
                                </h3>
                            </div>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete "{deleteModal.poll?.question}"? 
                                This action cannot be undone and all votes will be lost.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteModal({ show: false, poll: null })}
                                    disabled={deleting}
                                    className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-lg transition-colors"
                                >
                                    {deleting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default MyPollsPage;
