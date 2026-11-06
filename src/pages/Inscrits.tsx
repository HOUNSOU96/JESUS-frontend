// 📁 src/pages/Inscrits.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";

type Inscrit = {
  nom: string;
  prenom: string;
};

const Inscrits: React.FC = () => {
  const { paroisse } = useParams<{ paroisse: string }>();
  const [inscrits, setInscrits] = useState<Inscrit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInscrits = async () => {
      try {
        const res = await fetch(`/api/inscrits/${paroisse}`);
        const data = await res.json();
        setInscrits(data);
      } catch (error) {
        console.error("Erreur chargement inscrits :", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInscrits();
  }, [paroisse]);

  if (loading) {
    return <div className="text-center py-10">⏳ Chargement...</div>;
  }

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-gray-900 dark:text-white"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
    >
       <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-10 text-center text-white">
        👥 Membres inscrits de la paroisse{" "}
        <span className="text-blue-600 dark:text-blue-400">{paroisse}</span>
      </h1>

      {inscrits.length === 0 ? (
        <p className="text-red-600 dark:text-red-400">
          Aucun membre inscrit pour cette paroisse.
        </p>
      ) : (
        <ul className="w-full max-w-2xl divide-y divide-gray-300 dark:divide-gray-700">
          {inscrits.map((i, idx) => (
            <li
              key={idx}
              className="py-3 flex justify-between items-center px-4 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              <span className="font-semibold">{i.nom}</span>
              <span>{i.prenom}</span>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
};

export default Inscrits;
