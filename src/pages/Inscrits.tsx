import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/utils/axios";
import UserAvatar from "@/components/UserAvatar";

type Inscrit = {
  id: number;
  nom: string;
  prenom: string;
  photo_url?: string | null;
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
  photo_url?: string | null;
  matricule?: string | null;
  statut?: string | null;
  level: string;
  role_name: string;
  is_primary: boolean;
  effective_from?: string | null;
  ended_at?: string | null;
};

const PAGE_SIZE = 12;

const formatDate = (value?: string | null): string => {
  if (!value) return "Non renseignée";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  const responseError = error as {
    response?: {
      data?: {
        detail?: unknown;
      };
    };
  };

  const detail = responseError?.response?.data?.detail;

  return typeof detail === "string" && detail.trim()
    ? detail
    : fallback;
};

const Info = ({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) => (
  <div className="flex flex-col gap-1 border-b border-gray-100 py-2.5 dark:border-gray-700 sm:flex-row sm:items-start sm:justify-between">
    <span className="text-sm text-gray-500 dark:text-gray-400">
      {label}
    </span>

    <span className="break-words text-sm font-medium text-gray-800 dark:text-gray-100 sm:max-w-[60%] sm:text-right">
      {value || "Non renseigné"}
    </span>
  </div>
);

const StatCard = ({
  label,
  value,
  icon,
  description,
}: {
  label: string;
  value: number;
  icon: string;
  description: string;
}) => (
  <div className="rounded-2xl border border-white/30 bg-white/90 p-5 shadow-lg backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/90">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {label}
        </p>

        <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
      </div>

      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl dark:bg-blue-900/50">
        {icon}
      </div>
    </div>

    <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
      {description}
    </p>
  </div>
);

const SectionTitle = ({
  icon,
  title,
  description,
  count,
}: {
  icon: string;
  title: string;
  description: string;
  count?: number;
}) => (
  <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
        <span>{icon}</span>
        {title}
      </h2>

      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {description}
      </p>
    </div>

    {count !== undefined && (
      <span className="w-fit rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
        {count} {count > 1 ? "éléments" : "élément"}
      </span>
    )}
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
  const [refreshing, setRefreshing] = useState(false);

  const [membresError, setMembresError] = useState("");
  const [responsablesError, setResponsablesError] = useState("");

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [reloadKey, setReloadKey] = useState(0);

  // Chargement des membres et responsables.
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
        setRefreshing(false);
        return;
      }

      const isInitialLoad = inscrits.length === 0 && responsables.length === 0;

      if (isInitialLoad) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setMembresError("");
      setResponsablesError("");

      const paysUrl = encodeURIComponent(country);
      const dioceseUrl = encodeURIComponent(diocese);
      const paroisseUrl = encodeURIComponent(paroisse);

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
        } catch (error: unknown) {
          console.error("Erreur chargement membres :", error);

          if (!cancelled) {
            setMembresError(
              getErrorMessage(
                error,
                "Impossible de charger les membres de cette paroisse."
              )
            );
          }
        }
      };

      const chargerResponsables = async () => {
        try {
          const response = await api.get<Responsable[]>(
            `/api/hierarchy/responsables-paroisse/${paysUrl}/${dioceseUrl}/${paroisseUrl}`
          );

          if (!cancelled) {
            const data = Array.isArray(response.data)
              ? response.data
              : [];

            setResponsables(
              [...data].sort(
                (a, b) => Number(b.is_primary) - Number(a.is_primary)
              )
            );
          }
        } catch (error: unknown) {
          console.error("Erreur chargement responsables :", error);

          if (!cancelled) {
            setResponsablesError(
              getErrorMessage(
                error,
                "Impossible de charger les responsables paroissiaux."
              )
            );
          }
        }
      };

      try {
        await Promise.allSettled([
          chargerMembres(),
          chargerResponsables(),
        ]);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [country, diocese, paroisse, reloadKey]);

  // Recherche des membres.
  const filteredInscrits = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("fr");

    if (!normalizedSearch) return inscrits;

    return inscrits.filter((inscrit) => {
      const searchableText = [
        inscrit.nom,
        inscrit.prenom,
        inscrit.matricule,
        inscrit.profession,
        inscrit.statut,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("fr");

      return searchableText.includes(normalizedSearch);
    });
  }, [inscrits, search]);

  // Pagination.
  const totalPages = Math.max(
    1,
    Math.ceil(filteredInscrits.length / PAGE_SIZE)
  );

  const safePage = Math.min(currentPage, totalPages);

  const paginatedInscrits = useMemo(() => {
    const startIndex = (safePage - 1) * PAGE_SIZE;

    return filteredInscrits.slice(
      startIndex,
      startIndex + PAGE_SIZE
    );
  }, [filteredInscrits, safePage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const handleRefresh = () => {
    setReloadKey((previous) => previous + 1);
  };

  // Informations privées présentes dans la réponse du backend.
  const hasPrivateData = (inscrit: Inscrit) =>
    inscrit.email !== undefined ||
    inscrit.numero_whatsapp !== undefined ||
    inscrit.is_verified !== undefined ||
    inscrit.is_active !== undefined ||
    inscrit.is_blocked !== undefined;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-700" />

        <p className="mt-5 text-lg font-semibold text-gray-800 dark:text-white">
          Chargement de la vie paroissiale...
        </p>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Récupération des membres et des responsables.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className="mx-auto flex w-full max-w-7xl flex-col px-4 py-8 text-gray-900 dark:text-white sm:px-6 lg:px-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      {/* EN-TÊTE */}

      <section className="mb-8 overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-r from-blue-950/95 via-blue-900/90 to-indigo-950/95 p-6 text-white shadow-xl sm:p-9">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              <span>⛪</span>
              Espace paroissial
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Vie paroissiale
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-blue-100 sm:text-base">
              Retrouvez les responsables et les membres enregistrés
              au sein de cette paroisse.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-blue-100">
              <span>🌍 {country}</span>
              <span className="hidden sm:inline">›</span>
              <span>Diocèse de {diocese}</span>
              <span className="hidden sm:inline">›</span>
              <span className="font-semibold text-white">{paroisse}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className={refreshing ? "animate-spin" : ""}>
              🔄
            </span>

            {refreshing ? "Actualisation..." : "Actualiser"}
          </button>
        </div>
      </section>

      {/* STATISTIQUES */}

      <section className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          label="Membres enregistrés"
          value={inscrits.length}
          icon="👥"
          description="Membres retournés par le service paroissial."
        />

        <StatCard
          label="Responsables paroissiaux"
          value={responsables.length}
          icon="⛪"
          description="Responsables associés à cette paroisse."
        />
      </section>

      {/* RESPONSABLES */}

      <section className="mb-12">
        <SectionTitle
          icon="⛪"
          title="Responsables de la paroisse"
          description="Découvrez les personnes chargées de la responsabilité paroissiale."
          count={responsables.length}
        />

        {responsablesError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-center dark:border-red-900 dark:bg-red-950/40">
            <p className="font-medium text-red-700 dark:text-red-300">
              ⚠️ {responsablesError}
            </p>

            <button
              type="button"
              onClick={handleRefresh}
              className="mt-3 rounded-lg bg-red-100 px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-200"
            >
              Réessayer
            </button>
          </div>
        ) : responsables.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white/80 px-5 py-10 text-center dark:border-gray-700 dark:bg-gray-800/80">
            <div className="text-4xl">⛪</div>

            <p className="mt-3 font-semibold text-gray-700 dark:text-gray-200">
              Aucun responsable enregistré
            </p>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Les responsables de cette paroisse apparaîtront ici.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {responsables.map((responsable, index) => (
              <motion.article
                key={responsable.id}
                className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white/95 p-5 shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800/95"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
              >
                {responsable.is_primary && (
                  <div className="absolute right-0 top-0 rounded-bl-xl bg-green-600 px-3 py-1.5 text-xs font-bold text-white">
                    ★ Premier responsable
                  </div>
                )}

                <div className="flex items-center gap-4 pt-3">
                  <UserAvatar
                    photoUrl={responsable.photo_url}
                    name={`${responsable.prenom} ${responsable.nom}`}
                  />

                  <div className="min-w-0">
                    <h3 className="break-words text-lg font-bold text-gray-900 dark:text-white">
                      {responsable.prenom} {responsable.nom}
                    </h3>

                    <p className="mt-1 text-sm font-semibold text-blue-700 dark:text-blue-300">
                      {responsable.role_name}
                    </p>

                    {responsable.effective_from && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Prise d’effet : {formatDate(responsable.effective_from)}
                      </p>
                    )}

                    {responsable.ended_at && (
                      <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                        Fin de responsabilité : {formatDate(responsable.ended_at)}
                      </p>
                    )}

                    {responsable.matricule && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Matricule : {responsable.matricule}
                      </p>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </section>

      {/* MEMBRES */}

      <section>
        <SectionTitle
          icon="👥"
          title="Membres de la paroisse"
          description="Consultez les profils des membres enregistrés."
          count={inscrits.length}
        />

        {membresError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-center dark:border-red-900 dark:bg-red-950/40">
            <p className="font-medium text-red-700 dark:text-red-300">
              ⚠️ {membresError}
            </p>

            <button
              type="button"
              onClick={handleRefresh}
              className="mt-3 rounded-lg bg-red-100 px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-200"
            >
              Réessayer
            </button>
          </div>
        ) : (
          <>
            {/* RECHERCHE */}

            <div className="mb-6 rounded-2xl border border-gray-200 bg-white/90 p-4 shadow-md dark:border-gray-700 dark:bg-gray-800/90">
              <label
                htmlFor="recherche-membre"
                className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200"
              >
                🔎 Rechercher un membre
              </label>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  id="recherche-membre"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Nom, prénom, matricule, profession..."
                  className="min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:ring-blue-900"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="rounded-xl bg-gray-100 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                  >
                    Effacer
                  </button>
                )}
              </div>

              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                {filteredInscrits.length} résultat(s) correspondant à
                votre recherche.
              </p>
            </div>

            {inscrits.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white/80 px-5 py-12 text-center dark:border-gray-700 dark:bg-gray-800/80">
                <div className="text-5xl">👥</div>

                <p className="mt-4 font-semibold text-gray-700 dark:text-gray-200">
                  Aucun membre enregistré
                </p>

                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Aucun membre n'est actuellement retourné pour cette
                  paroisse.
                </p>
              </div>
            ) : filteredInscrits.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white/80 px-5 py-12 text-center dark:border-gray-700 dark:bg-gray-800/80">
                <div className="text-4xl">🔍</div>

                <p className="mt-3 font-semibold text-gray-700 dark:text-gray-200">
                  Aucun résultat trouvé
                </p>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Essayez un autre nom ou matricule.
                </p>

                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-4 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
                >
                  Réinitialiser la recherche
                </button>
              </div>
            ) : (
              <>
                {/* CARTES DES MEMBRES */}

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {paginatedInscrits.map((inscrit, index) => (
                    <motion.article
                      key={inscrit.id}
                      className="overflow-hidden rounded-2xl border border-gray-200 bg-white/95 shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800/95"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.035 }}
                    >
                      <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            photoUrl={inscrit.photo_url}
                            name={`${inscrit.prenom} ${inscrit.nom}`}
                          />

                          <div className="min-w-0 flex-1">
                            <h3 className="break-words text-lg font-bold text-gray-900 dark:text-white">
                              {inscrit.prenom} {inscrit.nom}
                            </h3>

                            <p className="mt-1 break-all text-xs text-gray-500 dark:text-gray-400">
                              {inscrit.matricule ||
                                "Matricule non attribué"}
                            </p>
                          </div>
                        </div>

                        {inscrit.statut && (
                          <div className="mt-4">
                            <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                              {inscrit.statut}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-5">
                        <div className="space-y-0">
                          <Info label="Sexe" value={inscrit.sexe} />

                          <Info
                            label="Profession"
                            value={inscrit.profession}
                          />

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
                        </div>

                        {/* INFORMATIONS PRIVÉES AUTORISÉES */}

                        {hasPrivateData(inscrit) && (
                          <div className="mt-5 border-t border-blue-200 pt-4 dark:border-blue-900">
                            <p className="mb-3 flex items-center gap-2 text-sm font-bold text-blue-700 dark:text-blue-300">
                              🔐 Informations réservées
                            </p>

                            <Info
                              label="Email"
                              value={inscrit.email}
                            />

                            <Info
                              label="WhatsApp"
                              value={inscrit.numero_whatsapp}
                            />

                            {inscrit.is_verified !== undefined && (
                              <Info
                                label="Compte vérifié"
                                value={inscrit.is_verified ? "Oui" : "Non"}
                              />
                            )}

                            {inscrit.is_active !== undefined && (
                              <Info
                                label="Compte actif"
                                value={inscrit.is_active ? "Oui" : "Non"}
                              />
                            )}

                            {inscrit.is_blocked !== undefined && (
                              <Info
                                label="Compte bloqué"
                                value={inscrit.is_blocked ? "Oui" : "Non"}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </motion.article>
                  ))}
                </div>

                {/* PAGINATION */}

                {totalPages > 1 && (
                  <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white/90 p-4 shadow-md dark:border-gray-700 dark:bg-gray-800/90 sm:flex-row">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Page {safePage} sur {totalPages}
                      {" — "}
                      {filteredInscrits.length} membres
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentPage((page) => Math.max(1, page - 1))
                        }
                        disabled={safePage === 1}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                      >
                        ← Précédent
                      </button>

                      <span className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white">
                        {safePage}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setCurrentPage((page) =>
                            Math.min(totalPages, page + 1)
                          )
                        }
                        disabled={safePage === totalPages}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                      >
                        Suivant →
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </section>

      {/* PIED DE PAGE DE LA PAGE */}

      <div className="mt-12 border-t border-gray-200 pt-6 text-center dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          SAINT ENFANT JÉSUS — Espace de vie paroissiale
        </p>
      </div>
    </motion.div>
  );
};

export default Inscrits;