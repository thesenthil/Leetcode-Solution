import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { hydrateAuth } from '../../features/auth/authSlice';
import LoadingSpinner from './LoadingSpinner';

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const { token, isHydrating } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(hydrateAuth());
    }
  }, [dispatch, token]);

  if (token && isHydrating) {
    return (
      <div className="auth-loading">
        <LoadingSpinner size="lg" label="Restoring session..." />
      </div>
    );
  }

  return children;
};

export default AuthInitializer;
