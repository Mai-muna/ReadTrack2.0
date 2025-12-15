import React, { createContext, useContext, useEffect, useState } from "react";
import api from "./api/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);

  const loadProfile = async (activeToken) => {
    if (!activeToken) return;
    try {
      const res = await api.get("/auth/profile", {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      setUser(res.data.user);
    } catch (err) {
      console.error("Failed to load profile", err);
    }
  };

  useEffect(() => {
    loadProfile(token);
  }, [token]);

  const login = (newToken, info) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    if (info) setUser(info);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, refresh: () => loadProfile(token) }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

