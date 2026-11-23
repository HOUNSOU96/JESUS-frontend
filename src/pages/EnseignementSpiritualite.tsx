import React, { useState } from "react";
import { motion } from "framer-motion";
import PublicationsManager from "@/components/PublicationsManager";

type Category = {
  id: string;
  number: string;
  icon: string;
  title: string;
  description: string;
  accent: string;
};

type AudioTeaching = {
  id: string;
  category: string;
  title: string;
  description: string;
  speaker: string;
  duration: string;
  src: string;
};

const categories: Category[] = [
  {
    id: "foi",
    number: "01",
    icon: "✝️",
    title: "Foi et vie chrétienne",
    description: "Grandir dans la foi et vivre chaque jour selon l'Évangile.",
    accent: "from-amber-500/20 to-yellow-500/5",
  },
  {
    id: "enfant-jesus",
    number: "02",
    icon: "👑",
    title: "Saint Enfant Jésus de Prague",
    description: "Découvrir la dévotion et approfondir notre attachement à l'Enfant Jésus.",
    accent: "from-yellow-500/20 to-orange-500/5",
  },
  {
    id: "biblique",
    number: "03",
    icon: "📖",
    title: "Enseignements bibliques",
    description: "Méditer la Parole de Dieu et mieux comprendre les Saintes Écritures.",
    accent: "from-blue-500/20 to-indigo-500/5",
  },
  {
    id: "priere",
    number: "04",
    icon: "🕊️",
    title: "Vie de prière",
    description: "Approfondir la prière, le silence intérieur et la communion avec Dieu.",
    accent: "from-violet-500/20 to-purple-500/5",
  },
  {
    id: "spiritualite",
    number: "05",
    icon: "✨",
    title: "Spiritualité et méditation",
    description: "Nourrir son âme et avancer dans son cheminement spirituel.",
    accent: "from-emerald-500/20 to-teal-500/5",
  },
  {
    id: "confrerie",
    number: "06",
    icon: "🤝",
    title: "Formation des membres",
    description: "Connaître la Confrérie, sa mission, ses valeurs et ses engagements.",
    accent: "from-rose-500/20 to-pink-500/5",
  },
];

// Ajouter ici les enseignements au fur et à mesure de leur disponibilité.
// Exemple :
// {
//   id: "enseignement-001",
//   category: "foi",
//   title: "Grandir dans la foi",
//   description: "Un enseignement pour approfondir sa relation avec Dieu.",
//   speaker: "Nom de l'intervenant",
//   duration: "18 min",
//   src: "/audios/enseignements/grandir-dans-la-foi.mp3",
// },

const teachings: AudioTeaching[] = [];

const EnseignementSpiritualite: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState("tous");

  const visibleTeachings =
    selectedCategory === "tous"
      ? teachings
      : teachings.filter((item) => item.category === selectedCategory);

  return (
    <div className="theme-adaptive relative mx-auto max-w-6xl py-8 sm:py-14">
      {/* Lumières décoratives */}
      <div className="pointer-events-none absolute left-1/2 top-24 h-80 w-80
                      -translate-x-1/2 rounded-full bg-amber-400/[0.08] blur-[110px]" />
      <div className="pointer-events-none absolute right-0 top-[35rem] h-64 w-64
                      rounded-full bg-yellow-500/[0.05] blur-[100px]" />

      {/* En-tête */}
      <motion.header
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative mb-12 overflow-hidden rounded-[2rem]
                   border border-amber-300/25
                   bg-gradient-to-br from-[#251d0d] via-[#111111] to-[#080808]
                   px-6 py-12 text-center shadow-[0_25px_70px_rgba(0,0,0,0.35)]
                   sm:px-12 sm:py-16"
      >
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64
                        rounded-full border border-amber-300/10" />
        <div className="pointer-events-none absolute -left-16 -bottom-28 h-72 w-72
                        rounded-full border border-amber-300/10" />

        <div className="relative mx-auto mb-6 flex h-24 w-24 items-center
                        justify-center rounded-full border border-amber-300/40
                        bg-gradient-to-br from-amber-300/20 to-yellow-700/10
                        text-5xl shadow-[0_0_55px_rgba(234,179,8,0.16)]">
          🕊️
        </div>

        <p className="relative mb-3 text-[10px] font-bold uppercase
                      tracking-[0.35em] text-amber-300/80 sm:text-xs">
          Confrérie Saint Enfant Jésus Miraculeux de Prague
        </p>

        <h1 className="relative text-3xl font-black leading-tight
                       tracking-wide text-amber-100 sm:text-5xl">
          Enseignement
          <span className="block mt-2 text-amber-400">& Spiritualité</span>
        </h1>

        <div className="relative mx-auto my-6 h-px w-32
                        bg-gradient-to-r from-transparent
                        via-amber-400 to-transparent" />

        <p className="relative mx-auto max-w-2xl text-sm leading-7
                      text-slate-300 sm:text-base">
          Une bibliothèque pour nourrir la foi, approfondir la Parole de Dieu
          et grandir dans la spiritualité de la Confrérie.
        </p>

        <div className="relative mt-8 inline-flex items-center gap-2 rounded-full
                        border border-amber-300/25 bg-amber-300/10
                        px-5 py-2.5 text-xs font-semibold text-amber-200">
          <span>🎧</span>
          <span>Écouter • Méditer • Grandir dans la foi</span>
        </div>
      </motion.header>

      {/* Introduction */}
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.6 }}
        className="relative mb-8 flex flex-col gap-4 rounded-3xl
                   border border-amber-300/20 bg-black/40 p-6
                   backdrop-blur-xl sm:flex-row sm:items-center sm:p-7"
      >
        <div className="flex h-14 w-14 shrink-0 items-center justify-center
                        rounded-2xl border border-amber-300/30
                        bg-amber-300/10 text-3xl">
          📚
        </div>
        <div>
          <h2 className="text-lg font-black text-amber-200">
            La connaissance au service de la foi
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Retrouvez ici des enseignements audio, des méditations et des
            formations pour accompagner votre vie chrétienne et votre mission
            au sein de la Confrérie.
          </p>
        </div>
      </motion.section>

      {/* Catégories */}
      <section className="relative">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em]
                          text-amber-400/70">
              Explorez les thèmes
            </p>
            <h2 className="mt-2 text-2xl font-black text-amber-100 sm:text-3xl">
              Nos domaines d'enseignement
            </h2>
          </div>
          <span className="rounded-full border border-amber-300/20
                           bg-amber-300/10 px-3 py-1.5 text-[10px]
                           font-bold uppercase tracking-wider text-amber-200">
            {categories.length} thèmes
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => {
            const active = selectedCategory === category.id;
            const count = teachings.filter(
              (item) => item.category === category.id
            ).length;

            return (
              <motion.button
                key={category.id}
                type="button"
                onClick={() =>
                  setSelectedCategory(active ? "tous" : category.id)
                }
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                aria-pressed={active}
                className={`group relative min-h-[220px] overflow-hidden
                  rounded-[1.7rem] border p-6 text-left
                  transition duration-300 hover:-translate-y-1
                  ${
                    active
                      ? "border-amber-300/80 bg-amber-300/15 shadow-[0_15px_40px_rgba(234,179,8,0.12)]"
                      : "border-amber-300/20 bg-gradient-to-br from-[#1d190f] via-[#111111] to-[#090909] hover:border-amber-300/55 hover:shadow-[0_15px_40px_rgba(234,179,8,0.08)]"
                  }`}
              >
                <div className={`pointer-events-none absolute -right-12 -top-12
                                 h-40 w-40 rounded-full bg-gradient-to-br
                                 ${category.accent} blur-3xl`} />

                <div className="relative flex items-center justify-between">
                  <span className="flex h-14 w-14 items-center justify-center
                                   rounded-2xl border border-amber-300/25
                                   bg-amber-300/10 text-3xl">
                    {category.icon}
                  </span>
                  <span className="text-xs font-black tracking-[0.25em]
                                   text-amber-400/40">
                    {category.number}
                  </span>
                </div>

                <div className="relative mt-7">
                  <h3 className="text-lg font-black leading-snug text-amber-100">
                    {category.title}
                  </h3>
                  <p className="mt-2 text-xs leading-6 text-slate-400">
                    {category.description}
                  </p>
                </div>

                <div className="relative mt-5 flex items-center justify-between
                                border-t border-amber-300/15 pt-4">
                  <span className="text-[10px] font-bold uppercase
                                   tracking-wider text-amber-400/80">
                    {count} audio{count > 1 ? "s" : ""}
                  </span>
                  <span className="text-lg text-amber-300">
                    {active ? "✓" : "↗"}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      <PublicationsManager
        section="enseignement"
        category={selectedCategory}
        categoryOptions={[
          { value: "foi", label: "Foi et vie chrétienne" },
          { value: "enfant-jesus", label: "Saint Enfant Jésus de Prague" },
          { value: "biblique", label: "Enseignements bibliques" },
          { value: "priere", label: "Vie de prière" },
          { value: "spiritualite", label: "Spiritualité et méditation" },
          { value: "confrerie", label: "Formation des membres" },
        ]}
      />

      {/* Citation finale */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative mt-12 rounded-3xl border border-amber-300/15
                   bg-black/35 px-6 py-7 text-center backdrop-blur-lg"
      >
        <span className="text-2xl text-amber-300">✦</span>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-300">
          Que chaque enseignement reçu devienne une lumière pour notre vie,
          un encouragement dans notre foi et un témoignage de notre amour
          pour le Saint Enfant Jésus.
        </p>
        <p className="mt-4 text-[10px] font-bold uppercase
                      tracking-[0.25em] text-amber-400/70">
          Confrérie Saint Enfant Jésus Miraculeux de Prague
        </p>
      </motion.div>
    </div>
  );
};

export default EnseignementSpiritualite;
