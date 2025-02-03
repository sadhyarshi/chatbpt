import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api";

const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login(email, password);
      const { access_token, user } = response;

      // Pass both the token and user_id to the parent component
      onLogin(access_token, user.id);

      navigate("/chat");
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="form-box">
        <h2>Login</h2>
        {error && <p className="error-message">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field"
          required
        />
        <button type="submit" className="submit-btn">
          Login
        </button>
        <a href="/register" className="link">
          Don't have an account? Register here
        </a>
      </form>
    </div>
  );
};

export default LoginForm;