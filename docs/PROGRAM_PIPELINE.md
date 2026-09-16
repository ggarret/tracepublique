# Pipeline des programmes

Le pipeline ingère uniquement les métadonnées publiques des URLs déclarées dans `data/programs.json`. Il ne publie rien et ne copie pas les documents complets.

## Utilisation

```sh
yarn discover:programs
yarn extract:program-suggestions
```

`discover:programs` écrit `data/inbox/program-details.json` et un rapport dans `data/inbox/program-discovery-report.json`. Les pages HTML fournissent leur titre, description, URL canonique et un extrait limité à 280 caractères ; les PDF sont seulement testés comme accessibles. Une erreur HTTP, réseau ou de lecture produit le statut `en_revue`.

`extract:program-suggestions` lit les métadonnées et produit `data/inbox/program-suggestions.json`. Le candidat vient du registre des programmes, tandis que le thème est une suggestion lexicale basée sur les métadonnées disponibles. Chaque résultat reste soumis à `revue_humaine` ; un document inaccessible reste `en_revue` avec candidat, thème et extrait nuls.

Les scripts sont idempotents : ils dédupliquent par identifiant stable et conservent les résultats précédents lors d'une relance. `--refresh` force le recalcul des résultats d'inbox. Les programmes déjà qualifiés sont exclus de l'extraction.
