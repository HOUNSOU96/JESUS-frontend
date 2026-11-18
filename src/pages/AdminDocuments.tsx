import React, { useCallback, useEffect, useState } from "react";
import api from "@/utils/axios";

type DocumentRequest = {
  id: number;
  user_id: number;
  nom: string;
  prenom: string;
  matricule: string;
  email_compte: string;
  destination_email: string;
  delivery_method: string;
  pays?: string;
  diocese?: string;
  paroisse?: string;
  status: "pending" | "approved" | "refused";
  created_at: string | null;
  approved_at: string | null;
  email_sent: boolean;
  email_error?: string | null;
  admin_note?: string | null;
  age_at_request?: number | null;
  support_amount?: number | null;
  support_message?: string | null;
};

const errorMessage = (error: any) =>
  error?.response?.data?.detail ||
  error?.response?.data?.message ||
  error?.message ||
  "Une erreur est survenue.";

const dateText = (value: string | null) =>
  value ? new Date(value).toLocaleString("fr-FR") : "—";

const AdminDocuments: React.FC = () => {
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [approvalTarget, setApprovalTarget] = useState<DocumentRequest | null>(null);
  const [refusalTarget, setRefusalTarget] = useState<DocumentRequest | null>(null);
  const [refusalNote, setRefusalNote] = useState("");

  const loadRequests = useCallback(async () => {
    try {
      const response = await api.get("/api/documents/admin/requests");
      setRequests(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const approve = (item: DocumentRequest) => {
    setApprovalTarget(item);
  };

  const confirmApproval = async () => {
    if (!approvalTarget || processing !== null) return;
    const item = approvalTarget;

    setProcessing(item.id);
    setError("");
    setMessage("");

    try {
      const response = await api.post(
        `/api/documents/admin/requests/${item.id}/approve`,
        {}
      );
      setMessage(response.data?.message || "Demande approuvée.");
      setApprovalTarget(null);
      await loadRequests();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setProcessing(null);
    }
  };

  const refuse = (item: DocumentRequest) => {
    setRefusalNote("");
    setRefusalTarget(item);
  };

  const confirmRefusal = async () => {
    if (!refusalTarget || processing !== null) return;
    const item = refusalTarget;

    setProcessing(item.id);
    setError("");
    setMessage("");

    try {
      const response = await api.post(
        `/api/documents/admin/requests/${item.id}/refuse`,
        { note: refusalNote.trim() || null }
      );
      setMessage(response.data?.message || "Demande refusée.");
      setRefusalTarget(null);
      setRefusalNote("");
      await loadRequests();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setProcessing(null);
    }
  };

  const pendingCount = requests.filter((item) => item.status === "pending").length;

  return (
    <section className="mx-auto max-w-6xl py-8 text-white">
      <div className="rounded-3xl border border-emerald-500/30 bg-black/75 p-6 shadow-xl sm:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-emerald-300 sm:text-3xl">
              ✓ Gestion des demandes de documents
            </h1>
            <p className="mt-2 text-sm text-gray-300">
              Examinez les demandes et approuvez ou refusez leur traitement.
            </p>
          </div>
          <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3">
            <span className="text-sm text-yellow-200">En attente : </span>
            <strong className="text-xl text-yellow-300">{pendingCount}</strong>
          </div>
        </div>

        {message && (
          <div className="mb-4 rounded-xl border border-green-500/40 bg-green-900/30 p-3 text-green-200">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-xl border border-red-500/40 bg-red-900/30 p-3 text-red-200">
            {error}
          </div>
        )}

        <div className="mb-5 flex justify-end">
          <button
            type="button"
            onClick={() => { setLoading(true); loadRequests(); }}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10"
          >
            ↻ Actualiser
          </button>
        </div>

        {loading ? (
          <p className="text-gray-400">Chargement des demandes...</p>
        ) : requests.length === 0 ? (
          <p className="rounded-xl bg-white/5 p-5 text-gray-300">Aucune demande enregistrée.</p>
        ) : (
          <div className="space-y-4">
            {requests.map((item) => (
              <article key={item.id} className="rounded-2xl border border-white/15 bg-white/5 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-yellow-100">
                      {item.prenom} {item.nom}
                    </h2>
                    <p className="text-sm text-gray-300">Matricule : {item.matricule}</p>
                    <p className="text-sm text-gray-400">Compte : {item.email_compte || "Non renseigné"}</p>
                  </div>
                  <span className={
                    item.status === "approved"
                      ? "rounded-full bg-green-800 px-3 py-1 text-sm text-green-200"
                      : item.status === "refused"
                      ? "rounded-full bg-red-800 px-3 py-1 text-sm text-red-200"
                      : "rounded-full bg-yellow-800 px-3 py-1 text-sm text-yellow-100"
                  }>
                    {item.status === "approved" ? "Approuvée" : item.status === "refused" ? "Refusée" : "En attente"}
                  </span>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-gray-300 sm:grid-cols-2">
                  <p className="break-all"><strong>Destinataire :</strong> {item.destination_email}</p>
                  <p><strong>Mode :</strong> {
                    item.delivery_method === "account"
                      ? "E-mail du compte"
                      : item.delivery_method === "custom"
                      ? "Autre adresse"
                      : "Premier responsable paroissial"
                  }</p>
                  <p><strong>Localisation :</strong> {[item.pays, item.diocese, item.paroisse].filter(Boolean).join(" / ") || "—"}</p>
                  <p><strong>Date de demande :</strong> {dateText(item.created_at)}</p>
                  <p><strong>Âge au moment de la demande :</strong> {item.age_at_request != null ? `${item.age_at_request} ans` : "—"}</p>
                  <p><strong>Soutien minimum :</strong> {item.support_amount != null ? `${item.support_amount} F CFA` : "—"}</p>
                </div>

                {item.status === "approved" && (
                  <p className="mt-3 text-sm">
                    Envoi e-mail :{" "}
                    <strong className={item.email_sent ? "text-green-300" : "text-yellow-300"}>
                      {item.email_sent ? "effectué" : "non confirmé"}
                    </strong>
                  </p>
                )}
                {item.support_message && (
                  <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-amber-300">
                      Message de soutien communiqué au membre
                    </p>
                    <p className="text-sm leading-relaxed text-gray-200">{item.support_message}</p>
                  </div>
                )}

                {item.admin_note && (
                  <p className="mt-2 text-sm text-gray-300">Note : {item.admin_note}</p>
                )}

                {item.status === "pending" && (
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={processing === item.id}
                      onClick={() => approve(item)}
                      className="rounded-xl bg-green-600 px-5 py-2.5 font-semibold text-white hover:bg-green-500 disabled:opacity-50"
                    >
                      {processing === item.id ? "Traitement..." : "✓ Approuver et envoyer le PDF"}
                    </button>
                    <button
                      type="button"
                      disabled={processing === item.id}
                      onClick={() => refuse(item)}
                      className="rounded-xl bg-red-700 px-5 py-2.5 font-semibold text-white hover:bg-red-600 disabled:opacity-50"
                    >
                      ✕ Refuser
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>

      {approvalTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="document-approval-title"
            className="w-full max-w-lg rounded-3xl border border-amber-400/40 bg-gradient-to-br from-zinc-950 via-black to-amber-950/30 p-6 shadow-2xl shadow-amber-950/30 sm:p-8"
          >
            <div className="mb-4 text-3xl text-amber-300">✦</div>
            <h2 id="document-approval-title" className="text-2xl font-black text-amber-100">
              Confirmer l’approbation
            </h2>
            <p className="mt-4 text-sm leading-6 text-gray-300">
              Approuver la demande de{" "}
              <strong className="text-amber-200">
                {approvalTarget.prenom} {approvalTarget.nom}
              </strong>{" "}
              et envoyer le PDF à :
            </p>
            <p className="mt-2 break-all rounded-xl border border-amber-400/20 bg-white/5 p-3 text-sm text-amber-100">
              {approvalTarget.destination_email}
            </p>
            <div className="mt-7 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setApprovalTarget(null)}
                disabled={processing !== null}
                className="rounded-xl border border-amber-400/30 px-5 py-3 text-sm font-semibold text-amber-100 hover:bg-white/10 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmApproval}
                disabled={processing !== null}
                className="rounded-xl border border-amber-300/50 bg-gradient-to-r from-amber-500 to-yellow-300 px-5 py-3 text-sm font-black text-black shadow-lg shadow-amber-900/30 hover:brightness-110 disabled:opacity-50"
              >
                {processing === approvalTarget.id ? "Traitement..." : "Confirmer et envoyer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {refusalTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              confirmRefusal();
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="document-refusal-title"
            className="w-full max-w-lg rounded-3xl border border-amber-400/40 bg-gradient-to-br from-zinc-950 via-black to-amber-950/30 p-6 shadow-2xl shadow-amber-950/30 sm:p-8"
          >
            <div className="mb-4 text-3xl text-amber-300">✦</div>
            <h2 id="document-refusal-title" className="text-2xl font-black text-amber-100">
              Refuser la demande
            </h2>
            <p className="mt-3 text-sm text-gray-300">
              Demande de{" "}
              <strong className="text-amber-200">
                {refusalTarget.prenom} {refusalTarget.nom}
              </strong>{" "}
              — #{refusalTarget.id}
            </p>
            <label htmlFor="document-refusal-note" className="mt-6 block text-sm font-semibold text-amber-100">
              Motif du refus <span className="font-normal text-gray-400">(facultatif)</span>
            </label>
            <textarea
              id="document-refusal-note"
              value={refusalNote}
              onChange={(event) => setRefusalNote(event.target.value)}
              maxLength={2000}
              rows={4}
              placeholder="Vous pouvez préciser le motif du refus..."
              className="mt-2 w-full rounded-xl border border-amber-400/25 bg-black/60 p-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-amber-300"
            />
            <p className="mt-1 text-right text-xs text-gray-500">
              {refusalNote.length}/2000
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setRefusalTarget(null);
                  setRefusalNote("");
                }}
                disabled={processing !== null}
                className="rounded-xl border border-amber-400/30 px-5 py-3 text-sm font-semibold text-amber-100 hover:bg-white/10 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={processing !== null}
                className="rounded-xl border border-amber-300/50 bg-gradient-to-r from-amber-500 to-yellow-300 px-5 py-3 text-sm font-black text-black shadow-lg shadow-amber-900/30 hover:brightness-110 disabled:opacity-50"
              >
                {processing === refusalTarget.id ? "Traitement..." : "Confirmer le refus"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
};

export default AdminDocuments;
