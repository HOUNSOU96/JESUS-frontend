import React, { useEffect, useState } from "react";
import api from "@/utils/axios";

interface Announcement {
  id: number;
  message: string;
  type: "alerte" | "avantage" | "info" | string;
  start_date?: string | null;
  end_date?: string | null;
}

interface PubliciteModalProps {
  onClose: () => void;
}

const typePresentation: Record<string, { label: string; icon: string }> = {
  alerte: { label: "Information", icon: "📢" },
  avantage: { label: "Soutien", icon: "🤝" },
  info: { label: "Publicité", icon: "✨" },
};

const PubliciteModal: React.FC<PubliciteModalProps> = ({ onClose }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadAnnouncements = async () => {
      try {
        const response = await api.get<Announcement[]>("/api/announcements");
        if (active) setAnnouncements(response.data);
      } catch {
        if (active) setError("Impossible de charger les annonces pour le moment.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadAnnouncements();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center
                 bg-black/75 px-3 py-6 backdrop-blur-md"
      onClick={onClose}
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="publicite-title"
        onClick={(event) => event.stopPropagation()}
        className="relative flex max-h-[85vh] w-full max-w-2xl flex-col
                   overflow-hidden rounded-[2rem] border border-amber-400/50
                   bg-gradient-to-b from-amber-50 via-white to-amber-100
                   text-gray-900 shadow-2xl
                   dark:from-[#17130b] dark:via-[#090909] dark:to-black
                   dark:text-white"
      >
        <header className="flex items-center justify-between border-b
                           border-amber-500/20 p-5 sm:p-6">
          <div>
            <h2 id="publicite-title"
                className="text-xl font-black tracking-wide text-amber-800
                           dark:text-amber-200 sm:text-2xl">
              ✨ Espace Publicitaire
            </h2>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              Découvrez les annonces et informations disponibles.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer les publicités"
            className="flex h-10 w-10 shrink-0 items-center justify-center
                       rounded-full border border-red-300/60 bg-red-100
                       text-xl font-bold text-red-700 transition
                       hover:bg-red-200"
          >
            ×
          </button>
        </header>

        <div className="overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <p className="py-10 text-center text-sm text-gray-600 dark:text-gray-300">
              Chargement des annonces…
            </p>
          ) : error ? (
            <p className="rounded-2xl border border-red-300/40 bg-red-100/60
                          p-5 text-center text-sm text-red-700 dark:bg-red-950/30
                          dark:text-red-200">
              {error}
            </p>
          ) : announcements.length === 0 ? (
            <div className="rounded-2xl border border-amber-400/30
                            bg-amber-100/50 p-8 text-center
                            dark:bg-amber-300/5">
              <div className="mb-3 text-4xl">📭</div>
              <p className="font-bold">Aucune annonce disponible</p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Revenez plus tard pour découvrir nos prochaines annonces.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {announcements.map((announcement) => {
                const presentation =
                  typePresentation[announcement.type] || typePresentation.info;

                return (
                  <article
                    key={announcement.id}
                    className="flex min-h-40 flex-col rounded-2xl
                               border border-amber-400/40
                               bg-gradient-to-br from-white to-amber-50
                               p-5 shadow-lg shadow-amber-900/5
                               dark:from-white/[0.08] dark:to-amber-400/[0.03]
                               dark:shadow-black/20"
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-2xl">{presentation.icon}</span>
                      <span className="rounded-full border border-amber-500/30
                                       bg-amber-100 px-3 py-1 text-[10px]
                                       font-black uppercase tracking-wider
                                       text-amber-900 dark:bg-amber-400/10
                                       dark:text-amber-200">
                        {presentation.label}
                      </span>
                    </div>

                    <p className="flex-1 whitespace-pre-line text-sm leading-6
                                  text-gray-800 dark:text-gray-100">
                      {announcement.message}
                    </p>
                  </article>
                );
              })}
            </div>
          )}

          <div className="mt-6 rounded-2xl border border-amber-400/40
                          bg-gradient-to-r from-amber-100 to-yellow-50
                          p-5 dark:from-amber-400/10 dark:to-yellow-500/5">
            <h3 className="font-black text-amber-900 dark:text-amber-200">
              Vous souhaitez faire connaître vos activités ?
            </h3>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
              Contactez-nous pour proposer une publicité dans cet espace.
            </p>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <a
                href="https://wa.me/2290161866453"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-green-700 px-4 py-3 text-center
                           text-sm font-bold text-white transition
                           hover:bg-green-800"
              >
                WhatsApp : +229 01 61 86 64 53
              </a>
              <a
                href="mailto:deogratiashounsou@gmail.com"
                className="rounded-xl border border-amber-500/40
                           bg-white px-4 py-3 text-center text-sm
                           font-bold text-amber-900 transition hover:bg-amber-100
                           dark:bg-white/5 dark:text-amber-100
                           dark:hover:bg-white/10"
              >
                ✉ Envoyer un e-mail
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PubliciteModal;
