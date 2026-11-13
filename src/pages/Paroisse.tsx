import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { continents } from "../data";
import api from "../utils/axios";
import UserAvatar from "../components/UserAvatar";

interface EcclesiasticalJurisdiction {
  id: number;
  name: string;
  kind: string;
}

interface GeographicParish {
  id: number;
  name: string;
  city_id: number | null;
}

interface DiocesanResponsible {
  id: number;
  user_id: number;
  nom: string;
  prenom: string;
  matricule?: string;
  photo_url?: string | null;
  statut?: string;
  level: string;
  role_name: string;
  country?: string;
  diocese?: string | null;
  parish: string | null;
  is_primary: boolean;
  is_active?: boolean;
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

const Paroisse: React.FC = () => {
  const { country, diocese } = useParams<{
    country: string;
    diocese: string;
  }>();

  const navigate = useNavigate();

  const [responsables, setResponsables] = useState<
    DiocesanResponsible[]
  >([]);

  const [loadingResponsables, setLoadingResponsables] = useState(true);
  const [errorResponsables, setErrorResponsables] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [selectedDiocese, setSelectedDiocese] =
    useState<EcclesiasticalJurisdiction | null>(null);
  const [parishes, setParishes] = useState<string[]>([]);
  const [loadingGeography, setLoadingGeography] = useState(true);


  // ============================================================
  // RECHERCHE DU TERRITOIRE
  // ============================================================

  const continent = continents.find((item) =>
    item.countries.some(
      (itemCountry) =>
        itemCountry.name.toLowerCase() === country?.toLowerCase()
    )
  );

  const selectedCountry = continent?.countries.find(
    (item) => item.name.toLowerCase() === country?.toLowerCase()
  );



  useEffect(() => {
    if (!country || !diocese || !selectedCountry) {
      setSelectedDiocese(null);
      setParishes([]);
      setLoadingGeography(false);
      return;
    }

    let cancelled = false;

    const loadGeography = async () => {
      setLoadingGeography(true);
      setSelectedDiocese(null);
      setParishes([]);

      try {
        const jurisdictionsResponse =
          await api.get<EcclesiasticalJurisdiction[]>(
            `/api/geography/jurisdictions?country=${encodeURIComponent(country.toLowerCase())}`
          );

        const jurisdictions = Array.isArray(jurisdictionsResponse.data)
          ? jurisdictionsResponse.data
          : [];

        const found = jurisdictions.find(
          (item) => item.name.trim().toLowerCase() === diocese.trim().toLowerCase()
        );

        if (!found) {
          if (!cancelled) setSelectedDiocese(null);
          return;
        }

        if (!cancelled) setSelectedDiocese(found);

        const parishesResponse = await api.get<GeographicParish[]>(
          `/api/geography/parishes?jurisdiction_id=${found.id}`
        );

        if (!cancelled) {
          const records = Array.isArray(parishesResponse.data)
            ? parishesResponse.data
            : [];
          setParishes(records.map((item) => item.name));
        }
      } catch (error) {
        console.error("Erreur chargement de l'organisation géographique :", error);
        if (!cancelled) {
          setSelectedDiocese(null);
          setParishes([]);
        }
      } finally {
        if (!cancelled) setLoadingGeography(false);
      }
    };

    loadGeography();

    return () => {
      cancelled = true;
    };
  }, [country, diocese, selectedCountry]);

  // ============================================================
  // CHARGEMENT DES RESPONSABLES
  // ============================================================


  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!country || !diocese || !selectedDiocese) {
        setResponsables([]);
        setLoadingResponsables(false);
        return;
      }

      setLoadingResponsables(true);
      setErrorResponsables("");

      try {
        const response = await api.get(
          `/api/hierarchy/responsables/${encodeURIComponent(country)}/${encodeURIComponent(diocese)}`
        );

        if (!Array.isArray(response.data)) {
          throw new Error("Format de réponse inattendu.");
        }

        if (!cancelled) {
          setResponsables(response.data);
        }
      } catch (error) {
        console.error(
          "Erreur lors du chargement des responsables :",
          error
        );

        if (!cancelled) {
          setResponsables([]);
          setErrorResponsables(
            "Impossible de charger les responsables de ce diocèse."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingResponsables(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [country, diocese, selectedDiocese, retryCount]);

  // ============================================================
  // VALIDATION DU TERRITOIRE
  // ============================================================

  if (!continent || !selectedCountry) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center rounded-3xl border border-white/10 bg-white/10 p-8 text-white shadow-xl">
          <div className="text-5xl mb-4">🌍</div>
          <h1 className="text-2xl font-bold mb-2">Pays introuvable</h1>
          <p className="text-gray-300 mb-6">
            Le pays demandé n'existe pas dans notre répertoire.
          </p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 transition"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  if (loadingGeography) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-blue-400" />
          <p className="mt-4">Chargement du diocèse et des paroisses...</p>
        </div>
      </div>
    );
  }

  if (!selectedDiocese) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center rounded-3xl border border-white/10 bg-white/10 p-8 text-white shadow-xl">
          <div className="text-5xl mb-4">⛪</div>
          <h1 className="text-2xl font-bold mb-2">Diocèse introuvable</h1>
          <p className="text-gray-300 mb-6">
            Ce diocèse n'est pas répertorié pour le pays sélectionné.
          </p>
          <button
            type="button"
            onClick={() =>
              navigate(`/pays/${encodeURIComponent(country || "")}`)
            }
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 transition"
          >
            Retour aux diocèses
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // NAVIGATION VERS LES MEMBRES
  // ============================================================

  const handleParishClick = (parish: string) => {
    navigate(
      `/inscrits/${encodeURIComponent(country || "")}/${encodeURIComponent(diocese || "")}/${encodeURIComponent(parish)}`
    );
  };

  // ============================================================
  // ORGANISATION DES RESPONSABLES
  // ============================================================

  const responsablesDiocesains = responsables.filter(
    (responsable) =>
      responsable.level === "diocesan" || !responsable.parish
  );

  const responsablesParoissiaux = responsables.filter(
    (responsable) =>
      responsable.level === "parish" && Boolean(responsable.parish)
  );

  const groupesParoissiaux = responsablesParoissiaux.reduce<
    Record<string, DiocesanResponsible[]>
  >((groups, responsable) => {
    const parish = responsable.parish || "Autre paroisse";

    if (!groups[parish]) {
      groups[parish] = [];
    }

    groups[parish].push(responsable);

    return groups;
  }, {});

  const renderResponsibleCard = (
    responsable: DiocesanResponsible,
    index: number
  ) => (
    <motion.article
      key={responsable.id}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.25) }}
      className="flex items-center gap-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <UserAvatar
        photoUrl={responsable.photo_url}
        name={`${responsable.prenom} ${responsable.nom}`}
      />

      <div className="min-w-0 flex-1">
        <h4 className="font-bold text-gray-900 dark:text-white break-words">
          {responsable.prenom} {responsable.nom}
        </h4>

        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
          {responsable.role_name}
        </p>

        {responsable.effective_from && (
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            Prise d’effet : {formatResponsibilityDate(responsable.effective_from)}
          </p>
        )}

        {responsable.ended_at && (
          <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
            Fin de responsabilité : {formatResponsibilityDate(responsable.ended_at)}
          </p>
        )}

        {responsable.is_primary && (
          <span className="inline-flex mt-2 items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/40 px-3 py-1 text-xs font-semibold text-green-800 dark:text-green-300">
            ✓ Premier responsable
          </span>
        )}
      </div>
    </motion.article>
  );

  // ============================================================
  // AFFICHAGE
  // ============================================================

  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen px-4 py-8 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">

        {/* EN-TÊTE */}

        <header className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-300/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-200 mb-5">
            🌍 {selectedCountry.label}
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">
            Paroisses du diocèse
          </h1>

          <p className="mt-3 text-2xl sm:text-3xl font-bold text-blue-300">
            {selectedDiocese.name}
          </p>

          <p className="mt-3 max-w-2xl mx-auto text-sm sm:text-base text-gray-300">
            Retrouvez les paroisses, consultez leurs membres et découvrez
            les responsables de votre diocèse.
          </p>
        </header>

        {/* INDICATEURS */}

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-5 text-center backdrop-blur-sm">
            <p className="text-3xl font-extrabold text-white">
              {parishes.length}
            </p>
            <p className="mt-1 text-sm text-gray-300">
              {parishes.length > 1 ? "Paroisses répertoriées" : "Paroisse répertoriée"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 p-5 text-center backdrop-blur-sm">
            <p className="text-3xl font-extrabold text-white">
              {loadingResponsables ? "…" : responsables.length}
            </p>
            <p className="mt-1 text-sm text-gray-300">
              Responsables actifs
            </p>
          </div>
        </section>

        {/* PAROISSES */}

        <section className="mb-16">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">
                🏛️ Les paroisses
              </h2>
              <p className="text-sm text-gray-300 mt-1">
                Sélectionnez une paroisse pour consulter ses membres.
              </p>
            </div>
          </div>

          {parishes.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/10 p-8 text-center">
              <div className="text-4xl mb-3">🏛️</div>
              <p className="font-semibold text-white">
                Aucune paroisse enregistrée
              </p>
              <p className="text-sm text-gray-300 mt-2">
                Aucune paroisse n'est actuellement répertoriée dans ce diocèse.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {parishes.map((parish, index) => (
                <motion.button
                  key={`${parish}-${index}`}
                  type="button"
                  onClick={() => handleParishClick(parish)}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className="group min-h-40 rounded-2xl border border-white/10 bg-white p-6 text-left shadow-lg transition-all hover:border-blue-300 hover:shadow-blue-900/20 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl transition-colors group-hover:bg-blue-200">
                      ⛪
                    </span>
                    <span className="text-blue-600 text-xl transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-gray-900">
                    {parish}
                  </h3>

                  <p className="mt-2 text-sm text-gray-500">
                    Consulter les membres
                  </p>
                </motion.button>
              ))}
            </div>
          )}
        </section>

        {/* RESPONSABLES */}

        <section>
          <div className="mb-7">
            <h2 className="text-2xl font-bold text-white">
              👥 Responsables du diocèse
            </h2>
            <p className="mt-2 text-sm text-gray-300">
              Les personnes chargées de l'organisation et de
              l'accompagnement des communautés.
            </p>
          </div>

          {/* CHARGEMENT */}

          {loadingResponsables && (
            <div className="rounded-2xl border border-white/10 bg-white/10 p-10 text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-blue-400" />
              <p className="mt-4 text-gray-200">
                Chargement des responsables...
              </p>
            </div>
          )}

          {/* ERREUR */}

          {!loadingResponsables && errorResponsables && (
            <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-6 text-center">
              <p className="font-semibold text-red-200">
                {errorResponsables}
              </p>

              <button
                type="button"
                onClick={() => setRetryCount((count) => count + 1)}
                className="mt-4 rounded-xl bg-red-600 px-5 py-2.5 font-semibold text-white hover:bg-red-700 transition"
              >
                Réessayer
              </button>
            </div>
          )}

          {/* LISTE */}

          {!loadingResponsables &&
            !errorResponsables &&
            responsables.length > 0 && (
              <div className="space-y-10">

                {/* RESPONSABLES DIOCÉSAINS */}

                {responsablesDiocesains.length > 0 && (
                  <div>
                    <div className="mb-5 flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-xl">
                        ⛪
                      </span>
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          Responsabilité diocésaine
                        </h3>
                        <p className="text-xs text-gray-300">
                          {responsablesDiocesains.length} responsable(s)
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {responsablesDiocesains.map(renderResponsibleCard)}
                    </div>
                  </div>
                )}

                {/* RESPONSABLES PAROISSIAUX */}

                {Object.entries(groupesParoissiaux).map(
                  ([parish, leaders]) => (
                    <div key={parish}>
                      <div className="mb-5 flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/20 text-xl">
                          🏛️
                        </span>
                        <div>
                          <h3 className="text-lg font-bold text-white">
                            {parish}
                          </h3>
                          <p className="text-xs text-gray-300">
                            {leaders.length} responsable(s)
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {leaders.map(renderResponsibleCard)}
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
              <div className="rounded-2xl border border-white/10 bg-white/10 p-10 text-center">
                <div className="text-5xl mb-4">👥</div>
                <h3 className="font-bold text-white">
                  Aucun responsable enregistré
                </h3>
                <p className="mt-2 text-sm text-gray-300">
                  Aucun responsable actif n'est actuellement affecté à ce diocèse.
                </p>
              </div>
            )}
        </section>
      </div>
    </motion.main>
  );
};

export default Paroisse;
