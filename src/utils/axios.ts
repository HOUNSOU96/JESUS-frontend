import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000", // adapte si ton backend est sur un autre host/port
});

// Intercepteur de requêtes : ajoute automatiquement le token dans les headers Authorization
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("[AXIOS REQUEST]", {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data,
      params: config.params,
    });
    return config;
  },
  (error) => {
    console.error("[AXIOS REQUEST ERROR]", error);
    return Promise.reject(error);
  }
);

// Intercepteur de réponses : logge les erreurs et gère les cas spéciaux
api.interceptors.response.use(
  (response) => {
    console.log("[AXIOS RESPONSE]", {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    if (error.response) {
      console.error("[AXIOS RESPONSE ERROR]", {
        url: error.config?.url,
        status: error.response.status,
        data: error.response.data,
      });

      // Gestion automatique du 401 Unauthorized
      if (error.response.status === 401) {
        console.warn("Token expiré ou invalide, déconnexion automatique...");
        localStorage.removeItem("token");
        window.location.href = "/login"; // redirection vers ta page de login
      }
    } else if (error.request) {
      console.error("[AXIOS NO RESPONSE]", error.request);
    } else {
      console.error("[AXIOS CONFIG ERROR]", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
