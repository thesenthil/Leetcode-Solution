import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { UserCheck, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getConnections,
  getPendingRequests,
  acceptConnectionRequest
} from '../../features/connections/connectionSlice';
import Avatar from '../../components/common/Avatar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const Connections = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { connections, pendingRequests, isLoading, error } = useSelector(
    (state) => state.connections
  );
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getConnections());
    dispatch(getPendingRequests());
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const getOtherUser = (connection) => {
    if (connection.sender?._id === user?._id) return connection.recipient;
    return connection.sender;
  };

  const handleAccept = (connectionId) => {
    dispatch(acceptConnectionRequest(connectionId)).then((result) => {
      if (acceptConnectionRequest.fulfilled.match(result)) {
        toast.success('Connection accepted');
        dispatch(getConnections());
      }
    });
  };

  if (isLoading && connections.length === 0 && pendingRequests.length === 0) {
    return (
      <div className="page-loading">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="connections-page">
      <div className="connections-page__content">
        {pendingRequests.length > 0 && (
          <section className="card">
            <h2 className="section-title">
              <UserCheck size={22} />
              Pending invitations ({pendingRequests.length})
            </h2>
            <div className="connections-list">
              {pendingRequests.map((request) => (
                <div key={request._id} className="connection-item">
                  <button
                    type="button"
                    className="connection-item__profile"
                    onClick={() => navigate(`/profile/${request.sender?._id}`)}
                  >
                    <Avatar
                      src={request.sender?.profileImage}
                      firstName={request.sender?.firstName}
                      lastName={request.sender?.lastName}
                      size={56}
                    />
                    <div>
                      <strong>
                        {request.sender?.firstName} {request.sender?.lastName}
                      </strong>
                      <span>{request.sender?.headline || 'LinkedIn Member'}</span>
                    </div>
                  </button>
                  <div className="connection-item__actions">
                    <button
                      type="button"
                      className="btn btn--primary btn--sm"
                      onClick={() => handleAccept(request._id)}
                    >
                      Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <p className="connections-note">
              Reject connection requests is not supported by the backend API.
            </p>
          </section>
        )}

        <section className="card">
          <h2 className="section-title">
            <Users size={22} />
            Your connections ({connections.length})
          </h2>

          {connections.length === 0 ? (
            <EmptyState
              title="No connections yet"
              description="Start building your network by connecting with other members."
            />
          ) : (
            <div className="connections-list">
              {connections.map((connection) => {
                const other = getOtherUser(connection);
                return (
                  <div key={connection._id} className="connection-item">
                    <button
                      type="button"
                      className="connection-item__profile"
                      onClick={() => navigate(`/profile/${other?._id}`)}
                    >
                      <Avatar
                        src={other?.profileImage}
                        firstName={other?.firstName}
                        lastName={other?.lastName}
                        size={56}
                      />
                      <div>
                        <strong>
                          {other?.firstName} {other?.lastName}
                        </strong>
                        <span>{other?.headline || 'LinkedIn Member'}</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      className="btn btn--outline btn--sm"
                      onClick={() => navigate(`/messaging/${other?._id}`)}
                    >
                      Message
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Connections;
