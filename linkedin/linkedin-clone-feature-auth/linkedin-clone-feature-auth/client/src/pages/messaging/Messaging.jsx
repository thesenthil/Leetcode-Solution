import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Outlet, useParams } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { getConnections } from '../../features/connections/connectionSlice';
import Avatar from '../../components/common/Avatar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const Messaging = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { recipientId } = useParams();
  const { connections, isLoading } = useSelector((state) => state.connections);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getConnections());
  }, [dispatch]);

  const getOtherUser = (connection) => {
    if (connection.sender?._id === user?._id) return connection.recipient;
    return connection.sender;
  };

  if (isLoading && connections.length === 0) {
    return (
      <div className="page-loading">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="messaging-page">
      <aside className="messaging-page__sidebar card">
        <h2 className="messaging-page__title">
          <MessageCircle size={22} />
          Messaging
        </h2>

        {connections.length === 0 ? (
          <EmptyState
            title="No conversations"
            description="Connect with people to start messaging."
          />
        ) : (
          <div className="messaging-list">
            {connections.map((connection) => {
              const other = getOtherUser(connection);
              const isActive = recipientId === other?._id;
              return (
                <button
                  key={connection._id}
                  type="button"
                  className={`messaging-list__item ${isActive ? 'messaging-list__item--active' : ''}`}
                  onClick={() => navigate(`/messaging/${other?._id}`)}
                >
                  <Avatar
                    src={other?.profileImage}
                    firstName={other?.firstName}
                    lastName={other?.lastName}
                    size={48}
                  />
                  <div>
                    <strong>{other?.firstName} {other?.lastName}</strong>
                    <span>{other?.headline || 'LinkedIn Member'}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </aside>

      <div className="messaging-page__chat">
        {recipientId ? (
          <Outlet key={recipientId} />
        ) : (
          <div className="messaging-page__placeholder card">
            <EmptyState
              title="Select a conversation"
              description="Choose a connection from the list to start chatting."
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Messaging;
