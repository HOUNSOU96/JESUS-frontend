import React, { useEffect, useRef, useState } from "react";
import api from "@/utils/axios";
import { useAuth } from "@/context/AuthContext";

type Card = {
  id: number;
  card_number?: string;
  status: "pending" | "approved" | "rejected" | "expired";
  city?: string;
  requested_at?: string;
  issued_at?: string;
  expires_at?: string;
  rejection_reason?: string;
  pdf_available?: boolean;
  delivery_status?: string;
};

const date = (value?: string) =>
  value ? new Date(value).toLocaleDateString("fr-FR") : "—";

const statusLabel: Record<string, string> = {
  pending: "En attente de validation",
  approved: "Carte approuvée",
  rejected: "Demande refusée",
  expired: "Carte expirée",
};

const MaCarte: React.FC = () => {
  const { user } = useAuth();
  const [cards, setCards] = useState<Card[]>([]);
  const [city, setCity] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const loadCards = async () => {
    try {
      const response = await api.get("/api/identity-cards/mine");
      setCards(response.data);
    } catch {
      setError("Impossible de récupérer vos demandes de carte.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  useEffect(() => {
    if (!photo) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const hasPending = cards.some((card) => card.status === "pending");
  const hasValid = cards.some((card) => card.status === "approved");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!city.trim()) {
      setError("Veuillez renseigner votre ville.");
      return;
    }
    if (!photo) {
      setError("Veuillez ajouter votre photo d'identité.");
      return;
    }

    const form = new FormData();
    form.append("city", city.trim());
    form.append("photo", photo);

    setSending(true);
    try {
      const response = await api.post("/api/identity-cards/requests", form);
      setMessage(response.data?.message || "Votre demande a été envoyée.");
      setPhoto(null);
      setCity("");
      if (inputRef.current) inputRef.current.value = "";
      await loadCards();
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        "Une erreur est survenue pendant l'envoi de votre demande."
      );
    } finally {
      setSending(false);
    }
  };

  const downloadPdf = async (card: Card) => {
    try {
      const response = await api.get(`/api/identity-cards/${card.id}/pdf`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `carte-${card.card_number || card.id}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Le téléchargement de votre carte a échoué.");
    }
  };

  const Field = ({ label, value }: { label: string; value?: unknown }) => (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <p className="text-[10px] uppercase tracking-widest text-amber-300">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-white">
        {value ? String(value) : "Non renseigné"}
      </p>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl py-8 text-white">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-300">
          Confrérie Saint Enfant Jésus
        </p>
        <h1 className="mt-2 text-3xl font-black sm:text-4xl">Ma carte d'identité</h1>
        <p className="mt-2 text-sm text-white/70">
          Demandez votre carte officielle de membre et suivez son traitement.
        </p>
      </div>

      {message && <div className="mb-5 rounded-xl border border-green-400/30 bg-green-500/15 p-4 text-green-100">{message}</div>}
      {error && <div className="mb-5 rounded-xl border border-red-400/30 bg-red-500/15 p-4 text-red-100">{error}</div>}

      <div className="grid gap-7 lg:grid-cols-2">
        <section className="space-y-5">
          <div className="overflow-hidden rounded-3xl border border-amber-300/30 bg-slate-950/85 shadow-2xl">
            <div className="relative min-h-56 overflow-hidden p-6">
              <div className="absolute inset-0 bg-[url('/jesus.jpeg')] bg-cover bg-center opacity-20" />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-950/95 via-blue-950/80 to-amber-950/50" />
              <div className="relative flex items-center gap-4">
                <img src="/jesus.jpeg" alt="Saint Enfant Jésus" className="h-16 w-16 rounded-full border-2 border-amber-300 object-cover" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-amber-300">Confrérie</p>
                  <h2 className="text-lg font-black">SAINT ENFANT JÉSUS</h2>
                  <p className="text-xs text-white/70">Miraculeux de Prague</p>
                </div>
              </div>

              <div className="relative mt-7 flex gap-4">
                <div className="h-28 w-24 shrink-0 overflow-hidden rounded-xl border-2 border-amber-300/80 bg-white/10">
                  {preview ? (
                    <img src={preview} alt="Aperçu de votre photo" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-center text-xs text-white/50">Votre photo</div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-widest text-amber-300">Carte de membre</p>
                  <p className="mt-2 text-xl font-black">{user?.prenom || ""} {user?.nom || ""}</p>
                  <p className="mt-2 text-sm text-white/70">Matricule : {user?.matricule || "Non renseigné"}</p>
                  <p className="mt-1 text-xs text-white/60">Document officiel soumis à validation.</p>
                </div>
              </div>
            </div>
            <div className="border-t border-amber-300/30 bg-black/30 px-6 py-3 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300">
              Tout membre doit pouvoir être identifié
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Nom" value={user?.nom} />
            <Field label="Prénom" value={user?.prenom} />
            <Field label="Matricule" value={user?.matricule} />
            <Field label="Téléphone" value={user?.numero_whatsapp} />
            <Field label="Adresse e-mail" value={user?.email} />
            <Field label="Date d'intégration" value={date(user?.date_integration ?? undefined)} />
            <Field label="Continent" value={user?.continent} />
            <Field label="Pays" value={user?.pays} />
            <Field label="Diocèse" value={user?.diocese} />
            <Field label="Paroisse" value={user?.paroisse} />
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-slate-950/85 p-6 shadow-2xl sm:p-8">
          <h2 className="text-xl font-black">Demander ma carte</h2>
          <p className="mt-2 text-sm leading-6 text-white/60">
            Vos informations personnelles sont récupérées depuis votre compte.
            Vous devez uniquement préciser votre ville et joindre une photo d'identité.
          </p>

          {hasValid && (
            <div className="mt-5 rounded-xl border border-green-400/30 bg-green-500/10 p-4 text-sm text-green-200">
              Vous possédez déjà une carte approuvée. Consultez votre historique ci-dessous.
            </div>
          )}

          {hasPending && (
            <div className="mt-5 rounded-xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100">
              Une demande est déjà en attente. Vous pourrez effectuer une nouvelle demande après son traitement.
            </div>
          )}

          <form onSubmit={submit} className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold">Ville de résidence *</label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                maxLength={120}
                placeholder="Ex. : Porto-Novo"
                className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-amber-300"
                disabled={hasPending || hasValid}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">Photo d'identité *</label>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-amber-300/40 bg-white/5 p-6 text-center transition hover:bg-white/10">
                <span className="text-3xl text-amber-300">＋</span>
                <span className="mt-2 text-sm font-bold">Choisir une photographie</span>
                <span className="mt-1 text-xs text-white/50">JPG, PNG ou WebP — maximum 5 Mo</span>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                  disabled={hasPending || hasValid}
                />
              </label>
              {photo && <p className="mt-2 text-xs text-green-300">{photo.name}</p>}
            </div>

            <div className="rounded-xl bg-amber-300/10 p-4 text-xs leading-5 text-amber-100/80">
              En envoyant cette demande, vous autorisez l'utilisation de votre photo pour la création de votre carte. La demande sera examinée par un administrateur.
            </div>

            <button
              type="submit"
              disabled={sending || hasPending || hasValid}
              className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-yellow-600 px-5 py-4 font-black text-slate-950 shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {sending ? "Transmission en cours..." : "ENVOYER MA DEMANDE"}
            </button>
          </form>
        </section>
      </div>

      <section className="mt-10 rounded-3xl border border-white/10 bg-slate-950/85 p-6 shadow-xl">
        <h2 className="text-xl font-black">Historique de mes cartes</h2>
        {loading ? (
          <p className="mt-4 text-sm text-white/60">Chargement...</p>
        ) : cards.length === 0 ? (
          <p className="mt-4 text-sm text-white/60">Vous n'avez encore aucune demande.</p>
        ) : (
          <div className="mt-5 space-y-3">
            {cards.map((card) => (
              <div key={card.id} className="flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center">
                <div>
                  <p className="font-bold">{card.card_number || "Demande de carte"}</p>
                  <p className="mt-1 text-xs text-white/60">Demande : {date(card.requested_at)}</p>
                  <p className="mt-2 text-sm text-amber-300">{statusLabel[card.status] || card.status}</p>
                  {card.issued_at && <p className="mt-1 text-xs text-white/60">Émise le {date(card.issued_at)} — Expire le {date(card.expires_at)}</p>}
                  {card.rejection_reason && <p className="mt-2 text-sm text-red-300">Motif : {card.rejection_reason}</p>}
                </div>
                {card.pdf_available && card.status === "approved" && (
                  <button onClick={() => downloadPdf(card)} className="rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-amber-300">
                    Télécharger le PDF
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default MaCarte;
