// src/pages/NotFound.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="text-center mt-10">
      <h1 className="text-4xl font-bold mb-4">404 - Page non trouvée</h1>
      <p className="mb-6">Désolé, cette page n'existe pas.</p>
      <Link
        to="/"
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
      >
        Retour à l’accueil
      </Link>
    </div>
  );
};

export default NotFound;
