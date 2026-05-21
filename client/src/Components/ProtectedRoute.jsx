import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { verifyAdminToken } from '../services/authService';
import Loader from './Common/loader';

/**
 * ProtectedRoute component for admin routes
 * Checks if user is authenticated before allowing access
 */
export default function ProtectedRoute({ element }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const valid = await verifyAdminToken();
        setIsAuthenticated(valid);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Show loading state while verifying token
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Render the protected component
  return element;
}
