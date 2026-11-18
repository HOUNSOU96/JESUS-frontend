import React, { useRef, useState } from "react";
import api from "@/utils/axios";
import { useAuth } from "@/context/AuthContext";

const ProfilePhotoEditor: React.FC = () => {
  const { user, setUser } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);

  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (!user) return null;

  const choisirPhoto = (file?: File) => {
    setError("");
    setMessage("");

    if (!file) return;

    const formats = ["image/jpeg", "image/png", "image/webp"];

    if (!formats.includes(file.type)) {
      setError("Choisis une image JPG, PNG ou WebP.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("La photo ne doit pas dépasser 5 Mo.");
      return;
    }

    if (preview) URL.revokeObjectURL(preview);

    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const fermer = () => {
    if (loading) return;

    if (preview) URL.revokeObjectURL(preview);

    setPhoto(null);
    setPreview(null);
    setError("");
    setMessage("");

    if (inputRef.current) inputRef.current.value = "";
  };

  const enregistrer = async () => {
    if (!photo || loading) return;

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("photo", photo);

      const response = await api.post("/api/auth/me/photo", formData);

      const updatedUser = {
        ...user,
        photo_url: response.data.photo_url,
      };

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setMessage("Votre photographie a été mise à jour avec succès.");

      if (preview) URL.revokeObjectURL(preview);

      setPhoto(null);
      setPreview(null);

      // Recharge les composants qui possèdent leur propre état utilisateur.
      window.setTimeout(() => window.location.reload(), 900);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
        "Une erreur est survenue lors de la modification."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError("");
          setMessage("");
          inputRef.current?.click();
        }}
        className="group inline-flex items-center justify-center gap-2
                   rounded-xl border border-amber-300/40
                   bg-gradient-to-r from-amber-400/10 to-yellow-500/5
                   px-5 py-3 text-sm font-bold text-amber-200
                   shadow-lg shadow-black/20 transition duration-300
                   hover:border-amber-200/70 hover:bg-amber-400/15
                   hover:shadow-amber-500/10 active:scale-[0.98]"
      >
        <span className="text-lg transition-transform group-hover:scale-110">
          📷
        </span>
        Modifier ma photo
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => choisirPhoto(event.target.files?.[0])}
      />

      {error && !preview && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-3 rounded-xl
                     border border-red-400/30 bg-red-950/40
                     px-4 py-3 text-left text-xs leading-5 text-red-200"
        >
          <span className="text-base">⚠</span>
          <span>{error}</span>
        </div>
      )}

      {preview && (
        <div
          className="fixed inset-0 z-[100] flex items-center
                     justify-center overflow-y-auto bg-black/85
                     px-4 py-8 backdrop-blur-md"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="photo-editor-title"
            className="relative my-auto w-full max-w-md overflow-hidden
                       rounded-[1.75rem] border border-amber-300/30
                       bg-gradient-to-b from-[#19150d] via-[#0d0c09]
                       to-[#050505] p-6 text-center
                       shadow-[0_25px_100px_rgba(0,0,0,0.85)]
                       sm:p-8"
          >
            <div className="absolute inset-x-10 top-0 h-px
                            bg-gradient-to-r from-transparent
                            via-amber-300 to-transparent" />

            <button
              type="button"
              onClick={fermer}
              disabled={loading}
              aria-label="Fermer la fenêtre"
              className="absolute right-4 top-4 flex h-9 w-9
                         items-center justify-center rounded-full
                         border border-white/10 bg-white/5
                         text-lg text-white/60 transition
                         hover:border-amber-300/40 hover:text-amber-200
                         disabled:cursor-not-allowed disabled:opacity-30"
            >
              ×
            </button>

            <div className="mb-5">
              <p className="mb-2 text-[9px] font-bold uppercase
                            tracking-[0.35em] text-amber-400/70">
                Espace membre · Prestige Or
              </p>

              <h2
                id="photo-editor-title"
                className="text-xl font-black tracking-wide text-amber-100
                           sm:text-2xl"
              >
                Nouvelle photographie
              </h2>

              <p className="mt-2 text-xs leading-6 text-white/55">
                Vérifiez votre aperçu avant de confirmer la modification.
              </p>
            </div>

            <div className="relative mx-auto mb-5 h-48 w-48">
              <div className="absolute -inset-2 rounded-full
                              border border-amber-300/20" />
              <div className="absolute -inset-4 rounded-full
                              border border-amber-300/10" />

              <img
                src={preview}
                alt="Aperçu de la nouvelle photo de profil"
                className="relative h-48 w-48 rounded-full
                           border-[3px] border-amber-300/70
                           object-cover shadow-[0_0_35px_rgba(212,175,55,0.15)]"
              />
            </div>

            <div className="mx-auto max-w-full rounded-xl
                            border border-white/10 bg-white/[0.04]
                            px-4 py-3">
              <p className="break-all text-xs font-semibold text-amber-100/80">
                {photo?.name}
              </p>
              <p className="mt-1 text-[10px] text-white/40">
                {photo ? `${(photo.size / (1024 * 1024)).toFixed(2)} Mo` : ""}
                {" · "}JPG, PNG ou WebP
              </p>
            </div>

            <p className="mt-4 text-[10px] leading-5 text-white/40">
              Taille maximale autorisée : 5 Mo.
            </p>

            {error && (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-red-400/30
                           bg-red-950/40 px-4 py-3 text-left
                           text-xs leading-5 text-red-200"
              >
                ⚠ {error}
              </div>
            )}

            <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={fermer}
                disabled={loading}
                className="rounded-xl border border-white/15
                           bg-white/[0.04] px-4 py-3 text-xs
                           font-bold uppercase tracking-wider
                           text-white/70 transition
                           hover:border-amber-300/30 hover:bg-white/[0.08]
                           disabled:cursor-not-allowed disabled:opacity-40"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={enregistrer}
                disabled={loading || !photo}
                className="rounded-xl border border-amber-200/70
                           bg-gradient-to-r from-amber-300
                           via-yellow-400 to-amber-500
                           px-4 py-3 text-xs font-black uppercase
                           tracking-wider text-black shadow-lg
                           shadow-amber-500/10 transition
                           hover:brightness-110 active:scale-[0.98]
                           disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full
                                     border-2 border-black/25
                                     border-t-black" />
                    Enregistrement...
                  </span>
                ) : (
                  "Confirmer la photo"
                )}
              </button>
            </div>

            <p className="mt-6 text-[9px] font-semibold uppercase
                          tracking-[0.3em] text-white/25">
              Confrérie Saint Enfant Jésus
            </p>
          </div>
        </div>
      )}

      {message && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 left-1/2 z-[120]
                     flex w-[calc(100%-2rem)] max-w-md
                     -translate-x-1/2 items-center gap-3
                     rounded-2xl border border-emerald-300/30
                     bg-[#101b14] px-5 py-4 text-sm
                     font-semibold text-emerald-200
                     shadow-[0_15px_50px_rgba(0,0,0,0.6)]"
        >
          <span className="flex h-8 w-8 shrink-0 items-center
                           justify-center rounded-full
                           border border-emerald-300/30
                           bg-emerald-400/10 text-lg">
            ✓
          </span>
          <span>{message}</span>
        </div>
      )}
    </>
  );
};

export default ProfilePhotoEditor;
