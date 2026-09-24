import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Logout and go to login page
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="brand">
          DeskFlow
        </NavLink>

        <nav className="nav-links">
          <NavLink to="/" end>
            Dashboard
          </NavLink>

          <NavLink to="/tickets" end>
            Tickets
          </NavLink>

          <NavLink to="/assets">
            {user.role === "admin" ? "Assets" : "My Devices"}
          </NavLink>

          <NavLink to="/tickets/new">New Ticket</NavLink>
        </nav>

        <div className="nav-user">
          <span className="nav-name">{user.name}</span>

          <span className={`role role-${user.role}`}>{user.role}</span>

          <button className="btn btn-outline btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
