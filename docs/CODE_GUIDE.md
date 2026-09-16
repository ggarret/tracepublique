# Guide de lecture et de contribution au code

Ce document indique où intervenir selon le type de changement. Il complète le README sans remplacer les règles éditoriales, de sécurité ou de contribution.

## Les deux chemins de données

Le dépôt possède deux chemins qui ne doivent pas être confondus.

### Snapshot public

Le site Next.js importe les fichiers JSON publics :

```text
data/candidates.json
data/themes.json
data/programs.json
data/proposals.json
data/sources.json
data/evaluation-criteria.json
data/track-records.json
             │
             ▼
       src/lib/data.ts
             │
             ▼
 pages et composants Next.js
```

Ce chemin est statique. Il facilite le référencement, le cache, la revue Git et l’hébergement sans serveur applicatif.

### Pipeline de préparation

Les scripts travaillent d’abord dans la boîte d’entrée :

```text
data/feeds.json ou data/programs.json
             │
             ▼
      scripts/discover-*.mjs
             │
             ▼
        data/inbox/
             │
  enrichissement + suggestions
             │
             ▼
 revue-actions + rapport auditable
             │
             ▼
     snapshot public validé
```

Une découverte, même produite par un agent, n’est pas une publication. Le passage vers les données publiques doit rester explicable et contrôlé.

## Site public Next.js

Les routes principales sont dans `src/app/` :

- `page.tsx` : accueil et propositions récentes ;
- `propositions/[id]/page.tsx` : fiche détaillée, sources, analyse et notation ;
- `candidats/` : liste et fiches des candidats ;
- `themes/` : navigation par thème ;
- `evaluation/page.tsx` : comparaison des IA et limites ;
- `methode/page.tsx` : méthode publique ;
- `a-propos/page.tsx` : présentation du projet ;
- `robots.ts` et `sitemap.ts` : indexation et sitemap.

Les composants communs sont dans `src/components/`. Les accès aux données doivent passer par `src/lib/data.ts` plutôt que relire les JSON dans chaque page.

## Contrats de données

Les types publics sont regroupés dans `src/lib/types.ts` :

- `Candidate` : identité publique, parti, positionnement et portrait ;
- `Theme` : identifiant et libellé d’un thème ;
- `Program` : document ou programme rattaché à un candidat ;
- `Proposal` : proposition, sources, analyses et critères de notation ;
- `Source` : référence externe réutilisable, type, dates, extrait utilisé et liste des propositions liées.
- `EvaluationCriterion` : dimension et pondération de la note sur 100 ;
- `TrackRecord` : vote, action ou position antérieure rapprochée d'une proposition.

Les sélecteurs de `src/lib/data.ts` sont les points d’accès à privilégier :

- `getCandidate(id)` et `getTheme(id)` résolvent les références ;
- `getSources(proposal)` rattache les sources déclarées ;
- `getPrograms(candidateId)` récupère les programmes ;
- `getTrackRecords(candidateId)` récupère le parcours sourcé ;
- `getOverallScore(proposal)` recalcule la note pondérée ;
- `proposals` est trié du plus récent au plus ancien.

Si le format JSON évolue, il faut mettre à jour les données, les types TypeScript, les validateurs et les pages qui les consomment.

## Scripts d’ingestion

Les scripts sont des modules Node exécutés avec Yarn. `scripts/ingestion-utils.mjs` assure :

- la normalisation des textes pour les comparaisons ;
- la normalisation des URL et la suppression des paramètres de suivi ;
- la construction de clés de détection ;
- la distinction entre source analysable et statut terminal.

La déduplication n’est pas une suppression silencieuse. Une fusion ou un rejet doit rester traçable et avoir un motif dans la revue.

| Script | Entrée principale | Sortie principale |
| --- | --- | --- |
| `discover-rss.mjs` | `data/feeds.json` | sources découvertes et rapport |
| `discover-programs.mjs` | `data/programs.json` | métadonnées et rapport d’accès |
| `enrich-sources.mjs` | sources découvertes | détails publics des sources |
| `extract-suggestions.mjs` | sources et alias | suggestions de candidat et thème |
| `generate-review-report.mjs` | suggestions revues | rapport Markdown |
| `validate-review.mjs` | actions de revue | contrôle du contrat |
| `apply-review-actions.mjs` | actions validées | suggestions avec décision |
| `validate-data.mjs` | référentiels JSON | contrôle des identifiants et relations |
| `validate-snapshot.mjs` | snapshot public | garde-fou avant publication |

## API NestJS et PostgreSQL

L’API de `apps/api/` est le futur chemin dynamique. Elle n’est pas nécessaire pour lire la v0.

Le préfixe global est `/api/v1`. Les routes actuelles sont :

| Route | Usage |
| --- | --- |
| `GET /api/v1/health` | Vérifier l’API et PostgreSQL. |
| `GET /api/v1/candidates` | Lister candidats et programmes. |
| `GET /api/v1/proposals` | Lister propositions, candidat, thème, sources et analyses. |

Le schéma Prisma se trouve dans `apps/api/prisma/schema.prisma`. Les modèles distinguent propositions, sources, analyses IA, décisions de revue et événements d’audit. Une migration doit être ajoutée pour chaque évolution ; une migration appliquée ne doit pas être réécrite.

## Garde-fous du code

- Ne jamais stocker de clé API, mot de passe ou donnée personnelle dans `data/`, `src/`, `apps/` ou `prompts/`.
- Ne jamais faire publier directement un agent ou un script de collecte.
- Toute sortie IA doit conserver fournisseur, modèle, version de prompt et statut.
- Toute décision humaine doit avoir relecteur, date et justification.
- Toute URL externe doit conserver sa date d’accès et son type de source.
- Les changements de scoring doivent être accompagnés d’un test ou d’une fixture.
- Les logs et rapports ne doivent pas exposer de secret ou de donnée personnelle.

## Modifier le code

1. Identifier le contrat concerné : page, type, JSON, script, API ou schéma.
2. Modifier la plus petite surface nécessaire.
3. Mettre à jour la documentation proche du code.
4. Exécuter `yarn validate:data`, `yarn validate:snapshot`, `yarn lint` et `yarn build` selon la zone touchée.
5. Vérifier le rendu public et les liens de sources.
6. Décrire dans le commit la raison du changement et ses limites.

## Ajouter une proposition

Une nouvelle proposition doit avoir un identifiant stable, un candidat et un thème existants, un résumé factuel, une source vérifiable, un statut compatible avec le snapshot, des analyses séparées et des critères de notation expliqués.

Une entrée de boîte d’entrée incomplète reste dans la boîte d’entrée. Elle ne doit pas être complétée artificiellement pour satisfaire le validateur.
