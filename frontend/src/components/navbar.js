import React from "react";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import "../css/navbar.css";

function Header() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <Navbar expand="lg" className="custom-navbar">
      <Container>
        <Navbar.Brand href="/" className="brand-title">
          SSL Security Analysis
        </Navbar.Brand>

        <Nav className="ms-auto align-items-center">
          <NavLink to="/" className="nav-link text-center" end>
            Dashboard
          </NavLink>

          <NavLink to="/scan" className="nav-link text-center">
            Scanned Domains
          </NavLink>

          {!token ? (
            <>
              <NavLink to="/register" className="nav-link text-center">
                Register
              </NavLink>
              <NavLink to="/login" className="nav-link text-center">
                Login
              </NavLink>
            </>
          ) : (
            <>
              <NavDropdown
                title="Profile"
                id="profile-dropdown"
                align="end"
                menuVariant="dark"
              >
                <NavDropdown.Item onClick={() => navigate("/profile")}>
                  View Profile
                </NavDropdown.Item>
                {/* <NavDropdown.Item onClick={() => navigate("/changepassword")}>
                  Change Password
                </NavDropdown.Item>
                <NavDropdown.Item onClick={() => navigate("/resetpassword")}>
                  Reset Password
                </NavDropdown.Item> */}
              </NavDropdown>

              <button
                onClick={handleLogout}
                className="btn btn-outline-light ms-3 px-3 py-1 text-dark"
                style={{ borderRadius: "20px" }}
              >
                Logout
              </button>
            </>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
}

export default Header;