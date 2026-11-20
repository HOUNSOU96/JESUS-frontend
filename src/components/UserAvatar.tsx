import React, { useEffect, useState } from "react";

interface UserAvatarProps {
  photoUrl?: string | null;
  name: string;
  containerClassName?: string;
  imageClassName?: string;
  fallback?: React.ReactNode;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  photoUrl,
  name,
  containerClassName,
  imageClassName,
  fallback,
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setImageFailed(false);
    setIsOpen(false);
  }, [photoUrl]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const hasPhoto = Boolean(photoUrl && !imageFailed);

  return (
    <>
      <div
        role={hasPhoto ? "button" : undefined}
        tabIndex={hasPhoto ? 0 : undefined}
        aria-label={hasPhoto ? `Agrandir la photo de ${name}` : undefined}
        onClick={(event) => {
          event.stopPropagation();
          if (hasPhoto) setIsOpen(true);
        }}
        onKeyDown={(event) => {
          if (hasPhoto && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            event.stopPropagation();
            setIsOpen(true);
          }
        }}
        className={
          containerClassName ||
          "relative inline-flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-2xl dark:bg-blue-900"
        }
        style={hasPhoto ? { cursor: "zoom-in" } : undefined}
      >
        {hasPhoto ? (
          <img
            src={photoUrl!}
            alt={`Photo de ${name}`}
            className={
              imageClassName ||
              "absolute inset-0 h-full w-full rounded-full object-cover object-top"
            }
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
          />
        ) : (
          fallback || (
            <span role="img" aria-label="Photo non disponible">
              👤
            </span>
          )
        )}
      </div>

      {isOpen && hasPhoto && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 p-3 backdrop-blur-sm sm:p-6"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`Photo agrandie de ${name}`}
        >
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setIsOpen(false);
            }}
            className="absolute right-4 top-4 z-[100000] flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-black/60 text-4xl font-light leading-none text-white shadow-xl transition hover:scale-110 hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-white/50 sm:right-7 sm:top-7"
            aria-label="Fermer la photo"
            title="Fermer"
          >
            ×
          </button>

          <div
            className="flex max-h-[94vh] max-w-[96vw] flex-col items-center gap-3"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={photoUrl!}
              alt={`Photo complète de ${name}`}
              className="max-h-[84vh] max-w-[94vw] rounded-xl object-contain shadow-2xl"
              referrerPolicy="no-referrer"
            />

            <p className="text-center text-lg font-semibold text-white">
              {name}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default UserAvatar;
