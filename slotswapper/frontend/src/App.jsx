import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";

export default function App() {
  const { token, logout } = useAuth();
  const inApp = useLocation().pathname.startsWith("/app");

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>SlotSwapper</h2>
        <nav style={{ display: "flex", gap: 12 }}>
          {token ? (
            <>
              <Link to="/app/dashboard">Dashboard</Link>
              <Link to="/app/marketplace">Marketplace</Link>
              <Link to="/app/requests">Requests</Link>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </header>
      <main style={{ marginTop: 24 }}>
        {inApp ? <Outlet /> : <p>Welcome to SlotSwapper! Please login or register.</p>}
      </main>
    </div>
  );
}
