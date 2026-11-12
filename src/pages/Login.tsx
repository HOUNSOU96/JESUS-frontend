import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import BackgroundSlideshow from "@/components/BackgroundSlideshow";

const Login: React.FC = () => {
  const [nom, setNom] = useState("");
  const [matricule, setMatricule] = useState("");
  const [erreurLocal, setErreurLocal] = useState("");
  const [loading, setLoading] = useState(false);

  const { loginWithPassword, erreur, setErreur, setUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setErreurLocal("");
    setErreur(null);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || ""}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nom: nom.trim(),
            matricule: matricule.trim(),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        if (data.detail === "USER_BLOCKED") {
          setErreurLocal(
            "Votre compte a été bloqué. Veuillez contacter un administrateur."
          );
        } else if (data.detail === "USER_NOT_VALIDATED") {
          setErreurLocal(
            "Votre compte n'est pas encore validé. Veuillez vérifier vos emails ou contacter un responsable."
          );
        } else {
          setErreurLocal(data.detail || "Nom ou matricule incorrect.");
        }
        return;
      }

      if (data.access_token && data.user) {
        const token = data.access_token;
        const dataUser = {
          ...data.user,
          is_admin: !!data.user.is_admin,
        };

        loginWithPassword(token, dataUser);
        setUser(dataUser);

        if (dataUser.is_admin) {
          navigate("/liste-inscrits");
        } else {
          navigate("/matiere");
        }
      } else {
        throw new Error("Réponse invalide du serveur.");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Erreur lors de la connexion.";

      setErreurLocal(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-transparent">
      <BackgroundSlideshow />

      <main className="relative z-20 flex flex-grow items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 25, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-3xl border border-white/20 bg-white/95 p-6 shadow-2xl backdrop-blur-xl dark:bg-gray-900/95 sm:p-9"
            aria-label="Formulaire de connexion"
          >
            {/* EN-TÊTE */}

            <div className="text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-600 text-4xl text-white shadow-lg shadow-blue-600/25">
                ✝
              </div>

              <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400">
                SAINT ENFANT JÉSUS
              </p>

              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                Connexion
              </h1>

              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Accédez à votre espace membre.
              </p>
            </div>

            {/* NOM */}

            <div>
              <label
                htmlFor="nom"
                className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                Nom de famille
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-lg text-gray-400">
                  👤
                </span>

                <input
                  id="nom"
                  type="text"
                  placeholder="Entrez votre nom"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  required
                  autoComplete="family-name"
                  autoFocus
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 py-3.5 pl-12 pr-4 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            {/* MATRICULE */}

            <div>
              <label
                htmlFor="matricule"
                className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                Matricule
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-lg text-gray-400">
                  🪪
                </span>

                <input
                  id="matricule"
                  type="text"
                  placeholder="Entrez votre matricule"
                  value={matricule}
                  onChange={(e) => setMatricule(e.target.value)}
                  required
                  autoComplete="username"
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 py-3.5 pl-12 pr-4 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            {/* ERREURS */}

            {(erreurLocal || erreur) && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
              >
                <span className="mr-2">⚠️</span>
                {erreurLocal || erreur}
              </motion.div>
            )}

            {/* BOUTON */}

            <button
              type="submit"
              disabled={loading || !nom.trim() || !matricule.trim()}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-blue-600 py-4 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Connexion en cours...
                </>
              ) : (
                <>
                  Se connecter
                  <span className="text-lg">→</span>
                </>
              )}
            </button>

            <p className="text-center text-xs leading-relaxed text-gray-500 dark:text-gray-400">
              L'accès à votre espace est réservé aux membres dont
              l'inscription a été validée.
            </p>
          </form>

          {/* INSCRIPTION */}

          <div className="mt-6 rounded-2xl border border-white/20 bg-black/20 px-5 py-5 text-center backdrop-blur-md">
            <p className="mb-3 text-sm text-white">
              Vous n'avez pas encore de compte ?
            </p>

            <Link
              to="/inscription"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-7 py-3 font-bold text-white shadow-lg transition hover:bg-green-700 active:scale-95"
            >
              Créer un compte
              <span>→</span>
            </Link>
          </div>
        </motion.div>
      </main>

      <footer className="relative z-20 border-t border-white/10 bg-black/20 px-4 py-4 text-center backdrop-blur-sm">
        <p className="text-xs text-white/70">
          SAINT ENFANT JÉSUS · Espace des membres
        </p>
      </footer>
    </div>
  );
};

export default Login;
