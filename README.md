# Trace publique

Observatoire open source des programmes et propositions publiques des candidats à l’élection présidentielle française de 2027.

Code et données : [github.com/ggarret/tracepublique](https://github.com/ggarret/tracepublique).

Le projet rend les propositions lisibles et sourcées, documente leurs contraintes, puis compare séparément ce que plusieurs IA en pensent. Le code, les données publiques, les prompts et les décisions de revue sont versionnés pour rester consultables et auditables.

Les règles de publication excluent les secrets, les données personnelles et les configurations d'hébergement privées. Les fichiers locaux de backlog, de roadmap et de spécification restent ignorés ; les Dockerfiles, Compose et Caddyfile présents ici sont des exemples génériques reproductibles.

> **État actuel : v0 en construction.** Le corpus publié est volontairement partiel et sa couverture n’est pas encore auditée de bout en bout : une fiche absente n’est pas une preuve d’absence.

## Projet et principes

Les déclarations politiques sont dispersées entre programmes, sites officiels, interviews, vidéos, réseaux sociaux et presse. L’objectif est de retrouver une proposition, remonter à sa source, séparer le fait de l’analyse et rendre l’incertitude visible.

Le projet n’est ni un site de soutien à un candidat, ni un sondage, ni un classement électoral. Il ne produit pas une opinion politique unique. Les analyses de GPT, Claude, Gemini, Mistral et d’autres modèles sont conservées séparément afin de montrer leurs accords, divergences et erreurs.

L’open source ne garantit pas l’absence de biais. Il rend les choix de collecte, les transformations, les critères, les prompts et les corrections visibles, discutables et corrigibles.

- **Sourcing** : une proposition publiée renvoie vers une source vérifiable.
- **Séparation** : fait, citation, contexte, analyse IA, notation et opinion sont distincts.
- **Traçabilité** : découvertes, doublons, rejets et décisions de revue sont conservés.
- **Prudence** : une suggestion automatique ne devient pas une publication sans revue.
- **Pluralité** : les modèles sont comparés avec un protocole documenté.
- **Correction** : une erreur peut être signalée sans effacer silencieusement l’historique.
- **Indépendance** : les sponsors ou crédits éventuels ne contrôlent pas la ligne éditoriale.

## Fonctionnement

```text
Flux RSS / programmes / sites officiels
                 │
                 ▼
        data/inbox/ — découvertes et suggestions
                 │
       qualification + revue humaine
                 │
                 ▼
 data/*.json — snapshot public versionné
                 │
                 ▼
       Next.js — pages citoyennes indexables
```

L’API NestJS et PostgreSQL constituent le socle de la future chaîne dynamique. La v0 lit principalement le snapshot JSON versionné pour rester simple, reproductible et facilement hébergeable.

## Démarrage local

Prérequis : Node.js 22 et Yarn 1.22.

```bash
yarn install --frozen-lockfile
cp .env.example .env.local
yarn dev
```

Le site est disponible sur [http://localhost:3000](http://localhost:3000).

Pour activer PostgreSQL et l’API :

```bash
docker compose up -d
yarn db:generate
yarn db:migrate:deploy
yarn db:seed
yarn api:dev
```

L’API écoute sur `http://localhost:3001` et expose son préfixe sous `/api/v1`.

Vérifications avant contribution :

```bash
yarn validate:data
yarn validate:snapshot
yarn lint
yarn build
```

## Commandes utiles

| Commande | Rôle |
| --- | --- |
| `yarn dev` | Démarrer Next.js en développement. |
| `yarn build` | Construire le site de production. |
| `yarn lint` | Vérifier le typage web et l’API. |
| `yarn validate:data` | Contrôler les JSON et leurs relations. |
| `yarn validate:snapshot` | Bloquer les données non publiables. |
| `yarn discover:rss` | Collecter les entrées des flux configurés. |
| `yarn discover:programs` | Vérifier les programmes enregistrés. |
| `yarn enrich:sources` | Enrichir les métadonnées découvertes. |
| `yarn extract:suggestions` | Suggérer candidat et thème. |
| `yarn review:report` | Générer le rapport de revue. |
| `yarn review:check` | Vérifier les décisions de revue. |
| `yarn review:apply` | Appliquer les décisions validées. |

Les scripts d’ingestion peuvent modifier `data/inbox/`, mais ne publient pas directement une proposition dans le snapshot public.

## Structure du dépôt

| Répertoire | Responsabilité |
| --- | --- |
| `src/app/` | Routes et pages publiques Next.js. |
| `src/components/` | Composants d’interface réutilisables. |
| `src/lib/` | Types, chargement JSON, sélecteurs et SEO. |
| `data/` | Corpus public, référentiels et boîte d’entrée. |
| `scripts/` | Collecte, normalisation, détection, revue et validation. |
| `prompts/` | Prompts versionnés des agents. |
| `apps/api/` | API NestJS, Prisma et PostgreSQL. |
| `tests/fixtures/` | Cas contrôlés pour sorties IA et revue. |
| `docs/` | Méthode, décisions, sécurité et stratégie. |
| `agents/` | Définitions publiques des rôles spécialisés et de leurs garde-fous. |

Consulter le [guide de lecture et de contribution au code](docs/CODE_GUIDE.md) pour le détail des flux et des contrats.

## Ajouter ou corriger une donnée

Une proposition publique doit avoir un candidat, un thème, un titre, un résumé, un statut autorisé, une date et une source vérifiable. Les suggestions RSS ou IA restent dans `data/inbox/` tant qu’elles n’ont pas été examinées.

1. Découvrir ou ajouter la source dans la boîte d’entrée.
2. Normaliser et dédupliquer l’URL et le contenu.
3. Qualifier candidat, thème et statut.
4. Enregistrer une décision avec relecteur et justification.
5. Compléter proposition, sources et analyses.
6. Exécuter les validateurs avant publication.

Les fichiers de `data/` sont publics par conception. Aucun secret, jeton, donnée privée ou document dont les droits de republication ne sont pas établis ne doit y être ajouté.

## Documentation principale

- [Guide du code](docs/CODE_GUIDE.md)
- [Méthodologie](docs/METHODOLOGIE.md)
- [Pipeline d’ingestion et de publication](docs/PIPELINE.md)
- [Qualification des sources](docs/SOURCES.md)
- [Revue humaine](docs/REVIEW.md)
- [Comparaison des IA](docs/AI_COMPARISON.md)
- [Grille de notation](docs/GRILLE_NOTATION.md)
- [Charte de neutralité](docs/CHARTE_NEUTRALITE.md)
- [Prompts versionnés](prompts/README.md)
- [Orchestration des agents](agents/README.md)

## Contribution et droits

Les contributions techniques, éditoriales et méthodologiques sont bienvenues. Une correction politique doit être accompagnée d’une source vérifiable et ne doit pas effacer silencieusement une version antérieure.

Lire [CONTRIBUTING.md](CONTRIBUTING.md) avant toute modification. Les vulnérabilités suivent [SECURITY.md](SECURITY.md). Les portraits et contenus de médias ne sont pas automatiquement réutilisables parce qu’ils sont accessibles en ligne ; vérifiez les droits avant toute contribution.
