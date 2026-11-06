import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Page1: React.FC = () => {
  const navigate = useNavigate();
  const [shine, setShine] = useState(false);
  const [rebound, setRebound] = useState(false);
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 20000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const renderConfetti = () => {
    if (!confetti) return null;

    const colors = ["#FFD700", "#FF4500", "#00FF00", "#1E90FF", "#FF69B4", "#FFFFFF"];
    return (
      <div className="absolute top-1/2 left-1/2">
        {Array.from({ length: 30 }, (_, i) => {
          const angle = Math.random() * 2 * Math.PI;
          const radius = Math.random() * 150 + 50;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const size = Math.random() * 8 + 4;
          const color = colors[Math.floor(Math.random() * colors.length)];

          return (
            <motion.div
              key={i}
              initial={{ x: 0, y: 0, opacity: 1 }}
              animate={{ x, y, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute"
              style={{
                width: size,
                height: size,
                borderRadius: "50%",
                backgroundColor: color,
              }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex justify-center items-center h-screen bg-black relative overflow-hidden">
      <motion.div
        className="absolute"
        initial={{ x: 0, y: "-50vh", opacity: 1 }}
        animate={{
          x: [0, 0, "-50vw", "120vw", 0],
          y: ["-50vh", "120vh", "0vh", "0vh", "0vh"],
          opacity: [1, 0, 1, 0, 1],
          scale: [1, 1, 1, 1, 1],
        }}
        transition={{
          duration: 8,
          ease: "easeInOut",
          times: [0, 0.25, 0.4, 0.65, 1],
          onComplete: () => {
            setShine(true);
            setRebound(true);
            setConfetti(true);
          },
        }}
        style={{ width: 300, height: 300 }}
      >
        <motion.div
          animate={
            rebound
              ? { scale: [1, 1.2, 0.95, 1.05, 1], scaleY: [1, 0.8, 1.2, 1] }
              : {}
          }
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ width: "100%", height: "100%" }}
        >
          <img
            src="/coin.jpg"
            alt="Coin Logo"
            className={`w-full h-full object-contain rounded-full shadow-2xl ${shine ? "animate-shine" : ""}`}
          />

          {renderConfetti()}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Page1;
