# Revue humaine des suggestions

Les suggestions ne sont jamais publiées directement. Les décisions humaines sont enregistrées dans `data/inbox/review-actions.json`, puis matérialisées dans `data/inbox/reviewed-suggestions.json`. Ces fichiers appartiennent à la boîte d'entrée locale et ne sont pas des données publiques.

Le seul passage d'une suggestion vers un état de revue ne constitue pas une publication. `yarn review:apply` ne lit ni ne modifie `data/proposals.json`, `data/sources.json`, les pages de `src/`, ni la configuration de déploiement. Il ne déclenche aucun build ni déploiement.

## Format

```json
[
  {
    "suggestionId": "suggestion-inbox-...",
    "decision": "rattacher_source",
    "reviewer": "identifiant-du-relecteur",
    "reason": "La déclaration correspond à une proposition déjà suivie.",
    "targetProposalId": "proposition-existante",
    "reviewedAt": "2026-09-15T14:00:00.000Z"
  }
]
```

`suggestionId`, `decision`, `reviewer` et `reason` sont obligatoires. `reviewedAt` est facultatif (il est horodaté à l'application), mais doit être une date ISO si elle est fournie. `targetProposalId` est obligatoire pour `rattacher_source`.

Décisions possibles :

- `rejeter` : l'entrée ne doit pas devenir une proposition ;
- `a_revoir` : les preuves sont insuffisantes ou ambiguës ;
- `rattacher_source` : la source documente une proposition existante ;
- `pret_a_publier` : la suggestion est suffisamment qualifiée pour l'étape de publication.

## Procédure locale

1. Examiner le rapport : `yarn review:report`.
2. Vérifier le contrat sans écrire : `yarn review:check`.
3. Renseigner une seule décision par suggestion dans `data/inbox/review-actions.json`.
4. Appliquer les décisions : `yarn review:apply`.
5. Relire `data/inbox/reviewed-suggestions.json` et `data/inbox/review-audit.json`.

Le script refuse les identifiants inconnus, les décisions invalides, les doublons de décision, les justifications ou relecteurs absents, les dates invalides et les rattachements sans proposition cible. Une erreur n'écrit aucun résultat.

`review-audit.json` conserve, pour chaque décision appliquée, le relecteur, la justification, la date, l'empreinte de l'entrée et les garanties `publicDataChanged: false` et `publishTriggered: false`. Ce journal est un relevé de l'exécution locale ; il ne remplace pas une décision de publication signée.

## Règles humaines

- Le relecteur vérifie la source originale, la citation, le candidat, le contexte électoral, le thème et les doublons.
- Une source secondaire ne suffit pas automatiquement à créer une proposition : rechercher une source primaire et conserver les deux liens quand ils apportent des éléments différents.
- Une entrée ambiguë, hors périmètre ou sensible reste `a_revoir` ou est `rejeter` ; elle n'est jamais promue par défaut.
- `pret_a_publier` signifie « soumise au prochain processus de publication », jamais « publiée ».
- Une correction humaine produit une nouvelle décision horodatée et justifiée ; on ne réécrit pas silencieusement l'historique.
