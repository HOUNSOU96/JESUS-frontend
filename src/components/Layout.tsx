// 📁 Layout.tsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";    
import { useExitNotifier } from "@/hooks/useExitNotifier";   
import api from "@/utils/axios";

const images = [
  "/images/b1.jpg", "/images/b2.jpg", "/images/b3.jpg", "/images/b4.jpg",
  "/images/b5.jpg", "/images/b6.jpg", "/images/b7.jpg", "/images/b8.jpg",
  "/images/b9.jpg", "/images/b10.jpg", "/images/b11.jpg", "/images/b12.jpg",
  "/images/b13.jpg", "/images/b14.jpg", "/images/b15.jpg", "/images/b16.jpg",
  "/images/b17.jpg", "/images/b18.jpg", "/images/b25.jpg", "/images/b28.jpg",
  "/images/b27.jpg", "/images/b19.jpg", "/images/b21.jpg", "/images/b20.jpg",
  "/images/b24.jpg", "/images/b26.jpg", "/images/b22.jpeg", "/images/b23.jpg",
  "/images/b29.jpg", "/images/b30.jpg", "/images/b31.jpg", "/images/b32.jpg",
  "/images/b33.jpg", "/images/b34.jpg", "/images/b35.png", "/images/b36.jpg",
  "/images/b37.jpg", "/images/b38.jpg", "/images/b39.jpg", "/images/b40.jpg",
  "/images/b41.jpg", "/images/b42.jpg", "/images/b43.jpg",
];

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
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

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setIsVisible(true);
      }, 1000);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      <div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 z-0 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        style={{ backgroundImage: `url(${images[currentIndex]})` }}
      />
      <div className="absolute inset-0 bg-black bg-opacity-50 z-10" />
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
