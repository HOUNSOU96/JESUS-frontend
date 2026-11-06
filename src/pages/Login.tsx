import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Login: React.FC = () => {
  const [nom, setNom] = useState("");           
  const [matricule, setMatricule] = useState(""); 
  const [erreurLocal, setErreurLocal] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginWithPassword, erreur, setErreur, setUser } = useAuth();

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErreurLocal("");
    setErreur(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom, matricule }), // 🔹 mot de passe supprimé
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.detail === "USER_BLOCKED") {
          setErreurLocal("Votre compte a été bloqué. Contactez un administrateur.");
        } else if (data.detail === "USER_NOT_VALIDATED") {
          setErreurLocal("Votre compte n'est pas encore validé. Veuillez vérifier vos emails ou vous inscrire.");
        } else {
          setErreurLocal(data.detail || "Nom ou matricule incorrect.");
        }
        return;
      }

      if (data.access_token && data.user) {
        const token = data.access_token;
        const dataUser = { ...data.user, is_admin: !!data.user.is_admin };

        loginWithPassword(token, dataUser);
        setUser(dataUser);

        if (dataUser.is_admin) navigate("/liste-inscrits");
        else navigate("/matiere");
      } else {
        throw new Error("Réponse invalide du serveur");
      }
    } catch (err: any) {
      setErreurLocal(err.message || "Erreur lors de la connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <main className="flex-grow flex items-center justify-center px-4 py-10">
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg w-full max-w-md space-y-6"
          aria-label="Formulaire de connexion"
        >
          <h2 className="text-3xl font-extrabold text-center text-blue-700 dark:text-white tracking-tight">
            Connexion 
          </h2>

          {/* Nom de famille */}
          <div>
            <label htmlFor="nom" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Nom de famille
            </label>
            <input
              id="nom"
              type="text"
              placeholder="Votre nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              required
              autoFocus
              className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Matricule */}
          <div>
            <label htmlFor="matricule" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Matricule
            </label>
            <input
              id="matricule"
              type="text"
              placeholder="Votre matricule"
              value={matricule}
              onChange={(e) => setMatricule(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {(erreur || erreurLocal) && (
            <p className="text-sm text-red-600 text-center">{erreurLocal || erreur}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition disabled:opacity-50"
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>
      </main>

      <footer className="py-6 bg-transparent border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-md mx-auto text-center px-4">
          <p className="text-gray-700 dark:text-gray-300 mb-3">Pas encore de compte ?</p>
          <Link
            to="/inscription"
            className="inline-block px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
          >
            S’inscrire
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Login;
