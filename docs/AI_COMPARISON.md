# Contrat de comparaison des analyses IA

Ce contrat décrit le format commun des analyses produites séparément par GPT
et Claude. Il sert à conserver une trace comparable et reproductible ; il ne
transforme pas une sortie de modèle en preuve et ne permet pas à un modèle de
décider seul de la publication.

Le fichier de référence est un objet JSON avec les champs suivants :

```text
{
  "schemaVersion": "1.0",
  "comparisonId": "…",
  "fixture": false,
  "dossierId": "…",
  "corpus": {
    "id": "…",
    "version": "…",
    "sourceIds": ["…"]
  },
  "analyses": {
    "gpt": { … },
    "claude": { … }
  },
  "comparison": {
    "agreements": ["…"],
    "disagreements": [
      {
        "topic": "…",
        "gptPosition": "…",
        "claudePosition": "…",
        "resolutionStatus": "unresolved"
      }
    ]
  }
}
```

Chaque entrée de `analyses.gpt` et `analyses.claude` possède la même forme :

- `modelVersion`, `analyzedAt`, `prompt` (`id`, `version` et `text`) et `corpusId`
  identifient précisément l'exécution ;
- `facts` contient les faits repris, chacun avec un `id`, une formulation et
  des `sourceIds` ;
- `sourcesUsed` contient les sources effectivement mobilisées, avec leur rôle
  (`primary`, `secondary` ou `context`) ;
- `strengths`, `limitations` et `uncertainties` sont des listes séparées ;
- `nonScoringDecision` est obligatoire. `nonScoring` vaut `true` si l'analyse
  ou un de ses éléments doit rester sans note ; dans ce cas `reason` et
  `missingInformation` doivent être renseignés. `reconsiderationConditions`
  documente le réexamen, y compris lorsque la décision est `false`.

Les notes éventuelles dans une analyse IA décrivent l'analyse de ce modèle et
ne remplacent jamais la grille documentaire validée. `comparison.disagreements`
ne fusionne pas les sorties : chaque désaccord
conserve les deux positions et un état (`resolved`, `unresolved` ou
`not-applicable`). La résolution humaine, si elle existe, peut être ajoutée
dans `resolutionNote` sans effacer les positions originales.

Règles de gouvernance :

1. GPT et Claude reçoivent le même `corpus.id` et `corpus.version`.
2. Les versions du modèle et du prompt, ainsi que la date UTC, sont conservées.
3. Une source est référencée par son identifiant du corpus ; le validateur
   refuse les références inconnues et les doublons.
4. La convergence des analyses n'est pas une validation indépendante et ne
   constitue pas un consensus GPT/Claude.
5. La fiabilité de l'attribution, la qualité documentaire du dossier, l'analyse
   propre à chaque modèle et la légitimité politique sont des objets distincts.
6. Une abstention n'est jamais codée comme une note nulle et reste visible.
7. Une fixture doit avoir `fixture: true` et ne doit pas être publiée comme une
   analyse réelle.

Le contrôle local s'exécute avec `yarn validate:ai`. Il est en lecture seule et
ne modifie aucune donnée publique.
