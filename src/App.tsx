// 📁 App.tsx
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AnimatedRoutes from "./AnimatedRoutes";
import DarkModeToggle from "./components/DarkModeToggle";
import AudioManager from "./components/AudioManager";
import AnnouncementBanner from "./components/AnnouncementBanner";

const App: React.FC = () => {
  return (
    <Router>
      {/* Bandeau d'annonces affiché partout */}
      <AnnouncementBanner />

      {/* Gestion audio (unique instance) */}
      <AudioManager />

      {/* Navigation avec animations */}
      <AnimatedRoutes />

      {/* Bouton dark/light mode */}
      <DarkModeToggle />
    </Router>
  );
};

export default App;
