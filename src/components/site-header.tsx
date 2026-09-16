import Link from "next/link";
import { githubUrl } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="brand" href="/" aria-label="Trace publique — accueil">
          <span className="brand-mark" aria-hidden="true">TP</span>
          <span>Trace publique</span>
        </Link>
        <nav className="nav" aria-label="Navigation principale">
          <Link href="/candidats">Candidats</Link>
          <Link href="/themes">Thèmes</Link>
          <Link href="/methode">Démarche</Link>
          <Link href="/evaluation">Évaluation</Link>
          <Link href="/a-propos">À propos</Link>
          {githubUrl ? <a className="nav-github" href={githubUrl} target="_blank" rel="noreferrer">GitHub ↗</a> : null}
        </nav>
        <span className="site-state">Version publique</span>
      </div>
    </header>
  );
}
