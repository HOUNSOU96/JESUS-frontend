import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isVerified } = useAuth();

  if (!isVerified) return <Navigate to="/login" replace />;
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Vérification des autorisations...
      </div>
    );
  }

  if (user.is_admin !== true && user.is_admin !== 1) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default RequireAdmin;
