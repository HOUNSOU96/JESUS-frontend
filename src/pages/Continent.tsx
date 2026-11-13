import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { continents } from "../data";

const flagCodes: Record<string, string> = {
  benin: "bj",
  nigeria: "ng",
  kenya: "ke",
  france: "fr",
  allemagne: "de",
  espagne: "es",
  chine: "cn",
  japon: "jp",
  inde: "in",
  usa: "us",
  canada: "ca",
  bresil: "br",
  australie: "au",
  nouvellezelande: "nz",
};

const Continent: React.FC = () => {
  const { continent } = useParams<{ continent: string }>();
  const navigate = useNavigate();

  const selected = continents.find(
    (item) => item.name.toLowerCase() === continent?.toLowerCase()
  );

  if (!selected) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-md rounded-2xl border border-white/20 bg-white/95 p-8 text-center shadow-xl dark:bg-gray-900">
          <div className="mb-4 text-5xl">🌍</div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Continent non trouvé
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Le continent demandé n'existe pas dans notre répertoire.
          </p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-6 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  const handleCountry = (countryName: string) => {
    navigate(`/pays/${encodeURIComponent(countryName)}`);
  };

  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="relative z-20 min-h-screen px-4 py-8 sm:px-6 sm:py-12"
    >
      <div className="mx-auto max-w-6xl">
        {/* En-tête */}
        <header className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/30 bg-white/90 text-4xl shadow-lg dark:bg-gray-900/90">
            {selected.icon}
          </div>

          <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-blue-700 dark:text-blue-300">
            Confrérie Saint Enfant Jésus
          </p>

          <h1 className="text-3xl font-extrabold text-white drop-shadow-lg sm:text-4xl md:text-5xl">
            {selected.label}
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/90 drop-shadow sm:text-base">
            Découvrez les pays de ce continent et accédez à leur organisation
            ecclésiastique.
          </p>

          <div className="mx-auto mt-6 h-1 w-20 rounded-full bg-blue-400" />
        </header>

        {/* Informations */}
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
          <div className="rounded-full border border-white/20 bg-black/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
            🌍 {selected.countries.length}{" "}
            {selected.countries.length > 1 ? "pays" : "pays"}
          </div>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-full border border-white/30 bg-white/90 px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-white dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
          >
            ← Retour
          </button>
        </div>

        {/* Liste des pays */}
        {selected.countries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto max-w-lg rounded-3xl border border-white/20 bg-white/95 px-6 py-12 text-center shadow-xl dark:bg-gray-900"
          >
            <div className="mb-5 text-6xl">❄️</div>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Aucun pays enregistré
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-400">
              Aucun pays n'est actuellement répertorié dans cette région.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {selected.countries.map((country, index) => {
              const flagCode = flagCodes[country.name];

              return (
                <motion.button
                  key={country.name}
                  type="button"
                  onClick={() => handleCountry(country.name)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: Math.min(index * 0.06, 0.35),
                  }}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className="group overflow-hidden rounded-2xl border border-white/40 bg-white text-left shadow-lg transition-shadow hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-400/50 dark:border-gray-700 dark:bg-gray-900"
                >
                  {/* Drapeau */}
                  <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-800 dark:to-gray-950">
                    <span className="absolute text-6xl opacity-20">
                      🌍
                    </span>

                    {flagCode && (
                      <img
                        src={`https://flagcdn.com/w320/${flagCode}.png`}
                        alt={`Drapeau de ${country.label}`}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="relative z-10 h-28 w-40 rounded-lg object-cover shadow-lg transition-transform duration-300 group-hover:scale-105"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    )}

                    <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-blue-800 shadow dark:bg-gray-800 dark:text-blue-300">
                      Organisation ecclésiastique
                    </span>
                  </div>

                  {/* Informations */}
                  <div className="flex items-center justify-between gap-3 p-5">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-400">
                        {country.label}
                      </h2>

                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Consulter l'organisation du pays
                      </p>
                    </div>

                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xl font-bold text-blue-700 transition group-hover:bg-blue-700 group-hover:text-white dark:bg-blue-950 dark:text-blue-300">
                      →
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Pied de page */}
        <footer className="mt-12 pb-6 text-center">
          <p className="text-xs font-medium tracking-wide text-white/80 drop-shadow">
            CONFRÉRIE SAINT ENFANT JÉSUS — MIRACULEUX DE PRAGUE
          </p>
        </footer>
      </div>
    </motion.main>
  );
};

export default Continent;
