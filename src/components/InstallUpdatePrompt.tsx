import { useEffect, useState } from "react";
import { registerSW } from "virtual:pwa-register";
import { useOperationProgress } from "@/components/OperationProgress";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallUpdatePrompt() {
  const progress = useOperationProgress();

  const [installEvent, setInstallEvent] =
    useState<InstallPromptEvent | null>(null);

  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [applyUpdate, setApplyUpdate] =
    useState<(() => Promise<void>) | null>(null);

  const isIOS =
    /iphone|ipad|ipod/i.test(navigator.userAgent) &&
    !(window.navigator as Navigator & { standalone?: boolean }).standalone;

  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const updateSW = registerSW({
      immediate: true,

      onNeedRefresh() {
        setUpdateAvailable(true);
      },

      onRegisteredSW(_swUrl, registration) {
        if (!registration) return;

        // Vérification automatique des nouvelles versions.
        const checkUpdates = () => {
          if (navigator.onLine) {
            registration.update().catch((error) => {
              console.warn("Vérification PWA impossible :", error);
            });
          }
        };

        const interval = window.setInterval(checkUpdates, 60 * 60 * 1000);

        return () => window.clearInterval(interval);
      },
    });

    setApplyUpdate(() => () => updateSW(false));

    const handleInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
    };

    const handleInstalled = () => {
      setInstallEvent(null);
      setDismissed(true);
    };

    window.addEventListener("beforeinstallprompt", handleInstall);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const installApp = async () => {
    if (isIOS) {
      progress.start(
        "Installation de JESUS",
        "Pour installer l'application sur votre iPhone :\n\n1. Ouvrez le menu Partager de Safari.\n2. Choisissez « Sur l'écran d'accueil ».\n3. Touchez « Ajouter » pour terminer."
      );
      progress.success(
        "Suivez ces étapes pour ajouter JESUS à l'écran d'accueil de votre téléphone."
      );
      return;
    }

    if (!installEvent) return;

    progress.start(
      "Installation de JESUS",
      "Préparation de l'installation de l'application sur votre téléphone..."
    );

    try {
      await installEvent.prompt();

      progress.update("Confirmation de votre choix...");

      const choice = await installEvent.userChoice;

      if (choice.outcome === "accepted") {
        setInstallEvent(null);
        setDismissed(true);

        progress.success(
          "Votre demande d'installation a été acceptée. JESUS sera disponible depuis l'écran d'accueil de votre téléphone."
        );
      } else {
        progress.error(
          "Installation annulée. Vous pourrez installer JESUS à tout moment."
        );
      }
    } catch (error) {
      console.error("Erreur installation PWA :", error);

      progress.error(
        "Impossible de lancer l'installation. Vérifiez votre connexion et réessayez."
      );
    }
  };

  const updateApp = async () => {
    if (!applyUpdate) return;

    progress.start(
      "Mise à jour de JESUS",
      "Préparation du téléchargement de la nouvelle version..."
    );

    try {
      progress.update(
        "Téléchargement et activation des nouveaux fichiers de l'application..."
      );

      await applyUpdate();

      progress.success(
        "La nouvelle version de JESUS est prête. Actualisation de l'application..."
      );

      window.setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Erreur mise à jour PWA :", error);

      progress.error(
        "La mise à jour n'a pas pu être terminée. Veuillez réessayer ultérieurement."
      );
    }
  };

  if (isStandalone || dismissed) return null;

  const canInstall = isIOS || !!installEvent;

  if (!canInstall && !updateAvailable) return null;

  return (
    <div className="fixed bottom-4 right-3 z-[80] w-[min(92vw,360px)] space-y-3">

      {canInstall && (
        <section className="rounded-2xl border border-amber-400/40
                            bg-gradient-to-br from-[#17130b]/95 to-black/95
                            p-4 text-amber-50 shadow-2xl backdrop-blur-xl">

          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-bold text-amber-300">
                Installer SAINT ENFANT JÉSUS
              </p>

              <p className="mt-1 text-xs leading-relaxed text-gray-300">
                Retrouvez votre application directement sur votre téléphone.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setDismissed(true)}
              aria-label="Fermer"
              className="text-gray-400 transition hover:text-white"
            >
              ✕
            </button>
          </div>

          <button
            type="button"
            onClick={installApp}
            className="mt-3 w-full rounded-xl
                       bg-gradient-to-r from-amber-300 to-yellow-500
                       px-4 py-3 text-sm font-black text-black
                       shadow-lg shadow-amber-500/10
                       transition hover:brightness-110 active:scale-[0.98]"
          >
            ⬇ Installer l’application
          </button>
        </section>
      )}

      {updateAvailable && (
        <section className="rounded-2xl border border-emerald-400/40
                            bg-gradient-to-br from-[#101b13]/95 to-black/95
                            p-4 text-white shadow-2xl backdrop-blur-xl">

          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-bold text-emerald-300">
                Nouvelle version disponible
              </p>

              <p className="mt-1 text-xs leading-relaxed text-gray-300">
                Une mise à jour de JESUS est prête à être installée.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setUpdateAvailable(false)}
              aria-label="Fermer"
              className="text-gray-400 transition hover:text-white"
            >
              ✕
            </button>
          </div>

          <button
            type="button"
            onClick={updateApp}
            className="mt-3 w-full rounded-xl
                       bg-gradient-to-r from-emerald-400 to-green-500
                       px-4 py-3 text-sm font-black text-black
                       shadow-lg shadow-green-500/10
                       transition hover:brightness-110 active:scale-[0.98]"
          >
            ↻ Mettre à jour l’application
          </button>
        </section>
      )}
    </div>
  );
}
