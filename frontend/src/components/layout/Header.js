import { useContext } from "react";
import { Dropdown, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { User, LogOut, Settings, Menu } from "lucide-react";
import { UserContext } from "../../context/usercontext";
import { useEffect } from "react";
import axios from "axios";
// import { detect } from "detect-browser";

function Header({ toggleSidebar }) {
  const navigate = useNavigate();
  const { user, clearUser } = useContext(UserContext);

  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    clearUser();
    navigate("/login");
  };
  // const browser = detect();
  // console.log(browser);
  // const fetchIPInfo = async () => {
  //   try {
  //     const response = await axios.get(`https://ipwhois.app/json/`);
  //     console.log(response.data);
  //     return response.data;
  //   } catch (error) {
  //     console.error("Error fetching IP info:", error.message);
  //     return null;
  //   }
  // };

  // useEffect(() => {
  //   fetchIPInfo();
  // }, []);

  const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : "U");

  return (
    <header
      className="border-bottom position-sticky top-0"
      style={{
        backgroundColor: "#e8e8ea",
        zIndex: 1020,
        height: "70px",
      }}
    >
      <div className="d-flex align-items-center justify-content-between h-100 px-4">
        <div className="d-flex align-items-center">
          <Button
            variant="link"
            className="p-2 text-dark border-0"
            onClick={toggleSidebar}
          >
            <Menu size={20} />
          </Button>
        </div>

        <div className="d-flex align-items-center gap-3">
          {!token ? (
            <div className="d-flex gap-2">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => navigate("/register")}
              >
                Register
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
            </div>
          ) : (
            <Dropdown align="end">
              <Dropdown.Toggle
                as="div"
                className="d-flex align-items-center gap-2"
                style={{ cursor: "pointer" }}
              >
                <span className="text-dark fw-semibold d-none d-md-inline">
                  {user?.user_name || "User"}
                </span>
                <div
                  className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white"
                  style={{
                    width: "36px",
                    height: "36px",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  {getInitial(user?.user_name)}
                </div>
              </Dropdown.Toggle>

              <Dropdown.Menu
                className="shadow border-0 mt-2"
                style={{ minWidth: "180px" }}
              >
                <Dropdown.Item
                  onClick={() => navigate("/profile")}
                  className="d-flex align-items-center py-2"
                >
                  <User size={16} className="me-3 text-muted" />
                  Profile
                </Dropdown.Item>

                <Dropdown.Item
                  onClick={() => navigate("/settings")}
                  className="d-flex align-items-center py-2"
                >
                  <Settings size={16} className="me-3 text-muted" />
                  Settings
                </Dropdown.Item>

                <Dropdown.Divider />

                <Dropdown.Item
                  onClick={handleLogout}
                  className="d-flex align-items-center py-2 text-danger"
                >
                  <LogOut size={16} className="me-3" />
                  Sign Out
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
