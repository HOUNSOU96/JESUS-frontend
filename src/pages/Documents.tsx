import React, { useCallback, useEffect, useState } from "react";
import api from "@/utils/axios";

type DocumentRequest = {
  id: number;
  delivery_method: "account" | "custom" | "parish_responsible";
  destination_email: string;
  status: "pending" | "approved" | "refused";
  created_at: string | null;
  approved_at: string | null;
  email_sent: boolean;
  admin_note?: string | null;
};

const errorMessage = (error: any) =>
  error?.response?.data?.detail ||
  error?.response?.data?.message ||
  error?.message ||
  "Une erreur est survenue.";

const dateText = (value: string | null) =>
  value ? new Date(value).toLocaleString("fr-FR") : "—";

const Documents: React.FC = () => {
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [method, setMethod] = useState<"account" | "custom" | "parish_responsible">("account");
  const [customEmail, setCustomEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadRequests = useCallback(async () => {
    try {
      const response = await api.get("/api/documents/mine");
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

  const submitRequest = async (event: React.FormEvent) => {
    event.preventDefault();
    setSending(true);
    setError("");
    setMessage("");

    try {
      const payload: {
        delivery_method: string;
        destination_email?: string;
      } = { delivery_method: method };

      if (method === "custom") {
        payload.destination_email = customEmail.trim();
      }

      const response = await api.post("/api/documents/request", payload);
      setMessage(response.data?.message || "Votre demande a été envoyée.");
      setCustomEmail("");
      await loadRequests();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const downloadDocument = async () => {
    setDownloading(true);
    setError("");
    setMessage("");

    try {
      const response = await api.get("/api/documents/download", {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Mon_document_personnel.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setMessage("Le téléchargement de votre document a été lancé.");
    } catch (err: any) {
      if (err?.response?.data instanceof Blob) {
        try {
          const content = await err.response.data.text();
          const parsed = JSON.parse(content);
          setError(parsed.detail || "Le téléchargement a échoué.");
        } catch {
          setError("Le téléchargement a échoué.");
        }
      } else {
        setError(errorMessage(err));
      }
    } finally {
      setDownloading(false);
    }
  };

  const latestApproved = requests.find((item) => item.status === "approved");
  const hasPending = requests.some((item) => item.status === "pending");

  return (
    <section className="mx-auto max-w-4xl py-8 text-white">
      <div className="rounded-3xl border border-yellow-500/30 bg-black/75 p-6 shadow-xl sm:p-8">
        <h1 className="mb-2 text-2xl font-bold text-yellow-300 sm:text-3xl">
          📘 Mon document personnel
        </h1>
        <p className="mb-6 text-sm text-gray-300">
          Demandez votre document personnalisé. Après validation par un administrateur,
          vous pourrez le télécharger ici et le recevoir par e-mail.
        </p>

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

        <form onSubmit={submitRequest} className="space-y-5">
          <div>
            <label className="mb-2 block font-semibold text-yellow-100">
              Adresse e-mail de réception
            </label>
            <div className="space-y-3">
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/15 p-3">
                <input
                  type="radio"
                  name="delivery"
                  checked={method === "account"}
                  onChange={() => setMethod("account")}
                  className="mt-1"
                />
                <span>
                  <span className="block font-medium">Mon adresse d'inscription</span>
                  <span className="text-sm text-gray-400">
                    Le document sera envoyé à l'adresse e-mail de mon compte.
                  </span>
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/15 p-3">
                <input
                  type="radio"
                  name="delivery"
                  checked={method === "custom"}
                  onChange={() => setMethod("custom")}
                  className="mt-1"
                />
                <span className="block flex-1">
                  <span className="block font-medium">Une autre adresse e-mail</span>
                  {method === "custom" && (
                    <input
                      type="email"
                      required
                      value={customEmail}
                      onChange={(event) => setCustomEmail(event.target.value)}
                      placeholder="exemple@domaine.com"
                      className="mt-3 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white outline-none focus:border-yellow-400"
                    />
                  )}
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/15 p-3">
                <input
                  type="radio"
                  name="delivery"
                  checked={method === "parish_responsible"}
                  onChange={() => setMethod("parish_responsible")}
                  className="mt-1"
                />
                <span>
                  <span className="block font-medium">Premier responsable de ma paroisse</span>
                  <span className="text-sm text-gray-400">
                    Le document sera envoyé à l'adresse enregistrée du premier responsable.
                  </span>
                </span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={sending || hasPending}
            className="w-full rounded-xl bg-yellow-500 px-5 py-3 font-bold text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? "Envoi de la demande..." : hasPending ? "Demande déjà en attente" : "Envoyer ma demande"}
          </button>
          {hasPending && (
            <p className="text-sm text-yellow-200">
              Une demande est déjà en attente de validation. Vous pourrez en soumettre une autre après son traitement.
            </p>
          )}
        </form>

        {latestApproved && (
          <div className="mt-6 rounded-2xl border border-green-500/40 bg-green-900/20 p-5">
            <h2 className="mb-2 text-lg font-bold text-green-300">Votre document est disponible</h2>
            <p className="mb-4 text-sm text-gray-200">
              Votre demande a été approuvée le {dateText(latestApproved.approved_at)}.
            </p>
            <p className="mb-4 text-sm text-gray-300">
              Envoi par e-mail :{" "}
              <strong className={latestApproved.email_sent ? "text-green-300" : "text-yellow-300"}>
                {latestApproved.email_sent ? "effectué" : "non confirmé"}
              </strong>
            </p>
            <button
              type="button"
              onClick={downloadDocument}
              disabled={downloading}
              className="w-full rounded-xl bg-green-600 px-5 py-3 font-bold text-white hover:bg-green-500 disabled:opacity-50"
            >
              {downloading ? "Préparation du PDF..." : "⬇ Télécharger mon document PDF"}
            </button>
          </div>
        )}

        <div className="mt-8">
          <h2 className="mb-4 text-xl font-bold text-yellow-200">Historique de mes demandes</h2>
          {loading ? (
            <p className="text-gray-400">Chargement...</p>
          ) : requests.length === 0 ? (
            <p className="text-gray-400">Vous n'avez encore soumis aucune demande.</p>
          ) : (
            <div className="space-y-3">
              {requests.map((item) => (
                <article key={item.id} className="rounded-xl border border-white/15 bg-white/5 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong>Demande #{item.id}</strong>
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
                  <p className="mt-2 break-all text-sm text-gray-300">
                    Destinataire : {item.destination_email}
                  </p>
                  <p className="mt-1 text-sm text-gray-400">
                    Demande créée : {dateText(item.created_at)}
                  </p>
                  {item.admin_note && (
                    <p className="mt-2 text-sm text-gray-300">Note : {item.admin_note}</p>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Documents;
