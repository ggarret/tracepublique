import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { attributionReliabilityDescription } from "@/lib/site";

export const metadata = pageMetadata(
  "Méthode — Trace publique",
  "Comment Trace publique collecte, source, vérifie et compare les propositions et les analyses IA.",
  "/methode/",
);

export default function MethodPage() {
  return (
    <main className="shell section">
      <header className="page-header">
        <p className="eyebrow">Transparence</p>
        <h1>Notre méthode</h1>
        <p className="lede">L’objectif est de rendre chaque proposition compréhensible, vérifiable et corrigeable.</p>
      </header>
      <div className="method-grid">
        <section className="method-block">
          <h2>1. Collecter</h2>
          <p>Nous conservons la formulation écrite, la date, l’auteur, le contexte et le lien vers la source originale.</p>
        </section>
        <section className="method-block">
          <h2>2. Qualifier</h2>
          <p>Chaque source est identifiée comme primaire, secondaire ou contextuelle. Une source médiatique ne devient pas automatiquement une position officielle.</p>
        </section>
        <section className="method-block">
          <h2>3. Dédupliquer</h2>
          <p>Une proposition unique peut recevoir plusieurs sources. Les doublons exacts et probables sont signalés avant publication.</p>
        </section>
        <section className="method-block">
          <h2>4. Analyser</h2>
          <p>GPT et Claude reçoivent le même dossier documentaire. Leurs réponses sont conservées et affichées séparément.</p>
        </section>
        <section className="method-block">
          <h2>5. Vérifier</h2>
          <p>Les analyses et notes sont contrôlées humainement. {attributionReliabilityDescription}</p>
        </section>
        <section className="method-block">
          <h2>6. Noter et corriger</h2>
          <p>La grille 2.0 attribue à chaque critère une valeur entière /100 à partir de cinq bandes observables et sourçables. Les modifications, corrections et limites connues restent visibles dans l’historique du projet.</p>
        </section>
      </div>
      <section className="method-block">
        <h2>Un score documentaire, pas un jugement politique</h2>
        <p>Le score global visible est la moyenne pondérée des six critères, arrondie à l’entier le plus proche, uniquement lorsque les six critères sont documentés. Il décrit la robustesse documentaire de la proposition. La fiabilité de l’attribution, l’analyse propre à chaque IA et la légitimité ou l’opinion politique sont affichées séparément et n’entrent jamais dans le calcul.</p>
        <p>L’incertitude est indépendante de la note : ses raisons et, si nécessaire, un intervalle restent visibles. Une information essentielle manquante entraîne une abstention plutôt qu’un zéro. Les 67 notes publiques historiques ne sont pas recalculées par cette version.</p>
      </section>
      <p className="method-link">Le code et les données seront publiés en open source.</p>
      <div className="method-actions">
        <Link href="/evaluation">Consulter la grille d’évaluation →</Link>
        <Link href="/a-propos">Comprendre pourquoi ce projet existe →</Link>
      </div>
    </main>
  );
}
