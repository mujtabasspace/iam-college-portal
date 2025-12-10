import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const u = await api.get('/admin/users');
        setUsers(u.data);

        const l = await api.get('/admin/logs');
        setLogs(l.data.slice(0, 50));
      } catch (err) {
        console.error('Failed loading admin data:', err);
      }
    }

    loadData();
  }, []);

  const changeRole = async (id, role) => {
    try {
      await api.post('/admin/role', { userId: id, role });
      setUsers(users.map(u => u._id === id ? { ...u, role } : u));
    } catch (err) {
      console.error('changeRole failed:', err);
    }
  };

  const disable = async (id) => {
    try {
      await api.post('/admin/disable', { userId: id });
      setUsers(users.map(u => u._id === id ? { ...u, disabled: true } : u));
    } catch (err) {
      console.error('disable failed:', err);
    }
  };

  return (
    <div className="p-6">

      {/* Navigation */}
      <div className="mb-6 flex gap-3">
        <Link to="/admin/users" className="bg-accent text-white px-4 py-2 rounded">
          Manage Users
        </Link>

        <Link to="/admin/logs" className="bg-accent text-white px-4 py-2 rounded">
          Audit Logs
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Users Section */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold mb-3">Users</h3>

          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted">
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map(u => (
                <tr key={u._id} className="border-t">
                  <td className="py-2">{u.email}</td>
                  <td className="py-2">{u.role}</td>
                  <td className="py-2 space-x-2">
                    <button
                      onClick={() => changeRole(u._id, u.role === 'student' ? 'faculty' : 'student')}
                      className="text-sm text-blue-600"
                    >
                      Toggle Role
                    </button>

                    <button
                      onClick={() => disable(u._id)}
                      className="text-sm text-red-600"
                    >
                      Disable
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>

        {/* Logs Section */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold mb-3">Recent Audit Logs</h3>

          <div className="text-xs text-muted space-y-2 max-h-[60vh] overflow-auto">
            {logs.map(l => (
              <div key={l._id} className="border-b py-2">
                <div className="text-xs">{new Date(l.timestamp).toLocaleString()}</div>
                <div className="text-sm">
                  {l.actor} — <span className="font-medium">{l.action}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
