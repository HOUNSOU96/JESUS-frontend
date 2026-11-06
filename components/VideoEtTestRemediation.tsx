import { useState } from 'react';

type VideoEtTestRemediationProps = {
  notion: string;
  niveauFinal: string; // ex: "4e"
  onSucces: () => void;
};

const niveaux = ["6e", "5e", "4e"]; // À adapter selon la classe finale

// Simulation QCM
const questionsFictives = [
  {
    question: "Question 1 : Exemple ?",
    options: ["A", "B", "C", "D"],
    reponse: 1,
  },
  {
    question: "Question 2 : Exemple ?",
    options: ["Vrai", "Faux"],
    reponse: 0,
  },
];

export default function VideoEtTestRemediation({ notion, niveauFinal, onSucces }: VideoEtTestRemediationProps) {
  const [niveauIndex, setNiveauIndex] = useState(0);
  const [reponses, setReponses] = useState<number[]>(Array(questionsFictives.length).fill(-1));
  const [testFait, setTestFait] = useState(false);
  const [note, setNote] = useState<number | null>(null);

  const niveauActuel = niveaux[niveauIndex];
  const derniereClasse = niveauFinal;

  const validerTest = () => {
    let score = 0;
    questionsFictives.forEach((q, i) => {
      if (reponses[i] === q.reponse) score++;
    });
    const noteSur20 = Math.round((score / questionsFictives.length) * 20);
    setNote(noteSur20);
    setTestFait(true);

    if (noteSur20 === 20) {
      // On passe à la vidéo suivante de la même notion
      const prochainNiveau = niveaux[niveauIndex + 1];
      if (prochainNiveau && prochainNiveau <= derniereClasse) {
        setTimeout(() => {
          setNiveauIndex(niveauIndex + 1);
          setReponses(Array(questionsFictives.length).fill(-1));
          setTestFait(false);
          setNote(null);
        }, 1000);
      } else {
        // Toutes les vidéos de la notion sont terminées
        setTimeout(() => {
          onSucces();
        }, 1000);
      }
    }
  };

  return (
    <div className="p-4 border rounded-xl shadow">
      <h2 className="text-xl font-bold mb-2">Remédiation – Notion : {notion} – Niveau : {niveauActuel}</h2>
      <div className="mb-4">
        <p>📺 Vidéo explicative (placeholder) : <strong>{notion} ({niveauActuel})</strong></p>
        <div className="aspect-video bg-gray-200 flex items-center justify-center mt-2 rounded">
          <span className="text-gray-500">[Vidéo {notion} – {niveauActuel}]</span>
        </div>
      </div>

      <h3 className="font-semibold mt-4">🎯 Mini test (QCM)</h3>
      {questionsFictives.map((q, i) => (
        <div key={i} className="my-2">
          <p>{q.question}</p>
          {q.options.map((opt, j) => (
            <label key={j} className="block">
              <input
                type="radio"
                name={`q-${i}`}
                value={j}
                checked={reponses[i] === j}
                onChange={() => {
                  const nouv = [...reponses];
                  nouv[i] = j;
                  setReponses(nouv);
                }}
              />
              {' '}
              {opt}
            </label>
          ))}
        </div>
      ))}

      {!testFait && (
        <button
          onClick={validerTest}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Valider mes réponses
        </button>
      )}

      {testFait && (
        <div className="mt-4">
          <p>📝 Note : <strong>{note}/20</strong></p>
          {note === 20 ? (
            <p className="text-green-600">✅ Bravo ! Vidéo suivante en cours...</p>
          ) : (
            <p className="text-red-600">❌ Vous devez revoir cette vidéo et refaire le test.</p>
          )}
        </div>
      )}
    </div>
  );
}
