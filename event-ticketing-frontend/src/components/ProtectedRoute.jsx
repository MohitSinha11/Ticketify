import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, hasRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <div className="max-w-md text-center px-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-900/30 text-red-500 mb-4">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Access Denied</h2>
          <p className="mt-2 text-slate-400">
            Your account does not have the required role ({requiredRole}) to access this page.
          </p>
          <a
            href="/"
            className="mt-6 inline-block rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold hover:bg-indigo-700 transition duration-200 shadow-lg shadow-indigo-600/30 text-white"
          >
            Return Home
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
