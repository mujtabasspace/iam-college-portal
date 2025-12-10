import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import MFASetup from "./pages/auth/MFASetup";

// Password reset pages
import ResetPassword from "./pages/auth/ResetPassword";
import RequestReset from "./pages/auth/RequestReset";

import Layout from "./components/Layout";
import RequireAuth from "./components/RequireAuth";
import RequireAdmin from "./components/RequireAdmin";

// Admin pages
import UsersAdmin from "./pages/admin/UsersAdmin";
import LogsAdmin from "./pages/admin/LogsAdmin";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>

        {/* Public */}
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        {/* Password Reset */}
        <Route path="request-reset" element={<RequestReset />} />
        <Route path="reset-password" element={<ResetPassword />} />

        {/* Auth only */}
        <Route element={<RequireAuth />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="mfa-setup" element={<MFASetup />} />
        </Route>

        {/* Admin only */}
        <Route element={<RequireAdmin />}>
          <Route path="admin" element={<AdminPanel />} />
          <Route path="admin/users" element={<UsersAdmin />} />
          <Route path="admin/logs" element={<LogsAdmin />} />
        </Route>

      </Route>
    </Routes>
  );
}
