import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function MFASetup() {
  const { accessToken, user, setUser } = useAuth();
  const navigate = useNavigate();

  const [qr, setQr] = useState(null);
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [status, setStatus] = useState(null);

  // -----------------------------
  // Fetch QR + Secret on load
  // -----------------------------
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await api.post(
          '/auth/mfa/setup',
          {},
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        setQr(res.data.qr);
        setSecret(res.data.secret);
      } catch (err) {
        console.error('MFA setup err', err);
      } finally {
        setLoading(false);
      }
    }

    if (accessToken) load();
  }, [accessToken]);

  // -----------------------------
  // Verify token submitted
  // -----------------------------
  async function handleVerify(e) {
    e.preventDefault();
    if (!token) return;

    try {
      setVerifying(true);
      await api.post(
        '/auth/mfa/verify',
        { token },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      // Mark success
      setStatus('success');

      // Update auth context so Dashboard knows MFA is enabled
      if (setUser) {
        setUser(prev => (prev ? { ...prev, mfaEnabled: true } : prev));
      }

      // Redirect after 2 seconds
      setTimeout(() => navigate('/dashboard'), 2000);

    } catch (err) {
      console.error('verify MFA err', err);
      setStatus('error');
    } finally {
      setVerifying(false);
    }
  }

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-lg">

        {/* Title */}
        <h1 className="text-2xl font-bold mb-2">Multi-Factor Authentication</h1>
        <p className="text-sm text-slate-600 mb-6">
          Scan the QR code using <strong>Google Authenticator</strong>,
          then enter the 6-digit code below.
        </p>

        {/* Loading */}
        {loading && (
          <div className="text-center py-10">
            <div className="animate-spin border-4 border-slate-300 border-t-accent rounded-full w-10 h-10 mx-auto mb-4" />
            <p className="text-sm text-slate-500">Generating your MFA key…</p>
          </div>
        )}

        {/* Success */}
        {status === 'success' && (
          <div className="text-center py-10">
            <div className="text-green-600 text-3xl font-bold mb-3">✔ Enabled</div>
            <p className="text-sm text-green-700">
              MFA has been successfully enabled! Redirecting…
            </p>
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div className="text-center mb-4 text-red-600 text-sm">
            Invalid code. Please try again.
          </div>
        )}

        {/* Main form */}
        {!loading && status !== 'success' && (
          <>
            <div className="flex justify-center mb-4">
              {qr && (
                <img
                  src={qr}
                  alt="MFA QR"
                  className="w-48 h-48 border rounded-lg"
                />
              )}
            </div>

            {/* Secret */}
            <div className="bg-slate-50 border rounded-lg px-3 py-2 text-sm flex justify-between items-center mb-6">
              <span className="font-mono">{secret}</span>
              <button
                type="button"
                className="text-accent font-medium text-sm"
                onClick={() => secret && navigator.clipboard.writeText(secret)}
              >
                Copy
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleVerify} className="space-y-4">
              <input
                type="text"
                placeholder="Enter 6-digit code"
                maxLength={6}
                value={token}
                onChange={e => setToken(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg text-lg tracking-widest text-center"
                autoFocus
              />

              <button
                type="submit"
                disabled={verifying || !token}
                className="w-full bg-accent text-white py-2 rounded-lg font-semibold disabled:opacity-50"
              >
                {verifying ? 'Verifying…' : 'Verify & Enable'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
