import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

/**
 * Guards admin (and optionally any authenticated) routes.
 * Uses the shared AuthContext — no separate admin login system.
 *
 * Props:
 *   children      Element(s) to render when access is granted
 *   requireAdmin  If true, also require the authenticated user to have role === "ADMIN"
 */
export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 size={28} className="animate-spin text-brand-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to the main login, preserving where the user was trying to go
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && user?.role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-6">
        <div className="card-flat p-8 max-w-md text-center">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Admin access required</h2>
          <p className="text-sm text-gray-500 mb-5">Your account doesn't have permission to view this page.</p>
          <a href="/" className="btn-primary inline-flex">Go home</a>
        </div>
      </div>
    );
  }

  return children;
}
