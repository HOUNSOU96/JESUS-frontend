import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "@/utils/axios";
import PublicationsManager from "@/components/PublicationsManager";

interface Announcement {
  id: number;
  message: string;
  type: "alerte" | "avantage" | "info" | string;
  start_date?: string | null;
  end_date?: string | null;
}

const typePresentation: Record<string, { label: string; icon: string }> = {
  alerte: { label: "Information", icon: "📢" },
  avantage: { label: "Soutien", icon: "🤝" },
  info: { label: "Publicité", icon: "✨" },
};

const Publicite: React.FC = () => {
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

  return (
    <div className="theme-adaptive relative mx-auto max-w-6xl py-10 sm:py-16">
      <div className="pointer-events-none absolute left-1/2 top-20 h-80 w-80
                      -translate-x-1/2 rounded-full bg-amber-400/[0.07] blur-[110px]" />

      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative mb-12 text-center"
      >
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center
                        rounded-full border border-amber-300/40
                        bg-gradient-to-br from-amber-300/20 to-yellow-700/10
                        text-4xl text-amber-200 shadow-[0_0_45px_rgba(234,179,8,0.12)]">
          📢
        </div>

        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.4em]
                      text-amber-400/70">
          Confrérie Saint Enfant Jésus
        </p>

        <h1 className="text-3xl font-black tracking-wide text-amber-100 sm:text-5xl">
          Espace Publicitaire
        </h1>

        <div className="mx-auto my-5 h-px w-28
                        bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

        <p className="mx-auto max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
          Découvrez les annonces, les informations et les publications
          partagées dans notre communauté.
        </p>
      </motion.header>

      <section className="relative">
        <h2 className="mb-5 text-xl font-black text-amber-100 sm:text-2xl">
          Annonces et informations
        </h2>

        {loading ? (
          <p className="py-10 text-center text-sm text-slate-400">
            Chargement des annonces…
          </p>
        ) : error ? (
          <p className="rounded-2xl border border-red-300/30 bg-red-950/30
                        p-5 text-center text-sm text-red-200">
            {error}
          </p>
        ) : announcements.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-amber-300/20
                          p-8 text-center">
            <div className="mb-3 text-4xl">📭</div>
            <p className="font-bold text-amber-100">Aucune annonce disponible</p>
            <p className="mt-1 text-sm text-slate-400">
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
                             border border-amber-400/30
                             bg-gradient-to-br from-[#201a0e] to-[#090909]
                             p-5 shadow-lg"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-2xl">{presentation.icon}</span>
                    <span className="rounded-full border border-amber-500/30
                                     bg-amber-400/10 px-3 py-1 text-[10px]
                                     font-black uppercase tracking-wider text-amber-200">
                      {presentation.label}
                    </span>
                  </div>
                  <p className="flex-1 whitespace-pre-line text-sm leading-6 text-slate-100">
                    {announcement.message}
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <PublicationsManager section="publicite" />

      <section className="relative mt-10 rounded-3xl border border-amber-400/30
                          bg-gradient-to-r from-[#201a0e] to-[#090909] p-5 sm:p-7">
        <h2 className="font-black text-amber-200 sm:text-xl">
          Vous souhaitez faire connaître vos activités ?
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Contactez-nous pour proposer une publicité dans cet espace.
        </p>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <a
            href="https://wa.me/2290161866453"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-green-700 px-5 py-3 text-center
                       text-sm font-bold text-white transition hover:bg-green-800"
          >
            WhatsApp : +229 01 61 86 64 53
          </a>
          <a
            href="mailto:deogratiashounsou@gmail.com"
            className="rounded-xl border border-amber-500/40 bg-white/5
                       px-5 py-3 text-center text-sm font-bold text-amber-100
                       transition hover:bg-white/10"
          >
            ✉ Envoyer un e-mail
          </a>
        </div>
      </section>
    </div>
  );
};

export default Publicite;
