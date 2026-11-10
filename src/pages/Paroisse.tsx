import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { continents } from "../data";
import api from "../utils/axios";

interface DiocesanResponsible {
  id: number;
  user_id: number;
  nom: string;
  prenom: string;
  statut: string | null;
  level: string;
  parish: string | null;
  is_primary: boolean;
}

const Paroisse: React.FC = () => {
  const { country, diocese } = useParams<{
    country: string;
    diocese: string;
  }>();

  const navigate = useNavigate();

  const [responsables, setResponsables] = useState<
    DiocesanResponsible[]
  >([]);

  const [loadingResponsables, setLoadingResponsables] =
    useState(false);

  const [errorResponsables, setErrorResponsables] =
    useState("");

  // Trouver le continent
  const continent = continents.find((c) =>
    c.countries.some(
      (p) => p.name.toLowerCase() === country?.toLowerCase()
    )
  );

  // Trouver le pays
  const selectedCountry = continent?.countries.find(
    (p) => p.name.toLowerCase() === country?.toLowerCase()
  );

  // Trouver le diocèse
  const selectedDiocese = selectedCountry?.dioceses.find(
    (d) => d.name.toLowerCase() === diocese?.toLowerCase()
  );

  // Récupérer les responsables du diocèse
  useEffect(() => {
    if (!country || !diocese || !selectedDiocese) return;

    let cancelled = false;

    const fetchResponsables = async () => {
      setLoadingResponsables(true);
      setErrorResponsables("");

      try {
        const response = await api.get(
          `/api/hierarchy/responsables/${encodeURIComponent(
            country
          )}/${encodeURIComponent(diocese)}`
        );

        if (!cancelled) {
          setResponsables(
            Array.isArray(response.data)
              ? response.data
              : response.data.responsables || []
          );
        }
      } catch (error) {
        console.error(
          "Erreur lors du chargement des responsables :",
          error
        );

        if (!cancelled) {
          setErrorResponsables(
            "Impossible de charger la liste des responsables de ce diocèse."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingResponsables(false);
        }
      }
    };

    fetchResponsables();

    return () => {
      cancelled = true;
    };
  }, [country, diocese, selectedDiocese]);

  if (!continent || !selectedCountry) {
    return (
      <div className="text-center py-10">
        🌍 Pays non trouvé
      </div>
    );
  }

  if (!selectedDiocese) {
    return (
      <div className="text-center py-10">
        ⛪ Diocèse non trouvé
      </div>
    );
  }

  const parishes = selectedDiocese.parishes || [];

  // Navigation vers les membres d'une paroisse
  const handleParishClick = (parish: string) => {
    navigate(
      `/inscrits/${encodeURIComponent(country!)}/${encodeURIComponent(
        diocese!
      )}/${encodeURIComponent(parish)}`
    );
  };

  // Regroupement des responsables par paroisse
  const responsablesParParoisse = responsables.reduce<
    Record<string, DiocesanResponsible[]>
  >((groups, responsable) => {
    const parish = responsable.parish || "Responsabilité diocésaine";

    if (!groups[parish]) {
      groups[parish] = [];
    }

    groups[parish].push(responsable);

    return groups;
  }, {});

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center px-4 py-10 text-gray-900 dark:text-white"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
    >
      {/* TITRE */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-center text-white">
        ⛪ Paroisses du diocèse de{" "}
        <span className="text-blue-300">
          {selectedDiocese.name}
        </span>{" "}
        ({selectedCountry.label})
      </h1>

      <p className="text-gray-300 text-center mb-10">
        Découvrez les paroisses et les responsables de ce diocèse.
      </p>

      {/* ================================================= */}
      {/* SECTION 1 : LISTE DES PAROISSES */}
      {/* ================================================= */}

      <section className="w-full max-w-5xl mb-16">
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-8 text-white">
          🏛️ Les paroisses
        </h2>

        {parishes.length === 0 ? (
          <p className="text-center text-gray-400">
            Aucune paroisse enregistrée dans ce diocèse.
          </p>
        ) : (
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
            {parishes.map((parish, index) => (
              <div
                key={`${parish}-${index}`}
                className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 perspective"
                onClick={() => handleParishClick(parish)}
              >
                <motion.div
                  className="card-3d w-full h-full rounded-full cursor-pointer"
                  whileHover={{ rotateY: 180 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="card-face bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-400 font-semibold text-sm sm:text-base md:text-lg flex items-center justify-center text-center rounded-full px-2">
                    {parish}
                  </div>

                  <div className="card-face card-back bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-400 font-semibold text-xs sm:text-sm md:text-base flex items-center justify-center text-center rounded-full px-2">
                    Liste des membres
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ================================================= */}
      {/* SECTION 2 : RESPONSABLES DU DIOCÈSE */}
      {/* ================================================= */}

      <section className="w-full max-w-5xl">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
            👥 Responsables du diocèse
          </h2>

          <p className="text-gray-300 mt-2">
            Liste des responsables et des paroisses dont ils ont
            la charge.
          </p>
        </div>

        {/* CHARGEMENT */}
        {loadingResponsables && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400 mx-auto mb-4" />

            <p className="text-gray-300">
              Chargement des responsables...
            </p>
          </div>
        )}

        {/* ERREUR */}
        {!loadingResponsables && errorResponsables && (
          <div className="bg-red-900/30 border border-red-500 text-red-200 rounded-xl p-5 text-center">
            {errorResponsables}
          </div>
        )}

        {/* LISTE DES RESPONSABLES */}
        {!loadingResponsables &&
          !errorResponsables &&
          responsables.length > 0 && (
            <div className="space-y-8">
              {Object.entries(responsablesParParoisse).map(
                ([parish, leaders]) => (
                  <div
                    key={parish}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 sm:p-6"
                  >
                    <h3 className="text-lg sm:text-xl font-bold text-blue-700 dark:text-blue-400 mb-5 border-b border-gray-200 dark:border-gray-700 pb-3">
                      ⛪ {parish}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {leaders.map((responsable) => (
                        <motion.div
                          key={responsable.id}
                          className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-2xl">
                              👤
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-900 dark:text-white">
                                {responsable.prenom}{" "}
                                {responsable.nom}
                              </p>

                              <p className="text-sm text-blue-700 dark:text-blue-300">
                                {responsable.level === "diocesan"
                                  ? "Responsable diocésain"
                                  : "Responsable paroissial"}
                              </p>
                            </div>
                          </div>

                          {responsable.is_primary && (
                            <div className="mt-3">
                              <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                Premier responsable
                              </span>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )}

        {/* AUCUN RESPONSABLE */}
        {!loadingResponsables &&
          !errorResponsables &&
          responsables.length === 0 && (
            <div className="bg-white/10 border border-white/20 rounded-xl p-8 text-center">
              <p className="text-4xl mb-3">👥</p>

              <p className="text-gray-200 font-semibold">
                Aucun responsable enregistré pour ce diocèse.
              </p>
            </div>
          )}
      </section>

      {/* STYLES 3D */}
      <style>{`
        .perspective {
          perspective: 1000px;
        }

        .card-3d {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          transition: transform 0.6s;
        }

        .card-3d:hover {
          transform: rotateY(180deg);
        }

        .card-face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 9999px;
        }

        .card-back {
          transform: rotateY(180deg);
        }
      `}</style>
    </motion.div>
  );
};

export default Paroisse;