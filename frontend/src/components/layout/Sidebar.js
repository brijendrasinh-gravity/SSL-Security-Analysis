import { Nav, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Shield, User, ShieldAlert, Bug } from 'lucide-react';
import { usePermission } from '../../hooks/usePermission';
import sslLogo from '../../assets/images/ssl-logo.png';

function Sidebar({ isCollapsed }) {
  const location = useLocation();
  const { hasAnyPermission } = usePermission();

  const allMenuItems = [
    {
      path: '/',
      icon: Home,
      label: 'Dashboard',
      exact: true,
      moduleName: 'ssl_security'
    },
    {
      path: '/user',
      icon: User,
      label: 'User',
      moduleName: 'user'
    },
    {
      path: '/role',
      icon: Shield,
      label: 'Role & Permission',
      moduleName: 'role_permission'
    },
    {
      path: '/blocked-ip',
      icon: ShieldAlert,
      label: 'Blocked IPs',
      moduleName: 'blocked_ip'
    },
    {
      path: '/virus-total',
      icon: Bug,
      label: 'Virus Scanner',
      moduleName: 'virus_total'
    },
    {
      path: '/scan',
      icon: Shield,
      label: 'Scanned Domains',
      moduleName: 'ssl_security'
    }
  ];

  // Filter menu items based on user permissions
  const menuItems = allMenuItems.filter(item => hasAnyPermission(item.moduleName));

  return (
    <div 
      className="border-end vh-100 position-fixed"
      style={{ 
        width: isCollapsed ? '70px' : '250px', 
        zIndex: 1000,
        transition: 'width 0.3s ease',
        backgroundColor: '#1d2538',
        borderColor: '#2a3447'
      }}
    >
      <div 
        className="p-3 border-bottom d-flex align-items-center justify-content-center"
        style={{ height: '70px' }}
      >
        {!isCollapsed ? (
          <div className="d-flex align-items-center">
            <img 
              src={sslLogo} 
              alt="SSL Security Logo" 
              style={{ width: '40px', height: '36px', objectFit: 'contain' }}
              className="me-2"
            />
            <div>
              <h6 className="mb-0 fw-bold text-white" style={{ fontSize: '14px' }}>SSL Security</h6>
              <small className="text-white-50" style={{ fontSize: '11px' }}>Analysis Tool</small>
            </div>
          </div>
        ) : (
          <img 
            src={sslLogo} 
            alt="SSL Security Logo" 
            style={{ width: '36px', height: '36px', objectFit: 'contain' }}
          />
        )}
      </div>
      
      <Nav className="flex-column p-2 mt-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact 
            ? location.pathname === item.path 
            : location.pathname.startsWith(item.path);
          
          const navLink = (
            <NavLink
              to={item.path}
              className="nav-link d-flex align-items-center px-3 py-2 rounded text-decoration-none mb-1"
              style={{
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                backgroundColor: isActive ? '#0d6efd' : 'transparent',
                color: isActive ? '#ffffff' : '#b8bcc8',
                transition: 'all 0.2s ease'
              }}
            >
              <Icon size={20} />
              {!isCollapsed && <span className="ms-3">{item.label}</span>}
            </NavLink>
          );

          if (isCollapsed) {
            return (
              <Nav.Item key={item.path}>
                <OverlayTrigger
                  placement="right"
                  overlay={<Tooltip>{item.label}</Tooltip>}
                >
                  {navLink}
                </OverlayTrigger>
              </Nav.Item>
            );
          }

          return <Nav.Item key={item.path}>{navLink}</Nav.Item>;
        })}
      </Nav>
    </div>
  );
}

export default Sidebar;
