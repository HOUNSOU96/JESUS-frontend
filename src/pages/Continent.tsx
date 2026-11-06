// 📁 Continent.tsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { continents } from "../data";

// Codes ISO pour les drapeaux
const flagCodes: Record<string, string> = {
  benin: "bj",
  nigeria: "ng",
  kenya: "ke",
  france: "fr",
  allemagne: "de",
  espagne: "es",
  chine: "cn",
  japon: "jp",
  inde: "in",
  usa: "us",
  canada: "ca",
  bresil: "br",
  australie: "au",
  nouvellezelande: "nz",
};

const Continent: React.FC = () => {
  const { continent } = useParams<{ continent: string }>();
  const navigate = useNavigate();

  const selected = continents.find((c) => c.name === continent);

  if (!selected) return <div>Continent non trouvé</div>;

  const handleCountry = (countryName: string) => {
    navigate(`/pays/${countryName}`);
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-white dark:text-white z-20"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-10 text-white dark:text-white">
        🌍 {selected.label}
      </h1>

      <div className="flex flex-wrap justify-center gap-6 sm:gap-8 max-w-5xl">
        {selected.countries.map((country) => (
          <div
            key={country.name}
            className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 perspective"
          >
            <motion.button
              onClick={() => handleCountry(country.name)}
              className="card-3d w-full h-full cursor-pointer rounded-full"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Face avant = nom du pays */}
              <div className="card-face bg-white dark:bg-gray-800 text-blue-600 font-semibold text-sm sm:text-base md:text-lg flex items-center justify-center text-center rounded-full">
                {country.label}
              </div>

              {/* Face arrière = drapeau */}
              <div className="card-face card-back bg-white dark:bg-gray-800 flex items-center justify-center p-1 rounded-full">
                <img
                  src={`https://flagcdn.com/w320/${flagCodes[country.name]}.png`}
                  alt={`${country.label} drapeau`}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </motion.button>
          </div>
        ))}
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

export default Continent;
