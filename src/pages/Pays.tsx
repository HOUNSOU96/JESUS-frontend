import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { continents } from "../data";
import api from "../utils/axios";

interface NationalResponsible {
  id: number;
  user_id: number;
  nom: string;
  prenom: string;
  level: string;
  role_name: string;
  is_primary: boolean;
}

const Pays: React.FC = () => {
  const { country } = useParams<{ country: string }>();
  const navigate = useNavigate();

  const [responsables, setResponsables] = useState<NationalResponsible[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const continent = continents.find((c) =>
    c.countries.some((p) => p.name.toLowerCase() === country?.toLowerCase())
  );

  const selectedCountry = continent?.countries.find(
    (p) => p.name.toLowerCase() === country?.toLowerCase()
  );

  useEffect(() => {
    if (!country || !selectedCountry) return;

    let cancelled = false;

    const fetchResponsables = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get<NationalResponsible[]>(
          `/api/hierarchy/responsables-national/${encodeURIComponent(country)}`
        );

        if (!cancelled) {
          setResponsables(Array.isArray(response.data) ? response.data : []);
        }
      } catch (err) {
        console.error("Erreur chargement responsables nationaux :", err);
        if (!cancelled) {
          setError("Impossible de charger les responsables nationaux de ce pays.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchResponsables();

    return () => {
      cancelled = true;
    };
  }, [country, selectedCountry]);

  if (!continent || !selectedCountry) {
    return <div className="text-center py-10">Pays non trouvé</div>;
  }

  const dioceses = selectedCountry.dioceses || [];

  const handleDioceseClick = (diocese: string) => {
    navigate(`/paroisses/${encodeURIComponent(country!)}/${encodeURIComponent(diocese)}`);
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center px-4 py-10 text-white dark:text-white z-20"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-10 text-center">
        🌍 {selectedCountry.label}
      </h1>

      <section className="w-full max-w-5xl mb-16">
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-8">
          🏛️ Les diocèses
        </h2>

        {dioceses.length === 0 ? (
          <p className="text-center text-gray-300">
            Aucun diocèse enregistré pour ce pays.
          </p>
        ) : (
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
            {dioceses.map((diocese) => (
              <div
                key={diocese.name}
                className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 perspective"
              >
                <motion.div
                  className="card-3d w-full h-full rounded-full cursor-pointer"
                  whileHover={{ rotateY: 180 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDioceseClick(diocese.name)}
                >
                  <div className="card-face bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-400 font-semibold text-base sm:text-lg md:text-xl flex items-center justify-center text-center rounded-full px-2">
                    {diocese.name}
                  </div>

                  <div className="card-face card-back bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-400 font-semibold text-base sm:text-lg md:text-xl flex items-center justify-center text-center rounded-full px-2">
                    Diocèse de
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="w-full max-w-5xl">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-8">
          👥 Responsables nationaux
        </h2>

        {loading && (
          <p className="text-center text-gray-300 py-6">
            Chargement des responsables...
          </p>
        )}

        {!loading && error && (
          <p className="text-center text-red-300 py-6">{error}</p>
        )}

        {!loading && !error && responsables.length === 0 && (
          <p className="text-center text-gray-300 py-6">
            Aucun responsable national enregistré pour ce pays.
          </p>
        )}

        {!loading && !error && responsables.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {responsables.map((responsable) => (
              <div
                key={responsable.id}
                className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl p-5 shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-2xl">
                    👤
                  </div>
                  <div>
                    <p className="font-bold">
                      {responsable.prenom} {responsable.nom}
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {responsable.role_name}
                    </p>
                  </div>
                </div>

                {responsable.is_primary && (
                  <span className="inline-block mt-3 text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Premier responsable
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <style>{`
        .perspective { perspective: 1000px; }
        .card-3d {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          transition: transform 0.6s;
        }
        .card-3d:hover { transform: rotateY(180deg); }
        .card-face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 9999px;
        }
        .card-back { transform: rotateY(180deg); }
      `}</style>
    </motion.div>
  );
};

export default Pays;
