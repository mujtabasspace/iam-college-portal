import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">

      {/* HERO */}
      <header className="px-6 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-4 tracking-tight">
          IAM College Portal
        </h1>

        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
          A secure Identity & Access Management platform designed for academic institutions.
          Manage users, roles, authentication and security — all in one place.
        </p>

        <div className="space-x-4">
          <Link
            to="/login"
            className="inline-block bg-accent text-white px-8 py-3 rounded-xl font-semibold shadow hover:shadow-lg transition"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="inline-block text-accent font-semibold hover:underline"
          >
            Create account
          </Link>
        </div>
      </header>

      {/* FEATURES */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-700 text-center mb-12">
          Platform Capabilities
        </h2>

        <div className="grid gap-8 md:grid-cols-3">
          
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-xl transition">
            <h3 className="font-semibold text-lg text-slate-800 mb-3">
              Secure Authentication
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Multi-Factor Authentication (MFA), JWT access tokens, and refresh token rotation
              ensure user identity protection and session security.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow hover:shadow-xl transition">
            <h3 className="font-semibold text-lg text-slate-800 mb-3">
              Role-Based Access Control
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Admin, Staff and Student roles provide structured access to resources,
              ensuring least-privilege usage.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow hover:shadow-xl transition">
            <h3 className="font-semibold text-lg text-slate-800 mb-3">
              Audit Logs & Monitoring
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every critical action is logged for compliance:
              login, MFA, role changes, password reset, and user management.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center py-10 text-sm text-slate-500">
        © {new Date().getFullYear()} IAM College Portal. All rights reserved.
      </footer>
    </div>
  );
}
