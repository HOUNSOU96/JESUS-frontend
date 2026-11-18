import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

type ProgressStatus = "loading" | "success" | "error";

type ProgressState = {
  title: string;
  message: string;
  status: ProgressStatus;
};

type ProgressContextType = {
  start: (title: string, message: string) => void;
  update: (message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  close: () => void;
};

const ProgressContext = createContext<ProgressContextType | null>(null);

export function OperationProgressProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [progress, setProgress] = useState<ProgressState | null>(null);

  const start = useCallback((title: string, message: string) => {
    setProgress({ title, message, status: "loading" });
  }, []);

  const update = useCallback((message: string) => {
    setProgress((current) =>
      current ? { ...current, message } : current
    );
  }, []);

  const success = useCallback((message: string) => {
    setProgress((current) =>
      current ? { ...current, message, status: "success" } : null
    );
  }, []);

  const error = useCallback((message: string) => {
    setProgress((current) =>
      current ? { ...current, message, status: "error" } : null
    );
  }, []);

  const close = useCallback(() => {
    setProgress(null);
  }, []);

  const isLoading = progress?.status === "loading";
  const isSuccess = progress?.status === "success";

  return (
    <ProgressContext.Provider value={{ start, update, success, error, close }}>
      {children}

      {progress && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center
                     bg-black/85 p-4 backdrop-blur-md"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-live="polite"
            aria-labelledby="operation-progress-title"
            className="relative w-full max-w-md overflow-hidden rounded-[2rem]
                       border border-amber-400/40 bg-gradient-to-b
                       from-[#17130b] via-[#090909] to-black
                       p-7 text-center shadow-[0_25px_100px_rgba(0,0,0,0.8)]
                       sm:p-9"
          >
            <div className="pointer-events-none absolute inset-x-10 top-0 h-px
                            bg-gradient-to-r from-transparent via-amber-300
                            to-transparent" />

            <div className="mb-6 flex justify-center">
              {isLoading ? (
                <div className="relative flex h-20 w-20 items-center justify-center">
                  <div className="absolute inset-0 animate-spin rounded-full
                                  border-2 border-amber-300/15
                                  border-t-amber-300" />
                  <div className="absolute inset-2 rounded-full
                                  border border-yellow-500/20" />
                  <span className="text-3xl text-amber-300">✦</span>
                </div>
              ) : (
                <div
                  className={`flex h-20 w-20 items-center justify-center
                              rounded-full border text-4xl font-black
                    ${
                      isSuccess
                        ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                        : "border-red-400/40 bg-red-400/10 text-red-300"
                    }`}
                >
                  {isSuccess ? "✓" : "!"}
                </div>
              )}
            </div>

            <p className="mb-2 text-[10px] font-bold uppercase
                          tracking-[0.35em] text-amber-400/70">
              Confrérie Saint Enfant Jésus
            </p>

            <h2
              id="operation-progress-title"
              className="text-2xl font-black tracking-wide text-amber-100"
            >
              {progress.title}
            </h2>

            <div className="mx-auto my-5 h-px w-24 bg-gradient-to-r
                            from-transparent via-amber-400/70 to-transparent" />

            <p className="whitespace-pre-line text-sm leading-7 text-white/75">
              {progress.message}
            </p>

            {isLoading && (
              <div className="mt-7 h-1.5 overflow-hidden rounded-full
                              bg-white/10">
                <div className="h-full w-1/3 animate-[progress_1.5s_ease-in-out_infinite]
                                rounded-full bg-gradient-to-r
                                from-amber-600 via-yellow-300 to-amber-500" />
              </div>
            )}

            {!isLoading && (
              <button
                type="button"
                onClick={close}
                autoFocus
                className="mt-8 w-full rounded-xl border border-amber-300/50
                           bg-gradient-to-r from-amber-300 via-yellow-400
                           to-amber-500 px-6 py-3.5 text-sm font-black
                           uppercase tracking-wider text-black shadow-lg
                           shadow-amber-500/10 transition hover:brightness-110
                           active:scale-[0.98]"
              >
                Fermer
              </button>
            )}

            <p className="mt-6 text-[9px] font-semibold uppercase
                          tracking-[0.25em] text-white/25">
              Prestige Or · Espace membre
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes progress {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(320%); }
        }
      `}</style>
    </ProgressContext.Provider>
  );
}

export function useOperationProgress() {
  const context = useContext(ProgressContext);

  if (!context) {
    throw new Error(
      "useOperationProgress doit être utilisé dans OperationProgressProvider."
    );
  }

  return context;
}
