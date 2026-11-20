import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Headphones,
  Music2,
  Sparkles,
  Volume2,
} from "lucide-react";

const prayerNames: Record<string, string> = {
  neuvaine: "La Neuvaine",
  lundi: "Prière du lundi",
  avent: "Prière du temps de l’Avent",
  "25": "Prière du 25",
};

const languageNames: Record<string, string> = {
  francais: "Français",
  fon: "Fon",
  anglais: "Anglais",
  nago: "Nago",
  dindi: "Dindi",
};

const AudiosPriere: React.FC = () => {
  const { priere = "", langue = "" } = useParams();

  const [audioDisponible, setAudioDisponible] = useState(false);
  const [verificationTerminee, setVerificationTerminee] = useState(false);

  const audioUrl = `/audios/prieres/${priere}/${langue}/priere-principale.mp3`;

  useEffect(() => {
    const controller = new AbortController();

    setAudioDisponible(false);
    setVerificationTerminee(false);

    fetch(audioUrl, {
      method: "HEAD",
      signal: controller.signal,
    })
      .then((response) => {
        setAudioDisponible(response.ok);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setAudioDisponible(false);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setVerificationTerminee(true);
        }
      });

    return () => controller.abort();
  }, [audioUrl]);

  const prayerName = prayerNames[priere] || "Prière";
  const languageName = languageNames[langue] || langue;

  return (
    <main className="theme-adaptive relative isolate mx-auto min-h-[75vh] max-w-5xl overflow-hidden px-3 py-10 sm:px-6 sm:py-14">

      {/* Lumières décoratives */}
      <div className="pointer-events-none absolute -left-32 top-20 -z-10 h-72 w-72 rounded-full bg-amber-400/10 blur-[100px]" />
      <div className="pointer-events-none absolute -right-32 bottom-10 -z-10 h-72 w-72 rounded-full bg-yellow-500/10 blur-[100px]" />

      {/* En-tête */}
      <motion.header
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative mb-10 text-center"
      >
        <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-amber-400/50 bg-gradient-to-br from-amber-100 to-yellow-50 text-amber-700 shadow-[0_0_45px_rgba(234,179,8,0.15)] dark:from-amber-300/20 dark:to-yellow-700/10 dark:text-amber-200">
          <Headphones size={38} strokeWidth={1.5} />
          <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-amber-500 text-white dark:border-gray-950">
            <Music2 size={13} />
          </span>
        </div>

        <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.35em] text-amber-700 dark:text-amber-400">
          Confrérie Saint Enfant Jésus
        </p>

        <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-amber-100 sm:text-5xl">
          {prayerName}
        </h1>

        <div className="mx-auto my-5 h-px w-32 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

        <p className="text-sm text-gray-600 dark:text-gray-300">
          Votre espace de prière et de recueillement.
        </p>
      </motion.header>

      {/* Informations sur la prière */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="relative overflow-hidden rounded-[2rem] border border-amber-400/25 bg-white/90 p-6 shadow-xl shadow-amber-900/5 dark:bg-gradient-to-br dark:from-[#201a0e] dark:via-[#15120d] dark:to-[#080808] dark:shadow-black/30 sm:p-9"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl" />

        <div className="relative flex flex-col items-center gap-5 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-100 to-yellow-50 text-amber-700 dark:from-amber-300/15 dark:to-yellow-700/10 dark:text-amber-300">
            <Volume2 size={30} />
          </div>

          <div className="text-center sm:text-left">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-amber-700 dark:text-amber-400">
              Votre moment spirituel
            </p>

            <h2 className="mt-2 text-xl font-black text-gray-900 dark:text-amber-100 sm:text-2xl">
              {prayerName}
            </h2>

            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-800 dark:bg-amber-400/10 dark:text-amber-300">
              <span className="text-base">🌍</span>
              {languageName}
            </div>
          </div>

          <div className="hidden sm:ml-auto sm:block">
            <Sparkles size={27} className="text-amber-400/60" />
          </div>
        </div>

        {/* Séparateur */}
        <div className="relative my-8 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

        {/* Lecteur */}
        <div className="relative">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300">
              <Music2 size={23} />
            </div>

            <div>
              <h3 className="font-extrabold text-gray-900 dark:text-amber-100">
                Prière principale
              </h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Enregistrement audio en {languageName}
              </p>
            </div>
          </div>

          {!verificationTerminee ? (
            <div className="rounded-2xl border border-amber-400/20 bg-amber-50/70 px-5 py-8 text-center dark:bg-white/[0.025]">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-amber-500/20 border-t-amber-600" />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Préparation de votre espace d'écoute...
              </p>
            </div>
          ) : audioDisponible ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-50 to-white p-4 dark:from-amber-400/[0.08] dark:to-white/[0.025] sm:p-6"
            >
              <div className="mb-4 flex items-center gap-2 text-xs font-bold text-green-700 dark:text-green-400">
                <CheckCircle2 size={17} />
                Enregistrement disponible
              </div>

              <audio
                controls
                preload="none"
                className="w-full"
                src={audioUrl}
              >
                Votre navigateur ne prend pas en charge la lecture audio.
              </audio>

              <p className="mt-4 text-center text-xs leading-6 text-gray-500 dark:text-gray-400">
                Prenez un instant de recueillement et laissez-vous guider
                par la prière.
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl border border-amber-400/25 bg-gradient-to-br from-amber-50 to-white px-5 py-9 text-center dark:from-amber-400/[0.06] dark:to-white/[0.02]"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-amber-400/30 bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300">
                <Headphones size={30} />
              </div>

              <h3 className="text-lg font-black text-gray-900 dark:text-amber-100">
                Audio bientôt disponible
              </h3>

              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-gray-600 dark:text-gray-400">
                Cet enregistrement n'est pas encore disponible dans
                cette langue. Il sera accessible dès son ajout
                à la bibliothèque audio de la confrérie.
              </p>

              <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-100/70 px-4 py-2 text-xs font-bold text-amber-800 dark:bg-amber-400/10 dark:text-amber-300">
                <Music2 size={14} />
                Bibliothèque audio
              </span>
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mt-9 flex flex-col justify-center gap-3 sm:flex-row"
      >
        <Link
          to={`/prieres/${priere}`}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-amber-500/30 bg-white/80 px-6 py-3 text-sm font-bold text-amber-800 shadow-sm transition hover:border-amber-500 hover:bg-amber-50 dark:bg-gray-900/80 dark:text-amber-300 dark:hover:bg-amber-400/10"
        >
          <ArrowLeft size={17} />
          Changer de langue
        </Link>

        <Link
          to="/prieres"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-600 to-yellow-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-amber-900/20 transition hover:-translate-y-0.5 hover:from-amber-700 hover:to-yellow-700"
        >
          Toutes les prières
          <ArrowRight size={17} />
        </Link>
      </motion.div>

      <footer className="mt-12 pb-4 text-center">
        <p className="text-[9px] font-bold tracking-[0.25em] text-gray-400 dark:text-gray-500">
          CONFRÉRIE SAINT ENFANT JÉSUS — MIRACULEUX DE PRAGUE
        </p>
      </footer>
    </main>
  );
};

export default AudiosPriere;
