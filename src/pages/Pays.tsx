// 📁 src/pages/Pays.tsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { continents } from "../data";

const Pays: React.FC = () => {
  const { country } = useParams<{ country: string }>();
  const navigate = useNavigate();

  const continent = continents.find((c) =>
    c.countries.some((p) => p.name === country)
  );
  if (!continent) return <div>Pays non trouvé</div>;

  const selectedCountry = continent.countries.find((p) => p.name === country);
  if (!selectedCountry) return <div>Pays non trouvé</div>;

  const dioceses = selectedCountry.dioceses || [];

  // Fonction pour naviguer vers les paroisses
  const handleDioceseClick = (diocese: string) => {
    navigate(`/paroisses/${country}/${diocese}`);
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-white dark:text-white z-20"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-10"> 🌍 {selectedCountry.label} </h1>

      <div className="flex flex-wrap justify-center gap-6 sm:gap-8 max-w-5xl">
        {dioceses.map((diocese) => (
          <div
            key={diocese.name}
            className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 perspective"
          >
            <motion.div
              className="card-3d w-full h-full rounded-full cursor-pointer"
              whileHover={{ rotateY: 180 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleDioceseClick(diocese.name)}
            >
              {/* Face avant = nom du diocèse */}
              <div className="card-face bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-400 font-semibold text-base sm:text-lg md:text-xl flex items-center justify-center text-center rounded-full">
                {diocese.name}
              </div>

              {/* Face arrière = Diocèse de {Pays} */}
              <div className="card-face card-back bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-400 font-semibold text-base sm:text-lg md:text-xl flex items-center justify-center text-center rounded-full">
                Diocèse de 
              </div>
            </motion.div>
          </div>
        ))}
      </div>

      {/* Styles 3D */}
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
          border-radius: 9999px;
        }
        .card-back {
          transform: rotateY(180deg);
        }
      `}</style>
    </motion.div>
  );
};

export default Pays;
