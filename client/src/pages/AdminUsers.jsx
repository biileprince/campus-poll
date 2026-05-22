import { useEffect, useState, useCallback } from "react";
import { getUsers, updateUserRole, deleteUser } from "../services/adminApi";
import { useAuth } from "../context/AuthContext";
import { Loader2, Search, Trash2, ShieldCheck, ShieldOff, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchUsers = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const data = await getUsers(page, 12, debouncedSearch);
      setUsers(data.users || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => { fetchUsers(1); }, [fetchUsers]);

  const handleToggleRole = async (u) => {
    if (u.id === currentUser?.id) return;
    const next = u.role === "ADMIN" ? "USER" : "ADMIN";
    if (!confirm(`Change ${u.email}'s role to ${next}?`)) return;
    try {
      setBusyId(u.id);
      await updateUserRole(u.id, next);
      setUsers((prev) => prev.map((p) => (p.id === u.id ? { ...p, role: next } : p)));
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to update role");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (u) => {
    if (u.id === currentUser?.id) return;
    if (!confirm(`Delete user ${u.email}? Their polls will be kept but unlinked. This cannot be undone.`)) return;
    try {
      setBusyId(u.id);
      await deleteUser(u.id);
      setUsers((prev) => prev.filter((p) => p.id !== u.id));
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to delete user");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500">{pagination.total} total</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <div className="text-sm">{error}</div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">User</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Role</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Auth</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Polls</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Joined</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="py-12 text-center"><Loader2 size={20} className="animate-spin inline text-brand-500" /></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="6" className="py-10 text-center text-gray-400">No users found</td></tr>
              ) : users.map((u) => (
                <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{u.name || <span className="text-gray-400 italic">No name</span>}</div>
                    <div className="text-xs text-gray-500">{u.email}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.role === "ADMIN" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{u.hasGoogleAuth ? "Google" : "Email"}</td>
                  <td className="py-3 px-4 text-gray-700">{u.pollCount ?? 0}</td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-right">
                    {u.id === currentUser?.id ? (
                      <span className="text-xs text-gray-400">You</span>
                    ) : (
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleToggleRole(u)}
                          disabled={busyId === u.id}
                          title={u.role === "ADMIN" ? "Demote to user" : "Promote to admin"}
                          className="p-1.5 rounded-md text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition disabled:opacity-50"
                        >
                          {u.role === "ADMIN" ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                        </button>
                        <button
                          onClick={() => handleDelete(u)}
                          disabled={busyId === u.id}
                          title="Delete user"
                          className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-500">Page {pagination.page} of {pagination.totalPages}</p>
          <div className="flex gap-1">
            <button
              onClick={() => fetchUsers(pagination.page - 1)}
              disabled={!pagination.hasPrev || loading}
              className="px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} className="inline" /> Prev
            </button>
            <button
              onClick={() => fetchUsers(pagination.page + 1)}
              disabled={!pagination.hasNext || loading}
              className="px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next <ChevronRight size={14} className="inline" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
