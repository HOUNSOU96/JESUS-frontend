import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";

import { GiEarthAfricaEurope, GiEarthAsiaOceania } from "react-icons/gi";
import { FaGlobeAmericas } from "react-icons/fa";
import { MdAcUnit } from "react-icons/md";

const Matiere: React.FC = () => {
  const { loading } = useAuth();
  const navigate = useNavigate();

  const continents = [
    { name: "afrique", label: "Afrique", icon: GiEarthAfricaEurope, color: "text-green-600" },
    { name: "europe", label: "Europe", icon: GiEarthAfricaEurope, color: "text-blue-600" },
    { name: "asie", label: "Asie", icon: GiEarthAsiaOceania, color: "text-red-600" },
    { name: "amerique", label: "Amérique", icon: FaGlobeAmericas, color: "text-orange-600" },
    { name: "oceanie", label: "Océanie", icon: GiEarthAsiaOceania, color: "text-purple-600" },
    { name: "antarctique", label: "Antarctique", icon: MdAcUnit, color: "text-cyan-600" },
  ];

  if (loading) return <div>Chargement...</div>;

  const handleChoice = (continent: string) => {
    navigate(`/continents/${continent}`);
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-black dark:text-white z-20"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-10 text-white dark:text-white">
        🌍 CHOISISSEZ UN CONTINENT
      </h1>

      <div className="flex flex-wrap justify-center gap-6 sm:gap-8 max-w-5xl">
        {continents.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.name}
              className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 perspective"
            >
              <motion.button
                onClick={() => handleChoice(c.name)}
                className="card-3d w-full h-full cursor-pointer rounded-full"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Face avant = nom */}
                <div className="card-face bg-white dark:bg-gray-800 text-blue-700 font-semibold text-sm sm:text-base md:text-lg flex items-center justify-center text-center rounded-full">
                  {c.label}
                </div>

                {/* Face arrière = icône */}
                <div className="card-face card-back bg-white dark:bg-gray-800 flex items-center justify-center rounded-full">
                  <Icon className={`text-3xl sm:text-4xl md:text-5xl ${c.color} dark:text-white`} />
                </div>
              </motion.button>
            </div>
          );
        })}
      </div>

      {/* Styles pour 3D */}
      <style>{`
        .perspective {
          perspective: 1000px;
        }
        .card-3d {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          transition: transform 0.6s;
        }
        .card-3d:hover {
          transform: rotateY(180deg);
        }
        .card-face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 9999px; /* cercle */
        }
        .card-back {
          transform: rotateY(180deg);
        }
      `}</style>
    </motion.div>
  );
};

export default Matiere;
