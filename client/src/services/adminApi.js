import api from "./api";

// All requests go through the shared axios instance, which already injects the
// user's auth token (set in AuthContext after login) as a Bearer header.
// Admin endpoints are protected server-side by protect + requireAdmin.

export const getDashboardStats = async () => {
  const res = await api.get("/admin/stats");
  return res.data?.data || res.data;
};

// === Users ===
export const getUsers = async (page = 1, limit = 10, search = "") => {
  const params = { page, limit };
  if (search) params.search = search;
  const res = await api.get("/admin/users", { params });
  return res.data?.data || res.data;
};

export const updateUserRole = async (userId, role) => {
  const res = await api.put(`/admin/users/${userId}/role`, { role });
  return res.data?.data || res.data;
};

export const deleteUser = async (userId) => {
  const res = await api.delete(`/admin/users/${userId}`);
  return res.data;
};

// === Polls ===
export const getAdminPolls = async (page = 1, limit = 10, search = "", status = "all") => {
  const params = { page, limit, status };
  if (search) params.search = search;
  const res = await api.get("/admin/polls", { params });
  return res.data?.data || res.data;
};

export const deletePollAdmin = async (pollId) => {
  const res = await api.delete(`/admin/polls/${pollId}`);
  return res.data;
};
