import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Skeleton } from '../../components/Skeleton';

export default function ProtectedAdminRoute({ children }) {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Skeleton circle width="3rem" height="3rem" />
      </div>
    );
  }

  if (!token || !['SUPERADMIN', 'ADMIN'].includes(user?.role)) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}
