import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("ticket_app_token");
      const storedUser = localStorage.getItem("ticket_app_user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error("Error loading stored authentication:", err);
      localStorage.removeItem("ticket_app_token");
      localStorage.removeItem("ticket_app_user");
    } finally {
      setIsInitialized(true);
    }
  }, []);

  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const { token: jwtToken, userId, name, role } = response.data;

    const userData = { userId, name, email, role };

    setToken(jwtToken);
    setUser(userData);

    localStorage.setItem("ticket_app_token", jwtToken);
    localStorage.setItem("ticket_app_user", JSON.stringify(userData));

    return userData;
  };

  const register = async (name, email, password, role = "USER") => {
    const response = await api.post("/auth/register", {
      name,
      email,
      password,
      role,
    });
    const { token: jwtToken, userId, role: userRole } = response.data;

    const userData = { userId, name, email, role: userRole || role };

    setToken(jwtToken);
    setUser(userData);

    localStorage.setItem("ticket_app_token", jwtToken);
    localStorage.setItem("ticket_app_user", JSON.stringify(userData));

    return userData;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("ticket_app_token");
    localStorage.removeItem("ticket_app_user");
  };

  const hasRole = (requiredRole) => {
    if (!user || !user.role) return false;

    // Normalize roles (e.g. ORGANIZER or ROLE_ORGANIZER)
    const normalizedUserRole = user.role.toUpperCase().replace("ROLE_", "");
    const normalizedRequiredRole = requiredRole.toUpperCase().replace("ROLE_", "");

    return normalizedUserRole === normalizedRequiredRole;
  };

  return (
    <AuthContext.Provider
      value={{
        isInitialized,
        isAuthenticated: !!token && !!user,
        user,
        token,
        login,
        register,
        logout,
        hasRole,
      }}
    >
      {isInitialized ? (
        children
      ) : (
        <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
            <p className="text-sm font-medium tracking-wide text-slate-400">Loading Application...</p>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
