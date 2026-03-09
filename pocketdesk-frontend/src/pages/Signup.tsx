import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import type { AuthResponse } from "../types/api";

export default function Signup() {
  const context = useContext(AuthContext);
  const navigate = useNavigate();

  if (!context) return null;

  const { login } = context;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async () => {
    try {
      setError(null);

      const res = await API.post<AuthResponse>("/auth/signup", {
        email,
        password,
      });

      // auto login after signup
      login(res.data.token);
      navigate("/home");

    } catch (err: any) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Signup</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br /><br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <button onClick={handleSignup}>Signup</button>

      <p>
        Already have an account? <Link to="/">Login</Link>
      </p>
    </div>
  );
}