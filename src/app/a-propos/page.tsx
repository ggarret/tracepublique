import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { githubUrl } from "@/lib/site";

export const metadata = pageMetadata(
  "À propos — Trace publique",
  "Qui construit Trace publique, pourquoi ce projet existe et comment contribuer à sa transparence.",
  "/a-propos/",
);

export default function AboutPage() {
  return (
    <main className="shell section prose-page">
      <header className="page-header">
        <p className="eyebrow">À propos</p>
        <h1>Pourquoi je construis ce projet</h1>
        <p className="lede">Je m’appelle Guillaume Garret et je travaille dans la tech depuis plusieurs années. Je construis cet observatoire pour confronter l’IA à un usage concret, utile et vérifiable.</p>
      </header>

      <section>
        <h2>Un besoin citoyen</h2>
        <p>Les propositions politiques sont dispersées entre programmes, interviews, débats et réseaux sociaux. L’objectif est de retrouver ce qui a réellement été annoncé, sa source et son évolution, puis de rendre visibles les contradictions lorsqu’elles existent.</p>
        <p>Le site ne doit pas dire aux citoyens quoi penser. Il doit leur permettre de comprendre comment une information a été obtenue et de se faire leur propre opinion.</p>
      </section>

      <section>
        <h2>Un laboratoire à ciel ouvert</h2>
        <p>Le projet compare également plusieurs intelligences artificielles sur les mêmes dossiers. Leurs réponses restent séparées afin d’observer leurs convergences, leurs désaccords et leurs erreurs.</p>
        <p>Je ne connais pas le résultat de cette expérience à l’avance. Cette incertitude fait partie du projet et sera documentée.</p>
      </section>

      <section>
        <h2>Une démarche non militante</h2>
        <p>Je ne construis pas cet outil pour défendre un parti ou un candidat. La méthode repose sur des sources visibles, une distinction claire entre faits et analyses, et une validation humaine avant publication.</p>
      </section>

      <section className="open-source-callout">
        <p className="eyebrow">Open source</p>
        <h2>Le projet doit pouvoir être audité</h2>
        <p>Le code, les structures de données, les prompts, les règles d’évaluation et les corrections ont vocation à être consultables et discutables.</p>
        <p>Les contributions techniques, éditoriales ou méthodologiques seront les bienvenues. Il sera possible de signaler une erreur, questionner un choix ou proposer directement une amélioration.</p>
        {githubUrl ? <p><a href={githubUrl} target="_blank" rel="noreferrer">Consulter le dépôt GitHub ↗</a></p> : <p className="muted">Le dépôt GitHub sera relié ici dès que son URL publique sera créée.</p>}
      </section>

      <p><Link href="/methode">Découvrir la démarche complète →</Link></p>
    </main>
  );
}
