// 📁 App.tsx
import React from "react";
import { useAuth } from "./context/AuthContext";
import { BrowserRouter as Router } from "react-router-dom";
import AnimatedRoutes from "./AnimatedRoutes";
import DarkModeToggle from "./components/DarkModeToggle";
import AudioManager from "./components/AudioManager";
import AnnouncementBanner from "./components/AnnouncementBanner";
import ChaplainSignatureGate from "./components/ChaplainSignatureGate";

const App: React.FC = () => {
  const { user } = useAuth();

  return (
    <Router>
      {/* Bandeau d'annonces affiché partout */}
      <AnnouncementBanner />

      {/* Gestion audio (unique instance) */}
      <AudioManager />

      {/* Contrôle de signature persistant pendant la navigation */}
      {user && <ChaplainSignatureGate />}

      {/* Navigation avec animations */}
      <AnimatedRoutes />

      {/* Bouton dark/light mode */}
      <DarkModeToggle />
    </Router>
  );
};

export default App;
