// 📁 Layout.tsx
import React, { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";    
import { useExitNotifier } from "@/hooks/useExitNotifier";   
import api from "@/utils/axios";
import BackgroundSlideshow from "@/components/BackgroundSlideshow";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { loading, user } = useAuth();

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
      else if (document.visibilityState === "visible" && isInternalUrl(window.location.href))
        notify("connect");
    };

    const handleBlur = () => { if (!document.hidden) notify("disconnect"); };
    const handleFocus = () => { if (!document.hidden && isInternalUrl(window.location.href)) notify("connect"); };

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

  const hideFooter = location.pathname.toLowerCase() === "/page1";


  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      <BackgroundSlideshow />

      {user && (
        <header className="relative z-30 w-full px-4 sm:px-6 lg:px-12 pt-4">
          <nav className="mx-auto max-w-7xl flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-yellow-500/30 bg-black/75 p-3 shadow-lg backdrop-blur-md">
            <Link
              to="/ma-carte"
              className="rounded-xl border border-yellow-500/40 bg-yellow-500/10 px-4 py-2 text-sm font-semibold text-yellow-300 transition hover:bg-yellow-500/25"
            >
              🪪 Ma carte d’identité
            </Link>

            {(user.is_admin === true || user.is_admin === 1) && (
              <Link
                to="/admin/cartes"
                className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/25"
              >
                ✓ Validation des cartes
              </Link>
            )}
          </nav>
        </header>
      )}

      <main className="relative z-20 flex-grow pb-16 px-4 sm:px-6 lg:px-12">{children}</main>

      {/* 📌 Footer corrigé */}
{/* 📌 Footer corrigé */}
{!hideFooter && (
  <footer className="hidden sm:block fixed bottom-0 left-0 right-0 z-30 select-none bg-black/70 overflow-hidden h-6 md:h-7 lg:h-8">
    <div className="relative h-full w-full overflow-hidden">
      <div className="absolute whitespace-nowrap animate-scrollLeft" style={{ right: 0 }}>
        <span className="font-semibold text-xs md:text-sm lg:text-base select-none pointer-events-none animate-rainbow">
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
