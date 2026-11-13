import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { worldCountries } from "@/data";
import api from "@/utils/axios";

type FormDataType = {
  nom: string;
  prenom: string;
  sexe: string;
  dateIntegration: string;
  statut: string;
  profession: string;
  continent: string;
  country: string;
  diocese: string;
  ville: string;
  parish: string;
  numero: string;
  email: string;
};

const initialForm: FormDataType = {
  nom: "",
  prenom: "",
  sexe: "",
  dateIntegration: "",
  statut: "Membre",
  profession: "",
  continent: "",
  country: "",
  diocese: "",
  ville: "",
  parish: "",
  numero: "",
  email: "",
};



type Jurisdiction = { id: number; name: string; kind: string };
type GeoCity = { id: number; name: string };
type GeoParish = { id: number; name: string; city_id: number | null };

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-900/30";

const labelClass =
  "mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200";

export default function Inscription() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormDataType>(initialForm);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [matricule, setMatricule] = useState("");
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [jurisdictions, setJurisdictions] = useState<Jurisdiction[]>([]);
  const [cities, setCities] = useState<GeoCity[]>([]);
  const [parishes, setParishes] = useState<GeoParish[]>([]);
  const [geoLoading, setGeoLoading] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const stepFields: Array<Array<keyof FormDataType>> = [
    ["nom", "prenom", "sexe", "dateIntegration"],
    ["profession"],
    ["continent", "country", "diocese", "ville", "parish"],
    ["numero"],
  ];

  const handleNextStep = () => {
    const newErrors: Record<string, string> = {};

    stepFields[currentStep - 1].forEach((field) => {
      if (!String(formData[field]).trim()) {
        newErrors[field] = "Ce champ est obligatoire.";
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setCurrentStep((previous) => Math.min(previous + 1, totalSteps));
  };

  const handlePreviousStep = () => {
    setErrors({});
    setCurrentStep((previous) => Math.max(previous - 1, 1));
  };


  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const selectedCountry = worldCountries.find(
    (country) => country.value === formData.country
  );

  const selectedJurisdiction = jurisdictions.find(
    (item) => item.name === formData.diocese
  );

  const selectedCity = cities.find(
    (item) => item.name === formData.ville
  );

  const indicatif = selectedCountry?.callingCode || "+";

  useEffect(() => {
    let active = true;

    setJurisdictions([]);
    setCities([]);
    setParishes([]);

    if (!formData.country) return;

    setGeoLoading(true);
    api.get(`/api/geography/jurisdictions?country=${encodeURIComponent(formData.country.toLowerCase())}`)
      .then((response) => {
        if (active) setJurisdictions(response.data);
      })
      .catch((error) => {
        console.error("Erreur de chargement des diocèses :", error);
        if (active) setJurisdictions([]);
      })
      .finally(() => {
        if (active) setGeoLoading(false);
      });

    return () => { active = false; };
  }, [formData.country]);

  useEffect(() => {
    let active = true;
    setCities([]);
    setParishes([]);

    if (!selectedJurisdiction) return;

    api.get(`/api/geography/cities?jurisdiction_id=${selectedJurisdiction.id}`)
      .then((response) => {
        if (active) setCities(response.data);
      })
      .catch((error) => {
        console.error("Erreur de chargement des villes :", error);
        if (active) setCities([]);
      });

    return () => { active = false; };
  }, [selectedJurisdiction?.id]);

  useEffect(() => {
    let active = true;
    setParishes([]);

    if (!selectedJurisdiction || !selectedCity) return;

    api.get(`/api/geography/parishes?jurisdiction_id=${selectedJurisdiction.id}&city_id=${selectedCity.id}`)
      .then((response) => {
        if (active) setParishes(response.data);
      })
      .catch((error) => {
        console.error("Erreur de chargement des paroisses :", error);
        if (active) setParishes([]);
      });

    return () => { active = false; };
  }, [selectedJurisdiction?.id, selectedCity?.id]);


  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => {
      if (name === "country") {
        const selected = worldCountries.find(
          (country) => country.value === value
        );

        return {
          ...previous,
          country: value,
          continent: selected?.continent || "",
          diocese: "",
          ville: "",
          parish: "",
        };
      }

      return {
        ...previous,
        [name]: value,
        ...(name === "diocese" ? { ville: "", parish: "" } : {}),
        ...(name === "ville" ? { parish: "" } : {}),
      };
    });

    setErrors((previous) => ({ ...previous, [name]: "" }));
  };

  const handlePhotoChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setErrors((previous) => ({
        ...previous,
        photo: "Format accepté : JPG, PNG ou WebP.",
      }));
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((previous) => ({
        ...previous,
        photo: "La photographie ne doit pas dépasser 5 Mo.",
      }));
      event.target.value = "";
      return;
    }

    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setErrors((previous) => ({ ...previous, photo: "" }));
  };

  const validerFormulaire = () => {
    const newErrors: Record<string, string> = {};

    const requiredFields: Array<keyof FormDataType> = [
      "nom",
      "prenom",
      "sexe",
      "dateIntegration",
      "profession",
      "continent",
      "country",
      "diocese",
      "ville",
      "parish",
      "numero",
    ];

    requiredFields.forEach((field) => {
      if (!String(formData[field]).trim()) {
        newErrors[field] = "Ce champ est obligatoire.";
      }
    });

    if (formData.numero && !/^[0-9\s().-]{6,20}$/.test(formData.numero)) {
      newErrors.numero = "Vérifie le numéro de téléphone saisi.";
    }

    if (
      formData.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = "Adresse électronique invalide.";
    }

    if (!photo) {
      newErrors.photo = "Une photographie est obligatoire.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (loading || matricule) return;
    if (!validerFormulaire()) return;

    setLoading(true);

    try {
      const payload = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (key === "statut") {
          payload.append("statut", "Membre");
        } else {
          payload.append(key, value.trim());
        }
      });

      if (photo) {
        payload.append("photo", photo);
      }

      const response = await api.post("/api/auth/register", payload);

      setMatricule(response.data.matricule);
      setConfirmationMessage(
        response.data.message ||
          "Votre inscription a été enregistrée. Votre compte est en attente de validation."
      );
    } catch (error: any) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Une erreur est survenue pendant l'inscription.";

      setErrors((previous) => ({ ...previous, general: message }));
    } finally {
      setLoading(false);
    }
  };

  const SectionTitle = ({
    number,
    title,
    description,
  }: {
    number: string;
    title: string;
    description: string;
  }) => (
    <div className="mb-6 flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
        {number}
      </div>
      <div>
        <h2 className="font-bold text-gray-900 dark:text-white">{title}</h2>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
    </div>
  );

  const FieldError = ({ name }: { name: string }) =>
    errors[name] ? (
      <p className="mt-1.5 text-xs text-red-600">{errors[name]}</p>
    ) : null;

  if (matricule) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 dark:bg-gray-950">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-xl dark:border-gray-800 dark:bg-gray-900 sm:p-10"
        >
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl dark:bg-green-900/30">
            ✓
          </div>

          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-green-700 dark:text-green-400">
            Inscription enregistrée
          </p>

          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            Bienvenue dans la confrérie
          </h1>

          <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-gray-600 dark:text-gray-300">
            {confirmationMessage}
          </p>

          <div className="mt-7 rounded-2xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-900/50 dark:bg-blue-950/30">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
              Votre matricule
            </p>
            <p className="mt-2 break-all text-xl font-extrabold tracking-wider text-blue-900 dark:text-blue-100">
              {matricule}
            </p>
            <p className="mt-3 text-xs text-blue-700 dark:text-blue-300">
              Conservez précieusement ce matricule. Il vous sera demandé pour
              vous connecter après validation de votre inscription.
            </p>
          </div>

          <div className="mt-6 rounded-xl bg-amber-50 p-4 text-left text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
            <strong>À retenir :</strong> votre compte doit être validé par un
            administrateur avant votre première connexion.
          </div>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="mt-7 w-full rounded-xl bg-blue-700 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-800"
          >
            Retour à la connexion
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-gray-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="bg-gradient-to-r from-blue-950 via-blue-800 to-blue-700 px-6 py-9 text-white sm:px-10">
            <div className="mx-auto max-w-2xl text-center">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-blue-200">
                Confrérie Saint Enfant Jésus
              </p>
              <h1 className="text-2xl font-extrabold sm:text-3xl">
                Formulaire d'inscription
              </h1>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-blue-100">
                Renseignez soigneusement les informations suivantes pour
                rejoindre la confrérie.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-9 p-5 sm:p-9">

            <div>
              <div className="mb-3 flex justify-between text-xs font-semibold text-gray-500">
                <span>Étape {currentStep} sur {totalSteps}</span>
                <span>{Math.round((currentStep / totalSteps) * 100)} %</span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <motion.div
                  className="h-full rounded-full bg-blue-700"
                  animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {errors.general && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
              >
                {errors.general}
              </div>
            )}

            {currentStep === 1 && (
<section>
              <SectionTitle
                number="01"
                title="Identité personnelle"
                description="Les informations permettant de vous identifier."
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Nom *</label>
                  <input
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Votre nom"
                    autoComplete="family-name"
                  />
                  <FieldError name="nom" />
                </div>

                <div>
                  <label className={labelClass}>Prénom(s) *</label>
                  <input
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Votre prénom"
                    autoComplete="given-name"
                  />
                  <FieldError name="prenom" />
                </div>

                <div>
                  <label className={labelClass}>Sexe *</label>
                  <select
                    name="sexe"
                    value={formData.sexe}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="">Sélectionner</option>
                    <option value="Homme">Homme</option>
                    <option value="Femme">Femme</option>
                  </select>
                  <FieldError name="sexe" />
                </div>

                <div>
                  <label className={labelClass}>Date d'intégration *</label>
                  <input
                    type="date"
                    name="dateIntegration"
                    value={formData.dateIntegration}
                    onChange={handleChange}
                    max={new Date().toISOString().split("T")[0]}
                    className={inputClass}
                  />
                  <FieldError name="dateIntegration" />
                </div>
              </div>
            </section>
)}

            {currentStep === 2 && (
<section className="border-t border-gray-100 pt-8 dark:border-gray-800">
              <SectionTitle
                number="02"
                title="Situation professionnelle"
                description="Votre activité actuelle."
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Profession *</label>
                  <select
                    name="profession"
                    value={formData.profession}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="">Sélectionner une profession</option>
                    <option value="Étudiant">Étudiant</option>
                    <option value="Enseignant">Enseignant</option>
                    <option value="Médecin">Médecin</option>
                    <option value="Ingénieur">Ingénieur</option>
                    <option value="Commerçant">Commerçant</option>
                    <option value="Artisan">Artisan</option>
                    <option value="Fonctionnaire">Fonctionnaire</option>
                    <option value="Sans emploi">Sans emploi</option>
                    <option value="Autre">Autre</option>
                  </select>
                  <FieldError name="profession" />
                </div>

                <div>
                  <label className={labelClass}>Statut dans la confrérie</label>
                  <input
                    value="Membre"
                    readOnly
                    className={`${inputClass} cursor-not-allowed bg-gray-100 dark:bg-gray-800`}
                  />
                  <p className="mt-1.5 text-xs text-gray-500">
                    Le statut de membre est attribué automatiquement.
                  </p>
                </div>
              </div>
            </section>
)}

            {currentStep === 3 && (
<section className="border-t border-gray-100 pt-8 dark:border-gray-800">
              <SectionTitle
                number="03"
                title="Localisation ecclésiastique"
                description="Indiquez votre implantation géographique."
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Continent *</label>
                  <div
                    className={`${inputClass} min-h-[46px] flex items-center bg-gray-100 dark:bg-gray-800`}
                  >
                    {selectedCountry?.continentLabel || "Automatiquement renseigné après le choix du pays"}
                  </div>
                  <FieldError name="continent" />
                </div>

                <div>
                  <label className={labelClass}>Pays *</label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="">Sélectionnez votre pays</option>
                    {worldCountries.map((country) => (
                      <option key={country.code} value={country.value}>
                        {country.label}
                      </option>
                    ))}
                  </select>
                  <FieldError name="country" />
                </div>

                <div>
                  <label className={labelClass}>Diocèse / Archidiocèse *</label>
                  <select
                    name="diocese"
                    value={formData.diocese}
                    onChange={handleChange}
                    className={inputClass}
                    disabled={!formData.country || geoLoading || jurisdictions.length === 0}
                  >
                    <option value="">
                      {!formData.country
                        ? "Choisissez d'abord un pays"
                        : geoLoading
                          ? "Chargement..."
                          : jurisdictions.length
                            ? "Sélectionnez votre diocèse"
                            : "Aucun diocèse enregistré pour ce pays"}
                    </option>
                    {jurisdictions.map((item) => (
                      <option key={item.id} value={item.name}>
                        {item.kind === "archdiocese" ? "Archidiocèse de " : "Diocèse de "}{item.name}
                      </option>
                    ))}
                  </select>
                  <FieldError name="diocese" />
                </div>

                <div>
                  <label className={labelClass}>Ville *</label>
                  <select
                    name="ville"
                    value={formData.ville}
                    onChange={handleChange}
                    className={inputClass}
                    disabled={!selectedJurisdiction || cities.length === 0}
                  >
                    <option value="">
                      {!selectedJurisdiction
                        ? "Choisissez d'abord un diocèse"
                        : cities.length
                          ? "Sélectionnez votre ville"
                          : "Aucune ville enregistrée"}
                    </option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.name}>{city.name}</option>
                    ))}
                  </select>
                  <FieldError name="ville" />
                </div>

                <div>
                  <label className={labelClass}>Paroisse *</label>
                  <select
                    name="parish"
                    value={formData.parish}
                    onChange={handleChange}
                    className={inputClass}
                    disabled={!selectedCity || parishes.length === 0}
                  >
                    <option value="">
                      {!selectedCity
                        ? "Choisissez d'abord une ville"
                        : parishes.length
                          ? "Sélectionnez votre paroisse"
                          : "Aucune paroisse enregistrée dans cette ville"}
                    </option>
                    {parishes.map((parish) => (
                      <option key={parish.id} value={parish.name}>
                        {parish.name}
                      </option>
                    ))}
                  </select>
                  <FieldError name="parish" />
                </div>
              </div>
            </section>
)}

            {currentStep === 4 && (
<section className="border-t border-gray-100 pt-8 dark:border-gray-800">
              <SectionTitle
                number="04"
                title="Coordonnées et photographie"
                description="Vos informations de contact et votre photo de profil."
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Téléphone / WhatsApp *</label>
                  <div className="flex">
                    <div className="flex min-w-[76px] items-center justify-center rounded-l-xl border border-r-0 border-gray-200 bg-gray-100 px-3 text-sm font-semibold text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
                      {indicatif}
                    </div>
                    <input
                      type="tel"
                      name="numero"
                      value={formData.numero}
                      onChange={handleChange}
                      className={`${inputClass} rounded-l-none`}
                      placeholder="Votre numéro"
                      autoComplete="tel-national"
                    />
                  </div>
                  <FieldError name="numero" />
                </div>

                <div>
                  <label className={labelClass}>
                    Adresse électronique (facultatif)
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="exemple@email.com"
                    autoComplete="email"
                  />
                  <FieldError name="email" />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Photographie *</label>

                  <div className="flex flex-col items-center gap-5 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-950 sm:flex-row">
                    <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-white text-4xl dark:border-gray-700 dark:bg-gray-900">
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Aperçu de la photographie"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>👤</span>
                      )}
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                        Ajouter une photographie
                      </p>
                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        Choisissez une photo nette permettant de vous
                        reconnaître. Formats JPG, PNG ou WebP — 5 Mo maximum.
                      </p>

                      <label className="mt-4 inline-flex cursor-pointer items-center rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-bold text-blue-700 transition hover:bg-blue-50 dark:border-blue-800 dark:bg-gray-900 dark:text-blue-300 dark:hover:bg-gray-800">
                        {photo ? "Changer la photographie" : "Choisir une photo"}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                      </label>

                      {photo && (
                        <p className="mt-2 break-all text-xs text-green-700 dark:text-green-400">
                          {photo.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <FieldError name="photo" />
                </div>
              </div>
            </section>
)}


            <div className="border-t border-gray-100 pt-7 dark:border-gray-800">
              <p className="mb-5 text-xs leading-5 text-gray-500 dark:text-gray-400">
                Les champs marqués d'un astérisque (*) sont obligatoires.
                Après l'envoi, votre inscription sera soumise à la validation
                d'un administrateur.
              </p>

              <div className="flex gap-3">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePreviousStep}
                    className="flex-1 rounded-xl border border-gray-300 px-5 py-4 text-sm font-bold text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800"
                  >
                    Retour
                  </button>
                )}

                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="flex-1 rounded-xl bg-blue-700 px-6 py-4 text-sm font-bold text-white shadow-lg transition hover:bg-blue-800"
                  >
                    Continuer →
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-xl bg-blue-700 px-6 py-4 text-sm font-bold text-white shadow-lg transition hover:bg-blue-800 disabled:opacity-60"
                  >
                    {loading ? "Enregistrement en cours..." : "Soumettre mon inscription"}
                  </button>
                )}
              </div>

              <p className="mt-5 text-center text-sm text-gray-600 dark:text-gray-400">
                Vous avez déjà un compte ?{" "}
                <Link
                  to="/login"
                  className="font-bold text-blue-700 hover:underline dark:text-blue-400"
                >
                  Se connecter
                </Link>
              </p>
            </div>

          </form>
        </motion.div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Confrérie Saint Enfant Jésus — Miraculeux de Prague
        </p>
      </div>
    </div>
  );
}
