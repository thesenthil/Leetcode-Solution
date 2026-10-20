import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronDown, LogOut, User, Moon, Sun } from 'lucide-react';
import { logout } from '../../features/auth/authSlice';
import { useTheme } from '../../hooks/useTheme';
import Avatar from '../common/Avatar';

const UserMenu = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="user-menu" ref={menuRef}>
      <button
        type="button"
        className="user-menu__trigger"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <Avatar
          src={user.profileImage}
          firstName={user.firstName}
          lastName={user.lastName}
          size={32}
        />
        <span className="user-menu__name hide-mobile">
          {user.firstName}
        </span>
        <ChevronDown size={16} />
      </button>

      {open && (
        <div className="user-menu__dropdown">
          <div className="user-menu__info">
            <Avatar
              src={user.profileImage}
              firstName={user.firstName}
              lastName={user.lastName}
              size={56}
            />
            <div>
              <strong>{user.firstName} {user.lastName}</strong>
              <span>{user.email}</span>
            </div>
          </div>
          <hr />
          <button type="button" onClick={() => { navigate(`/profile/${user._id}`); setOpen(false); }}>
            <User size={18} />
            View Profile
          </button>
          <button type="button" onClick={toggleTheme}>
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            {theme === 'light' ? 'Dark mode' : 'Light mode'}
          </button>
          <hr />
          <button type="button" className="user-menu__logout" onClick={handleLogout}>
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
