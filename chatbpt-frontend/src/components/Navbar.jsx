import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ token, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="brand">ChatBPT</div>
      <div className="buttons">
        {!token ? (
          <>
            <Link to="/">Login</Link>
            <Link to="/register">Register</Link>
          </>
        ) : (
          <button onClick={handleLogout}>Logout</button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;