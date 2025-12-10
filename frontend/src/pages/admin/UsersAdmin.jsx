// src/pages/admin/UsersAdmin.jsx
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import ConfirmModal from '../../components/ui/ConfirmModal';
import Button from '../../components/ui/Button';

const ROLE_OPTIONS = ['student', 'faculty', 'admin']; // must match backend

export default function UsersAdmin() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ open: false, action: null, target: null });

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users', {
        params: { search: q, page, limit }
      });

      // backend currently returns plain array; support both formats
      if (Array.isArray(res.data)) {
        setUsers(res.data);
        setTotal(res.data.length);
      } else {
        setUsers(res.data.users || []);
        setTotal(res.data.total ?? (res.data.users?.length || 0));
      }
    } catch (err) {
      console.error('fetch users err', err);
    } finally {
      setLoading(false);
    }
  };

  const doSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const openConfirm = (action, target) => setModal({ open: true, action, target });
  const closeConfirm = () => setModal({ open: false, action: null, target: null });

  const updateRole = async (userId, role) => {
    const original = users.slice();
    setUsers(users.map(u => (u._id === userId ? { ...u, role } : u)));

    try {
      await api.post('/admin/role', { userId, role }); // backend expects userId
    } catch (err) {
      console.error('update role err', err);
      setUsers(original);
    }
  };

  const toggleDisable = async (userId, disable) => {
    const original = users.slice();
    setUsers(users.map(u => (u._id === userId ? { ...u, disabled: disable } : u)));

    try {
      await api.post(disable ? '/admin/disable' : '/admin/enable', { userId });
    } catch (err) {
      console.error('toggle disable err', err);
      setUsers(original);
    } finally {
      closeConfirm();
    }
  };

  const deleteUser = async (userId) => {
    const original = users.slice();
    setUsers(users.filter(u => u._id !== userId));

    try {
      await api.post('/admin/delete', { userId });
    } catch (err) {
      console.error('delete user err', err);
      setUsers(original);
    } finally {
      closeConfirm();
    }
  };

  const handleConfirm = () => {
    const { action, target } = modal;
    if (!action || !target) return closeConfirm();

    if (action === 'disable') toggleDisable(target._id, true);
    if (action === 'enable') toggleDisable(target._id, false);
    if (action === 'delete') deleteUser(target._id);
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">User Management</h1>
          <p className="text-sm text-muted">View and manage users, roles, and account status.</p>
        </div>

        <div className="flex gap-3 items-center">
          <form onSubmit={doSearch} className="flex gap-2">
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search by name or email..."
              className="px-3 py-2 border rounded-lg w-64 text-sm focus:outline-none"
            />
            <Button type="submit">Search</Button>
          </form>
          <Button onClick={() => { setQ(''); setPage(1); fetchUsers(); }}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
        <table className="min-w-full table-auto">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Role</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Created</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="p-6 text-center">Loading…</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="6" className="p-6 text-center">No users found</td></tr>
            ) : users.map(u => (
              <tr key={u._id} className="border-t">
                <td className="px-4 py-3">
                  <div className="font-medium">{u.name || '-'}</div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">{u.email}</td>
                <td className="px-4 py-3">
                  <select
                    value={u.role}
                    onChange={(e) => updateRole(u._id, e.target.value)}
                    className="px-2 py-1 border rounded"
                  >
                    {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3">
                  {u.disabled ? (
                    <span className="text-xs px-2 py-1 rounded bg-red-50 text-red-700">Disabled</span>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded bg-green-50 text-green-700">Active</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  {u.createdAt ? new Date(u.createdAt).toLocaleString() : '-'}
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  {u.disabled ? (
                    <button onClick={() => openConfirm('enable', u)} className="text-sm text-green-600">
                      Enable
                    </button>
                  ) : (
                    <button onClick={() => openConfirm('disable', u)} className="text-sm text-red-600">
                      Disable
                    </button>
                  )}
                  <button onClick={() => openConfirm('delete', u)} className="text-sm text-rose-600">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="px-4 py-3 border-t flex items-center justify-between">
          <div className="text-sm">Showing {users.length} of {total} users</div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Prev
            </Button>
            <div className="px-3">{page} / {totalPages}</div>
            <Button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={modal.open}
        title={
          modal.action === 'delete'
            ? 'Delete user'
            : modal.action === 'disable'
            ? 'Disable user'
            : 'Enable user'
        }
        message={
          modal.target
            ? `Are you sure you want to ${modal.action} "${modal.target.name || modal.target.email}"?`
            : ''
        }
        onCancel={closeConfirm}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
