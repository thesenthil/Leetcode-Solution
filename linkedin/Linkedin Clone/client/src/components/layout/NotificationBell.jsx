import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import api from '../../services/api';
import useSocket from '../../hooks/useSocket';
import Avatar from '../common/Avatar';

const NotificationBell = () => {
  const socketRef = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [notifRes, countRes] = await Promise.all([
          api.get('/notifications'),
          api.get('/notifications/unread-count')
        ]);
        if (!cancelled) {
          setNotifications(notifRes.data.notifications || []);
          setUnreadCount(countRes.data.count || 0);
          setApiAvailable(true);
        }
      } catch (error) {
        if (!cancelled && error.response?.status === 404) {
          setApiAvailable(false);
        }
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return undefined;

    const handleNewNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on('new_notification', handleNewNotification);
    return () => socket.off('new_notification', handleNewNotification);
  }, [socketRef]);

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/mark-read');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      setUnreadCount(0);
    }
  };

  const getNotificationText = (notification) => {
    const name = `${notification.sender?.firstName || ''} ${notification.sender?.lastName || ''}`.trim();
    switch (notification.type) {
      case 'like':
        return `${name} liked your post`;
      case 'comment':
        return `${name} commented on your post`;
      case 'connection_request':
        return `${name} sent you a connection request`;
      case 'connection_accepted':
        return `${name} accepted your connection request`;
      default:
        return 'New notification';
    }
  };

  return (
    <div className="notification-bell">
      <button
        type="button"
        className="notification-bell__btn"
        onClick={() => setShowDropdown(!showDropdown)}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="notification-bell__badge">{unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <div className="notification-bell__dropdown">
          <div className="notification-bell__header">
            <h3>Notifications</h3>
            {unreadCount > 0 && apiAvailable && (
              <button type="button" onClick={handleMarkAllRead}>
                Mark all read
              </button>
            )}
          </div>

          {!apiAvailable && notifications.length === 0 && (
            <p className="notification-bell__empty">
              Real-time notifications work via socket. REST API is not mounted on the server.
            </p>
          )}

          {notifications.length === 0 && apiAvailable && (
            <p className="notification-bell__empty">No notifications yet</p>
          )}

          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`notification-bell__item ${!notification.read ? 'notification-bell__item--unread' : ''}`}
            >
              <Avatar
                src={notification.sender?.profileImage}
                firstName={notification.sender?.firstName}
                lastName={notification.sender?.lastName}
                size={40}
              />
              <div className="notification-bell__item-content">
                <p>{getNotificationText(notification)}</p>
                <span>
                  {new Date(notification.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
