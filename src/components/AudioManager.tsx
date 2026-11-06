import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const audioPlaylist = [
  "/sounds/e1.mp3",
  "/sounds/e2.mp3",
  "/sounds/e3.mp3",
  "/sounds/e4.mp3",
  "/sounds/e5.mp3",
  "/sounds/e6.mp3",
  "/sounds/e7.mp3",
];

// Pages où la musique doit être interrompue.
const shouldPauseAudio = [
  "/inscription",
];

const AudioManager: React.FC = () => {
  const location = useLocation();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const unlockedRef = useRef(false);
  const manualPauseRef = useRef(false);

  const [ready, setReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [notification, setNotification] = useState("");

  const getRandomTrack = (currentTrack?: string) => {
    const available = audioPlaylist.filter(
      (track) => track !== currentTrack
    );

    const tracks = available.length > 0 ? available : audioPlaylist;

    return tracks[Math.floor(Math.random() * tracks.length)];
  };

  // Création d'une seule instance audio pendant toute l'application.
  useEffect(() => {
    const audio = new Audio();

    audio.preload = "auto";
    audio.volume = 0.7;
    audio.muted = false;

    const firstTrack = getRandomTrack();

    audio.src = firstTrack;
    audio.dataset.currentTrack = firstTrack;

    const handleCanPlay = () => {
      setReady(true);
      console.info("Audio prêt :", audio.dataset.currentTrack);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setNotification("");
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      const nextTrack = getRandomTrack(audio.dataset.currentTrack);

      console.info("Changement de morceau :", nextTrack);

      audio.dataset.currentTrack = nextTrack;
      audio.src = nextTrack;
      audio.load();

      if (unlockedRef.current && !manualPauseRef.current) {
        audio.play().catch((error: unknown) => {
          console.error("Lecture du morceau suivant impossible :", error);
        });
      }
    };

    const handleError = () => {
      const code = audio.error?.code ?? 0;

      const messages: Record<number, string> = {
        1: "Lecture audio interrompue.",
        2: "Erreur réseau pendant le chargement audio.",
        3: "Firefox n'arrive pas à décoder ce fichier audio.",
        4: "Format audio ou fichier non pris en charge.",
      };

      const message = messages[code] || "Erreur audio inconnue.";

      console.error("Erreur audio :", {
        fichier: audio.dataset.currentTrack,
        code,
        message,
        source: audio.currentSrc,
      });

      setIsPlaying(false);
      setNotification(message);
    };

    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    audioRef.current = audio;
    audio.load();

    return () => {
      audio.pause();

      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);

      audio.removeAttribute("src");
      audio.load();

      if (audioRef.current === audio) {
        audioRef.current = null;
      }
    };
  }, []);

  // Gestion du démarrage automatique et des changements de pages.
  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    const path = location.pathname.toLowerCase();

    const isHomePage = path === "/";
    const isLoginPage = path === "/login";
    const isAutoStartPage = isHomePage || isLoginPage;

    const excluded = shouldPauseAudio.some((page) =>
      path.includes(page)
    );

    if (excluded) {
      audio.pause();
      return;
    }

    // Démarrage de la musique, avec gestion du blocage de Firefox.
    const attemptPlayback = () => {
      if (manualPauseRef.current || !audio.paused) return;

      audio.play()
        .then(() => {
          unlockedRef.current = true;
          setNotification("");
          console.info("Lecture audio démarrée :", audio.currentSrc);
        })
        .catch((error: unknown) => {
          const name =
            error instanceof Error ? error.name : "Erreur inconnue";

          if (name !== "NotAllowedError") {
            console.error("Échec de la lecture audio :", error);
          }
        });
    };

    if (isAutoStartPage) {
      // Première tentative de lecture automatique.
      attemptPlayback();

      // Firefox peut autoriser la lecture après la première interaction.
      const handleFirstInteraction = () => {
        attemptPlayback();
      };

      window.addEventListener(
        "pointerdown",
        handleFirstInteraction,
        true
      );

      window.addEventListener(
        "keydown",
        handleFirstInteraction,
        true
      );

      window.addEventListener(
        "touchstart",
        handleFirstInteraction,
        true
      );

      return () => {
        window.removeEventListener(
          "pointerdown",
          handleFirstInteraction,
          true
        );

        window.removeEventListener(
          "keydown",
          handleFirstInteraction,
          true
        );

        window.removeEventListener(
          "touchstart",
          handleFirstInteraction,
          true
        );
      };
    }

    // Sur les autres pages, maintenir la lecture si elle était active.
    if (
      unlockedRef.current &&
      !manualPauseRef.current &&
      audio.paused
    ) {
      attemptPlayback();
    }
  }, [location.pathname]);

  // Bouton de contrôle des autres pages.
  const handleToggleAudio = () => {
    const audio = audioRef.current;

    if (!audio) {
      setNotification("Le lecteur audio n'est pas initialisé.");
      return;
    }

    if (!audio.paused) {
      manualPauseRef.current = true;
      audio.pause();
      setNotification("Musique en pause.");
      return;
    }

    manualPauseRef.current = false;
    unlockedRef.current = true;

    setNotification("Démarrage de la musique...");

    audio.play()
      .then(() => {
        console.info("Lecture audio démarrée :", audio.currentSrc);
        setNotification("");
      })
      .catch((error: unknown) => {
        console.error("Échec du démarrage audio :", error);

        const name =
          error instanceof Error ? error.name : "Erreur inconnue";

        if (name === "NotAllowedError") {
          setNotification("Cliquez à nouveau pour autoriser la musique.");
        } else {
          setNotification("Lecture impossible : " + name);
        }

        setIsPlaying(false);
      });
  };

  const path = location.pathname.toLowerCase();

  const isAutoStartPage =
    path === "/" || path === "/login";

  const isExcluded = shouldPauseAudio.some((page) =>
    path.includes(page)
  );

  // Aucun bouton musical sur l'accueil et la connexion.
  if (isAutoStartPage || isExcluded) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] bg-white/95 dark:bg-gray-800 rounded-xl shadow-lg p-3 flex flex-col items-center gap-2 w-[190px]">

      <button
        type="button"
        onClick={handleToggleAudio}
        className="w-full text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg transition"
      >
        {isPlaying ? "⏸ Pause" : "🔊 Allumer"}
      </button>

      <div className="text-[11px] text-gray-600 dark:text-gray-300 text-center">
        {isPlaying
          ? "Lecture en cours..."
          : ready
          ? "Musique en pause."
          : "Préparation du lecteur audio..."}
      </div>

      {notification && (
        <div className="text-xs text-center text-orange-600 dark:text-orange-300 break-words">
          {notification}
        </div>
      )}
    </div>
  );
};

export default AudioManager;
