import { useEffect, useState, useCallback } from "react";
import { getUsers, updateUserRole, deleteUser } from "../services/adminApi";
import { useAuth } from "../context/AuthContext";
import {
  Loader2, Search, Trash2, ShieldCheck, ShieldOff, AlertCircle,
  ChevronLeft, ChevronRight, Users as UsersIcon,
} from "lucide-react";

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
      setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to delete user");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {pagination.total} {pagination.total === 1 ? "user" : "users"} registered
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9 text-sm"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <div className="text-sm">{error}</div>
        </div>
      )}

      {/* Table */}
      <div className="card-flat overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left py-3 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">User</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Role</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Auth</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Polls</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Joined</th>
                <th className="text-right py-3 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <Loader2 size={20} className="animate-spin inline text-brand-500" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <UsersIcon size={28} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-sm text-gray-400">No users found</p>
                    {debouncedSearch && (
                      <p className="text-xs text-gray-300 mt-1">Try a different search</p>
                    )}
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  return (
                    <tr key={u.id} className="hover:bg-gray-50/60 transition">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {(u.name || u.email)?.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {u.name || <span className="text-gray-400 italic font-normal">No name</span>}
                              {isSelf && <span className="ml-2 text-[10px] text-brand-600 font-semibold uppercase">You</span>}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`badge ${u.role === "ADMIN" ? "badge-brand" : "badge-neutral"} text-[10px]`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-xs text-gray-500">{u.hasGoogleAuth ? "Google" : "Email"}</span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-700 tabular-nums">{u.pollCount ?? 0}</td>
                      <td className="py-3.5 px-4 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        {isSelf ? (
                          <span className="text-xs text-gray-300">—</span>
                        ) : (
                          <div className="inline-flex items-center gap-0.5">
                            <button
                              onClick={() => handleToggleRole(u)}
                              disabled={busyId === u.id}
                              title={u.role === "ADMIN" ? "Demote to user" : "Promote to admin"}
                              className="p-2 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition disabled:opacity-50"
                            >
                              {u.role === "ADMIN" ? <ShieldOff size={15} /> : <ShieldCheck size={15} />}
                            </button>
                            <button
                              onClick={() => handleDelete(u)}
                              disabled={busyId === u.id}
                              title="Delete user"
                              className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm px-1">
          <p className="text-gray-500">
            Page <span className="font-semibold text-gray-700">{pagination.page}</span> of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => fetchUsers(pagination.page - 1)}
              disabled={!pagination.hasPrev || loading}
              className="btn-secondary px-3 py-1.5 text-xs"
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <button
              onClick={() => fetchUsers(pagination.page + 1)}
              disabled={!pagination.hasNext || loading}
              className="btn-secondary px-3 py-1.5 text-xs"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
