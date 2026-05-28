import { Link, NavLink, useNavigate } from "react-router-dom";
import { Car, Gauge, LogOut, Shield, UserRound } from "lucide-react";
import { brand } from "../assets/brand";
import { useAuth } from "../hooks/useAuth";

export function Navbar() {
  const { isAuthenticated, user, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate("/");
  }

  return (
    <header className="navbar">
      <Link to="/" className="brand-mark" aria-label="VW Motion home">
        <span className="brand-orbit">VW</span>
        <span>{brand.name}</span>
      </Link>

      <nav className="nav-links" aria-label="Primary navigation">
        <NavLink to="/vehicles">
          <Car size={17} />
          Vehicles
        </NavLink>
        {isAuthenticated && (
          <NavLink to="/dashboard">
            <Gauge size={17} />
            Dashboard
          </NavLink>
        )}
        {isAuthenticated && (
          <NavLink to="/profile">
            <UserRound size={17} />
            Profile
          </NavLink>
        )}
      </nav>

      <div className="nav-actions">
        {isAuthenticated ? (
          <>
            <span className="role-pill">
              <Shield size={14} />
              {user?.role || "user"}
            </span>
            <button className="icon-text-button subtle" type="button" onClick={handleLogout}>
              <LogOut size={17} />
              Logout
            </button>
          </>
        ) : (
          <>
            <Link className="text-link" to="/login">
              Login
            </Link>
            <Link className="primary-button compact" to="/register">
              Join
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
