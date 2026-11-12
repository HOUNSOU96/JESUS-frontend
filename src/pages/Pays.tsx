import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { continents } from "../data";
import UserAvatar from "../components/UserAvatar";
import api from "../utils/axios";

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

  const dioceses = selectedCountry.dioceses || [];

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
      className="relative z-20 min-h-screen w-full px-4 py-8 sm:px-6 sm:py-12 text-white"
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -25 }}
      transition={{ duration: 0.45 }}
    >
      <div className="mx-auto max-w-6xl">

        {/* EN-TÊTE DU PAYS */}

        <header className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-2 text-sm text-blue-100">
            <span>🌍</span>
            <span>{continent.name}</span>
          </div>

          <h1 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            {selectedCountry.label}
          </h1>

          <p className="mt-3 text-sm sm:text-base text-gray-300">
            Découvrez les diocèses et les responsables nationaux.
          </p>

          <div className="mx-auto mt-6 h-1 w-20 rounded-full bg-blue-500" />
        </header>

        {/* INDICATEURS */}

        <div className="mb-12 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-5 text-center shadow-lg">
            <div className="text-3xl mb-2">🏛️</div>
            <p className="text-3xl font-extrabold text-white">
              {dioceses.length}
            </p>
            <p className="mt-1 text-sm text-gray-300">
              {dioceses.length > 1 ? "Diocèses" : "Diocèse"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 p-5 text-center shadow-lg">
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
                  className="group flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-5 text-left shadow-lg backdrop-blur-sm transition-all hover:border-blue-400/60 hover:bg-blue-900/30"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-500/20 text-3xl transition group-hover:bg-blue-500/30">
                    🏛️
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-white text-base sm:text-lg">
                      {diocese.name}
                    </h3>
                    <p className="mt-1 text-xs text-gray-300">
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

          {/* CARTES DES RESPONSABLES */}

          {!loading && !error && responsables.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {responsables.map((responsable, index) => (
                <motion.article
                  key={responsable.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.05, 0.35) }}
                  className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-5 shadow-lg backdrop-blur-sm transition hover:border-blue-400/40 hover:bg-white/15"
                >
                  <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-blue-500/10" />

                  <div className="relative flex items-center gap-4">
                    <UserAvatar
                      photoUrl={responsable.photo_url}
                      name={`${responsable.prenom} ${responsable.nom}`}
                    />

                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-white text-base sm:text-lg break-words">
                        {responsable.prenom} {responsable.nom}
                      </h3>

                      <p className="mt-1 text-sm font-semibold text-blue-300">
                        {responsable.role_name}
                      </p>

                      {responsable.effective_from && (
                        <p className="mt-1 text-xs text-gray-300">
                          Prise d’effet : {formatResponsibilityDate(responsable.effective_from)}
                        </p>
                      )}

                      {responsable.ended_at && (
                        <p className="mt-1 text-xs text-amber-300">
                          Fin de responsabilité : {formatResponsibilityDate(responsable.ended_at)}
                        </p>
                      )}

                      {responsable.matricule && (
                        <p className="mt-1 text-xs text-gray-300">
                          Matricule : {responsable.matricule}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="relative mt-5 flex flex-wrap items-center gap-2">
                    {responsable.is_primary && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-green-400/20 bg-green-500/15 px-3 py-1 text-xs font-semibold text-green-200">
                        ✓ Premier responsable
                      </span>
                    )}

                    {responsable.statut && (
                      <span className="rounded-full border border-blue-400/20 bg-blue-500/15 px-3 py-1 text-xs font-medium text-blue-200">
                        {responsable.statut}
                      </span>
                    )}
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </section>
      </div>
    </motion.main>
  );
};

export default Pays;
