import React, { useState } from "react";
import api from "../../services/api";

export default function RequestReset() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const res = await api.post("/auth/request-password-reset", { email });

    if (res.status === 200) {
      setSent(true);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="bg-white shadow rounded-xl p-8 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Reset Password</h2>

        {sent ? (
          <div className="text-green-600">
            Check your email for the reset link.
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full border px-3 py-2 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button className="w-full bg-accent text-white py-2 rounded">
              Send Reset Link
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
