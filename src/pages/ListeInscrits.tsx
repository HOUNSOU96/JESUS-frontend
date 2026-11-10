import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/utils/axios";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

interface UserInscrit {
  id: number;
  nom: string;
  prenom: string;
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
  is_validated: boolean;
  is_blocked?: boolean;
  is_active?: boolean;
  is_verified?: boolean;
  is_online?: boolean;
  status?: "pending" | "validated" | "refused";
  last_warning?: string | null;
  last_seen?: string | null;
}

const PAGE_SIZE = 10;

const formatDate = (value?: string | null) => {
  if (!value) return "Non renseignée";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Non renseignée"
    : date.toLocaleString("fr-FR");
};

const Info = ({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) => (
  <div className="min-w-0">
    <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
      {label}
    </p>
    <p className="break-words text-sm text-gray-900 dark:text-gray-100">
      {value || "Non renseigné"}
    </p>
  </div>
);

const ListeInscrits: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [inscrits, setInscrits] = useState<UserInscrit[]>([]);
  const [loadingListe, setLoadingListe] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  const observer = useRef<IntersectionObserver | null>(null);

  const lastInscritRef = useCallback(
    (node: HTMLElement | null) => {
      if (loadingListe) return;

      if (observer.current) observer.current.disconnect();

      if (!node) return;

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });

      observer.current.observe(node);
    },
    [loadingListe, hasMore]
  );

  useEffect(() => {
    if (!authLoading) {
      if (!user) navigate("/login");
      else if (!user.is_admin) navigate("/matiere");
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user?.is_admin || !hasMore) return;

    let cancelled = false;

    const fetchInscrits = async () => {
      setLoadingListe(true);

      try {
        const response = await api.get("/api/admin/liste-inscrits", {
          params: { page, page_size: PAGE_SIZE },
        });

        if (cancelled) return;

        const nouvelleListe: UserInscrit[] = response.data.inscrits || [];

        setInscrits((prev) => {
          const ids = new Set(prev.map((u) => u.id));
          const filtered = nouvelleListe.filter((u) => !ids.has(u.id));
          return [...prev, ...filtered];
        });

        setPendingCount(response.data.pending_total ?? 0);

        if (page * PAGE_SIZE >= response.data.total) {
          setHasMore(false);
        }
      } catch (err) {
        console.error("Erreur récupération inscrits :", err);
      } finally {
        if (!cancelled) setLoadingListe(false);
      }
    };

    fetchInscrits();

    return () => {
      cancelled = true;
    };
  }, [page, user, hasMore]);

  const handleValider = async (id: number) => {
    try {
      const res = await api.post(`/api/admin/valider-inscrit/${id}`);

      setInscrits((prev) =>
        prev.map((u) =>
          u.id === id
            ? { ...u, status: "validated", is_validated: true }
            : u
        )
      );

      setPendingCount((prev) => Math.max(0, prev - 1));
      alert(res.data.message);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la validation.");
    }
  };

  const handleRefuser = async (id: number) => {
    try {
      const res = await api.post(`/api/admin/refuser-inscrit/${id}`);

      setInscrits((prev) => prev.filter((u) => u.id !== id));
      setPendingCount((prev) => Math.max(0, prev - 1));

      alert(res.data.message);
    } catch (err) {
      console.error(err);
      alert("Erreur lors du refus.");
    }
  };

  if (authLoading) return <div>Chargement...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-100 p-4 dark:bg-gray-900 md:p-6"
    >
      <h1 className="mb-4 text-center text-3xl font-bold text-blue-700 dark:text-white">
        Liste des membres inscrits
      </h1>

      <p className="mb-6 text-center text-gray-600 dark:text-gray-300">
        Inscriptions en attente :{" "}
        <span className="font-bold">{pendingCount}</span>
      </p>

      {inscrits.length === 0 && !loadingListe ? (
        <p className="text-center text-gray-600 dark:text-gray-300">
          Aucun inscrit pour le moment.
        </p>
      ) : (
        <div className="space-y-4">
          {inscrits.map((i, index) => {
            const isLast = inscrits.length === index + 1;

            return (
              <motion.article
                key={i.id}
                ref={isLast ? lastInscritRef : null}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-md dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      {i.nom} {i.prenom}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Matricule : {i.matricule || "Non attribué"}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-sm font-semibold ${
                      i.is_validated
                        ? "bg-green-100 text-green-800"
                        : i.status === "refused"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {i.is_validated
                        ? "Validé"
                        : i.status === "refused"
                        ? "Refusé"
                        : "En attente"}
                    </span>

                    <span className={`rounded-full px-3 py-1 text-sm ${
                      i.is_online
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {i.is_online ? "En ligne" : "Hors ligne"}
                    </span>
                  </div>
                </div>

                <details className="mt-4">
                  <summary className="cursor-pointer font-semibold text-blue-700 dark:text-blue-400">
                    Consulter toutes les informations
                  </summary>

                  <div className="mt-4 grid grid-cols-1 gap-4 border-t border-gray-200 pt-4 dark:border-gray-700 sm:grid-cols-2 lg:grid-cols-3">
                    <Info label="Nom" value={i.nom} />
                    <Info label="Prénom" value={i.prenom} />
                    <Info label="Sexe" value={i.sexe} />
                    <Info label="Date d'intégration" value={formatDate(i.date_integration)} />

                    <Info label="Statut déclaré" value={i.requested_role} />
                    <Info label="Statut du membre" value={i.statut} />
                    <Info label="Profession" value={i.profession} />

                    <Info label="Continent" value={i.continent} />
                    <Info label="Pays" value={i.pays} />
                    <Info label="Diocèse" value={i.diocese} />
                    <Info label="Paroisse" value={i.paroisse} />

                    <Info label="WhatsApp" value={i.numero_whatsapp} />
                    <Info label="Adresse e-mail" value={i.email} />

                    <Info label="Matricule" value={i.matricule} />
                    <Info label="Date d'inscription" value={formatDate(i.date_inscription)} />
                    <Info label="Dernière activité" value={formatDate(i.last_seen)} />
                    <Info label="Dernier avertissement" value={formatDate(i.last_warning)} />

                    <Info
                      label="Compte"
                      value={i.is_active ? "Actif" : "Désactivé"}
                    />
                    <Info
                      label="Blocage"
                      value={i.is_blocked ? "Bloqué" : "Non bloqué"}
                    />
                    <Info
                      label="Vérification"
                      value={i.is_verified ? "Vérifié" : "Non vérifié"}
                    />
                  </div>
                </details>

                {!i.is_validated && i.status !== "refused" && (
                  <div className="mt-4 flex flex-wrap gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
                    <button
                      onClick={() => handleValider(i.id)}
                      className="rounded-lg bg-green-600 px-4 py-2 text-white transition hover:bg-green-700"
                    >
                      Valider
                    </button>

                    <button
                      onClick={() => handleRefuser(i.id)}
                      className="rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
                    >
                      Refuser
                    </button>
                  </div>
                )}
              </motion.article>
            );
          })}
        </div>
      )}

      {loadingListe && (
        <p className="mt-4 text-center text-gray-600 dark:text-gray-300">
          Chargement des inscriptions...
        </p>
      )}

      <div className="mt-8 text-center">
        <button
          onClick={() => navigate("/matiere")}
          disabled={pendingCount > 0}
          className={`rounded-xl px-6 py-3 font-semibold transition ${
            pendingCount > 0
              ? "cursor-not-allowed bg-gray-400 text-gray-700"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          CONTINUER
        </button>

        {pendingCount > 0 && (
          <p className="mt-2 text-sm text-red-600">
            Vous devez traiter toutes les inscriptions avant de continuer.
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default ListeInscrits;
