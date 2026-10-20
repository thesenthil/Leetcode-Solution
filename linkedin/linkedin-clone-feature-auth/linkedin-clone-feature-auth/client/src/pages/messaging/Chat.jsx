import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Send, ArrowLeft } from 'lucide-react';
import useSocket from '../../hooks/useSocket';
import { getChatRoomId } from '../../utils/avatar';
import Avatar from '../../components/common/Avatar';
import api from '../../services/api';

const Chat = () => {
  const { recipientId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const socketRef = useSocket();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [recipient, setRecipient] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchRecipient = async () => {
      try {
        const response = await api.get(`/users/${recipientId}`);
        if (!cancelled) setRecipient(response.data.user);
      } catch {
        if (!cancelled) setRecipient(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchRecipient();

    return () => { cancelled = true; };
  }, [recipientId]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !user?._id || !recipientId) return undefined;

    const roomId = getChatRoomId(user._id, recipientId);
    socket.emit('join_room', roomId);

    const handleReceive = (message) => {
      setMessages((prev) => {
        const exists = prev.some((m) => m._id === message._id);
        if (exists) return prev;
        return [...prev, message];
      });
      scrollToBottom();
    };

    const handleTyping = ({ userId }) => {
      if (userId !== user._id) {
        setIsTyping(true);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2000);
      }
    };

    const handleError = ({ message }) => {
      console.error('Socket error:', message);
    };

    socket.on('receive_message', handleReceive);
    socket.on('user_typing', handleTyping);
    socket.on('error', handleError);

    return () => {
      socket.off('receive_message', handleReceive);
      socket.off('user_typing', handleTyping);
      socket.off('error', handleError);
    };
  }, [socketRef, user?._id, recipientId, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = () => {
    if (!newMessage.trim() || !socketRef.current) return;

    const content = newMessage.trim();
    socketRef.current.emit('send_message', { recipientId, content });

    const optimistic = {
      _id: `temp-${Date.now()}`,
      sender: user,
      recipient: recipientId,
      content,
      createdAt: new Date().toISOString()
    };
    setMessages((prev) => [...prev, optimistic]);
    setNewMessage('');
  };

  const handleTyping = () => {
    socketRef.current?.emit('typing', { recipientId });
  };

  if (loading) {
    return <div className="chat__loading">Loading conversation...</div>;
  }

  if (!recipient) {
    return <div className="chat__loading">User not found</div>;
  }

  return (
    <div className="chat card">
      <header className="chat__header">
        <button type="button" className="chat__back hide-desktop" onClick={() => navigate('/messaging')}>
          <ArrowLeft size={20} />
        </button>
        <Avatar
          src={recipient.profileImage}
          firstName={recipient.firstName}
          lastName={recipient.lastName}
          size={40}
        />
        <div className="chat__header-info">
          <strong>{recipient.firstName} {recipient.lastName}</strong>
          <span>{recipient.headline || 'LinkedIn Member'}</span>
        </div>
      </header>

      <div className="chat__messages">
        {messages.length === 0 && (
          <p className="chat__empty">
            No messages yet. Say hello! Message history is not persisted via REST API.
          </p>
        )}
        {messages.map((message) => {
          const senderId = message.sender?._id || message.sender;
          const isSent = senderId === user?._id;
          return (
            <div
              key={message._id}
              className={`chat__message ${isSent ? 'chat__message--sent' : 'chat__message--received'}`}
            >
              <p>{message.content}</p>
              <time>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
            </div>
          );
        })}
        {isTyping && <p className="chat__typing">{recipient.firstName} is typing...</p>}
        <div ref={messagesEndRef} />
      </div>

      <footer className="chat__input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            handleTyping();
          }}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Write a message..."
          aria-label="Message input"
        />
        <button type="button" className="btn btn--primary" onClick={sendMessage} disabled={!newMessage.trim()}>
          <Send size={18} />
        </button>
      </footer>
    </div>
  );
};

export default Chat;
