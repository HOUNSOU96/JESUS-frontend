// 📁 components/AnnouncementBanner.tsx
import React, { useEffect, useState } from "react";
import api from "@/utils/axios";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";

interface Announcement {
  id: number;
  message: string;
  type: "alerte" | "avantage" | "info";
  start_date?: string;
  end_date?: string;
}

const AnnouncementBanner: React.FC = () => {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [direction, setDirection] = useState<"left" | "right">("left");

  useEffect(() => {
    const fetchCurrentAnnouncement = async () => {
      try {
        const res = await api.get("/api/announcements/current");
        if (res.data) {
          setDirection(Math.random() > 0.5 ? "left" : "right");
        }
        setAnnouncement(res.data || null);
      } catch (error) {
        console.error("Erreur récupération annonce courante:", error);
      }
    };

    fetchCurrentAnnouncement();
    const interval = setInterval(fetchCurrentAnnouncement, 1000); // check toutes les 1s
    return () => clearInterval(interval);
  }, []);

  const getBannerColorHex = (type: Announcement["type"]) => {
    switch (type) {
      case "alerte":
        return "#EF4444";
      case "avantage":
        return "#22C55E";
      case "info":
        return "#3B82F6";
      default:
        return "#FACC15";
    }
  };

  const getBannerIcon = (type: Announcement["type"]) => {
    switch (type) {
      case "alerte":
        return <AlertTriangle className="w-5 h-5" />;
      case "avantage":
        return <CheckCircle className="w-5 h-5" />;
      case "info":
        return <Info className="w-5 h-5" />;
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {announcement && (
        <motion.div
          key={announcement.id}
          initial={{ opacity: 0, x: direction === "left" ? -100 : 100 }}
          animate={{
            opacity: 1,
            x: 0,
            backgroundColor: getBannerColorHex(announcement.type),
            y: [0, -10, 0], // bounce final
          }}
          exit={{ opacity: 0, x: direction === "left" ? 100 : -100 }}
          transition={{ duration: 0.8 }}
          className="fixed top-0 w-full z-50 text-center py-2 shadow-md flex items-center justify-center text-white"
        >
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{
              opacity: 1,
              x: [0, -2, 2, -2, 2, 0], // vibration subtile
            }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {getBannerIcon(announcement.type)}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="text-sm font-medium">{announcement.message}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnnouncementBanner;
