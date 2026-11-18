import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useExitNotifier } from "@/hooks/useExitNotifier";
import api from "@/utils/axios";
import BackgroundSlideshow from "@/components/BackgroundSlideshow";
import ChaplainSignatureGate from "@/components/ChaplainSignatureGate";
import ProfilePhotoEditor from "@/components/ProfilePhotoEditor";
import InstallUpdatePrompt from "@/components/InstallUpdatePrompt";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useExitNotifier({ eventType: "connect" });
  useExitNotifier({ eventType: "disconnect" });

  useEffect(() => {
    if (!user?.email) return;

    const notify = async (eventType: "connect" | "disconnect") => {
      try {
        await api.post(`/api/notify/${eventType}`, { email: user.email });
      } catch (err) {
        console.error(`Erreur envoi notif ${eventType}:`, err);
      }
    };

    const isInternalUrl = (url: string) => {
      const appOrigin = window.location.origin;
      return url.startsWith(appOrigin);
    };

    const handleBeforeUnload = () => notify("disconnect");

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") notify("disconnect");
      else if (
        document.visibilityState === "visible" &&
        isInternalUrl(window.location.href)
      ) {
        notify("connect");
      }
    };

    const handleBlur = () => {
      if (!document.hidden) notify("disconnect");
    };

    const handleFocus = () => {
      if (!document.hidden && isInternalUrl(window.location.href)) {
        notify("connect");
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, [user]);

  // Fermer automatiquement le menu après un changement de page.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Fermer le menu avec la touche Échap.
  useEffect(() => {
    if (!menuOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [menuOpen]);

  const hideFooter = location.pathname.toLowerCase() === "/page1";
  const isAdmin = user?.is_admin === true || user?.is_admin === 1;

  const menuLinkClass =
    "group flex w-full items-center gap-3 rounded-2xl border border-amber-300/20 " +
    "bg-gradient-to-r from-white/[0.07] to-white/[0.02] px-4 py-3.5 " +
    "text-left text-sm font-semibold text-amber-50 shadow-sm " +
    "transition duration-300 hover:-translate-y-0.5 hover:border-amber-300/60 " +
    "hover:from-amber-400/15 hover:to-yellow-500/5 hover:shadow-lg " +
    "hover:shadow-amber-500/10 active:scale-[0.99]";

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      <BackgroundSlideshow />
      <InstallUpdatePrompt />

      {user && <ChaplainSignatureGate />}

      <main className="relative z-20 flex-grow pb-28 px-4 sm:px-6 lg:px-12">
        {children}
      </main>

      {/* Bouton Menu fixe en bas de l'écran */}
      {user && (
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Ouvrir le menu"
          aria-expanded={menuOpen}
          className="fixed bottom-10 left-1/2 z-50 -translate-x-1/2
                     flex items-center justify-center gap-3 rounded-full
                     border border-amber-300/70
                     bg-gradient-to-r from-[#17130b] via-black to-[#17130b]
                     px-8 py-3.5 text-base font-black tracking-wide
                     text-amber-200 shadow-[0_0_28px_rgba(234,179,8,0.28)]
                     backdrop-blur-xl transition duration-300
                     hover:scale-105 hover:border-yellow-200
                     hover:shadow-[0_0_35px_rgba(234,179,8,0.42)]
                     active:scale-95"
        >
          <span className="text-xl">☰</span>
          <span>Menu</span>
        </button>
      )}

      {/* Fenêtre du menu */}
      {user && menuOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center
                     bg-black/85 px-3 pb-24 pt-6 backdrop-blur-md
                     sm:items-center sm:pb-6"
          onClick={() => setMenuOpen(false)}
          role="presentation"
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="jesus-menu-title"
            className="relative w-full max-w-md max-h-[78vh] overflow-y-auto
                       rounded-[2rem] border border-amber-300/40
                       bg-gradient-to-b from-[#17130b] via-[#090909]
                       to-black p-5 shadow-[0_25px_90px_rgba(0,0,0,0.8)]
                       shadow-amber-900/20 backdrop-blur-2xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2
                  id="jesus-menu-title"
                  className="text-xl font-black tracking-wide text-amber-200"
                >
                  ☰ Menu
                </h2>
                <p className="mt-1 text-xs text-gray-400">
                  Confrérie Saint Enfant Jésus
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Fermer le menu"
                className="flex h-10 w-10 items-center justify-center
                           rounded-full border border-amber-300/25
                           bg-white/5 text-xl text-amber-100/70 transition
                           hover:border-red-400/60 hover:bg-red-500/15
                           hover:text-red-300"
              >
                ✕
              </button>
            </div>

            <nav className="space-y-3">
             <Link
               to="/mon-profil"
               onClick={() => setMenuOpen(false)}
               className={menuLinkClass}
             >
               <span className="text-xl">👤</span>
               <span>Mon profil</span>
             </Link>
              <Link
                to="/prieres"
                onClick={() => setMenuOpen(false)}
                className={menuLinkClass}
              >
                <span className="text-xl">🙏</span>
                <span>Les prières</span>
              </Link>

              <Link
                to="/documents"
                onClick={() => setMenuOpen(false)}
                className={menuLinkClass}
              >
                <span className="text-xl">📘</span>
                <span>Mon document</span>
              </Link>

              <Link
                to="/ma-carte"
                onClick={() => setMenuOpen(false)}
                className={menuLinkClass}
              >
                <span className="text-xl">🪪</span>
                <span>Ma carte d'identité</span>
              </Link>

              {isAdmin && (
                <>
                  <div className="border-t border-yellow-500/20 pt-4">
                    <p className="mb-3 text-xs font-bold uppercase
                                  tracking-wider text-yellow-500">
                      Administration
                    </p>

                    <div className="space-y-3">
                      <Link
                        to="/admin/documents"
                        onClick={() => setMenuOpen(false)}
                        className={menuLinkClass}
                      >
                        <span className="text-xl">📘</span>
                        <span>Gestion des documents</span>
                      </Link>

                      <Link
                        to="/admin/cartes"
                        onClick={() => setMenuOpen(false)}
                        className={menuLinkClass}
                      >
                        <span className="text-xl">✓</span>
                        <span>Validation des cartes</span>
                      </Link>
                    </div>
                  </div>
                </>
              )}

              <div className="border-t border-yellow-500/20 pt-4">
                <p className="mb-3 text-xs font-bold uppercase
                              tracking-wider text-yellow-500">
                  Mon profil
                </p>
                <div className="rounded-2xl border border-amber-300/20
                                bg-gradient-to-br from-amber-300/[0.08]
                                to-white/[0.02] p-4">
                  <ProfilePhotoEditor />
                </div>
              </div>
            </nav>

            <p className="mt-5 text-center text-[10px] font-medium
                          tracking-wide text-amber-100/35">
              Touchez une rubrique pour y accéder.
            </p>
          </section>
        </div>
      )}

      {/* Pied de page conservé */}
      {!hideFooter && (
        <footer className="hidden sm:block fixed bottom-0 left-0 right-0
                           z-30 select-none bg-black/70 overflow-hidden
                           h-6 md:h-7 lg:h-8">
          <div className="relative h-full w-full overflow-hidden">
            <div
              className="absolute whitespace-nowrap animate-scrollLeft"
              style={{ right: 0 }}
            >
              <span
                className="font-semibold text-xs md:text-sm lg:text-base
                           select-none pointer-events-none animate-rainbow"
              >
                Confrérie Saint Enfant Jésus Miraculeux de Prague
              </span>
            </div>
          </div>

          <style>{`
            @keyframes scrollLeft {
              0% { transform: translateX(100%); }
              100% { transform: translateX(-400%); }
            }
            .animate-scrollLeft {
              display: inline-block;
              animation: scrollLeft 15s linear infinite;
            }

            @keyframes rainbow {
              0% { color: green; }
              16% { color: yellow; }
              33% { color: red; }
              50% { color: blue; }
              66% { color: white; }
              83% { color: black; }
              100% { color: green; }
            }
            .animate-rainbow {
              animation: rainbow 6s linear infinite;
            }
          `}</style>
        </footer>
      )}
    </div>
  );
};

export default Layout;
