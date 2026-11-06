// 📁 src/pages/Paroisse.tsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { continents } from "../data";

const Paroisse: React.FC = () => {
  const { country, diocese } = useParams<{ country: string; diocese: string }>();
  const navigate = useNavigate();

  // Trouver le continent qui contient le pays
  const continent = continents.find((c) =>
    c.countries.some((p) => p.name === country)
  );
  if (!continent) {
    return <div className="text-center py-10">🌍 Pays non trouvé</div>;
  }

  // Trouver le pays sélectionné
  const selectedCountry = continent.countries.find((p) => p.name === country);
  if (!selectedCountry) {
    return <div className="text-center py-10">🌍 Pays non trouvé</div>;
  }

  // Trouver le diocèse sélectionné
  const selectedDiocese = selectedCountry.dioceses.find(
    (d) => d.name.toLowerCase() === diocese?.toLowerCase()
  );
  if (!selectedDiocese) {
    return <div className="text-center py-10">⛪ Diocèse non trouvé</div>;
  }

  const parishes = selectedDiocese.parishes || [];

  // 👉 Rediriger vers la page des inscrits de cette paroisse
  const handleParishClick = (parish: string) => {
    navigate(`/inscrits/${country}/${diocese}/${parish}`);
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-white-900 dark:text-white"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
    >
      {/* Titre */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-10 text-center text-white">
  ⛪ Paroisses du diocèse de{" "}
  <span className="text-white">
    {selectedDiocese.name}
  </span>{" "}
  ({selectedCountry.label})
</h1>


      {/* Liste des paroisses */}
      <div className="flex flex-wrap justify-center gap-6 sm:gap-8 max-w-5xl">
        {parishes.map((parish, index) => (
          <div
            key={index}
            className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 perspective"
            onClick={() => handleParishClick(parish)}
          >
            <motion.div
              className="card-3d w-full h-full rounded-full cursor-pointer"
              whileHover={{ rotateY: 180 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Face avant */}
              <div className="card-face bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-400 font-semibold text-sm sm:text-base md:text-lg flex items-center justify-center text-center rounded-full px-2">
                {parish}
              </div>
              {/* Face arrière */}
              <div className="card-face card-back bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-400 font-semibold text-xs sm:text-sm md:text-base flex items-center justify-center text-center rounded-full px-2">
                Liste des membres
              </div>
            </motion.div>
          </div>
        ))}
      </div>

      {/* Styles 3D */}
      <style>{`
        .perspective { perspective: 1000px; }
        .card-3d {
          position: relative; width: 100%; height: 100%;
          transform-style: preserve-3d;
          transition: transform 0.6s;
        }
        .card-3d:hover { transform: rotateY(180deg); }
        .card-face {
          position: absolute; width: 100%; height: 100%;
          backface-visibility: hidden; border-radius: 9999px;
        }
        .card-back { transform: rotateY(180deg); }
      `}</style>
    </motion.div>
  );
};

export default Paroisse;
