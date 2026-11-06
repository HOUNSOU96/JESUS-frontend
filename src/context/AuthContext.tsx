import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import api from "../utils/axios";
import { User } from "../types/User";

// Type du contexte d'authentification
type AuthContextType = {
  user: User | null;
  token: string | null;
  erreur: string | null;
  setUser: (user: User | null) => void;
  setErreur: (msg: string | null) => void;
  verifyOtp: (token: string, user: User) => void;
  loginWithPassword: (token: string, user: User) => void;
  logout: () => void;
  isVerified: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState<boolean>(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    const storedVerified = localStorage.getItem("isVerified");

    if (storedToken) {
      setToken(storedToken);
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser); // ✅ plus d'email, prend directement ce que renvoie le backend
      }
      if (storedVerified === "true") setIsVerified(true);
    }
  }, []);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchUser();
    } else {
      delete api.defaults.headers.common["Authorization"];
      setUser(null);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await api.get("/api/auth/me");
      const fetchedUser = res.data;
      setUser(fetchedUser); // ✅ backend renvoie is_admin
      localStorage.setItem("user", JSON.stringify(fetchedUser));
    } catch (err) {
      console.warn("⚠️ Erreur lors de la récupération de l'utilisateur :", err);
      logout();
    }
  };

  const verifyOtp = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    setIsVerified(true);
    setErreur(null);

    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    localStorage.setItem("isVerified", "true");
    localStorage.removeItem("pendingEmail");
  };

  const loginWithPassword = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    setIsVerified(true);
    setErreur(null);

    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    localStorage.setItem("isVerified", "true");
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsVerified(false);
    setErreur(null);

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isVerified");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        setUser,
        erreur,
        setErreur,
        verifyOtp,
        loginWithPassword,
        logout,
        isVerified,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
