// 📁 useExitNotifier.ts
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

interface ExitNotifierOptions {
  eventType: string; // ex: 'disconnect', 'page2', 'navigation'
}

// On met une valeur par défaut pour eventType
export const useExitNotifier = ({ eventType }: ExitNotifierOptions = { eventType: "unknown" }) => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.email) return;

    const url = `${import.meta.env.VITE_API_URL}/notify-exit`;
    const payload = JSON.stringify({
      email: user.email,
      event: eventType,
      timestamp: new Date().toISOString(),
    });

    const handleBeforeUnload = () => {
      // Utilisation de sendBeacon pour fiabilité même si l'onglet se ferme
      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon(url, blob);
      } else {
        // Fallback classique si sendBeacon non supporté
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [user?.email, eventType]);
};

export default useExitNotifier;
