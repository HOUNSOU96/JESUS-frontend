import React, { useEffect, useState } from "react";

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

const BackgroundSlideshow: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const interval = setInterval(() => {
      setIsVisible(false);

      timeout = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setIsVisible(true);
      }, 1000);
    }, 6000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <>
      <div
        aria-hidden="true"
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 z-0 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        style={{ backgroundImage: `url(${images[currentIndex]})` }}
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black bg-opacity-50 z-10"
      />
    </>
  );
};

export default BackgroundSlideshow;
