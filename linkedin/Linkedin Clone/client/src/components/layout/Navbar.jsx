import { NavLink } from 'react-router-dom';
import { Home, Users, Briefcase, MessageCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import SearchBar from '../common/SearchBar';
import NotificationBell from './NotificationBell';
import UserMenu from './UserMenu';

const navItems = [
  { to: '/feed', label: 'Home', icon: Home },
  { to: '/connections', label: 'My Network', icon: Users },
  { to: '/jobs', label: 'Jobs', icon: Briefcase },
  { to: '/messaging', label: 'Messaging', icon: MessageCircle }
];

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const { pendingRequests } = useSelector((state) => state.connections);

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <NavLink to="/feed" className="navbar__logo">
          in
        </NavLink>

        <div className="navbar__search hide-mobile">
          <SearchBar />
        </div>

        <nav className="navbar__nav" aria-label="Main navigation">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `navbar__link ${isActive ? 'navbar__link--active' : ''}`
              }
            >
              <span className="navbar__link-icon">
                <Icon size={22} />
                {to === '/connections' && pendingRequests?.length > 0 && (
                  <span className="navbar__badge">{pendingRequests.length}</span>
                )}
              </span>
              <span className="navbar__link-label">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="navbar__actions">
          <NotificationBell />
          {user && <UserMenu />}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
