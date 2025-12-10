import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("accessToken") || null
  );
  const [loading, setLoading] = useState(true);

  // --------------------------------------------------
  // On load → attempt refresh
  // --------------------------------------------------
  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const res = await api.post("/auth/token");

        if (res.status === 200 && res.data?.accessToken) {
          setAccessToken(res.data.accessToken);
          localStorage.setItem("accessToken", res.data.accessToken);

          if (res.data.user) {
            setUser(res.data.user);
          }
        }
      } catch (_) {
        // no refresh cookie / not logged in
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();
    return () => (mounted = false);
  }, []);

  // --------------------------------------------------
  // Attach token to protected calls
  // --------------------------------------------------
  useEffect(() => {
    const id = api.interceptors.request.use(
      (cfg) => {
        if (accessToken) cfg.headers.Authorization = `Bearer ${accessToken}`;
        return cfg;
      },
      (err) => Promise.reject(err)
    );

    return () => api.interceptors.request.eject(id);
  }, [accessToken]);

  // --------------------------------------------------
  // LOGIN
  // --------------------------------------------------
  const login = async (email, password, totp) => {
    const res = await api.post("/auth/login", { email, password, totp });

    // Because validateStatus always returns true →
    // we must check manually
    if (res.status !== 200) {
      const error = new Error(res.data?.message || "Login failed");
      error.response = { data: res.data };
      throw error;
    }

    // success
    setAccessToken(res.data.accessToken);
    localStorage.setItem("accessToken", res.data.accessToken);
    setUser(res.data.user);

    return res.data;
  };

  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (_) { }

    setAccessToken(null);
    setUser(null);
    localStorage.removeItem("accessToken");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        accessToken,
        setAccessToken,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
