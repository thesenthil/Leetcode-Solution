import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const HIDE_SIDEBAR_PATHS = ['/jobs', '/messaging'];

const MainLayout = () => {
  const { pathname } = useLocation();
  const showSidebar = !HIDE_SIDEBAR_PATHS.some((path) => pathname.startsWith(path));

  return (
    <div className="app-layout">
      <Navbar />
      <div className="app-layout__body">
        {showSidebar && (
          <div className="app-layout__sidebar hide-tablet">
            <Sidebar />
          </div>
        )}
        <main className="app-layout__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
