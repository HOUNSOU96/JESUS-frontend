import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { continents } from "../data";
import UserAvatar from "../components/UserAvatar";
import api from "../utils/axios";

interface EcclesiasticalJurisdiction {
  id: number;
  name: string;
  kind: string;
}

interface NationalResponsible {
  id: number;
  user_id: number;
  nom: string;
  prenom: string;
  matricule?: string | null;
  photo_url?: string | null;
  statut?: string | null;
  level: string;
  role_name: string;
  country?: string | null;
  is_primary: boolean;
  effective_from?: string | null;
  ended_at?: string | null;
}

const formatResponsibilityDate = (value?: string | null): string => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const Pays: React.FC = () => {
  const { country } = useParams<{ country: string }>();
  const navigate = useNavigate();

  const [responsables, setResponsables] = useState<NationalResponsible[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [dioceses, setDioceses] = useState<EcclesiasticalJurisdiction[]>([]);
  const [loadingDioceses, setLoadingDioceses] = useState(true);


  const continent = continents.find((c) =>
    c.countries.some(
      (p) => p.name.toLowerCase() === country?.toLowerCase()
    )
  );

  const selectedCountry = continent?.countries.find(
    (p) => p.name.toLowerCase() === country?.toLowerCase()
  );


  useEffect(() => {
    if (!country || !selectedCountry) {
      setDioceses([]);
      setLoadingDioceses(false);
      return;
    }

    let cancelled = false;

    const fetchDioceses = async () => {
      setLoadingDioceses(true);
      try {
        const response = await api.get<EcclesiasticalJurisdiction[]>(
          `/api/geography/jurisdictions?country=${encodeURIComponent(country.toLowerCase())}`
        );

        if (!cancelled) {
          setDioceses(Array.isArray(response.data) ? response.data : []);
        }
      } catch (err) {
        console.error("Erreur chargement des diocèses :", err);
        if (!cancelled) setDioceses([]);
      } finally {
        if (!cancelled) setLoadingDioceses(false);
      }
    };

    fetchDioceses();

    return () => {
      cancelled = true;
    };
  }, [country, selectedCountry]);

  useEffect(() => {
    if (!country || !selectedCountry) {
      setResponsables([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchResponsables = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get<NationalResponsible[]>(
          `/api/hierarchy/responsables-national/${encodeURIComponent(country)}`
        );

        if (!cancelled) {
          setResponsables(
            Array.isArray(response.data) ? response.data : []
          );
        }
      } catch (err) {
        console.error("Erreur chargement responsables nationaux :", err);

        if (!cancelled) {
          setError(
            "Impossible de charger les responsables nationaux de ce pays."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchResponsables();

    return () => {
      cancelled = true;
    };
  }, [country, selectedCountry, retry]);

  if (!continent || !selectedCountry) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center rounded-3xl border border-white/10 bg-white/10 p-10">
          <div className="text-5xl mb-4">🌍</div>
          <h2 className="text-xl font-bold text-white">
            Pays non trouvé
          </h2>
          <button
            onClick={() => navigate("/")}
            className="mt-5 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500 transition"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }



  const handleDioceseClick = (diocese: string) => {
    navigate(
      `/paroisses/${encodeURIComponent(country!)}/${encodeURIComponent(diocese)}`
    );
  };

  const handleRetry = () => {
    setRetry((previous) => previous + 1);
  };

  return (
    <motion.main
      className="hierarchy-page relative z-20 min-h-screen w-full px-4 py-8 sm:px-6 sm:py-12"
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -25 }}
      transition={{ duration: 0.45 }}
    >
      <div className="mx-auto max-w-6xl">

        {/* EN-TÊTE DU PAYS */}

        <header className="mb-12 text-center">
          <div className="gold-frame inline-flex items-center gap-2 rounded-full bg-white/80 px-5 py-2 text-sm text-amber-800 dark:bg-gray-900/90 dark:text-amber-300">
            <span>🌍</span>
            <span>{continent.name}</span>
          </div>

          <h1 className="hierarchy-title mt-5 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            {selectedCountry.label}
          </h1>

          <p className="hierarchy-description mt-3 text-sm sm:text-base">
            Découvrez les diocèses et les responsables nationaux.
          </p>

          <div className="gold-divider" />
        </header>

        {/* RESPONSABLES NATIONAUX */}

        <section>
          <div className="mb-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold">
              👥 Responsables nationaux
            </h2>
            <p className="mt-2 text-sm text-gray-300">
              Les personnes chargées des responsabilités nationales.
            </p>
          </div>

          {/* CHARGEMENT */}

          {loading && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/10 py-12">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-blue-400" />
              <p className="mt-4 text-sm text-gray-300">
                Chargement des responsables...
              </p>
            </div>
          )}

          {/* ERREUR */}

          {!loading && error && (
            <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-8 text-center">
              <div className="text-4xl mb-3">⚠️</div>
              <p className="text-red-200">{error}</p>

              <button
                type="button"
                onClick={handleRetry}
                className="mt-5 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-500"
              >
                Réessayer
              </button>
            </div>
          )}

          {/* AUCUN RESPONSABLE */}

          {!loading && !error && responsables.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/10 p-10 text-center">
              <div className="text-5xl mb-4">👥</div>
              <h3 className="font-bold text-white text-lg">
                Aucun responsable enregistré
              </h3>
              <p className="mt-2 text-sm text-gray-300">
                Aucun responsable national actif n'est actuellement affecté à ce pays.
              </p>
            </div>
          )}

          {/* RESPONSABLE PRINCIPAL ET AUTRES MEMBRES DU BUREAU */}

          {!loading && !error && responsables.length > 0 && (() => {
            const principal =
              responsables.find((r) => r.is_primary) || responsables[0];

            const autres = responsables.filter(
              (r) => r.id !== principal.id
            );

            return (
              <div className="space-y-7">
                <motion.article
                  key={principal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="gold-frame gold-corner overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 via-white to-yellow-100 p-4 shadow-xl dark:from-gray-900 dark:via-gray-900 dark:to-amber-950/30 sm:p-6"
                >
                  <div className="grid items-center gap-6 md:grid-cols-2">
                    <div className="relative h-[65vh] min-h-[340px] max-h-[680px] w-full overflow-hidden rounded-2xl border-4 border-amber-400 bg-amber-100 shadow-xl dark:bg-gray-800">
                      <div className="absolute inset-0 flex items-center justify-center text-6xl font-black text-amber-700 dark:text-amber-300">
                        {(principal.prenom?.[0] || "")}{(principal.nom?.[0] || "")}
                      </div>
                      {principal.photo_url && (
                        <img
                          src={principal.photo_url}
                          alt={`Portrait de ${principal.prenom} ${principal.nom}`}
                          className="absolute inset-0 h-full w-full object-cover"
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                      )}
                    </div>

                    <div className="px-2 py-5 text-center md:text-left">
                      <p className="text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-300">
                        Confrérie Saint Enfant Jésus
                      </p>
                      <h3 className="mt-4 break-words text-3xl font-black text-gray-900 dark:text-white sm:text-4xl">
                        {principal.prenom} {principal.nom}
                      </h3>
                      <p className="mt-3 text-xl font-bold text-amber-700 dark:text-amber-300">
                        {principal.role_name}
                      </p>
                      {principal.matricule && (
                        <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                          Matricule : {principal.matricule}
                        </p>
                      )}
                      {principal.effective_from && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                          Prise d’effet : {formatResponsibilityDate(principal.effective_from)}
                        </p>
                      )}
                      {principal.ended_at && (
                        <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                          Fin de responsabilité : {formatResponsibilityDate(principal.ended_at)}
                        </p>
                      )}
                      <span className="mt-5 inline-flex rounded-full border border-amber-400/40 bg-amber-100 px-4 py-2 text-xs font-bold text-amber-900 dark:bg-amber-500/15 dark:text-amber-200">
                        ★ Responsable national principal
                      </span>
                    </div>
                  </div>
                </motion.article>

                {autres.length > 0 && (
                  <div>
                    <h3 className="mb-5 text-xl font-extrabold text-gray-900 dark:text-white">
                      Autres membres du bureau national
                    </h3>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      {autres.map((responsable, index) => (
                        <motion.article
                          key={responsable.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="gold-frame flex items-center gap-4 rounded-2xl bg-white/90 p-5 shadow-lg dark:bg-gray-900/90"
                        >
                          <UserAvatar
                            photoUrl={responsable.photo_url}
                            name={`${responsable.prenom} ${responsable.nom}`}
                          />
                          <div className="min-w-0">
                            <h4 className="break-words font-bold text-gray-900 dark:text-white">
                              {responsable.prenom} {responsable.nom}
                            </h4>
                            <p className="mt-1 text-sm font-semibold text-amber-700 dark:text-amber-300">
                              {responsable.role_name}
                            </p>
                            {responsable.matricule && (
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Matricule : {responsable.matricule}
                              </p>
                            )}
                          </div>
                        </motion.article>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}


        </section>

{/* INDICATEURS */}

        <div className="mb-12 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <div className="gold-frame rounded-2xl bg-white/80 p-5 text-center shadow-lg dark:bg-gray-900/85">
            <div className="text-3xl mb-2">🏛️</div>
            <p className="text-3xl font-extrabold text-white">
              {dioceses.length}
            </p>
            <p className="mt-1 text-sm text-gray-300">
              {dioceses.length > 1 ? "Diocèses" : "Diocèse"}
            </p>
          </div>

          <div className="gold-frame rounded-2xl bg-white/80 p-5 text-center shadow-lg dark:bg-gray-900/85">
            <div className="text-3xl mb-2">👥</div>
            <p className="text-3xl font-extrabold text-white">
              {loading ? "…" : responsables.length}
            </p>
            <p className="mt-1 text-sm text-gray-300">
              Responsables nationaux
            </p>
          </div>
        </div>

                        {/* DIOCÈSES */}

        <section className="mb-16">
          <div className="mb-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold">
              🏛️ Les diocèses
            </h2>
            <p className="mt-2 text-sm text-gray-300">
              Sélectionnez un diocèse pour découvrir ses paroisses.
            </p>
          </div>

          {dioceses.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/10 p-8 text-center">
              <div className="text-4xl mb-3">🏛️</div>
              <p className="text-gray-300">
                Aucun diocèse enregistré pour ce pays.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {dioceses.map((diocese, index) => (
                <motion.button
                  key={diocese.name}
                  type="button"
                  onClick={() => handleDioceseClick(diocese.name)}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.04, 0.3) }}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className="gold-frame gold-corner group flex items-center gap-4 rounded-2xl bg-white/85 p-5 text-left shadow-lg backdrop-blur-sm transition-all hover:bg-amber-50 dark:bg-gray-900/85 dark:hover:bg-gray-800"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-500/20 text-3xl transition group-hover:bg-blue-500/30">
                    🏛️
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-white text-base sm:text-lg">
                      {diocese.name}
                    </h3>
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                      Consulter les paroisses
                    </p>
                  </div>

                  <span className="text-xl text-blue-300 transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </motion.button>
              ))}
            </div>
          )}
        </section>

      </div>
    </motion.main>
  );
};

export default Pays;
