import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

function Layout({ children }) {
  const token = localStorage.getItem('token');
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Pages that should not show the sidebar/header layout
  const authPages = ['/login', '/register', '/forgot-password', '/verify-otp', '/reset-password'];
  const isAuthPage = authPages.includes(location.pathname);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Don't show sidebar/header layout for auth pages
  if (!token || isAuthPage) {
    return <div className="min-vh-100">{children}</div>;
  }

  return (
    <div className="min-vh-100 bg-light">
      <Sidebar isCollapsed={isCollapsed} />
      <div 
        style={{ 
          marginLeft: isCollapsed ? '70px' : '250px',
          transition: 'margin-left 0.3s ease'
        }}
      >
        <Header isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
        <main className="p-4">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;