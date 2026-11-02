import { NavLink, Outlet } from "react-router-dom";
import { Activity, CarFront, LayoutDashboard, LogOut, MapPin, Ticket } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useParking } from "../context/ParkingContext.jsx";

const navigation = [
  { to: "/", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/find-parking", label: "Find parking", icon: MapPin },
  { to: "/bookings", label: "My bookings", icon: Ticket },
  { to: "/activity", label: "Activity", icon: Activity },
];

export default function ParkingLayout() {
  const { user, signOut } = useAuth();
  const { error, setError, loading } = useParking();
  const name = user?.displayName?.trim() || user?.email?.split("@")[0] || "Driver";
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="dashboard-shell">
      <header className="topbar">
        <NavLink className="wordmark" to="/" aria-label="Parkwise home">
          <span className="brand-mark small"><CarFront size={19} /></span>
          <span>parkwise</span>
        </NavLink>
        <nav className="main-nav" aria-label="Main navigation">
          {navigation.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
              end={end}
              key={to}
              to={to}
            >
              <Icon size={16} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="topbar-right">
          <span className="live-indicator"><span className={loading ? "syncing" : ""} /> {loading ? "Connecting" : "Kotlin API"}</span>
          <div className="user-chip">
            <span className="avatar">{initial}</span>
            <span className="user-name">{name}</span>
          </div>
          <button className="icon-button logout-button" onClick={signOut} title="Sign out" aria-label="Sign out">
            <LogOut size={18} />
          </button>
        </div>
      </header>
      {error && (
        <div className="error-banner" role="alert">
          <span>{error}</span>
          <button aria-label="Dismiss error" className="icon-button" onClick={() => setError("")}>×</button>
        </div>
      )}
      <Outlet />
      <footer className="dashboard-footer">Parkwise <span>·</span> Kotlin-powered local parking demo.</footer>
    </div>
  );
}
