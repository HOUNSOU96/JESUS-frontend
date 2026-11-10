import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/utils/axios";

type Inscrit = {
  id: number;
  nom: string;
  prenom: string;
  matricule?: string | null;
  sexe?: string | null;
  statut?: string | null;
  profession?: string | null;
  date_integration?: string | null;
  pays?: string | null;
  diocese?: string | null;
  paroisse?: string | null;
  date_inscription?: string | null;
  email?: string | null;
  numero_whatsapp?: string | null;
  is_verified?: boolean;
  is_active?: boolean;
  is_blocked?: boolean;
};

type Responsable = {
  id: number;
  user_id: number;
  nom: string;
  prenom: string;
  matricule?: string | null;
  statut?: string | null;
  level: string;
  role_name: string;
  is_primary: boolean;
};

const formatDate = (value?: string | null) => {
  if (!value) return "Non renseignée";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("fr-FR");
};

const Info = ({
  label,
  value
}: {
  label: string;
  value?: string | null;
}) => (
  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 py-2 border-b border-gray-100 dark:border-gray-700">
    <span className="text-sm text-gray-500 dark:text-gray-400">
      {label}
    </span>

    <span className="text-sm font-medium break-words sm:text-right">
      {value || "Non renseigné"}
    </span>
  </div>
);

const Inscrits: React.FC = () => {
  const { country, diocese, paroisse } = useParams<{
    country: string;
    diocese: string;
    paroisse: string;
  }>();

  const [inscrits, setInscrits] = useState<Inscrit[]>([]);
  const [responsables, setResponsables] = useState<Responsable[]>([]);

  const [loading, setLoading] = useState(true);
  const [membresError, setMembresError] = useState("");
  const [responsablesError, setResponsablesError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      if (!country || !diocese || !paroisse) {
        setInscrits([]);
        setResponsables([]);

        setMembresError(
          "Les informations de localisation sont incomplètes."
        );
        setResponsablesError(
          "Les informations de localisation sont incomplètes."
        );

        setLoading(false);
        return;
      }

      setLoading(true);

      setMembresError("");
      setResponsablesError("");

      setInscrits([]);
      setResponsables([]);

      const paysUrl = encodeURIComponent(country);
      const dioceseUrl = encodeURIComponent(diocese);
      const paroisseUrl = encodeURIComponent(paroisse);

      // Chargement indépendant des membres.
      const chargerMembres = async () => {
        try {
          const response = await api.get<Inscrit[]>(
            `/api/inscrits/${paysUrl}/${dioceseUrl}/${paroisseUrl}`
          );

          if (!cancelled) {
            setInscrits(
              Array.isArray(response.data) ? response.data : []
            );
          }
        } catch (err: any) {
          console.error("Erreur chargement membres :", err);

          if (!cancelled) {
            setMembresError(
              err.response?.data?.detail ||
              "Impossible de charger les membres."
            );
          }
        }
      };

      // Chargement indépendant des responsables.
      const chargerResponsables = async () => {
        try {
          const response = await api.get<Responsable[]>(
            `/api/hierarchy/responsables-paroisse/${paysUrl}/${dioceseUrl}/${paroisseUrl}`
          );

          if (!cancelled) {
            setResponsables(
              Array.isArray(response.data) ? response.data : []
            );
          }
        } catch (err: any) {
          console.error("Erreur chargement responsables :", err);

          if (!cancelled) {
            setResponsablesError(
              err.response?.data?.detail ||
              "Impossible de charger les responsables."
            );
          }
        }
      };

      try {
        await Promise.allSettled([
          chargerResponsables(),
          chargerMembres()
        ]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [country, diocese, paroisse]);

  if (loading) {
    return (
      <div className="text-center py-10">
        ⏳ Chargement des données...
      </div>
    );
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

      {/* RESPONSABLES */}

      <section className="w-full max-w-4xl mb-12">
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-6">
          ⛪ Responsables de la paroisse
        </h2>

        {responsablesError && (
          <p className="text-red-600 text-center mb-4">
            {responsablesError}
          </p>
        )}

        {!responsablesError && responsables.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400">
            Aucun responsable paroissial enregistré.
          </p>
        )}

        {responsables.length > 0 && (
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
                      {responsable.role_name}
                    </p>

                    {responsable.matricule && (
                      <p className="text-xs text-gray-500 mt-1">
                        Matricule : {responsable.matricule}
                      </p>
                    )}
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

      {/* MEMBRES */}

      <section className="w-full max-w-4xl">
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-6">
          👥 Membres de la paroisse
        </h2>

        {membresError && (
          <p className="text-red-600 text-center mb-4">
            {membresError}
          </p>
        )}

        {!membresError && (
          <>
            <p className="mb-6 text-center font-semibold">
              Nombre de membres : {inscrits.length}
            </p>

            {inscrits.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400">
                Aucun autre membre validé pour cette paroisse.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {inscrits.map((inscrit) => (
                  <motion.article
                    key={inscrit.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-2xl">
                        👤
                      </div>

                      <div>
                        <h3 className="font-bold text-lg">
                          {inscrit.prenom} {inscrit.nom}
                        </h3>

                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {inscrit.matricule || "Matricule non attribué"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Info label="Sexe" value={inscrit.sexe} />

                      <Info label="Statut" value={inscrit.statut} />

                      <Info label="Profession" value={inscrit.profession} />

                      <Info
                        label="Date d'intégration"
                        value={formatDate(inscrit.date_integration)}
                      />

                      <Info label="Pays" value={inscrit.pays} />

                      <Info label="Diocèse" value={inscrit.diocese} />

                      <Info label="Paroisse" value={inscrit.paroisse} />

                      <Info
                        label="Date d'inscription"
                        value={formatDate(inscrit.date_inscription)}
                      />

                      {/* Informations privées uniquement si le backend les autorise. */}
                      {inscrit.email !== undefined && (
                        <>
                          <div className="pt-3 mt-3 border-t border-blue-200 dark:border-blue-800">
                            <p className="text-sm font-bold text-blue-700 dark:text-blue-300 mb-2">
                              🔐 Informations réservées aux responsables
                            </p>
                          </div>

                          <Info label="Email" value={inscrit.email} />

                          <Info
                            label="WhatsApp"
                            value={inscrit.numero_whatsapp}
                          />

                          <Info
                            label="Compte vérifié"
                            value={inscrit.is_verified ? "Oui" : "Non"}
                          />

                          <Info
                            label="Compte actif"
                            value={inscrit.is_active ? "Oui" : "Non"}
                          />

                          <Info
                            label="Compte bloqué"
                            value={inscrit.is_blocked ? "Oui" : "Non"}
                          />
                        </>
                      )}
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </motion.div>
  );
};

export default Inscrits;
