import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (token) => {
    try {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await api.get("/auth/me");
      const userData = response.data.data?.user || response.data.user;
      setUser(userData);
    } catch (err) {
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await api.post("/auth/login", { email, password });
      const { token, user } = response.data.data || response.data;

      localStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(user);

      return { success: true };
    } catch (err) {
      let errorMessage = "Login failed";
      
      if (err.response?.status === 401) {
        errorMessage = "Invalid email or password";
      } else if (err.response?.status === 429) {
        errorMessage = "Too many login attempts. Please try again later";
      } else if (err.response?.status === 500) {
        errorMessage = "Server error. Please try again later";
      } else if (err.response?.data?.message || err.response?.data?.error) {
        errorMessage = err.response.data.message || err.response.data.error;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (email, password, name) => {
    try {
      setError(null);
      const response = await api.post("/auth/register", {
        email,
        password,
        name,
      });
      const { token, user } = response.data.data || response.data;

      localStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(user);

      return { success: true };
    } catch (err) {
      let errorMessage = "Registration failed";
      
      if (err.response?.status === 409) {
        errorMessage = "An account with this email already exists";
      } else if (err.response?.status === 400) {
        errorMessage = err.response?.data?.error || "Please check your input and try again";
      } else if (err.response?.status === 429) {
        errorMessage = "Too many registration attempts. Please try again later";
      } else if (err.response?.status === 500) {
        errorMessage = "Server error. Please try again later";
      } else if (err.response?.data?.message || err.response?.data?.error) {
        errorMessage = err.response.data.message || err.response.data.error;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
  };

  const updateProfile = async (data) => {
    try {
      setError(null);
      const response = await api.put("/auth/profile", data);
      setUser(response.data.user);
      return { success: true };
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.message || "Update failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      setError(null);
      await api.put("/auth/password", { currentPassword, newPassword });
      return { success: true };
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.message || "Password change failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError: () => setError(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
