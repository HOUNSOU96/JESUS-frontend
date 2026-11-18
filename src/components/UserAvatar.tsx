import React, { useEffect, useState } from "react";

interface UserAvatarProps {
  photoUrl?: string | null;
  name: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ photoUrl, name }) => {
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
        className={`relative inline-flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-2xl dark:bg-blue-900 ${
          hasPhoto ? "cursor-zoom-in transition-transform hover:scale-105" : ""
        }`}
      >
        {hasPhoto ? (
          <img
            src={photoUrl!}
            alt={`Photo de ${name}`}
            className="absolute inset-0 h-full w-full rounded-full object-cover"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span role="img" aria-label="Photo non disponible">👤</span>
        )}
      </div>

      {isOpen && hasPhoto && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`Photo agrandie de ${name}`}
        >
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-3xl text-white transition hover:bg-white/30"
            aria-label="Fermer"
          >
            ×
          </button>

          <div
            className="flex max-h-[90vh] max-w-[95vw] flex-col items-center gap-3"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={photoUrl!}
              alt={`Photo agrandie de ${name}`}
              className="max-h-[78vh] max-w-[90vw] rounded-xl border-2 border-amber-300 object-contain shadow-2xl"
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
