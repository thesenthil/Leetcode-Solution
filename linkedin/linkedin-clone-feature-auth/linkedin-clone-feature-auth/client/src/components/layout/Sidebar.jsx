import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Avatar from '../common/Avatar';

const Sidebar = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user) return null;

  return (
    <aside className="sidebar">
      <div className="sidebar__card sidebar__profile">
        <div className="sidebar__banner" />
        <NavLink to={`/profile/${user._id}`} className="sidebar__profile-link">
          <Avatar
            src={user.profileImage}
            firstName={user.firstName}
            lastName={user.lastName}
            size={72}
            className="sidebar__avatar"
          />
          <h3>{user.firstName} {user.lastName}</h3>
          <p>{user.headline || 'Add a headline'}</p>
        </NavLink>
      </div>

      <div className="sidebar__card">
        <h4>Quick links</h4>
        <nav className="sidebar__links">
          <NavLink to="/connections">My connections</NavLink>
          <NavLink to="/jobs">Browse jobs</NavLink>
          <NavLink to="/messaging">Messages</NavLink>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
