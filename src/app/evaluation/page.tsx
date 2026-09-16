import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import type { CSSProperties } from "react";
import { evaluationCriteria as criteria } from "@/lib/data";
import { attributionReliabilityDescription } from "@/lib/site";

export const metadata = pageMetadata(
  "Évaluation — Trace publique",
  "La grille transparente utilisée pour mesurer la robustesse documentaire des propositions politiques.",
  "/evaluation/",
);

export default function EvaluationPage() {
  return (
    <main className="shell section prose-page">
      <header className="page-header">
        <p className="eyebrow">Méthode publique</p>
        <h1>Comment les propositions sont évaluées</h1>
        <p className="lede">Une note n’est utile que si sa méthode, ses sources et son niveau d’incertitude sont visibles.</p>
      </header>

      <div className="criteria-list">
        {criteria.map((criterion, index) => (
          <section className="criterion-card" key={criterion.id} style={{ "--criterion-color": criterion.color } as CSSProperties}>
            <span className="criterion-index">0{index + 1}</span>
            <div className="criterion-copy">
              <div><h2>{criterion.label}</h2><strong>{criterion.weight} %</strong></div>
              <p>{criterion.description}</p>
            </div>
          </section>
        ))}
      </div>

      <div className="evaluation-legend" aria-label="Lecture des couleurs de score">
        <p><strong>Lecture de la note IA</strong> La couleur indique la robustesse documentaire du dossier disponible, jamais la qualité politique d’une proposition.</p>
        <div><span><i className="score-low" />0–39 · fragile</span><span><i className="score-mid" />40–69 · à étayer</span><span><i className="score-high" />70–100 · étayé</span></div>
      </div>

      <section>
        <h2>Ce que la note ne signifie pas</h2>
        <p>Elle n’indique pas pour qui voter, ne juge pas si une idée est « bonne » et ne mesure pas la valeur politique d’un candidat. Elle décrit la robustesse du dossier documentaire disponible pour une proposition précise.</p>
      </section>
      <section>
        <h2>Note IA et fiabilité de l’attribution sont séparées</h2>
        <p>{attributionReliabilityDescription} Une proposition peut sembler faisable tout en reposant sur des informations insuffisantes : la note IA mesure donc la robustesse de son dossier documentaire et non sa faisabilité.</p>
      </section>
      <section>
        <h2>Les IA ne décident pas seules</h2>
        <p>GPT et Claude analysent le même dossier séparément. Leurs réponses, sources et désaccords sont conservés. Toute analyse publiée doit être relue humainement.</p>
      </section>

      <p><Link href="/methode">Voir toute la chaîne de traitement →</Link></p>
    </main>
  );
}
