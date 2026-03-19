import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    function syncAuth() {
      setToken(localStorage.getItem("token"));
    }

    window.addEventListener("storage", syncAuth);
    window.addEventListener("authChange", syncAuth);

    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("authChange", syncAuth);
    };
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.dispatchEvent(new Event("authChange"));

    navigate("/signin");
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">RideShare</Link>

        <nav className="nav-links">
          <Link to="/" className="nav-link">Home</Link>

          {!token ? (
            <>
              <Link to="/signin" className="nav-link">Sign In</Link>
              <Link to="/create-account" className="nav-link">Create Account</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <button onClick={handleLogout} className="nav-link">
                Log Out
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}