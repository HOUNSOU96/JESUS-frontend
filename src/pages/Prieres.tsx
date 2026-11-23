import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PublicationsManager from "@/components/PublicationsManager";

const prayers = [
  {
    title: "La Neuvaine",
    subtitle: "Un temps de prière et de dévotion",
    symbol: "✦",
    number: "01",
    slug: "neuvaine",
  },
  {
    title: "Prière du lundi",
    subtitle: "Un rendez-vous spirituel hebdomadaire",
    symbol: "🙏",
    number: "02",
    slug: "lundi",
  },
  {
    title: "Prière du temps de l’Avent",
    subtitle: "Un cheminement spirituel vers Noël",
    symbol: "🕯️",
    number: "03",
    slug: "avent",
  },
  {
    title: "Prière du 25",
    subtitle: "Un rendez-vous mensuel de prière à l’Enfant Jésus",
    symbol: "✨",
    number: "04",
    slug: "25",
  },
];

const Prieres: React.FC = () => {
  return (
    <div className="theme-adaptive relative mx-auto max-w-5xl py-10 sm:py-16">

      <div className="pointer-events-none absolute left-1/2 top-20 h-72 w-72
                      -translate-x-1/2 rounded-full bg-amber-400/[0.07] blur-[100px]" />

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
          ✨
        </div>

        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.4em]
                      text-amber-400/70">
          Confrérie Saint Enfant Jésus
        </p>

        <h1 className="text-3xl font-black tracking-wide text-amber-100
                       sm:text-5xl">
          Les prières
        </h1>

        <div className="mx-auto my-5 h-px w-28
                        bg-gradient-to-r from-transparent
                        via-amber-400 to-transparent" />

        <p className="mx-auto max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
          Découvrez nos différents temps de prière et approfondissez
          votre cheminement spirituel dans la foi.
        </p>
      </motion.header>

      <div className="relative grid gap-5 sm:grid-cols-2">
        {prayers.map((prayer, index) => (
          <Link
            key={prayer.number}
            to={`/prieres/${prayer.slug}`}
            className="block rounded-[1.8rem] focus:outline-none
                       focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.12 }}
              className="group relative min-h-[245px] overflow-hidden
                         rounded-[1.8rem] border border-amber-300/25
                         bg-gradient-to-br from-[#201a0e] via-[#111111] to-[#080808]
                         p-7 text-left shadow-[0_18px_45px_rgba(0,0,0,0.35)]
                         transition duration-300 hover:-translate-y-1
                         hover:border-amber-300/60 hover:shadow-[0_18px_45px_rgba(234,179,8,0.10)]"
            >
              <div className="pointer-events-none absolute -right-12 -top-12
                              h-40 w-40 rounded-full bg-amber-400/[0.06] blur-3xl" />

              <div className="relative flex items-center justify-between">
                <span className="flex h-14 w-14 items-center justify-center
                                 rounded-2xl border border-amber-300/30
                                 bg-amber-300/10 text-3xl text-amber-200">
                  {prayer.symbol}
                </span>

                <span className="text-xs font-black tracking-[0.25em]
                                 text-amber-400/40">
                  {prayer.number}
                </span>
              </div>

              <div className="relative mt-8">
                <h2 className="text-xl font-black leading-snug text-amber-100">
                  {prayer.title}
                </h2>

                <p className="mt-2 text-xs leading-6 text-slate-400">
                  {prayer.subtitle}
                </p>
              </div>

              <div className="relative mt-6 flex items-center justify-between
                              border-t border-amber-300/15 pt-4">
                <span className="text-[9px] font-bold uppercase
                                 tracking-[0.2em] text-amber-400/80">
                  Choisir une langue
                </span>
                <span className="text-lg text-amber-300">✧</span>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      <PublicationsManager
        section="priere"
        categoryOptions={[
          { value: "neuvaine", label: "La Neuvaine" },
          { value: "lundi", label: "Prière du lundi" },
          { value: "avent", label: "Temps de l’Avent" },
          { value: "25", label: "Prière du 25" },
        ]}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="relative mt-12 rounded-2xl border border-amber-300/15
                   bg-white/[0.025] px-6 py-5 text-center"
      >
        <p className="text-xs leading-6 text-slate-400">
          <span className="text-amber-300">✦</span>
          {" "}Que la prière accompagne chaque membre dans son cheminement
          spirituel et renforce son attachement à l’Enfant Jésus.
        </p>
      </motion.div>
    </div>
  );
};

export default Prieres;
