import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const DarkModeToggle: React.FC = () => {
  const location = useLocation();
  const [isDark, setIsDark] = useState<boolean>(() => {
    const theme = localStorage.getItem("theme");
    return (
      theme === "dark" ||
      (theme === null && window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  // Ne pas rendre le bouton sur la page 1 ("/")
  if (location.pathname === "/") return null;

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="fixed top-4 right-4 z-50 bg-gray-200 dark:bg-gray-700 text-xl p-2 rounded-full shadow hover:scale-105 transition"
      aria-label="Basculer le thème sombre"
    >
      {isDark ? "🌙" : "☀️"}
    </button>
  );
};

export default DarkModeToggle;