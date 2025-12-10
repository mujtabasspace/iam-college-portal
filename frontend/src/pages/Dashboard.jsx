import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    async function load() {
      // Only ADMIN users can load logs
      if (user?.role !== 'admin') {
        setLogs([]);
        return;
      }

      try {
        const res = await api.get('/admin/logs');
        if (res?.data) setLogs(res.data.slice(0, 10));
      } catch (e) {
        console.error('Failed to load logs:', e);
      }
    }

    load();
  }, [user]);

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2 bg-white p-6 rounded-xl shadow">
        <h3 className="text-xl font-semibold">Welcome, {user?.name || 'User'}</h3>
        <p className="text-sm text-muted mt-2">Role: <strong>{user?.role}</strong></p>

        <div className="mt-6">
          <h4 className="font-medium">Quick Actions</h4>
          <div className="mt-3 space-x-2">
            <a className="inline-block bg-accent text-white px-4 py-2 rounded" href="/mfa-setup">
              Setup MFA
            </a>
          </div>
        </div>
      </div>

      {/* Only admin sees logs section */}
      {user?.role === 'admin' && (
        <aside className="bg-white p-6 rounded-xl shadow">
          <h4 className="font-medium mb-3">Recent Audit Logs</h4>
          <div className="space-y-2 text-sm text-muted">
            {logs.length === 0 ? (
              <div>No logs available</div>
            ) : (
              logs.map(l => (
                <div key={l._id} className="text-xs">
                  <div className="text-slate-600">{new Date(l.timestamp).toLocaleString()}</div>
                  <div className="text-slate-800">{l.actor} — {l.action}</div>
                </div>
              ))
            )}
          </div>
        </aside>
      )}
    </div>
  );
}
