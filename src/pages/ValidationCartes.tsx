import React, { useEffect, useState } from "react";
import api from "@/utils/axios";

type Member = {
  nom: string;
  prenom: string;
  matricule?: string;
  telephone?: string;
  email?: string;
  date_integration?: string;
  continent?: string;
  pays?: string;
  diocese?: string;
  paroisse?: string;
};

type Card = {
  id: number;
  city?: string;
  requested_at?: string;
  member?: Member;
};

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleString("fr-FR") : "—";

const ValidationCartes: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [rejection, setRejection] = useState<Card | null>(null);
  const [reason, setReason] = useState("");
  const [photos, setPhotos] = useState<Record<number, string>>({});
  const [photoErrors, setPhotoErrors] = useState<Record<number, string>>({});

  const load = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/identity-cards/admin/pending");
      setCards(response.data);
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Impossible de charger les demandes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    let active = true;
    const urls: string[] = [];

    setPhotos({});
    setPhotoErrors({});

    const loadPhotos = async () => {
      for (const card of cards) {
        try {
          const response = await api.get(
            `/api/identity-cards/admin/${card.id}/photo`,
            { responseType: "blob" }
          );
          if (!active) return;
          const url = URL.createObjectURL(response.data);
          urls.push(url);
          setPhotos((previous) => ({ ...previous, [card.id]: url }));
        } catch (err: any) {
          if (!active) return;

          const status = err.response?.status;

          setPhotoErrors((previous) => ({
            ...previous,
            [card.id]: status
              ? `Photo indisponible (erreur HTTP ${status}).`
              : "Impossible de récupérer cette photo. Vérifiez la connexion au serveur."
          }));
        }
      }
    };

    if (cards.length) loadPhotos();

    return () => {
      active = false;
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [cards]);

  const approve = async (card: Card) => {
    if (!window.confirm(`Confirmer l'approbation de la carte de ${card.member?.prenom || ""} ${card.member?.nom || ""} ?`)) return;

    setBusy(card.id);
    setError("");
    setSuccess("");
    try {
      const response = await api.post(`/api/identity-cards/admin/${card.id}/approve`);
      setSuccess(response.data?.message || "Carte approuvée.");
      await load();
    } catch (err: any) {
      setError(err.response?.data?.detail || "L'approbation a échoué.");
    } finally {
      setBusy(null);
    }
  };

  const reject = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!rejection || !reason.trim()) return;

    setBusy(rejection.id);
    setError("");
    setSuccess("");

    const form = new FormData();
    form.append("reason", reason.trim());

    try {
      const response = await api.post(
        `/api/identity-cards/admin/${rejection.id}/reject`,
        form
      );
      setSuccess(response.data?.message || "Demande refusée.");
      setRejection(null);
      setReason("");
      await load();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Le refus a échoué.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl py-8 text-white">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-300">Espace administratif</p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">Validation des cartes</h1>
          <p className="mt-2 text-sm text-white/60">Examinez les photographies et les informations avant délivrance.</p>
        </div>
        <button onClick={load} className="rounded-xl border border-amber-300/40 px-5 py-3 text-sm font-bold text-amber-200 hover:bg-amber-300/10">
          Actualiser
        </button>
      </div>

      {error && <div className="mb-5 rounded-xl border border-red-400/30 bg-red-500/15 p-4 text-red-100">{error}</div>}
      {success && <div className="mb-5 rounded-xl border border-green-400/30 bg-green-500/15 p-4 text-green-100">{success}</div>}

      <div className="mb-6 rounded-2xl border border-amber-300/20 bg-slate-950/80 p-5">
        <p className="text-xs uppercase tracking-widest text-amber-300">Demandes à examiner</p>
        <p className="mt-1 text-3xl font-black">{cards.length}</p>
      </div>

      {loading ? (
        <p className="py-12 text-center text-white/60">Chargement des demandes...</p>
      ) : cards.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-12 text-center">
          <p className="text-3xl">✓</p>
          <h2 className="mt-3 text-xl font-bold">Aucune demande en attente</h2>
          <p className="mt-2 text-sm text-white/50">Les nouvelles demandes apparaîtront ici.</p>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          {cards.map((card) => {
            const member = card.member;
            return (
              <article key={card.id} className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/90 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 bg-white/5 p-5">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-amber-300">Demande #{card.id}</p>
                    <h2 className="mt-1 text-lg font-black">{member?.prenom} {member?.nom}</h2>
                  </div>
                  <span className="rounded-full bg-amber-400/15 px-3 py-1 text-xs font-bold text-amber-200">En attente</span>
                </div>

                <div className="grid gap-5 p-5 sm:grid-cols-[145px_1fr]">
                  <div className="mx-auto h-44 w-36 overflow-hidden rounded-2xl border-2 border-amber-300/40 bg-white/5">
                    {photos[card.id] ? (
                      <img
                        src={photos[card.id]}
                        alt="Photo d'identité du membre"
                        className="h-full w-full object-cover"
                      />
                    ) : photoErrors[card.id] ? (
                      <div className="flex h-full items-center justify-center p-3 text-center text-xs text-red-300">
                        {photoErrors[card.id]}
                      </div>
                    ) : (
                      <div className="flex h-full items-center justify-center p-3 text-center text-xs text-white/40">
                        Chargement de la photo...
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {[
                      ["Matricule", member?.matricule],
                      ["Téléphone", member?.telephone],
                      ["E-mail", member?.email],
                      ["Ville", card.city],
                      ["Continent", member?.continent],
                      ["Pays", member?.pays],
                      ["Diocèse", member?.diocese],
                      ["Paroisse", member?.paroisse],
                      ["Intégration", formatDate(member?.date_integration)],
                      ["Demande", formatDate(card.requested_at)],
                    ].map(([label, value]) => (
                      <div key={label} className="min-w-0 rounded-xl bg-white/5 p-3">
                        <p className="text-[10px] uppercase tracking-wider text-amber-300">{label}</p>
                        <p className="mt-1 break-words text-xs font-semibold text-white/90">{value || "Non renseigné"}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-white/10 p-5 sm:flex-row">
                  <button
                    onClick={() => approve(card)}
                    disabled={busy === card.id || !photos[card.id]}
                    className="flex-1 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3 text-sm font-black text-white hover:brightness-110 disabled:opacity-40"
                  >
                    {busy === card.id ? "Traitement..." : "✓ APPROUVER ET GÉNÉRER"}
                  </button>
                  <button
                    onClick={() => { setRejection(card); setReason(""); }}
                    disabled={busy === card.id}
                    className="rounded-xl border border-red-400/40 px-5 py-3 text-sm font-bold text-red-300 hover:bg-red-500/10 disabled:opacity-40"
                  >
                    Refuser
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {rejection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <form onSubmit={reject} className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-2xl">
            <h2 className="text-xl font-black">Refuser la demande</h2>
            <p className="mt-2 text-sm text-white/60">
              Membre : {rejection.member?.prenom} {rejection.member?.nom}
            </p>
            <label className="mt-5 block text-sm font-semibold">Motif du refus *</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              maxLength={2000}
              rows={5}
              placeholder="Précisez la raison du refus..."
              className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 p-4 text-white outline-none focus:border-amber-300"
            />
            <div className="mt-5 flex gap-3">
              <button type="button" onClick={() => setRejection(null)} className="flex-1 rounded-xl border border-white/15 px-4 py-3 text-sm font-bold">Annuler</button>
              <button type="submit" disabled={busy === rejection.id || !reason.trim()} className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold disabled:opacity-40">
                Confirmer le refus
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ValidationCartes;
