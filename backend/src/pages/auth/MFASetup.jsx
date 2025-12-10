// src/pages/auth/MFASetup.jsx
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function MFASetup(){
  const { accessToken } = useAuth();
  const [qr, setQr] = useState(null);
  const [secret, setSecret] = useState(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(()=> {
    let mounted = true;
    async function init(){
      setLoading(true);
      try {
        // Protected request: api already attaches Authorization header via interceptor
        const res = await api.post('/auth/mfa/setup');
        if(!mounted) return;
        setQr(res.data.qr);
        setSecret(res.data.secret);
      } catch (err) {
        console.error(err);
        setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to initialize MFA' });
      } finally {
        if(mounted) setLoading(false);
      }
    }

    if(accessToken) init();
    else {
      // if no accessToken, still try — api interceptor will handle 401
      init();
    }

    return ()=> mounted = false;
  }, [accessToken]);

  const copySecret = async () => {
    if(!secret) return;
    try {
      await navigator.clipboard.writeText(secret);
      setMessage({ type: 'success', text: 'Secret copied to clipboard' });
    } catch (e) {
      setMessage({ type: 'error', text: 'Unable to copy secret' });
    }
  };

  const verify = async (e) => {
    e?.preventDefault();
    setMessage(null);
    if(!code || code.trim().length === 0) {
      setMessage({ type: 'error', text: 'Enter the 6-digit code from your authenticator app.'});
      return;
    }
    setVerifying(true);
    try {
      await api.post('/auth/mfa/verify', { token: code });
      setMessage({ type: 'success', text: 'MFA enabled successfully. Your account is now protected.' });
      setCode('');
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Verification failed. Try again.' });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-2xl font-semibold mb-2">Set up Multi-Factor Authentication (MFA)</h2>
        <p className="text-sm text-muted mb-4">
          Protect your account by enabling time-based one-time passwords (TOTP). Use Google Authenticator, Authy or any TOTP app.
        </p>

        {message && (
          <div className={`p-3 rounded mb-4 ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message.text}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">Initializing…</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 items-start">
            <div className="bg-slate-50 border rounded p-4 flex flex-col items-center">
              <div className="text-sm text-muted mb-3">Scan this QR code with an authenticator app</div>
              {qr ? (
                <img src={qr} alt="MFA QR Code" className="w-48 h-48 bg-white p-2 rounded-lg shadow-sm" />
              ) : (
                <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center text-sm text-muted">No QR available</div>
              )}
              <div className="mt-3 text-xs text-muted text-center">
                If your camera doesn't work, use the secret key below.
              </div>
            </div>

            <div className="bg-white p-4 border rounded space-y-3">
              <div>
                <label className="block text-xs text-muted mb-1">Secret key</label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 select-all bg-slate-100 px-3 py-2 rounded text-sm">{secret || '—'}</div>
                  <Button onClick={copySecret} disabled={!secret}>Copy</Button>
                </div>
                <div className="text-xs text-muted mt-2">Store this secret safely. If you lose it you will need account recovery.</div>
              </div>

              <form onSubmit={verify} className="space-y-3">
                <label className="block text-xs text-muted">Enter 6-digit code</label>
                <Input
                  placeholder="123456"
                  value={code}
                  onChange={e=>setCode(e.target.value.trim())}
                  maxLength={6}
                  inputMode="numeric"
                />
                <div className="flex gap-3">
                  <Button type="submit" disabled={verifying || !secret}>{verifying ? 'Verifying…' : 'Verify & Enable'}</Button>
                  <Button variant="ghost" onClick={()=>{ setCode(''); setMessage(null); }} disabled={verifying}>Reset</Button>
                </div>
              </form>

              <div className="text-xs text-muted mt-2">
                After enabling, your authenticator app will be required at each login. Keep a backup of the secret.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
