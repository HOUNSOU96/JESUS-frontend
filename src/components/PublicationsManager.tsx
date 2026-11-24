import React, { FormEvent, useCallback, useEffect, useState } from "react";
import api from "@/utils/axios";
import { useAuth } from "@/context/AuthContext";

type Publication = {
  id: number;
  section: string;
  category?: string | null;
  content_type: "texte" | "audio" | "video" | "image";
  title: string;
  description?: string | null;
  text_content?: string | null;
  media_url?: string | null;
  external_video_url?: string | null;
  contact_name?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  website?: string | null;
  address?: string | null;
  extra_info?: string | null;
  is_published: boolean;
  created_at?: string;
};

type Props = {
  section: "publicite" | "priere" | "enseignement";
  category?: string;
  categoryOptions?: { value: string; label: string }[];
  compact?: boolean;
};

const emptyForm = {
  title: "",
  description: "",
  category: "",
  content_type: "texte" as "texte" | "audio" | "video" | "image",
  text_content: "",
  external_video_url: "",
  contact_name: "",
  phone: "",
  whatsapp: "",
  email: "",
  website: "",
  address: "",
  extra_info: "",
  is_published: true,
};

const PublicationsManager: React.FC<Props> = ({
  section,
  category,
  categoryOptions = [],
  compact = false,
}) => {
  const { user } = useAuth();
  const isAdmin = user?.is_admin === true || user?.is_admin === 1;

  const [items, setItems] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Publication | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [media, setMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string>("");

  useEffect(() => {
    if (!media) {
      setMediaPreview("");
      return;
    }

    const preview = URL.createObjectURL(media);
    setMediaPreview(preview);

    return () => URL.revokeObjectURL(preview);
  }, [media]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (isAdmin) {
        const response = await api.get<Publication[]>("/api/publications/admin");
        setItems(response.data.filter((item) => item.section === section));
      } else {
        const response = await api.get<Publication[]>("/api/publications", {
          params: { section },
        });
        setItems(response.data);
      }
    } catch {
      setError("Impossible de charger les publications. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }, [isAdmin, section]);

  useEffect(() => {
    load();
  }, [load]);

  const visibleItems = items.filter((item) => {
    if (category && category !== "tous" && item.category !== category) return false;
    return isAdmin || item.is_published;
  });

  const startCreate = () => {
    setEditing(null);
    setForm({
      ...emptyForm,
      category: category && category !== "tous" ? category : "",
    });
    setMedia(null);
    setFormOpen(true);
  };

  const startEdit = (item: Publication) => {
    setEditing(item);
    setForm({
      title: item.title || "",
      description: item.description || "",
      category: item.category || "",
      content_type: item.content_type,
      text_content: item.text_content || "",
      external_video_url: item.external_video_url || "",
      contact_name: item.contact_name || "",
      phone: item.phone || "",
      whatsapp: item.whatsapp || "",
      email: item.email || "",
      website: item.website || "",
      address: item.address || "",
      extra_info: item.extra_info || "",
      is_published: item.is_published,
    });
    setMedia(null);
    setFormOpen(true);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.title.trim()) {
      setError("Le titre est obligatoire.");
      return;
    }
    if (!editing && form.content_type === "audio" && !media) {
      setError("Veuillez sélectionner un fichier audio.");
      return;
    }
    if (!editing && form.content_type === "video" && !media && !form.external_video_url.trim()) {
      setError("Ajoutez un fichier vidéo ou un lien vidéo.");
      return;
    }
    if (!editing && form.content_type === "image" && !media) {
      setError("Veuillez sélectionner une image.");
      return;
    }
    if (form.content_type === "texte" && !form.text_content.trim()) {
      setError("Le contenu du texte est obligatoire.");
      return;
    }

    const data = new FormData();
    if (!editing) {
      data.append("section", section);
      data.append("content_type", form.content_type);
    }

    Object.entries(form).forEach(([key, value]) => {
      data.append(key, String(value));
    });
    if (media) data.append("media", media);

    setSaving(true);
    setError("");
    try {
      if (editing) {
        await api.put(`/api/publications/${editing.id}`, data);
      } else {
        await api.post("/api/publications", data);
      }
      setFormOpen(false);
      setEditing(null);
      setForm(emptyForm);
      setMedia(null);
      await load();
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "L'enregistrement a échoué. Vérifiez les champs et le fichier."
      );
    } finally {
      setSaving(false);
    }
  };

  const togglePublished = async (item: Publication) => {
    const data = new FormData();
    data.append("is_published", String(!item.is_published));
    try {
      await api.put(`/api/publications/${item.id}`, data);
      await load();
    } catch {
      setError("Impossible de modifier le statut de cette publication.");
    }
  };

  const remove = async (item: Publication) => {
    if (!window.confirm(`Supprimer définitivement « ${item.title} » ?`)) return;
    try {
      await api.delete(`/api/publications/${item.id}`);
      await load();
    } catch {
      setError("Impossible de supprimer cette publication.");
    }
  };

  const heading =
    section === "publicite" ? "Publications et annonces" :
    section === "priere" ? "Prières publiées" :
    "Enseignements et méditations";

  return (
    <section className={`${compact ? "mt-6" : "relative mt-10"} rounded-3xl border border-amber-300/20 bg-black/30 p-4 text-white shadow-xl sm:p-6`}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-400/70">
            Espace de partage
          </p>
          <h2 className="mt-1 text-xl font-black text-amber-100 sm:text-2xl">
            {heading}
          </h2>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={startCreate}
            className="rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-black text-black transition hover:bg-amber-300"
          >
            + Publier
          </button>
        )}
      </div>

      {error && (
        <p className="mb-4 rounded-xl border border-red-400/30 bg-red-950/30 p-3 text-sm text-red-200">
          {error}
        </p>
      )}

      {formOpen && isAdmin && (
        <form onSubmit={submit} className="mb-6 space-y-4 rounded-2xl border border-amber-300/30 bg-[#17130b] p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-black text-amber-200">
              {editing ? "Modifier la publication" : "Nouvelle publication"}
            </h3>
            <button type="button" onClick={() => setFormOpen(false)} className="text-xl text-slate-300" aria-label="Fermer">×</button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {!editing && (
              <label className="text-sm text-slate-300">
                Type de contenu
                <select value={form.content_type} onChange={(e) => setForm({ ...form, content_type: e.target.value as any })} className="mt-1 w-full rounded-xl border border-amber-300/20 bg-black p-3 text-white">
                  <option value="texte">Texte</option>
                  <option value="audio">Audio</option>
                  <option value="video">Vidéo</option>\n                  <option value="image">Image</option>
                </select>
              </label>
            )}
            {categoryOptions.length > 0 && (
              <label className="text-sm text-slate-300">
                Catégorie
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mt-1 w-full rounded-xl border border-amber-300/20 bg-black p-3 text-white">
                  <option value="">Choisir une catégorie</option>
                  {categoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
            )}
          </div>

          <label className="block text-sm text-slate-300">
            Titre *
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 w-full rounded-xl border border-amber-300/20 bg-black p-3 text-white" />
          </label>

          <label className="block text-sm text-slate-300">
            Description
            <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 w-full rounded-xl border border-amber-300/20 bg-black p-3 text-white" />
          </label>

          {form.content_type === "texte" && (
            <label className="block text-sm text-slate-300">
              Contenu *
              <textarea rows={6} value={form.text_content} onChange={(e) => setForm({ ...form, text_content: e.target.value })} className="mt-1 w-full rounded-xl border border-amber-300/20 bg-black p-3 text-white" />
            </label>
          )}

          {(form.content_type === "audio" || form.content_type === "video" || form.content_type === "image") && (
            <div>
              <label className="block text-sm text-slate-300">
                Fichier {form.content_type === "audio" ? "audio" : form.content_type === "video" ? "vidéo" : "image"} {editing ? "(facultatif si vous conservez le fichier actuel)" : "*"}
                <input
                  type="file"
                  accept={
                    form.content_type === "audio" ? "audio/*" :
                    form.content_type === "video" ? "video/*" :
                    "image/jpeg,image/png,image/webp"
                  }
                  onChange={(e) => setMedia(e.target.files?.[0] || null)}
                  className="mt-1 block w-full rounded-xl border border-amber-300/20 bg-black p-3 text-sm text-white file:mr-3 file:rounded-lg file:border-0 file:bg-amber-400 file:px-3 file:py-2 file:font-bold file:text-black"
                />
              </label>

              {form.content_type === "image" && (mediaPreview || (editing && editing.media_url)) && (
                <div className="mt-3">
                  <p className="mb-2 text-xs text-amber-200">Aperçu de l'image</p>
                  <img
                    src={mediaPreview || editing?.media_url || ""}
                    alt="Aperçu de la publication"
                    className="max-h-64 max-w-full rounded-xl border border-amber-300/30 object-contain"
                  />
                </div>
              )}
            </div>
          )}

          {form.content_type === "video" && (
            <label className="block text-sm text-slate-300">
              Lien vidéo externe (facultatif)
              <input type="url" value={form.external_video_url} onChange={(e) => setForm({ ...form, external_video_url: e.target.value })} placeholder="https://…" className="mt-1 w-full rounded-xl border border-amber-300/20 bg-black p-3 text-white" />
            </label>
          )}

          <div className="border-t border-amber-300/15 pt-4">
            <p className="mb-3 text-sm font-bold text-amber-200">Coordonnées facultatives</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {([
                ["contact_name", "Nom / organisation"],
                ["phone", "Téléphone"],
                ["whatsapp", "WhatsApp"],
                ["email", "E-mail"],
                ["website", "Site Internet"],
                ["address", "Adresse"],
              ] as const).map(([key, label]) => (
                <label key={key} className="text-xs text-slate-400">
                  {label}
                  <input value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="mt-1 w-full rounded-xl border border-amber-300/20 bg-black p-2.5 text-sm text-white" />
                </label>
              ))}
            </div>
            <label className="mt-3 block text-xs text-slate-400">
              Informations complémentaires
              <textarea rows={2} value={form.extra_info} onChange={(e) => setForm({ ...form, extra_info: e.target.value })} className="mt-1 w-full rounded-xl border border-amber-300/20 bg-black p-3 text-sm text-white" />
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-200">
            <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="rounded border-amber-300 text-amber-500 focus:ring-amber-400" />
            Publier immédiatement
          </label>

          <div className="flex flex-wrap gap-3">
            <button disabled={saving} type="submit" className="rounded-xl bg-amber-400 px-5 py-3 text-sm font-black text-black disabled:opacity-50">
              {saving ? "Enregistrement…" : editing ? "Enregistrer les modifications" : "Enregistrer la publication"}
            </button>
            <button type="button" onClick={() => setFormOpen(false)} className="rounded-xl border border-white/20 px-5 py-3 text-sm text-white">
              Annuler
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="py-8 text-center text-sm text-slate-400">Chargement des publications…</p>
      ) : visibleItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-amber-300/20 px-5 py-9 text-center">
          <p className="text-3xl">📭</p>
          <p className="mt-3 font-bold text-amber-100">Aucune publication pour le moment</p>
          <p className="mt-1 text-sm text-slate-400">
            {isAdmin ? "Vous pouvez ajouter un texte, un audio, une vidéo ou une image." : "Les prochaines publications apparaîtront ici."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {visibleItems.map((item) => (
            <article key={item.id} className="rounded-2xl border border-amber-300/20 bg-gradient-to-br from-[#201a0e] to-[#090909] p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span className="rounded-full bg-amber-300/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-200">
                    {item.content_type} {item.category ? `• ${item.category}` : ""}
                  </span>
                  <h3 className="mt-3 text-lg font-black text-amber-100">{item.title}</h3>
                  {item.description && <p className="mt-1 whitespace-pre-line text-sm text-slate-300">{item.description}</p>}
                </div>
                {isAdmin && (
                  <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${item.is_published ? "bg-green-900/50 text-green-300" : "bg-orange-900/50 text-orange-300"}`}>
                    {item.is_published ? "En ligne" : "Non publiée"}
                  </span>
                )}
              </div>

              {item.text_content && <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-200">{item.text_content}</p>}

              {item.content_type === "image" && item.media_url && (
                <img
                  src={item.media_url}
                  alt={item.title}
                  loading="lazy"
                  className="mt-4 max-h-[520px] w-full rounded-xl bg-black object-contain"
                />
              )}

              {item.content_type === "audio" && item.media_url && (
                <audio controls preload="none" src={item.media_url} className="mt-4 w-full" />
              )}

              {item.content_type === "video" && item.media_url && (
                <video controls preload="metadata" src={item.media_url} className="mt-4 max-h-[420px] w-full rounded-xl bg-black" />
              )}

              {item.external_video_url && (
                <a href={item.external_video_url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex rounded-lg bg-amber-400 px-4 py-2 text-sm font-bold text-black">
                  ▶ Regarder la vidéo
                </a>
              )}

              {(item.contact_name || item.phone || item.whatsapp || item.email || item.website || item.address || item.extra_info) && (
                <div className="mt-4 border-t border-amber-300/15 pt-3 text-xs leading-6 text-slate-300">
                  {item.contact_name && <p className="font-bold text-amber-200">{item.contact_name}</p>}
                  {item.phone && <p>Téléphone : {item.phone}</p>}
                  {item.whatsapp && <p><a className="text-green-300 underline" href={`https://wa.me/${item.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">WhatsApp : {item.whatsapp}</a></p>}
                  {item.email && <p><a className="text-amber-200 underline" href={`mailto:${item.email}`}>{item.email}</a></p>}
                  {item.website && <p><a className="text-amber-200 underline" href={item.website} target="_blank" rel="noopener noreferrer">{item.website}</a></p>}
                  {item.address && <p>Adresse : {item.address}</p>}
                  {item.extra_info && <p className="mt-1 whitespace-pre-line">{item.extra_info}</p>}
                </div>
              )}

              {isAdmin && (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-amber-300/15 pt-3">
                  <button type="button" onClick={() => startEdit(item)} className="rounded-lg border border-amber-300/30 px-3 py-2 text-xs font-bold text-amber-200">Modifier</button>
                  <button type="button" onClick={() => togglePublished(item)} className="rounded-lg border border-blue-300/30 px-3 py-2 text-xs font-bold text-blue-200">
                    {item.is_published ? "Dépublier" : "Publier"}
                  </button>
                  <button type="button" onClick={() => remove(item)} className="rounded-lg border border-red-300/30 px-3 py-2 text-xs font-bold text-red-200">Supprimer</button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default PublicationsManager;
