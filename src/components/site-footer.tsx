import Link from "next/link";
import { githubUrl } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <div className="footer-brand">
          <strong>Trace publique</strong>
          <p>Projet citoyen open source. Chaque proposition doit pouvoir être sourcée, discutée et corrigée.</p>
        </div>
        <nav aria-label="Navigation secondaire">
          <Link href="/candidats">Candidats</Link>
          <Link href="/themes">Thèmes</Link>
          <Link href="/methode">Démarche</Link>
          <Link href="/evaluation">Évaluation</Link>
          <Link href="/#faq">FAQ</Link>
          <Link href="/a-propos">Qui suis-je ?</Link>
          {githubUrl ? <a href={githubUrl} target="_blank" rel="noreferrer">GitHub ↗</a> : null}
        </nav>
      </div>
    </footer>
  );
}
