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
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem("jesus-install-dismissed") === "true"
  );
  const [showHelp, setShowHelp] = useState(false);
  const [applyUpdate, setApplyUpdate] =
    useState<(() => Promise<void>) | null>(null);

  const ua = navigator.userAgent.toLowerCase();

  const isIOS =
    /iphone|ipad|ipod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  const isAndroid = /android/.test(ua);

  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  const showInstall = !isStandalone && !dismissed;

  useEffect(() => {
    const handleInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
    };

    const handleInstalled = () => {
      setInstallEvent(null);
      setDismissed(true);
      sessionStorage.setItem("jesus-install-dismissed", "true");
    };

    window.addEventListener("beforeinstallprompt", handleInstall);
    window.addEventListener("appinstalled", handleInstalled);

    let cleanupInterval: (() => void) | undefined;

    if ("serviceWorker" in navigator) {
      const updateSW = registerSW({
        immediate: true,
        onNeedRefresh() {
          setUpdateAvailable(true);
        },
        onRegisteredSW(_swUrl, registration) {
          if (!registration) return;

          const interval = window.setInterval(() => {
            if (navigator.onLine) {
              registration.update().catch((error) =>
                console.warn("Vérification PWA impossible :", error)
              );
            }
          }, 60 * 60 * 1000);

          cleanupInterval = () => window.clearInterval(interval);
        },
      });

      setApplyUpdate(() => () => updateSW(false));
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstall);
      window.removeEventListener("appinstalled", handleInstalled);
      cleanupInterval?.();
    };
  }, []);

  const dismissInstall = () => {
    setDismissed(true);
    sessionStorage.setItem("jesus-install-dismissed", "true");
  };

  const installApp = async () => {
    if (!installEvent) {
      setShowHelp((previous) => !previous);
      return;
    }

    progress.start(
      "Installation de JESUS",
      "Préparation de la demande d'installation. Veuillez patienter..."
    );

    try {
      await installEvent.prompt();
      const choice = await installEvent.userChoice;

      if (choice.outcome === "accepted") {
        setInstallEvent(null);
        dismissInstall();
        progress.success(
          "JESUS a été accepté pour installation sur votre appareil."
        );
      } else {
        progress.error("Installation annulée. Vous pourrez réessayer.");
      }
    } catch (error) {
      console.error("Erreur installation PWA :", error);
      progress.error(
        "Une erreur est survenue pendant la demande d'installation. Vous pouvez réessayer ou consulter les instructions."
      );
      setShowHelp(true);
    }
  };

  const updateApp = async () => {
    if (!applyUpdate) return;

    progress.start(
      "Mise à jour de JESUS",
      "Préparation du téléchargement de la nouvelle version..."
    );

    try {
      progress.update("Activation des nouveaux fichiers de l'application...");
      await applyUpdate();

      progress.success("La nouvelle version de JESUS est prête.");

      window.setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error("Erreur mise à jour PWA :", error);
      progress.error("La mise à jour n'a pas pu être terminée.");
    }
  };

  if (!showInstall && !updateAvailable) return null;

  return (
    <div className="fixed bottom-4 right-3 z-[80] flex w-[min(94vw,390px)] flex-col gap-3">

      {/* CARTE D'INSTALLATION */}
      {showInstall && (
        <section className="relative overflow-hidden rounded-[26px] border border-amber-300/25 bg-[#100d08]/95 text-white shadow-[0_20px_70px_rgba(0,0,0,0.55)] backdrop-blur-2xl">

          <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-16 h-40 w-40 rounded-full bg-yellow-600/10 blur-3xl" />

          <div className="relative p-4 sm:p-5">

            <div className="flex items-start gap-3">
              <div className="h-[62px] w-[62px] shrink-0 overflow-hidden rounded-2xl border border-amber-300/40 bg-black shadow-lg shadow-amber-500/10">
                <img
                  src="/pwa-icon-192.png"
                  alt="SAINT ENFANT JÉSUS"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="min-w-0 flex-1 pt-1">
                <div className="mb-1 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.19em] text-amber-300/80">
                    Votre application officielle
                  </span>
                </div>

                <h3 className="text-[15px] font-extrabold leading-tight tracking-wide text-amber-50">
                  SAINT ENFANT JÉSUS
                </h3>

                <p className="mt-1 text-[11px] leading-relaxed text-white/55">
                  La Confrérie vous accompagne partout.
                </p>
              </div>

              <button
                type="button"
                onClick={dismissInstall}
                aria-label="Fermer l'invitation"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm text-white/50 transition hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="my-4 h-px bg-gradient-to-r from-transparent via-amber-300/25 to-transparent" />

            <p className="text-[13px] font-semibold leading-relaxed text-white/90">
              Emportez SAINT ENFANT JÉSUS partout avec vous.
            </p>

            <p className="mt-1 text-[11px] leading-relaxed text-white/50">
              Ajoutez l'application à votre écran d'accueil pour y accéder facilement, sans passer par votre navigateur.
            </p>

            <button
              type="button"
              onClick={installApp}
              className="group mt-4 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 px-4 py-3.5 text-[12px] font-black uppercase tracking-[0.09em] text-[#241805] shadow-[0_8px_25px_rgba(234,179,8,0.18)] transition duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_10px_30px_rgba(234,179,8,0.28)] active:translate-y-0">
              <svg
                className="h-4 w-4 transition-transform group-hover:translate-y-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 3v12" />
                <path d="m7 10 5 5 5-5" />
                <path d="M5 17v3h14v-3" />
              </svg>
              {installEvent ? "Installer l'application" : "Découvrir l'installation"}
            </button>

            {showHelp && (
              <div className="mt-3 rounded-2xl border border-amber-300/15 bg-amber-100/[0.06] p-3.5">
                <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-amber-300">
                  Comment installer JESUS ?
                </p>

                <div className="space-y-2 text-[11px] leading-relaxed text-white/75">
                  {isIOS ? (
                    <>
                      {!isSafari && (
                        <p>Ouvrez d'abord cette page dans Safari.</p>
                      )}
                      <p>1. Touchez le bouton Partager de Safari.</p>
                      <p>2. Choisissez « Sur l'écran d'accueil ».</p>
                      <p>3. Touchez « Ajouter ».</p>
                    </>
                  ) : isAndroid ? (
                    <>
                      <p>1. Ouvrez le menu ⋮ de votre navigateur.</p>
                      <p>2. Choisissez « Installer l'application » ou « Ajouter à l'écran d'accueil ».</p>
                      <p>3. Confirmez l'installation.</p>
                    </>
                  ) : (
                    <>
                      <p>1. Ouvrez le menu de votre navigateur.</p>
                      <p>2. Recherchez « Installer JESUS » ou « Installer cette application ».</p>
                      <p>3. Confirmez l'installation.</p>
                    </>
                  )}
                </div>
              </div>
            )}

            <p className="mt-3 text-center text-[9px] tracking-wide text-white/30">
              Installation gratuite • Accès rapide • Application officielle
            </p>
          </div>
        </section>
      )}

      {/* CARTE DE MISE À JOUR */}
      {updateAvailable && (
        <section className="relative overflow-hidden rounded-[24px] border border-emerald-400/25 bg-[#09140e]/95 p-4 text-white shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-2xl">

          <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-emerald-400/10 blur-3xl" />

          <div className="relative flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 7v5h-5" />
                <path d="M4 17v-5h5" />
                <path d="M5.6 9a7 7 0 0 1 11.6-2L20 12" />
                <path d="M18.4 15a7 7 0 0 1-11.6 2L4 12" />
              </svg>
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-300/70">
                Nouvelle version
              </p>
              <h3 className="mt-1 text-sm font-extrabold text-emerald-50">
                JESUS a évolué
              </h3>
              <p className="mt-1 text-[11px] leading-relaxed text-white/55">
                Une mise à jour est disponible pour profiter des dernières améliorations.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setUpdateAvailable(false)}
              aria-label="Fermer la notification"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white/40 transition hover:bg-white/10 hover:text-white"
            >
              ✕
            </button>
          </div>

          <button
            type="button"
            onClick={updateApp}
            className="relative mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-green-500 px-4 py-3 text-[11px] font-black uppercase tracking-wider text-[#052111] shadow-lg shadow-emerald-500/10 transition hover:brightness-110 active:scale-[0.98]"
          >
            <span aria-hidden="true">↻</span>
            Mettre à jour JESUS
          </button>
        </section>
      )}
    </div>
  );
}
