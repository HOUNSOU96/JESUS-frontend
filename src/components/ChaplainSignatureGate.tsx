import React, { useCallback, useEffect, useRef, useState } from "react";
import api from "@/utils/axios";

interface Assignment {
  assignment_id: number;
  role_name: string;
  country: string;
  diocese: string;
  signed: boolean;
}

interface SignatureStatus {
  required: boolean;
  signed: boolean;
  assignments: Assignment[];
}

const ChaplainSignatureGate: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  const [status, setStatus] = useState<SignatureStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [drawn, setDrawn] = useState(false);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/api/chaplain-signatures/status");
      setStatus(response.data);
    } catch (err) {
      console.error("Erreur de vérification de signature :", err);
      setError("Impossible de vérifier votre signature. Réessayez.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const currentAssignment = status?.assignments?.find(
    (assignment) => !assignment.signed
  );

  const getPosition = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();

    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !currentAssignment || saving) return;

    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const point = getPosition(event);
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#14233d";

    drawing.current = true;
    setDrawn(true);
  };

  const continueDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !drawing.current) return;

    event.preventDefault();

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const point = getPosition(event);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    drawing.current = false;
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    setDrawn(false);
    setError("");
  };

  const saveSignature = async () => {
    if (!canvasRef.current || !currentAssignment || !drawn) {
      setError("Veuillez dessiner votre signature avant de continuer.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const image = canvasRef.current.toDataURL("image/png");

      await api.post("/api/chaplain-signatures/save", {
        assignment_id: currentAssignment.assignment_id,
        image,
      });

      clearSignature();
      await loadStatus();
    } catch (err: any) {
      console.error("Erreur d'enregistrement :", err);
      setError(
        err?.response?.data?.detail ||
        "L'enregistrement a échoué. Veuillez réessayer."
      );
    } finally {
      setSaving(false);
    }
  };

  // Tant que le statut n'est pas vérifié, l'accès reste bloqué.
  if (loading || !status || status.required) {
    return (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/95 p-3 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="chaplain-signature-title"
      >
        <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-amber-300/40 bg-gradient-to-b from-[#19150d] via-[#0d0c09] to-[#050505] text-white shadow-[0_25px_100px_rgba(0,0,0,0.85)]">
          <div className="border-b border-amber-300/20 bg-gradient-to-r from-[#100d07] via-[#211909] to-[#100d07] px-5 py-7 text-center text-white sm:px-8">
            <div className="mb-3 text-4xl text-amber-300">✍️</div>
            <h2
              id="chaplain-signature-title"
              className="text-xl font-black tracking-wide text-amber-200 sm:text-2xl"
            >
              Enregistrement de votre signature officielle
            </h2>
            <p className="mt-2 text-sm text-amber-100/50">
              Confrérie Saint Enfant Jésus Miraculeux de Prague
            </p>
          </div>

          <div className="space-y-5 p-5 sm:p-8">
            {loading ? (
              <div className="py-12 text-center text-amber-100/60">
                Vérification de votre nomination diocésaine...
              </div>
            ) : !status ? (
              <div className="text-center">
                <p className="text-red-700">{error || "Vérification impossible."}</p>
                <button
                  onClick={loadStatus}
                  className="mt-5 rounded-xl border border-amber-200/50 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 px-6 py-3 font-black text-black shadow-lg shadow-amber-500/10 transition hover:brightness-110"
                >
                  Réessayer
                </button>
              </div>
            ) : currentAssignment ? (
              <>
                <div className="rounded-2xl border border-amber-300/30 bg-gradient-to-br from-amber-300/10 to-yellow-500/[0.03] p-4 text-sm text-amber-50 shadow-inner shadow-amber-300/5">
                  <p className="font-bold">Nomination diocésaine détectée</p>
                  <p className="mt-1">{currentAssignment.role_name}</p>
                  <p>Diocèse : {currentAssignment.diocese}</p>
                  <p>Pays : {currentAssignment.country}</p>
                  <p className="mt-3 font-semibold">
                    Votre signature est obligatoire pour finaliser votre prise
                    de fonction.
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-sm font-bold text-amber-100">
                    Dessinez votre signature dans le cadre ci-dessous :
                  </p>

                  <div className="overflow-hidden rounded-2xl border-2 border-dashed border-amber-400/60 bg-white shadow-[0_0_25px_rgba(212,175,55,0.08)]">
                    <canvas
                      ref={canvasRef}
                      width={1200}
                      height={360}
                      className="block h-auto w-full touch-none"
                      onPointerDown={startDrawing}
                      onPointerMove={continueDrawing}
                      onPointerUp={stopDrawing}
                      onPointerCancel={stopDrawing}
                      onPointerLeave={stopDrawing}
                    />
                  </div>

                  <p className="mt-2 text-xs leading-5 text-white/40">
                    Utilisez votre doigt sur téléphone ou votre souris sur
                    ordinateur.
                  </p>
                </div>

                {error && (
                  <p className="rounded-xl border border-red-400/30 bg-red-950/40 p-3 text-sm text-red-200">
                    {error}
                  </p>
                )}

                <div className="flex flex-wrap justify-between gap-3">
                  <button
                    type="button"
                    onClick={clearSignature}
                    disabled={saving}
                    className="rounded-xl border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-bold text-white/70 transition hover:border-amber-300/40 hover:bg-white/[0.08] disabled:opacity-40"
                  >
                    Effacer
                  </button>

                  <button
                    type="button"
                    onClick={saveSignature}
                    disabled={!drawn || saving}
                    className="rounded-xl border border-amber-200/70 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 px-6 py-3 text-sm font-black text-black shadow-lg shadow-amber-500/10 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {saving ? "Enregistrement..." : "Enregistrer ma signature"}
                  </button>
                </div>
              </>
            ) : status.required ? (
              <div className="py-8 text-center text-amber-100/70">
                Une signature est encore attendue pour une de vos nominations.
                <button
                  onClick={loadStatus}
                  className="mt-4 block w-full rounded-xl border border-amber-200/50 bg-gradient-to-r from-amber-300 to-yellow-500 px-5 py-3 font-black text-black shadow-lg transition hover:brightness-110"
                >
                  Actualiser
                </button>
              </div>
            ) : (
              <div className="py-8 text-center font-bold text-emerald-300">
                Signature vérifiée.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ChaplainSignatureGate;
