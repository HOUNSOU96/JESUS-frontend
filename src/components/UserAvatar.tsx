import React, { useEffect, useState } from "react";

interface UserAvatarProps {
  photoUrl?: string | null;
  name: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ photoUrl, name }) => {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [photoUrl]);

  return (
    <div className="relative inline-flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-2xl dark:bg-blue-900">
      {photoUrl && !imageFailed ? (
        <img
          src={photoUrl}
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
  );
};

export default UserAvatar;
