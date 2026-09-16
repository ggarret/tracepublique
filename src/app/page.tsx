import { ProposalFeed } from "@/components/proposal-feed";
import Link from "next/link";
import { candidates, proposals, sources, themes } from "@/lib/data";
import { siteUrl } from "@/lib/seo";
import { githubUrl } from "@/lib/site";

const faqItems = [
  {
    question: "Est-ce un site qui recommande pour qui voter ?",
    answer: "Non. Trace publique documente des propositions, leurs sources et les analyses produites à partir d’un même dossier. La conclusion politique appartient au lecteur.",
  },
  {
    question: "Comment une proposition entre-t-elle dans le corpus ?",
    answer: "Chaque nouvel élément doit identifier une personnalité suivie, contenir une proposition attribuable à un éventuel mandat présidentiel et conserver sa source. Les doublons sont rapprochés, puis une validation humaine est requise avant publication.",
  },
  {
    question: "Pourquoi utiliser plusieurs intelligences artificielles ?",
    answer: "GPT, Claude puis d’autres modèles reçoivent le même dossier et les mêmes consignes. Leurs réponses restent séparées pour rendre visibles les convergences, les désaccords, les erreurs et les limites de chaque système.",
  },
  {
    question: "Peut-on garantir l’absence totale de biais ?",
    answer: "Non, et le projet ne fera pas cette promesse. L’objectif est de rendre les biais possibles observables : sources visibles, règles publiques, prompts versionnés, analyses séparées, décisions humaines et historique des corrections.",
  },
  {
    question: "Les dix personnes suivies sont-elles officiellement candidates ?",
    answer: "Pas nécessairement. Il s’agit d’une liste de travail fondée sur leur place actuelle dans le débat public. Elle pourra évoluer et ne remplace pas la liste officielle établie pour l’élection.",
  },
  {
    question: "Qui finance le projet ?",
    answer: "La première version est développée et financée personnellement par Guillaume Garret. Si des soutiens ou financements apparaissent, leur nature devra être publiée sans leur donner de contrôle sur les conclusions éditoriales.",
  },
  {
    question: "Comment signaler une erreur ou contribuer ?",
    answer: "Le dépôt GitHub permet de consulter le code et les données, d’ouvrir une discussion ou de proposer une correction. Toute modification publiée doit rester traçable dans l’historique du projet.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "Trace publique",
      url: `${siteUrl}/`,
      inLanguage: "fr-FR",
      description: "Un observatoire citoyen des propositions de la présidentielle française 2027.",
      creator: { "@id": `${siteUrl}/#guillaume-garret` },
    },
    {
      "@type": "Person",
      "@id": `${siteUrl}/#guillaume-garret`,
      name: "Guillaume Garret",
      url: `${siteUrl}/a-propos/`,
    },
    {
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <main className="shell">
        <section className="home-hero" id="demarche">
          <div>
            <p className="eyebrow">Présidentielle française · 2027</p>
            <h1>Les propositions politiques, <span>rendues vérifiables.</span></h1>
            <p className="lede">
              Les annonces des candidats, leur source d’origine et les analyses de plusieurs IA — séparées, datées et auditables.
            </p>
            <div className="hero-actions">
              <a className="button-link" href="#propositions">Voir les propositions</a>
              <Link className="button-link secondary" href="/methode">Comprendre la méthode</Link>
            </div>
          </div>
          <div>
            <dl className="project-facts">
              <div><dt>propositions publiées</dt><dd>{proposals.length}</dd></div>
              <div><dt>candidats suivis</dt><dd>{candidates.length}</dd></div>
              <div><dt>thèmes documentés</dt><dd>{themes.length}</dd></div>
            </dl>
            <div className="data-notice" aria-label="État actuel du corpus">
              <p><strong>Corpus en construction.</strong> Les éléments marqués « à vérifier » n’ont pas encore terminé la revue humaine.</p>
            </div>
          </div>
        </section>

        <section className="section home-feed" id="propositions" aria-labelledby="propositions-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Flux documenté</p>
              <h2 id="propositions-title">Les annonces les plus récentes</h2>
            </div>
            <p>De la plus récente à la plus ancienne</p>
          </div>
          <ProposalFeed proposals={proposals} candidates={candidates} themes={themes} sources={sources} />
        </section>

        <section className="home-manifesto" id="notre-demarche" aria-labelledby="demarche-title">
          <div className="home-section-intro">
            <div>
              <p className="eyebrow">La démarche</p>
              <h2 id="demarche-title">Partir des faits. Montrer le chemin.</h2>
            </div>
            <p className="manifesto-statement">
              Une information politique ne devrait pas seulement être lisible. Elle devrait pouvoir être retrouvée, vérifiée, discutée et corrigée.
            </p>
          </div>

          <div className="approach-grid">
            <article className="approach-card">
              <span>01</span>
              <h3>Collecter sans réécrire</h3>
              <p>Retrouver la proposition formulée par le candidat, sa date et sa source d’origine. Les commentaires médiatiques peuvent aider à la découvrir, mais ne remplacent pas ce qui a été réellement annoncé.</p>
            </article>
            <article className="approach-card">
              <span>02</span>
              <h3>Vérifier avant de publier</h3>
              <p>Détecter les doublons, rechercher les précédents juridiques, économiques ou institutionnels et distinguer une promesse de mandat d’une simple réaction d’actualité.</p>
            </article>
            <article className="approach-card">
              <span>03</span>
              <h3>Rendre l’analyse contestable</h3>
              <p>Conserver les sources, les données, les prompts, les réponses de chaque IA et les décisions humaines. Une correction ne doit pas effacer l’histoire de l’information.</p>
            </article>
          </div>

          <p className="manifesto-note">
            Trace publique n’est ni un oracle ni un arbitre politique. C’est une méthode ouverte pour permettre à chacun de remonter de l’affirmation jusqu’à la preuve.
          </p>
        </section>

        <section className="home-author" id="qui-suis-je" aria-labelledby="author-title">
          <div className="author-monogram" aria-hidden="true"><span>GG</span><small>Fondateur</small></div>
          <div className="author-copy">
            <p className="eyebrow">Qui porte le projet ?</p>
            <h2 id="author-title">Je m’appelle Guillaume Garret.</h2>
            <p className="author-lede">Je travaille dans la tech depuis plusieurs années, sur des produits, des infrastructures cloud et des automatisations utilisées dans des situations bien réelles.</p>
            <p>L’intelligence artificielle fait déjà partie de mon quotidien professionnel. Pourtant, ses usages concrets restent encore mal compris. Je construis Trace publique comme un laboratoire à ciel ouvert : un projet utile aux citoyens, mais aussi un cas pratique pour montrer ce que l’IA accélère, ce qu’elle fragilise et les endroits où l’intervention humaine reste indispensable.</p>
            <p>Je développe et finance aujourd’hui cette première version personnellement. Je ne représente aucun parti, candidat ou organisation politique. Cela ne me rend pas magiquement neutre : c’est précisément pour cette raison que le code, les sources, les règles et les décisions doivent pouvoir être examinés et contestés.</p>
            <div className="author-actions">
              <Link className="button-link" href="/a-propos">En savoir plus sur le projet</Link>
              {githubUrl ? <a className="button-link secondary" href={githubUrl} target="_blank" rel="noreferrer">Voir le dépôt GitHub ↗</a> : null}
            </div>
          </div>
        </section>

        <section className="home-faq" id="faq" aria-labelledby="faq-title">
          <div className="home-section-intro faq-intro">
            <div>
              <p className="eyebrow">Questions fréquentes</p>
              <h2 id="faq-title">Ce que le projet fait — et ne fait pas.</h2>
            </div>
            <p>Les réponses les plus importantes sur la sélection des données, la place de l’IA, les biais et l’indépendance du projet.</p>
          </div>
          <div className="faq-list">
            {faqItems.map((item, index) => (
              <details key={item.question} open={index === 0}>
                <summary><span>{String(index + 1).padStart(2, "0")}</span>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

    </>
  );
}
