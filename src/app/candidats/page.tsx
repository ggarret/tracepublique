import { candidates, proposals } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import { CandidateDirectory } from "@/components/candidate-directory";

export const metadata = pageMetadata(
  "Candidats suivis — Trace publique",
  "Les 10 personnalités suivies par Trace publique dans le cadre de la présidentielle française 2027.",
  "/candidats/",
);

export default function CandidatesPage() {
  const candidatesWithCounts = candidates.map((candidate) => ({
    ...candidate,
    proposalCount: proposals.filter((proposal) => proposal.candidateId === candidate.id).length,
  }));

  return (
    <main className="shell section">
      <header className="page-header">
        <p className="eyebrow">Présidentielle française · 2027</p>
        <h1>10 candidats suivis</h1>
        <p className="lede">Une sélection de travail révisable. Chaque fiche rassemble les documents officiels et les propositions déjà sourcées.</p>
        <p className="ordering-note">L’ordre de présentation est renouvelé chaque jour, sans classement politique.</p>
      </header>
      <CandidateDirectory candidates={candidatesWithCounts} />
    </main>
  );
}
