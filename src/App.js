import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import ChatWindow from "./components/ChatWindow";
import Navbar from "./components/Navbar";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [userId, setUserId] = useState(localStorage.getItem("userId") || null);

  // Handle login
  const handleLogin = (newToken, newUserId) => {
    setToken(newToken);
    setUserId(newUserId);
    localStorage.setItem("token", newToken);
    localStorage.setItem("userId", newUserId);
  };

  // Handle logout
  const handleLogout = () => {
    setToken(null);
    setUserId(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
  };

  return (
    <Router>
      {/* Navbar */}
      <Navbar token={token} onLogout={handleLogout} />

      {/* Main Content */}
      <div className="p-4">
        <Routes>
          {/* Redirect to /chat if user is logged in */}
          <Route
            path="/"
            element={token ? <Navigate to="/chat" /> : <LoginForm onLogin={handleLogin} />}
          />

          {/* Registration page */}
          <Route path="/register" element={<RegisterForm />} />

          {/* Chat window (protected route) */}
          <Route
            path="/chat"
            element={
              token && userId ? (
                <ChatWindow token={token} userId={userId} onLogout={handleLogout} />
              ) : (
                <Navigate to="/" />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;