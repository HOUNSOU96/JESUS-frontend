import React from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Globe2,
  Languages,
  Sparkles,
} from "lucide-react";

const languages = [
  { name: "Français", slug: "francais", symbol: "🇫🇷", description: "Prier dans la langue française" },
  { name: "Fon", slug: "fon", symbol: "🇧🇯", description: "Prier dans la langue Fon" },
  { name: "Anglais", slug: "anglais", symbol: "🌍", description: "Pray in English" },
  { name: "Nago", slug: "nago", symbol: "🌿", description: "Prier dans la langue Nago" },
  { name: "Dindi", slug: "dindi", symbol: "🌍", description: "Prier dans la langue Dindi" },
];

const ChoixLanguePriere: React.FC = () => {
  const { priere = "" } = useParams();

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
        className="relative mb-12 text-center"
      >
        <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-amber-400/50 bg-gradient-to-br from-amber-100 to-yellow-50 text-amber-700 shadow-[0_0_45px_rgba(234,179,8,0.15)] dark:from-amber-300/20 dark:to-yellow-700/10 dark:text-amber-200">
          <Globe2 size={38} strokeWidth={1.5} />
          <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-amber-500 text-white dark:border-gray-950">
            <Sparkles size={13} />
          </span>
        </div>

        <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.35em] text-amber-700 dark:text-amber-400">
          Confrérie Saint Enfant Jésus
        </p>

        <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-amber-100 sm:text-5xl">
          Choisissez votre langue
        </h1>

        <div className="mx-auto my-5 h-px w-32 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

        <p className="mx-auto max-w-xl text-sm leading-7 text-gray-600 dark:text-gray-300 sm:text-base">
          Chaque langue est une invitation à la prière.
          Choisissez celle dans laquelle vous souhaitez vivre
          ce moment de communion avec l’Enfant Jésus.
        </p>
      </motion.header>

      {/* Indication */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="mb-6 flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          <Languages size={18} className="text-amber-600 dark:text-amber-400" />
          Langues disponibles
        </div>

        <span className="rounded-full border border-amber-500/30 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 dark:bg-amber-400/10 dark:text-amber-300">
          {languages.length} langues
        </span>
      </motion.div>

      {/* Cartes des langues */}
      <div className="relative grid gap-4 sm:grid-cols-2">
        {languages.map((language, index) => (
          <motion.div
            key={language.slug}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: index * 0.09 }}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              to={`/prieres/${priere}/${language.slug}`}
              className="group relative flex min-h-[112px] items-center gap-5 overflow-hidden rounded-3xl border border-amber-400/25 bg-white/90 p-5 shadow-lg shadow-amber-900/5 transition-all duration-300 hover:border-amber-500/60 hover:shadow-xl hover:shadow-amber-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:bg-gradient-to-br dark:from-[#201a0e] dark:via-[#15120d] dark:to-[#080808] dark:shadow-black/30 dark:hover:border-amber-300/60"
            >
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-400/10 blur-3xl transition group-hover:bg-amber-400/20" />

              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-100 to-yellow-50 text-3xl shadow-inner transition duration-300 group-hover:scale-105 dark:from-amber-300/15 dark:to-yellow-700/10">
                {language.symbol}
              </div>

              <div className="relative min-w-0 flex-1">
                <h2 className="text-lg font-extrabold text-gray-900 transition-colors group-hover:text-amber-700 dark:text-amber-100 dark:group-hover:text-amber-300">
                  {language.name}
                </h2>

                <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
                  {language.description}
                </p>
              </div>

              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber-400/30 bg-amber-50 text-amber-700 transition-all duration-300 group-hover:border-amber-500 group-hover:bg-amber-500 group-hover:text-white dark:bg-amber-400/10 dark:text-amber-300">
                <ArrowRight size={19} />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Message spirituel */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        className="mt-12 rounded-3xl border border-amber-400/20 bg-gradient-to-r from-amber-50/80 via-white to-amber-50/80 px-6 py-6 text-center dark:from-amber-400/[0.06] dark:via-white/[0.02] dark:to-amber-400/[0.06]"
      >
        <Sparkles size={21} className="mx-auto mb-3 text-amber-600 dark:text-amber-400" />

        <p className="text-sm font-medium leading-7 text-gray-600 dark:text-gray-300">
          « Que toutes les nations et toutes les langues
          célèbrent la gloire de l’Enfant Jésus. »
        </p>
      </motion.div>

      {/* Retour */}
      <div className="mt-10 text-center">
        <Link
          to="/prieres"
          className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-white/80 px-6 py-3 text-sm font-bold text-amber-800 shadow-sm transition hover:border-amber-500 hover:bg-amber-50 dark:bg-gray-900/80 dark:text-amber-300 dark:hover:bg-amber-400/10"
        >
          <ArrowLeft size={17} />
          Retour aux prières
        </Link>
      </div>

      <footer className="mt-12 text-center">
        <p className="text-[9px] font-bold tracking-[0.25em] text-gray-400 dark:text-gray-500">
          CONFRÉRIE SAINT ENFANT JÉSUS — MIRACULEUX DE PRAGUE
        </p>
      </footer>
    </main>
  );
};

export default ChoixLanguePriere;
