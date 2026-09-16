# Périmètre des données

Tout fichier versionné dans ce dossier est considéré comme public et peut être exposé dans l'historique Git.

- Les fichiers JSON à la racine constituent le corpus public ou ses référentiels.
- `proposals.json` contient l'attribution, les sources et les six sous-notes sur 100 de chaque mesure publiée.
- `evaluation-criteria.json` est la source de vérité des critères et pondérations.
- `track-records.json` conserve les votes, actions et positions antérieures rapprochés des propositions actuelles.
- `sources.json` conserve une seule fiche par document ou page ; `proposalIds` permet de réutiliser la même preuve pour plusieurs mesures sans dupliquer son URL.
- `inbox/` contient les découvertes, suggestions et décisions de revue rendues auditables. Une entrée de cette boîte n'est pas nécessairement validée ni publiée.
- Les données privées, secrets, coordonnées personnelles, notes confidentielles et documents sans droit de republication ne doivent jamais être ajoutés ici.

Les éventuels fichiers de travail privés restent dans `data/private/`, dossier ignoré par Git. Une variable d'environnement ou un secret n'est jamais stocké dans un fichier de données.

Avant chaque publication, exécuter :

```bash
yarn validate:data
yarn validate:snapshot
```
