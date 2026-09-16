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

      <p className="method-note"><strong>Libellé public : Score documentaire IA · /100.</strong> Il est produit avec assistance IA selon la grille publique, puis relu humainement. Il résume la qualité des éléments vérifiables au regard des six critères ; il ne s’agit ni d’un avis politique, ni d’une fiabilité d’attribution, ni d’un consensus entre GPT et Claude.</p>

      <div className="criteria-list">
        {criteria.map((criterion, index) => (
          <section className="criterion-card" key={criterion.id} style={{ "--criterion-color": criterion.color } as CSSProperties}>
            <span className="criterion-index">0{index + 1}</span>
            <div className="criterion-copy">
              <div><h2>{criterion.label}</h2><strong>{criterion.weight} %</strong></div>
              <p>{criterion.description}</p>
              <p className="criterion-evidence"><strong>Éléments observés :</strong> {criterion.evidenceDimensions.join(" · ")}</p>
              <div className="criterion-bands" aria-label={`Bandes de score pour ${criterion.label}`}>
                {criterion.bands.map((band) => (
                  <div key={`${criterion.id}-${band.min}`}>
                    <strong>{band.min}–{band.max} · {band.label}</strong>
                    <span>{band.anchor}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>

      <div className="evaluation-legend" aria-label="Lecture des couleurs de score">
        <p><strong>Lecture du score de robustesse documentaire</strong> La couleur indique la robustesse documentaire du dossier disponible, jamais la qualité politique d’une proposition.</p>
        <div><span><i className="score-low" />0–39 · fragile</span><span><i className="score-mid" />40–69 · à étayer</span><span><i className="score-high" />70–100 · étayé</span></div>
      </div>

      <section>
        <h2>Ce que la note ne signifie pas</h2>
        <p>Elle n’indique pas pour qui voter, ne juge pas si une idée est « bonne » et ne mesure pas la valeur politique d’un candidat. Elle décrit la robustesse du dossier documentaire disponible pour une proposition précise.</p>
      </section>
      <section>
        <h2>Score documentaire IA et fiabilité de l’attribution sont séparés</h2>
        <p>{attributionReliabilityDescription} Une proposition peut être correctement attribuée tout en reposant sur des informations insuffisantes. Inversement, un dossier peut être bien documenté alors que son attribution reste incertaine : les deux informations ne se compensent pas.</p>
      </section>
      <section>
        <h2>Les IA ne décident pas seules</h2>
        <p>GPT et Claude analysent le même dossier séparément. Leurs faits, sources, raisonnements, incertitudes et désaccords sont conservés par modèle. Une convergence n’est pas un consensus ni une validation indépendante ; toute analyse publiée doit être relue humainement.</p>
      </section>

      <p><Link href="/methode">Voir toute la chaîne de traitement →</Link></p>
    </main>
  );
}
