import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/utils/axios";

type Inscrit = {
  nom: string;
  prenom: string;
};

type Responsable = {
  id: number;
  user_id: number;
  nom: string;
  prenom: string;
  level: string;
  is_primary: boolean;
};

const Inscrits: React.FC = () => {
  const { country, diocese, paroisse } = useParams<{
    country: string;
    diocese: string;
    paroisse: string;
  }>();

  const [inscrits, setInscrits] = useState<Inscrit[]>([]);
  const [responsables, setResponsables] = useState<Responsable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      if (!country || !diocese || !paroisse) {
        setError("Les informations de localisation sont incomplètes.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const paysUrl = encodeURIComponent(country);
        const dioceseUrl = encodeURIComponent(diocese);
        const paroisseUrl = encodeURIComponent(paroisse);

        const [membresResponse, responsablesResponse] = await Promise.all([
          api.get<Inscrit[]>(
            `/api/inscrits/${paysUrl}/${dioceseUrl}/${paroisseUrl}`
          ),
          api.get<Responsable[]>(
            `/api/hierarchy/responsables-paroisse/${paysUrl}/${dioceseUrl}/${paroisseUrl}`
          )
        ]);

        if (!cancelled) {
          setInscrits(Array.isArray(membresResponse.data) ? membresResponse.data : []);
          setResponsables(
            Array.isArray(responsablesResponse.data)
              ? responsablesResponse.data
              : []
          );
        }
      } catch (err: any) {
        console.error("Erreur chargement paroisse :", err);

        if (!cancelled) {
          setError(
            err.response?.data?.detail ||
            "Impossible de charger les responsables et les membres de cette paroisse."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [country, diocese, paroisse]);

  if (loading) {
    return <div className="text-center py-10">⏳ Chargement des données...</div>;
  }

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center px-4 py-10 text-gray-900 dark:text-white"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-center">
        👥 Vie paroissiale
      </h1>

      <p className="text-center mb-10 text-gray-600 dark:text-gray-300">
        {country} — {diocese} — {paroisse}
      </p>

      {error && (
        <p className="text-red-600 dark:text-red-400 text-center mb-8">
          {error}
        </p>
      )}

      {!error && (
        <>
          {/* RESPONSABLES EN PREMIER */}
          <section className="w-full max-w-3xl mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-center mb-6">
              ⛪ Responsables de la paroisse
            </h2>

            {responsables.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400">
                Aucun responsable paroissial enregistré.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {responsables.map((responsable) => (
                  <motion.div
                    key={responsable.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
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
                          Responsable paroissial
                        </p>
                      </div>
                    </div>

                    {responsable.is_primary && (
                      <span className="inline-block mt-3 text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Premier responsable
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          {/* MEMBRES ORDINAIRES */}
          <section className="w-full max-w-2xl">
            <h2 className="text-xl sm:text-2xl font-bold text-center mb-6">
              👥 Membres de la paroisse
            </h2>

            <p className="mb-4 text-center font-semibold">
              Nombre de membres : {inscrits.length}
            </p>

            {inscrits.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400">
                Aucun autre membre validé pour cette paroisse.
              </p>
            ) : (
              <ul className="w-full divide-y divide-gray-300 dark:divide-gray-700">
                {inscrits.map((inscrit, index) => (
                  <li
                    key={`${inscrit.nom}-${inscrit.prenom}-${index}`}
                    className="py-3 flex justify-between items-center px-4 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  >
                    <span className="font-semibold">{inscrit.nom}</span>
                    <span>{inscrit.prenom}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </motion.div>
  );
};

export default Inscrits;
