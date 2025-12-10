import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function LogsAdmin() {
  const { user } = useAuth();

  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [page]);

  async function load() {
    if (user?.role !== 'admin') return;

    try {
      const res = await api.get('/admin/logs', {
        params: {
          search,
          action: actionFilter,
          page,
          limit
        }
      });
      setLogs(res.data || []);
    } catch (err) {
      console.error('Failed to load logs:', err);
    }
  }

  const doSearch = e => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const exportCSV = () => {
    const headers = "timestamp,actor,action,target\n";
    const rows = logs.map(l => {
      return `${new Date(l.timestamp).toISOString()},${l.actor},${l.action},${l.target || ''}`;
    }).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Audit Logs</h1>

      {/* Filters */}
      <form onSubmit={doSearch} className="flex gap-2 mb-4">
        <input
          className="border rounded px-3 py-2 w-64"
          placeholder="Search user/email"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select
          className="border rounded px-3 py-2"
          value={actionFilter}
          onChange={e => setActionFilter(e.target.value)}
        >
          <option value="">All actions</option>
          <option value="login">Login</option>
          <option value="register">Register</option>
          <option value="mfa_enabled">MFA Enabled</option>
          <option value="password_reset">Password Reset</option>
          <option value="disable_user">Disable User</option>
          <option value="enable_user">Enable User</option>
          <option value="delete_user">Delete User</option>
        </select>

        <button className="bg-accent text-white px-4 rounded">Search</button>
        <button type="button" onClick={exportCSV} className="bg-slate-700 text-white px-4 rounded">
          Export CSV
        </button>
      </form>

      {/* List */}
      <div className="bg-white border rounded-xl shadow overflow-hidden">
        <table className="table-auto w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left">Time</th>
              <th className="px-4 py-2 text-left">Actor</th>
              <th className="px-4 py-2 text-left">Action</th>
              <th className="px-4 py-2 text-left">Target</th>
            </tr>
          </thead>

          <tbody>
            {logs.length === 0 && (
              <tr><td colSpan="4" className="p-4 text-center">No logs found</td></tr>
            )}

            {logs.map(log => (
              <tr key={log._id} className="border-t">
                <td className="px-4 py-2">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-4 py-2">{log.actor}</td>
                <td className="px-4 py-2">{log.action}</td>
                <td className="px-4 py-2">{log.target || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage(p => p - 1)}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Prev
        </button>

        <div className="px-4 py-2">{page}</div>

        <button
          onClick={() => setPage(p => p + 1)}
          className="px-4 py-2 border rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}
