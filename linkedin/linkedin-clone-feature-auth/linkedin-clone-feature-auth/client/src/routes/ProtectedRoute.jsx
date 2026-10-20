import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProtectedRoute = ({ children }) => {
  const { token, isHydrating } = useSelector((state) => state.auth);
  const location = useLocation();

  if (isHydrating) {
    return (
      <div className="auth-loading">
        <LoadingSpinner size="lg" label="Loading..." />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
