# Contribuer à l'Observatoire citoyen

Merci de vouloir améliorer le projet. Les contributions peuvent porter sur le code, les données, les sources, la méthode, l'accessibilité, le design ou la documentation.

## Avant de contribuer

1. Lisez la [méthodologie](docs/METHODOLOGIE.md) et la [charte de neutralité](docs/CHARTE_NEUTRALITE.md).
2. Vérifiez qu'une proposition ou une correction similaire n'existe pas déjà.
3. Ne publiez aucune donnée personnelle, aucun secret et aucun document obtenu sans droit d'accès.
4. Pour une vulnérabilité de sécurité, suivez [SECURITY.md](SECURITY.md) au lieu d'ouvrir une issue publique.

## Signaler une erreur factuelle

Indiquez au minimum :

- l'URL de la fiche concernée ;
- l'information qui semble incorrecte ;
- une source primaire ou institutionnelle permettant de la vérifier ;
- la correction proposée ;
- la date de consultation de la source.

Une source médiatique peut servir à découvrir une déclaration, mais elle ne doit pas être présentée comme une source primaire. Les désaccords d'interprétation doivent être distingués des erreurs factuelles.

## Ajouter une proposition politique

Une proposition publiable doit être précisément délimitée et attribuable. Elle contient au minimum l'auteur, la formulation, la date, le contexte, une source, le thème, le statut de validation et le niveau de confiance.

Une suggestion extraite automatiquement reste dans la file de revue. Aucun agent ni contributeur ne publie seul une proposition politique sans contrôle humain.

## Modifier le code

```bash
yarn install --frozen-lockfile
cp .env.example .env.local
yarn dev
```

Avant de proposer un changement :

```bash
yarn validate:data
yarn validate:snapshot
yarn lint
yarn build
```

Limitez chaque contribution à un objectif identifiable. Expliquez le problème, la solution retenue, les vérifications effectuées et les éventuels effets éditoriaux.

## Utilisation de l'IA

Une contribution assistée par IA reste sous la responsabilité de son auteur. Signalez l'usage matériel d'un modèle lorsqu'il a produit ou transformé une analyse, une donnée ou une décision éditoriale. Vérifiez chaque citation, URL, attribution et résultat avant soumission.

Les sorties brutes d'un modèle ne constituent jamais une source.

## Revue et historique

Les corrections factuelles créent une nouvelle version et conservent la justification du changement. Une modification de méthode, de pondération ou de périmètre doit être documentée séparément. Les mainteneurs peuvent demander une source supplémentaire, une reformulation ou une revue spécialisée avant acceptation.
