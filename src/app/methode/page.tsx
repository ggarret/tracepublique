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
          <h2>6. Corriger</h2>
          <p>Les modifications, corrections et limites connues doivent rester visibles dans l’historique du projet.</p>
        </section>
      </div>
      <p className="method-link">Le code et les données seront publiés en open source.</p>
      <div className="method-actions">
        <Link href="/evaluation">Consulter la grille d’évaluation →</Link>
        <Link href="/a-propos">Comprendre pourquoi ce projet existe →</Link>
      </div>
    </main>
  );
}
