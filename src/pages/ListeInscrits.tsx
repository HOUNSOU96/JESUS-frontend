import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import api from "@/utils/axios";
import { useAuth } from "@/hooks/useAuth";
import UserAvatar from "@/components/UserAvatar";

interface UserInscrit {
  id: number;
  nom: string;
  prenom: string;
  photo_url?: string | null;
  matricule: string | null;
  sexe?: string | null;
  date_integration?: string | null;
  statut?: string | null;
  requested_role?: string | null;
  profession?: string | null;
  continent?: string | null;
  pays?: string | null;
  diocese?: string | null;
  paroisse?: string | null;
  numero_whatsapp?: string | null;
  email?: string | null;
  date_inscription?: string | null;
  created_at?: string | null;
  is_validated: boolean;
  is_blocked?: boolean;
  is_active?: boolean;
  is_verified?: boolean;
  is_online?: boolean;
  status?: "pending" | "validated" | "refused";
  last_warning?: string | null;
  last_seen?: string | null;
}

interface ListeResponse {
  total: number;
  pending_total: number;
  page: number;
  page_size: number;
  inscrits: UserInscrit[];
}

type StatusFilter = "all" | "pending" | "validated" | "refused";

const PAGE_SIZE = 10;

const formatDate = (value?: string | null) => {
  if (!value) return "Non renseignée";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Non renseignée";
  }

  return date.toLocaleString("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const getStatus = (user: UserInscrit) => {
  if (user.is_validated || user.status === "validated") {
    return "validated";
  }

  if (user.status === "refused") {
    return "refused";
  }

  return "pending";
};

const Info = ({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) => (
  <div className="min-w-0 rounded-xl bg-gray-50 p-3 dark:bg-gray-900/60">
    <p className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
      {label}
    </p>

    <p className="break-words text-sm font-medium text-gray-900 dark:text-gray-100">
      {value || "Non renseigné"}
    </p>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const config = {
    validated: {
      label: "Validé",
      className: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
      icon: "✓",
    },
    refused: {
      label: "Refusé",
      className: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
      icon: "✕",
    },
    pending: {
      label: "En attente",
      className: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
      icon: "◷",
    },
  }[status] || {
    label: "En attente",
    className: "bg-amber-100 text-amber-800",
    icon: "◷",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${config.className}`}
    >
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
};

const ListeInscrits: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [inscrits, setInscrits] = useState<UserInscrit[]>([]);
  const [total, setTotal] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  const [page, setPage] = useState(1);
  const [loadingListe, setLoadingListe] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [processingIds, setProcessingIds] = useState<Set<number>>(
    new Set()
  );

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // --------------------------------------------------
  // CONTRÔLE D'ACCÈS
  // --------------------------------------------------

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    if (!user.is_admin) {
      navigate("/matiere", { replace: true });
    }
  }, [authLoading, user, navigate]);

  // --------------------------------------------------
  // CHARGEMENT DES INSCRITS
  // --------------------------------------------------

  const chargerInscrits = useCallback(async () => {
    if (!user?.is_admin) return;

    setLoadingListe(true);
    setError("");

    try {
      const response = await api.get<ListeResponse>(
        "/api/admin/liste-inscrits",
        {
          params: {
            page,
            page_size: PAGE_SIZE,
          },
        }
      );

      const data = response.data;

      setInscrits(Array.isArray(data.inscrits) ? data.inscrits : []);
      setTotal(Number(data.total) || 0);
      setPendingCount(Number(data.pending_total) || 0);
    } catch (err) {
      console.error("Erreur récupération des inscrits :", err);

      setError(
        "Impossible de récupérer les inscriptions. Vérifie ta connexion et réessaie."
      );
    } finally {
      setLoadingListe(false);
    }
  }, [user, page, refreshKey]);

  useEffect(() => {
    chargerInscrits();
  }, [chargerInscrits]);

  // --------------------------------------------------
  // RECHERCHE ET FILTRES
  // --------------------------------------------------

  const inscritsFiltres = useMemo(() => {
    const terme = search.trim().toLowerCase();

    return inscrits.filter((inscrit) => {
      const correspondRecherche =
        !terme ||
        [
          inscrit.nom,
          inscrit.prenom,
          inscrit.matricule,
          inscrit.email,
          inscrit.numero_whatsapp,
          inscrit.pays,
          inscrit.diocese,
          inscrit.paroisse,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(terme)
          );

      const statut = getStatus(inscrit);

      const correspondStatut =
        statusFilter === "all" || statut === statusFilter;

      return correspondRecherche && correspondStatut;
    });
  }, [inscrits, search, statusFilter]);

  // --------------------------------------------------
  // MISE À JOUR DU TRAITEMENT
  // --------------------------------------------------

  const terminerTraitement = (id: number) => {
    setProcessingIds((previous) => {
      const next = new Set(previous);
      next.delete(id);
      return next;
    });
  };

  const commencerTraitement = (id: number) => {
    setProcessingIds((previous) => new Set(previous).add(id));
  };

  // --------------------------------------------------
  // VALIDATION
  // --------------------------------------------------

  const handleValider = async (inscrit: UserInscrit) => {
    const id = inscrit.id;

    if (processingIds.has(id)) return;

    if (getStatus(inscrit) !== "pending") return;

    const confirmation = window.confirm(
      `Confirmer la validation de ${inscrit.nom} ${inscrit.prenom} ?`
    );

    if (!confirmation) return;

    commencerTraitement(id);
    setError("");
    setSuccess("");

    try {
      const response = await api.post(
        `/api/admin/valider-inscrit/${id}`
      );

      setInscrits((previous) =>
        previous.map((item) =>
          item.id === id
            ? {
                ...item,
                status: "validated",
                is_validated: true,
              }
            : item
        )
      );

      setPendingCount((previous) => Math.max(0, previous - 1));

      setSuccess(
        response.data?.message || "Inscription validée avec succès."
      );
    } catch (err) {
      console.error("Erreur validation :", err);

      setError(
        "La validation a échoué. Vérifie ta connexion et réessaie."
      );
    } finally {
      terminerTraitement(id);
    }
  };

  // --------------------------------------------------
  // REFUS
  // --------------------------------------------------

  const handleRefuser = async (inscrit: UserInscrit) => {
    const id = inscrit.id;

    if (processingIds.has(id)) return;

    if (getStatus(inscrit) !== "pending") return;

    const confirmation = window.confirm(
      `Confirmer le refus de l'inscription de ${inscrit.nom} ${inscrit.prenom} ?\n\nCette opération conservera sa fiche dans la base de données.`
    );

    if (!confirmation) return;

    commencerTraitement(id);
    setError("");
    setSuccess("");

    try {
      const response = await api.post(
        `/api/admin/refuser-inscrit/${id}`
      );

      // La fiche reste visible : le backend conserve le membre.
      setInscrits((previous) =>
        previous.map((item) =>
          item.id === id
            ? {
                ...item,
                status: "refused",
                is_validated: false,
              }
            : item
        )
      );

      setPendingCount((previous) => Math.max(0, previous - 1));

      setSuccess(
        response.data?.message || "Inscription refusée."
      );
    } catch (err) {
      console.error("Erreur refus :", err);

      setError(
        "Le refus a échoué. Vérifie ta connexion et réessaie."
      );
    } finally {
      terminerTraitement(id);
    }
  };

  // --------------------------------------------------
  // RAFRAÎCHISSEMENT
  // --------------------------------------------------

  const actualiser = () => {
    setSearch("");
    setStatusFilter("all");
    setSuccess("");
    setError("");
    setPage(1);
    setRefreshKey((previous) => previous + 1);
  };

  // --------------------------------------------------
  // AFFICHAGE CHARGEMENT
  // --------------------------------------------------

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          <p className="font-medium text-gray-600 dark:text-gray-300">
            Vérification de votre accès...
          </p>
        </div>
      </div>
    );
  }

  if (!user?.is_admin) {
    return null;
  }

  // --------------------------------------------------
  // INTERFACE PRINCIPALE
  // --------------------------------------------------

  return (
    <motion.main
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen bg-gray-50 p-4 dark:bg-gray-950 sm:p-6 lg:p-8"
    >
      <div className="mx-auto max-w-7xl">

        {/* EN-TÊTE */}

        <section className="mb-7 overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                <span className="h-2 w-2 rounded-full bg-green-400" />
                Espace administration
              </div>

              <h1 className="text-2xl font-extrabold sm:text-3xl">
                Gestion des inscriptions
              </h1>

              <p className="mt-2 max-w-xl text-sm text-blue-100 sm:text-base">
                Consulte les demandes, vérifie les informations et
                décide de l'admission des nouveaux membres.
              </p>
            </div>

            <button
              type="button"
              onClick={actualiser}
              disabled={loadingListe}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className={loadingListe ? "animate-spin" : ""}>
                ↻
              </span>
              Actualiser
            </button>
          </div>
        </section>

        {/* INDICATEURS */}

        <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                  Total des inscrits
                </p>
                <p className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">
                  {total}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-2xl dark:bg-blue-900/40">
                👥
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm dark:border-amber-900/50 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                  Inscriptions en attente
                </p>
                <p className="mt-2 text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                  {pendingCount}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-2xl dark:bg-amber-900/40">
                ⏳
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-green-200 bg-white p-5 shadow-sm dark:border-green-900/50 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                  Membres validés sur cette page
                </p>
                <p className="mt-2 text-3xl font-extrabold text-green-600 dark:text-green-400">
                  {inscrits.filter((item) => getStatus(item) === "validated").length}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-2xl dark:bg-green-900/40">
                ✓
              </div>
            </div>
          </div>

        </section>

        {/* MESSAGES */}

        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
          >
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="font-bold"
              aria-label="Fermer le message"
            >
              ✕
            </button>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300"
          >
            <span>{success}</span>

            <button
              type="button"
              onClick={() => setSuccess("")}
              className="font-bold"
              aria-label="Fermer le message"
            >
              ✕
            </button>
          </div>
        )}

        {/* RECHERCHE ET FILTRES */}

        <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-5">

          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Répertoire des membres
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Recherche et filtres appliqués aux inscrits de la page actuelle.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">

            <div>
              <label
                htmlFor="recherche-inscrit"
                className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                Rechercher un membre
              </label>

              <input
                id="recherche-inscrit"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Nom, prénom, matricule, pays, email..."
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-900"
              />
            </div>

            <div>
              <label
                htmlFor="filtre-statut"
                className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                Filtrer par statut
              </label>

              <select
                id="filtre-statut"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as StatusFilter)
                }
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-900"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="validated">Validés</option>
                <option value="refused">Refusés</option>
              </select>
            </div>

          </div>
        </section>

        {/* INFORMATIONS SUR LA PAGINATION */}

        <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Page <strong>{page}</strong> sur <strong>{totalPages}</strong>
            {" · "}
            {total} inscription(s) au total
          </p>

          <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">
            {inscritsFiltres.length} résultat(s) affiché(s)
          </p>
        </div>

        {/* LISTE DES INSCRITS */}

        {loadingListe && inscrits.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white py-16 text-center dark:border-gray-800 dark:bg-gray-900">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />

            <p className="font-medium text-gray-600 dark:text-gray-300">
              Chargement des inscriptions...
            </p>
          </div>
        ) : inscritsFiltres.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white px-5 py-16 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">

            <div className="mb-4 text-5xl">📋</div>

            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {inscrits.length === 0
                ? "Aucune inscription"
                : "Aucun résultat correspondant"}
            </h3>

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {inscrits.length === 0
                ? "Les nouvelles inscriptions apparaîtront ici."
                : "Modifie ta recherche ou sélectionne un autre statut."}
            </p>

          </div>
        ) : (
          <div className="space-y-5">

            {inscritsFiltres.map((inscrit, index) => {
              const status = getStatus(inscrit);
              const processing = processingIds.has(inscrit.id);

              return (
                <motion.article
                  key={inscrit.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.025 }}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
                >

                  {/* IDENTITÉ */}

                  <div className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">

                    <div className="flex min-w-0 items-center gap-4">

                      <UserAvatar
                        photoUrl={inscrit.photo_url}
                        name={`${inscrit.prenom} ${inscrit.nom}`}
                      />

                      <div className="min-w-0">
                        <h3 className="break-words text-lg font-extrabold text-gray-900 dark:text-white">
                          {inscrit.nom} {inscrit.prenom}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          Matricule :{" "}
                          <span className="font-bold text-gray-700 dark:text-gray-200">
                            {inscrit.matricule || "Non attribué"}
                          </span>
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          Inscription : {formatDate(inscrit.date_inscription)}
                        </p>
                      </div>

                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={status} />

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          inscrit.is_online
                            ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {inscrit.is_online ? "● En ligne" : "○ Hors ligne"}
                      </span>
                    </div>

                  </div>

                  {/* LOCALISATION */}

                  <div className="grid grid-cols-1 gap-3 border-t border-gray-100 bg-gray-50/70 px-5 py-4 dark:border-gray-800 dark:bg-gray-950/40 sm:grid-cols-3">

                    <Info label="Pays" value={inscrit.pays} />
                    <Info label="Diocèse" value={inscrit.diocese} />
                    <Info label="Paroisse" value={inscrit.paroisse} />

                  </div>

                  {/* DÉTAILS */}

                  <div className="px-5 py-4">

                    <details>
                      <summary className="cursor-pointer select-none text-sm font-bold text-blue-700 transition hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                        Consulter toutes les informations du membre
                      </summary>

                      <div className="mt-4 grid grid-cols-1 gap-3 border-t border-gray-200 pt-4 dark:border-gray-800 sm:grid-cols-2 lg:grid-cols-3">

                        <Info label="Nom" value={inscrit.nom} />
                        <Info label="Prénom" value={inscrit.prenom} />
                        <Info label="Sexe" value={inscrit.sexe} />

                        <Info
                          label="Date d'intégration"
                          value={formatDate(inscrit.date_integration)}
                        />

                        <Info
                          label="Statut déclaré"
                          value={inscrit.requested_role}
                        />

                        <Info
                          label="Statut du membre"
                          value={inscrit.statut}
                        />

                        <Info label="Profession" value={inscrit.profession} />

                        <Info label="Continent" value={inscrit.continent} />
                        <Info label="Pays" value={inscrit.pays} />
                        <Info label="Diocèse" value={inscrit.diocese} />
                        <Info label="Paroisse" value={inscrit.paroisse} />

                        <Info
                          label="WhatsApp"
                          value={inscrit.numero_whatsapp}
                        />

                        <Info
                          label="Adresse e-mail"
                          value={inscrit.email}
                        />

                        <Info
                          label="Matricule"
                          value={inscrit.matricule}
                        />

                        <Info
                          label="Date d'inscription"
                          value={formatDate(inscrit.date_inscription)}
                        />

                        <Info
                          label="Dernière activité"
                          value={formatDate(inscrit.last_seen)}
                        />

                        <Info
                          label="Dernier avertissement"
                          value={formatDate(inscrit.last_warning)}
                        />

                        <Info
                          label="Compte"
                          value={inscrit.is_active ? "Actif" : "Désactivé"}
                        />

                        <Info
                          label="Blocage"
                          value={inscrit.is_blocked ? "Bloqué" : "Non bloqué"}
                        />

                        <Info
                          label="Vérification"
                          value={inscrit.is_verified ? "Vérifié" : "Non vérifié"}
                        />

                      </div>
                    </details>

                  </div>

                  {/* ACTIONS */}

                  {status === "pending" && (
                    <div className="flex flex-col gap-3 border-t border-gray-200 bg-gray-50 px-5 py-4 dark:border-gray-800 dark:bg-gray-950/40 sm:flex-row sm:justify-end">

                      <button
                        type="button"
                        onClick={() => handleRefuser(inscrit)}
                        disabled={processing}
                        className="rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900 dark:bg-gray-900 dark:text-red-400 dark:hover:bg-red-950/40"
                      >
                        {processing ? "Traitement..." : "Refuser l'inscription"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleValider(inscrit)}
                        disabled={processing}
                        className="rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {processing ? "Traitement..." : "✓ Valider l'inscription"}
                      </button>

                    </div>
                  )}

                  {status === "refused" && (
                    <div className="border-t border-red-100 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                      Cette inscription a été refusée. La fiche du membre est conservée.
                    </div>
                  )}

                  {status === "validated" && (
                    <div className="border-t border-green-100 bg-green-50 px-5 py-3 text-sm font-semibold text-green-700 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-300">
                      Cette inscription a été validée.
                    </div>
                  )}

                </motion.article>
              );
            })}

          </div>
        )}

        {/* CHARGEMENT COMPLÉMENTAIRE */}

        {loadingListe && inscrits.length > 0 && (
          <p className="mt-5 text-center text-sm font-medium text-blue-600 dark:text-blue-400">
            Actualisation des données...
          </p>
        )}

        {/* PAGINATION */}

        <section className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:flex-row">

          <p className="text-sm text-gray-600 dark:text-gray-400">
            Page {page} / {totalPages}
          </p>

          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={() => setPage((previous) => Math.max(1, previous - 1))}
              disabled={page <= 1 || loadingListe}
              className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              ← Précédent
            </button>

            <button
              type="button"
              onClick={() =>
                setPage((previous) => Math.min(totalPages, previous + 1))
              }
              disabled={page >= totalPages || loadingListe}
              className="rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Suivant →
            </button>

          </div>

        </section>

        {/* CONTINUER */}

        <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">

          <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
            Étape de gestion des inscriptions
          </h2>

          {pendingCount > 0 ? (
            <p className="mx-auto mt-2 max-w-xl text-sm text-amber-700 dark:text-amber-400">
              Il reste {pendingCount} inscription(s) en attente.
              Tu dois traiter toutes les demandes avant de continuer.
            </p>
          ) : (
            <p className="mt-2 text-sm text-green-700 dark:text-green-400">
              Toutes les inscriptions ont été traitées. Tu peux continuer.
            </p>
          )}

          <button
            type="button"
            onClick={() => navigate("/matiere")}
            disabled={pendingCount > 0 || loadingListe}
            className={`mt-5 rounded-xl px-8 py-3 font-extrabold shadow-sm transition ${
              pendingCount > 0 || loadingListe
                ? "cursor-not-allowed bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                : "bg-blue-700 text-white hover:bg-blue-800"
            }`}
          >
            CONTINUER →
          </button>

        </section>

      </div>
    </motion.main>
  );
};

export default ListeInscrits;