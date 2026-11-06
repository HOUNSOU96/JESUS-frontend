import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/axios";

export const useAuth = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null); // ou typage plus précis si tu as
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const navigate = useNavigate();

  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        // Pas de token => redirection login immédiate
        navigate("/login");
        return;
      }

      try {
        const res = await api.get("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data); // selon la réponse de ton API
        setLoading(false);
      } catch (err) {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
        navigate("/login");
      }
    };

    checkToken();
  }, [navigate, token]);

  return { loading, user, token };
};
