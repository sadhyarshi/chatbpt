import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../api";

const RegisterForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // New state for confirm password
  const [isPremium, setIsPremium] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await register(email, password, isPremium);
      alert("Registration successful! Please log in.");
      navigate("/");
    } catch (err) {
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="form-box">
        <h2>Register</h2>
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
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="input-field"
          required
        />
        <label className="input-field">
          <input
            type="checkbox"
            checked={isPremium}
            onChange={(e) => setIsPremium(e.target.checked)}
            style={{ marginRight: "0.5rem" }}
          />
          Premium Subscription
        </label>
        <button type="submit" className="submit-btn">
          Register
        </button>
        <a href="/" className="link">
          Already have an account? Login here
        </a>
      </form>
    </div>
  );
};

export default RegisterForm;