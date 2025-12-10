import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await login(email, password, totp);

      // Login success
      navigate("/dashboard");
    } catch (err) {
      const msg = err?.response?.data?.message || err.message;

      if (msg === "MFA token required") {
        setError("MFA code is required");
      } else if (msg === "Invalid MFA token") {
        setError("Invalid MFA code");
      } else if (msg === "Invalid credentials") {
        setError("Incorrect email or password");
      } else {
        setError("Login failed");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">

        <h1 className="text-2xl font-bold mb-4">Sign in</h1>

        {error && (
          <div className="text-red-600 mb-3 text-sm">{error}</div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />

          {/* MFA input */}
          <input
            type="text"
            placeholder="6-digit MFA code (if enabled)"
            maxLength={6}
            value={totp}
            onChange={(e) => setTotp(e.target.value.replace(/\D/g, ""))}
            className="w-full border px-3 py-2 rounded"
          />

          {/* Sign in button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-white py-2 rounded font-semibold disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        {/* Forgot password link */}
        <div className="text-sm text-center mt-3">
          <Link to="/request-reset" className="text-accent hover:underline">
            Forgot password?
          </Link>
        </div>

      </div>
    </div>
  );
}
