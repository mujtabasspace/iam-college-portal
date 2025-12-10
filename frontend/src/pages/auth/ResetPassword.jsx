import React, { useState } from "react";
import api from "../../services/api";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);

  async function send(e) {
    e.preventDefault();
    try {
      const res = await api.post("/auth/request-password-reset", { email });

      if (res.status === 200) {
        setStatus("sent");
      } else {
        setStatus("error");
      }
    } catch (_) {
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="bg-white shadow rounded-xl p-8 w-full max-w-md">

        <h2 className="text-xl font-semibold mb-4">Reset Password</h2>

        {status === "sent" ? (
          <div className="bg-green-50 border border-green-300 text-green-700 p-3 rounded">
            Check your email for the reset link.
          </div>
        ) : (
          <form onSubmit={send} className="space-y-4">

            <input
              type="email"
              placeholder="Your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />

            <button className="w-full bg-accent text-white px-4 py-2 rounded">
              Send reset link
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
