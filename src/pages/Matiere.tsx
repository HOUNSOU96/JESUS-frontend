import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";

import {
  GiEarthAfricaEurope,
  GiEarthAsiaOceania,
} from "react-icons/gi";

import { FaGlobeAmericas } from "react-icons/fa";
import { MdAcUnit } from "react-icons/md";
import { FiArrowRight, FiGlobe } from "react-icons/fi";

const continents = [
  {
    name: "afrique",
    label: "Afrique",
    icon: GiEarthAfricaEurope,
    color: "from-emerald-400 to-green-700",
    light: "bg-emerald-400/15",
    description: "Le continent africain et ses communautés.",
    symbol: "🌍",
  },
  {
    name: "europe",
    label: "Europe",
    icon: GiEarthAfricaEurope,
    color: "from-blue-400 to-indigo-700",
    light: "bg-blue-400/15",
    description: "Les communautés européennes.",
    symbol: "🌐",
  },
  {
    name: "asie",
    label: "Asie",
    icon: GiEarthAsiaOceania,
    color: "from-rose-400 to-red-700",
    light: "bg-rose-400/15",
    description: "Les communautés du continent asiatique.",
    symbol: "🌏",
  },
  {
    name: "amerique",
    label: "Amérique",
    icon: FaGlobeAmericas,
    color: "from-orange-400 to-amber-700",
    light: "bg-orange-400/15",
    description: "Les communautés des Amériques.",
    symbol: "🌎",
  },
  {
    name: "oceanie",
    label: "Océanie",
    icon: GiEarthAsiaOceania,
    color: "from-purple-400 to-violet-700",
    light: "bg-purple-400/15",
    description: "Les communautés de l'Océanie.",
    symbol: "🌊",
  },
  {
    name: "antarctique",
    label: "Antarctique",
    icon: MdAcUnit,
    color: "from-cyan-300 to-sky-700",
    light: "bg-cyan-400/15",
    description: "Le territoire polaire austral.",
    symbol: "❄️",
  },
];

const Matiere: React.FC = () => {
  const { loading } = useAuth();
  const navigate = useNavigate();

  const handleChoice = (continent: string) => {
    navigate(`/continents/${continent}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-blue-400" />
          <p className="text-sm font-medium text-white">
            Chargement de votre espace...
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.main
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.45 }}
      className="relative z-20 min-h-[calc(100vh-4rem)] overflow-hidden px-4 py-10 sm:px-6 sm:py-14"
    >
      {/* Décoration d'arrière-plan */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-20 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-500/20 blur-[100px]"
      />

      <div className="mx-auto max-w-6xl">
        {/* En-tête */}
        <header className="mb-12 text-center">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/30 bg-white/10 shadow-2xl shadow-blue-950/30 backdrop-blur-xl"
          >
            <FiGlobe className="text-5xl text-white" />
          </motion.div>

          <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-blue-200 sm:text-sm">
            Confrérie Saint Enfant Jésus
          </p>

          <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-lg sm:text-4xl md:text-5xl">
            Choisissez un continent
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
            Explorez les différentes régions du monde et découvrez
            l'organisation de notre confrérie à travers les continents.
          </p>

          <div className="mx-auto mt-6 h-1 w-20 rounded-full bg-gradient-to-r from-blue-300 via-white to-blue-300" />
        </header>

        {/* Compteur */}
        <div className="mb-7 flex items-center justify-center">
          <div className="flex items-center gap-3 rounded-full border border-white/20 bg-black/20 px-5 py-2.5 text-sm text-white shadow-lg backdrop-blur-md">
            <FiGlobe className="text-lg text-blue-300" />
            <span className="font-semibold">
              {continents.length} continents disponibles
            </span>
          </div>
        </div>

        {/* Cartes des continents */}
        <section
          aria-label="Liste des continents"
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
        >
          {continents.map((continent, index) => {
            const Icon = continent.icon;

            return (
              <motion.button
                key={continent.name}
                type="button"
                onClick={() => handleChoice(continent.name)}
                aria-label={`Explorer le continent ${continent.label}`}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.08,
                }}
                whileHover={{ y: -7, scale: 1.015 }}
                whileTap={{ scale: 0.97 }}
                className="group relative flex min-h-[190px] w-full flex-col overflow-hidden rounded-3xl border border-white/25 bg-white/90 p-6 text-left shadow-xl shadow-black/10 backdrop-blur-xl transition-all duration-300 hover:border-white/60 hover:bg-white dark:bg-gray-900/85 dark:hover:bg-gray-900 sm:min-h-[205px] sm:p-7"
              >
                {/* Halo décoratif */}
                <div
                  aria-hidden="true"
                  className={`absolute -right-12 -top-12 h-36 w-36 rounded-full ${continent.light} blur-2xl transition-transform duration-500 group-hover:scale-150`}
                />

                <div className="relative z-10 flex w-full items-start justify-between">
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${continent.color} shadow-lg transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110`}
                  >
                    <Icon className="text-4xl text-white" />
                  </div>

                  <span className="text-2xl opacity-80 transition-transform duration-300 group-hover:scale-125">
                    {continent.symbol}
                  </span>
                </div>

                <div className="relative z-10 mt-6 flex w-full items-end justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-extrabold text-gray-900 dark:text-white sm:text-2xl">
                      {continent.label}
                    </h2>

                    <p className="mt-2 text-sm leading-5 text-gray-600 dark:text-gray-300">
                      {continent.description}
                    </p>
                  </div>

                  <span className="mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-all duration-300 group-hover:bg-blue-700 group-hover:text-white dark:bg-gray-800 dark:text-gray-200">
                    <FiArrowRight className="text-xl transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </div>

                {/* Barre décorative */}
                <div
                  className={`absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r ${continent.color} transition-all duration-500 group-hover:w-full`}
                />
              </motion.button>
            );
          })}
        </section>

        {/* Pied de section */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-10 text-center text-xs leading-6 text-white/70 sm:text-sm"
        >
          Sélectionnez un continent pour poursuivre votre exploration.
        </motion.p>
      </div>
    </motion.main>
  );
};

export default Matiere;
