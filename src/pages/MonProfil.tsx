import React, { useEffect, useState } from "react";
import api from "@/utils/axios";
import ProfilePhotoEditor from "@/components/ProfilePhotoEditor";

type Responsibility = {
  id: number;
  level?: string | null;
  role_name?: string | null;
  country?: string | null;
  diocese?: string | null;
  parish?: string | null;
  is_primary?: boolean;
};

type ProfileData = {
  nom?: string | null;
  prenom?: string | null;
  matricule?: string | null;
  sexe?: string | null;
  numero_whatsapp?: string | null;
  email?: string | null;
  date_integration?: string | null;
  date_inscription?: string | null;
  continent?: string | null;
  pays?: string | null;
  ville?: string | null;
  diocese?: string | null;
  paroisse?: string | null;
  statut?: string | null;
  profession?: string | null;
  requested_role?: string | null;
  status?: string | null;
  photo_url?: string | null;
  responsibilities?: Responsibility[];
};

const valeur = (v?: string | null) =>
  v && String(v).trim() ? v : "Non renseigné";

const dateFr = (v?: string | null) => {
  if (!v) return "Non renseignée";
  const d = new Date(`${v.slice(0, 10)}T00:00:00`);
  return Number.isNaN(d.getTime())
    ? v
    : d.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
};

const statusInfo = (status?: string | null) => {
  switch ((status || "").toLowerCase()) {
    case "validated":
      return {
        label: "Compte validé",
        symbol: "✓",
        style: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
      };
    case "pending":
      return {
        label: "En attente de validation",
        symbol: "◷",
        style: "border-amber-400/40 bg-amber-400/10 text-amber-200",
      };
    case "refused":
      return {
        label: "Demande refusée",
        symbol: "!",
        style: "border-red-400/40 bg-red-400/10 text-red-300",
      };
    default:
      return {
        label: "Statut non renseigné",
        symbol: "•",
        style: "border-slate-400/30 bg-slate-400/10 text-slate-300",
      };
  }
};

const SectionCard: React.FC<{
  title: string;
  subtitle: string;
  symbol: string;
  items: Array<[string, string]>;
}> = ({ title, subtitle, symbol, items }) => (
  <section className="group relative overflow-hidden rounded-2xl border border-amber-300/20 bg-gradient-to-br from-[#171717] via-[#101010] to-[#090909] p-5 shadow-[0_15px_45px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-1 hover:border-amber-300/50 hover:shadow-[0_18px_50px_rgba(202,160,65,0.10)] sm:p-6">
    <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-amber-400/[0.06] blur-3xl transition group-hover:bg-amber-400/[0.12]" />

    <div className="relative mb-5 flex items-center gap-3 border-b border-amber-300/15 pb-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-300/30 bg-gradient-to-br from-amber-300/20 to-yellow-700/10 text-xl text-amber-200 shadow-inner">
        {symbol}
      </div>
      <div>
        <h2 className="font-bold tracking-wide text-amber-100">{title}</h2>
        <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>

    <dl className="relative grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
      {items.map(([label, value]) => (
        <div key={label} className="min-w-0">
          <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-300/65">
            {label}
          </dt>
          <dd className="mt-1.5 break-words text-sm font-medium leading-relaxed text-slate-100">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  </section>
);

const MonProfil: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        const response = await api.get("/api/auth/me");
        if (active) setProfile(response.data as ProfileData);
      } catch (err: any) {
        if (active) {
          setError(
            err?.response?.data?.detail ||
              "Impossible de charger vos informations personnelles."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProfile();
    return () => {
      active = false;
    };
  }, []);

  const copyMatricule = async () => {
    if (!profile?.matricule) return;

    try {
      await navigator.clipboard.writeText(profile.matricule);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-14 w-14 animate-spin rounded-full border-2 border-amber-300/20 border-t-amber-300" />
          <p className="mt-5 text-sm font-medium tracking-widest text-amber-200">
            CHARGEMENT DE VOTRE PROFIL
          </p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="mx-auto mt-12 max-w-xl rounded-2xl border border-red-400/30 bg-[#151010] p-8 text-center shadow-xl">
        <div className="text-4xl text-red-300">!</div>
        <h2 className="mt-3 text-xl font-bold text-white">
          Profil indisponible
        </h2>
        <p className="mt-2 text-sm text-red-200">
          {error || "Aucune information de profil disponible."}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 rounded-xl border border-amber-300/40 px-5 py-2.5 text-sm font-semibold text-amber-200 transition hover:bg-amber-300/10"
        >
          Réessayer
        </button>
      </div>
    );
  }

  const status = statusInfo(profile.status);
  const fullName =
    [profile.prenom, profile.nom].filter(Boolean).join(" ") || "Membre";

  return (
    <div className="theme-adaptive relative mx-auto w-full max-w-6xl space-y-7 pb-12 pt-7 sm:pt-10">
      {/* Décoration d'arrière-plan */}
      <div className="pointer-events-none absolute left-1/2 top-10 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-amber-400/[0.07] blur-[100px]" />

      {/* En-tête */}
      <header className="relative overflow-hidden rounded-3xl border border-amber-300/25 bg-gradient-to-br from-[#241c0d] via-[#15120d] to-[#090909] px-5 py-9 text-center shadow-[0_20px_70px_rgba(0,0,0,0.4)] sm:px-10 sm:py-12">
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute -left-16 -top-20 h-64 w-64 rounded-full border border-amber-300/40" />
          <div className="absolute -left-10 -top-14 h-52 w-52 rounded-full border border-amber-300/30" />
          <div className="absolute -bottom-32 -right-12 h-72 w-72 rounded-full border border-amber-300/40" />
          <div className="absolute -bottom-24 -right-4 h-56 w-56 rounded-full border border-amber-300/30" />
        </div>

        <div className="relative">
          <div className="mb-4 flex items-center justify-center gap-3 text-amber-300">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-amber-300/70" />
            <span className="text-xs font-bold uppercase tracking-[0.35em]">
              Espace personnel
            </span>
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-amber-300/70" />
          </div>

          <div className="mb-3 text-3xl text-amber-300">✦</div>

          <h1 className="bg-gradient-to-r from-amber-100 via-yellow-300 to-amber-500 bg-clip-text text-3xl font-black uppercase tracking-[0.12em] text-transparent sm:text-5xl">
            Mon profil
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
            Votre espace personnel au sein de la Confrérie Saint Enfant Jésus
            Miraculeux de Prague.
          </p>

          <div className="mx-auto mt-6 h-px w-32 bg-gradient-to-r from-transparent via-amber-300/70 to-transparent" />
          <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-200/70">
            Identité · Appartenance · Responsabilités
          </p>
        </div>
      </header>

      {/* Carte personnelle */}
      <section className="relative overflow-hidden rounded-3xl border border-amber-300/30 bg-gradient-to-br from-[#201a0e] via-[#121212] to-[#090909] p-5 shadow-[0_20px_65px_rgba(0,0,0,0.4)] sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-yellow-500/[0.08] blur-3xl" />

        <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
          <div className="relative shrink-0">
            <div className="absolute -inset-2 rounded-full border border-amber-300/50" />
            <div className="absolute -inset-4 rounded-full border border-amber-300/15" />

            {profile.photo_url ? (
              <img
                src={profile.photo_url}
                alt="Photo de profil"
                className="relative h-32 w-32 rounded-full border-[3px] border-amber-300 object-cover shadow-[0_0_35px_rgba(234,179,8,0.22)] sm:h-36 sm:w-36"
              />
            ) : (
              <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-[3px] border-amber-300 bg-gradient-to-br from-amber-200/20 to-slate-900 text-5xl text-amber-200 shadow-[0_0_35px_rgba(234,179,8,0.22)] sm:h-36 sm:w-36">
                ♙
              </div>
            )}

            <span className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#17130b] bg-gradient-to-br from-amber-200 to-yellow-600 text-sm font-black text-black">
              ✦
            </span>
          </div>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-300/70">
              Membre de la Confrérie
            </p>

            <h2 className="mt-2 break-words text-2xl font-black text-white sm:text-3xl">
              {fullName}
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              {valeur(profile.statut)}
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${status.style}`}>
                <span>{status.symbol}</span>
                {status.label}
              </span>

              {profile.is_admin === true && (
                <span className="rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1.5 text-xs font-bold text-amber-200">
                  Administration
                </span>
              )}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-300/70">
                Matricule
              </span>
              <span className="rounded-lg border border-amber-300/30 bg-black/40 px-3 py-2 font-mono text-sm font-bold tracking-wider text-amber-100">
                {valeur(profile.matricule)}
              </span>
              {profile.matricule && (
                <button
                  type="button"
                  onClick={copyMatricule}
                  className="rounded-lg border border-amber-300/30 px-3 py-2 text-xs font-semibold text-amber-200 transition hover:bg-amber-300/10"
                >
                  {copied ? "✓ Copié" : "Copier"}
                </button>
              )}
            </div>
          </div>

          <div className="relative shrink-0 rounded-2xl border border-amber-300/20 bg-black/30 p-4">
            <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-widest text-amber-200/70">
              Photographie
            </p>
            <ProfilePhotoEditor />
          </div>
        </div>
      </section>

      {/* Informations */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SectionCard
          title="Identité personnelle"
          subtitle="Vos informations d'identification"
          symbol="♙"
          items={[
            ["Nom", valeur(profile.nom)],
            ["Prénom(s)", valeur(profile.prenom)],
            ["Sexe", valeur(profile.sexe)],
            ["Matricule", valeur(profile.matricule)],
          ]}
        />

        <SectionCard
          title="Coordonnées"
          subtitle="Vos moyens de contact"
          symbol="✉"
          items={[
            ["Téléphone / WhatsApp", valeur(profile.numero_whatsapp)],
            ["Adresse e-mail", valeur(profile.email)],
          ]}
        />

        <SectionCard
          title="Intégration"
          subtitle="Votre appartenance à la Confrérie"
          symbol="✦"
          items={[
            ["Date d'intégration", dateFr(profile.date_integration)],
            ["Statut dans la Confrérie", valeur(profile.statut)],
            ["Profession", valeur(profile.profession)],
            ["Fonction demandée", valeur(profile.requested_role)],
            ["État du compte", status.label],
            ["Date d'inscription", dateFr(profile.date_inscription)],
          ]}
        />

        <SectionCard
          title="Localisation"
          subtitle="Votre rattachement géographique et ecclésiastique"
          symbol="⌖"
          items={[
            ["Continent", valeur(profile.continent)],
            ["Pays", valeur(profile.pays)],
            ["Ville / Quartier / Zone", valeur(profile.ville)],
            ["Diocèse", valeur(profile.diocese)],
            ["Paroisse", valeur(profile.paroisse)],
          ]}
        />
      </div>

      {/* Responsabilités */}
      <section className="relative overflow-hidden rounded-2xl border border-amber-300/25 bg-gradient-to-br from-[#19150d] via-[#101010] to-[#090909] p-5 shadow-[0_15px_45px_rgba(0,0,0,0.3)] sm:p-7">
        <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-amber-400/[0.06] blur-3xl" />

        <div className="relative mb-6 flex items-center gap-3 border-b border-amber-300/15 pb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-300/30 bg-amber-300/10 text-xl text-amber-200">
            ⚜
          </div>
          <div>
            <h2 className="font-bold text-amber-100">
              Mes responsabilités
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Vos fonctions et missions actives
            </p>
          </div>
        </div>

        {profile.responsibilities?.length ? (
          <div className="relative grid grid-cols-1 gap-4 md:grid-cols-2">
            {profile.responsibilities.map((item) => (
              <article
                key={item.id}
                className="rounded-xl border border-amber-300/20 bg-black/35 p-5 transition hover:border-amber-300/50 hover:bg-amber-300/[0.04]"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-bold text-white">
                    {valeur(item.role_name)}
                  </h3>
                  {item.is_primary && (
                    <span className="shrink-0 rounded-full border border-amber-300/30 bg-amber-300/10 px-2.5 py-1 text-[10px] font-bold text-amber-200">
                      PRINCIPALE
                    </span>
                  )}
                </div>

                <p className="mt-3 text-xs font-bold uppercase tracking-wider text-amber-300/70">
                  Niveau de responsabilité
                </p>
                <p className="mt-1 text-sm text-slate-200">
                  {valeur(item.level)}
                </p>

                <div className="mt-4 space-y-1 border-t border-white/10 pt-3 text-xs text-slate-400">
                  {item.country && <p>Pays : {item.country}</p>}
                  {item.diocese && <p>Diocèse : {item.diocese}</p>}
                  {item.parish && <p>Paroisse : {item.parish}</p>}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="relative rounded-xl border border-dashed border-amber-300/20 bg-black/20 px-5 py-8 text-center">
            <div className="text-3xl text-amber-300/60">⚜</div>
            <p className="mt-3 text-sm font-medium text-slate-300">
              Aucune responsabilité active enregistrée.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Vos éventuelles responsabilités apparaîtront ici.
            </p>
          </div>
        )}
      </section>

      {/* Signature de bas de page */}
      <footer className="pb-4 pt-3 text-center">
        <div className="mx-auto mb-4 flex items-center justify-center gap-3 text-amber-300/60">
          <span className="h-px w-12 bg-gradient-to-r from-transparent to-amber-300/50" />
          <span>✦</span>
          <span className="h-px w-12 bg-gradient-to-l from-transparent to-amber-300/50" />
        </div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-200/60">
          Confrérie Saint Enfant Jésus Miraculeux de Prague
        </p>
        <p className="mt-2 text-xs text-slate-600">
          Votre identité · Votre engagement · Votre appartenance
        </p>
      </footer>
    </div>
  );
};

export default MonProfil;
