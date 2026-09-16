# Contrôle avant publication

Le snapshot public est publiable uniquement si les données forment un corpus
complet, cohérent et traçable. Le contrôle est déterministe et ne modifie
aucun fichier :

```bash
yarn validate:data
yarn validate:snapshot
```

## Règles bloquantes

`yarn validate:snapshot` vérifie :

- le JSON et la forme des tableaux de candidats, thèmes, propositions et sources ;
- l'unicité des identifiants et des URLs de sources ;
- les références candidat/thème/proposition/source dans les deux sens ;
- les champs éditoriaux et de traçabilité, notamment `sourceIds`, `proposalIds`,
  `accessedAt`, `publisher`, `url`, `analysis.gpt` et `analysis.claude` ;
- les statuts publics autorisés : `validée` et `publiée` ;
- l'absence de proposition au statut `à vérifier`, `a_verifier`, `a_revoir` ou
  `revue_humaine` dans `data/proposals.json` ;
- les dates, types de sources et URLs.

Une erreur arrête la commande avec un rapport lisible sur stderr. Le script ne
répare pas les données, ne déplace pas les suggestions et ne déclenche ni build
ni déploiement. Une correction doit être faite et revue explicitement dans les
données de travail avant de relancer le contrôle.

## État du corpus actuel

Au 15 septembre 2026, le contrôle échoue volontairement : les deux propositions
présentes dans `data/proposals.json` ont encore le statut `à vérifier`. Les
30 suggestions de `data/inbox/proposal-suggestions.json` sont en
`revue_humaine`. Ce n'est pas une raison pour contourner le contrôle : une
validation humaine doit d'abord décider quelles entrées sont publiables, les
qualifier et compléter leur traçabilité.

Le contrôle de revue des suggestions reste séparé :

```bash
yarn review:check
```

`pret_a_publier` signifie seulement qu'une suggestion peut être soumise au
processus de publication ; il ne suffit pas à faire passer le snapshot public.
