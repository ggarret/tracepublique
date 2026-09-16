# Orchestration des agents

Le projet utilise un backlog d'agents séparé du backlog produit. Le backlog produit décrit ce qui doit être construit ; le backlog d'agents décrit les lots délégables et leur état d'exécution.

## États

- `ready` : prêt à être confié à un agent ;
- `queued` : demande envoyée, thread/worktree pas encore confirmé ;
- `claimed` : réservé par un agent ;
- `in_progress` : en cours ;
- `review` : travail terminé, vérification nécessaire ;
- `blocked` : dépendance ou décision manquante ;
- `done` : intégré et validé.

## Règles

1. Un lot doit avoir un objectif unique et des fichiers de sortie identifiés.
2. Deux agents ne doivent pas modifier les mêmes fichiers en parallèle.
3. `agents/backlog.json` est piloté uniquement par le thread principal ; un sous-agent ne modifie jamais les statuts ni les références de threads.
4. Chaque agent doit exécuter `yarn lint` et les tests pertinents.
5. Un agent ne publie jamais directement en production.
6. Le thread principal arbitre les conflits et intègre les résultats.
7. Toute tâche bloquée doit documenter la question exacte à résoudre.

## Commandes

```bash
yarn agent:next
yarn agent:status
```

La première commande affiche les lots prêts à déléguer. La seconde affiche les lots en cours, leur état et la référence du thread délégué quand elle est connue.
Le backlog de pilotage n’est pas publié dans le dépôt public : dans un clone où il est absent, ces deux commandes affichent un message explicite et se terminent sans erreur.

## Cycle de pilotage

1. Le thread principal choisit un lot `ready` dont les dépendances sont terminées.
2. Il le passe à `queued` et enregistre la référence provisoire dans `delegatedTo`.
3. Il le passe à `in_progress` uniquement quand un vrai `threadId` est visible dans l’application.
4. Le sous-agent produit ses fichiers et lance les validations prévues.
5. Le thread principal vérifie le diff, passe le lot à `review`, puis à `done` après intégration.
6. Un lot `done` débloque automatiquement les lots dépendants via `yarn agent:next`.
