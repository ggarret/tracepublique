# Audit de couverture du corpus Trace publique

Audit déterministe généré à partir des six fichiers JSON publics. État des données le **2026-09-16**. Le script est idempotent : une nouvelle exécution avec les mêmes entrées reproduit les mêmes sorties.

## Avertissement de lecture

> **Un zéro ne prouve pas l'absence d'une proposition.** Il signifie seulement qu'aucune proposition n'est actuellement recensée dans la cellule candidat-thème du corpus. Une cellule vide est donc une piste de collecte ou de revue, pas une conclusion politique.

## Synthèse

| Élément | Nombre |
|---|---:|
| Candidats | 10 |
| Thèmes | 8 |
| Programmes / documents | 10 |
| Propositions | 67 |
| Sources | 46 |
| Précédents | 4 |
| Cellules candidat-thème | 80 |
| Cellules couvertes | 58 |
| Cellules vides | 22 |
| Propositions historiques (`past_program`) | 10 |
| Propositions avec sources secondaires seules | 2 |
| Programmes signalés non exhaustifs | 7 |
| Candidats sans précédent qualifié | 6 |

## Ventilation des attributions

Les quatre catégories sont conservées séparément : `candidate`, `campaign`, `party` et `past_program`. Une attribution `past_program` est traitée comme historique et ne doit pas être lue comme un engagement 2027 présumé.

| Candidat | candidate | campaign | party | past_program | Total |
|---|---:|---:|---:|---:|---:|
| Marine Le Pen | 0 | 0 | 5 | 1 | 6 |
| Jean-Luc Mélenchon | 3 | 2 | 0 | 2 | 7 |
| Édouard Philippe | 0 | 11 | 0 | 0 | 11 |
| Raphaël Glucksmann | 1 | 0 | 5 | 0 | 6 |
| Gabriel Attal | 0 | 5 | 1 | 0 | 6 |
| Bruno Retailleau | 4 | 1 | 2 | 0 | 7 |
| François Ruffin | 0 | 6 | 0 | 0 | 6 |
| Marine Tondelier | 0 | 3 | 3 | 0 | 6 |
| Éric Zemmour | 0 | 0 | 0 | 6 | 6 |
| Fabien Roussel | 3 | 0 | 2 | 1 | 6 |

Totaux du corpus : **candidate 11**, **campaign 28**, **party 18**, **past_program 10**.

## Couverture par candidat et par thème

Chaque nombre est le nombre de propositions actuellement recensées dans la cellule. Les colonnes reprennent les identifiants stables des thèmes ; le détail lisible des cellules vides figure plus bas.

| Candidat | economie | ecologie | institutions | securite | technologie | education | sante | retraites | Total | Cellules vides |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Marine Le Pen | 1 | 1 | 0 | 1 | 0 | 1 | 1 | 1 | 6 | 2 |
| Jean-Luc Mélenchon | 2 | 1 | 1 | 1 | 0 | 1 | 0 | 1 | 7 | 2 |
| Édouard Philippe | 2 | 2 | 1 | 1 | 1 | 1 | 2 | 1 | 11 | 0 |
| Raphaël Glucksmann | 1 | 1 | 1 | 0 | 1 | 1 | 1 | 0 | 6 | 2 |
| Gabriel Attal | 2 | 1 | 0 | 1 | 1 | 1 | 0 | 0 | 6 | 3 |
| Bruno Retailleau | 1 | 1 | 2 | 1 | 1 | 0 | 1 | 0 | 7 | 2 |
| François Ruffin | 2 | 1 | 1 | 0 | 0 | 1 | 0 | 1 | 6 | 3 |
| Marine Tondelier | 1 | 1 | 1 | 0 | 1 | 0 | 2 | 0 | 6 | 3 |
| Éric Zemmour | 1 | 1 | 1 | 1 | 0 | 1 | 1 | 0 | 6 | 2 |
| Fabien Roussel | 1 | 2 | 0 | 0 | 0 | 1 | 1 | 1 | 6 | 3 |

### Totaux par thème

| Thème | Propositions | Candidats couverts | Candidats absents | candidate | campaign | party | past_program |
|---|---:|---:|---:|---:|---:|---:|---:|
| Économie, dette et pouvoir d’achat | 14 | 10 | 0 | 2 | 6 | 5 | 1 |
| Écologie, climat et énergie | 12 | 10 | 0 | 4 | 5 | 2 | 1 |
| Institutions, démocratie et Europe | 8 | 7 | 3 | 2 | 3 | 2 | 1 |
| Immigration, sécurité et justice | 6 | 6 | 4 | 1 | 2 | 1 | 2 |
| Technologie, IA et numérique | 5 | 5 | 5 | 1 | 2 | 2 | 0 |
| Éducation et recherche | 8 | 8 | 2 | 0 | 3 | 2 | 3 |
| Santé et protection sociale | 9 | 7 | 3 | 1 | 4 | 3 | 1 |
| Retraites et vieillissement | 5 | 5 | 5 | 0 | 3 | 1 | 1 |

## Cellules vides

**22 cellules** n'ont aucune proposition actuellement recensée :

| Candidat | Thème |
|---|---|
| Marine Le Pen | Institutions, démocratie et Europe |
| Marine Le Pen | Technologie, IA et numérique |
| Jean-Luc Mélenchon | Technologie, IA et numérique |
| Jean-Luc Mélenchon | Santé et protection sociale |
| Raphaël Glucksmann | Immigration, sécurité et justice |
| Raphaël Glucksmann | Retraites et vieillissement |
| Gabriel Attal | Institutions, démocratie et Europe |
| Gabriel Attal | Santé et protection sociale |
| Gabriel Attal | Retraites et vieillissement |
| Bruno Retailleau | Éducation et recherche |
| Bruno Retailleau | Retraites et vieillissement |
| François Ruffin | Immigration, sécurité et justice |
| François Ruffin | Technologie, IA et numérique |
| François Ruffin | Santé et protection sociale |
| Marine Tondelier | Immigration, sécurité et justice |
| Marine Tondelier | Éducation et recherche |
| Marine Tondelier | Retraites et vieillissement |
| Éric Zemmour | Technologie, IA et numérique |
| Éric Zemmour | Retraites et vieillissement |
| Fabien Roussel | Institutions, démocratie et Europe |
| Fabien Roussel | Immigration, sécurité et justice |
| Fabien Roussel | Technologie, IA et numérique |

## Programmes non exhaustifs

Les statuts `orientations`, `progressif`, `partiel`, `socle` et `collectif` signalent une couverture qui ne doit pas être présentée comme un programme personnel complet. Les deux documents marqués « à requalifier » restent en incertitude et ne sont pas comptés comme non exhaustifs sur la seule base de leur statut. Le registre de programmes reste lui-même un premier passage transversal non exhaustif.

| Candidat | Programme / document | Statut | Motif |
|---|---|---|---|
| Marine Le Pen | Site officiel de campagne — présidentielle 2027 | orientations_a_qualifier | Axes repérés, sans programme complet qualifié. |
| Jean-Luc Mélenchon | L'Avenir en commun — édition 2025 | socle_programmatique_2027 | Socle repris pour 2027, qui ne vaut pas programme final exhaustif. |
| Édouard Philippe | Les priorités d'Édouard Philippe | orientations_2027 | Priorités de campagne, sans programme complet. |
| Raphaël Glucksmann | Le programme — Raphaël Glucksmann 2027 | programme_progressif_2027 | Programme annoncé comme publié par étapes. |
| Gabriel Attal | Programme — Attal Président | programme_progressif_2027 | Programme annoncé comme publié par étapes. |
| François Ruffin | Cahiers de campagne — Nous Président | programme_partiel_2027 | Cahiers ou documents de campagne explicitement partiels. |
| Marine Tondelier | Programme écologiste 2027 — 557 mesures | programme_collectif_2027 | Programme collectif : il ne constitue pas une preuve d'engagement personnel exhaustif. |

## Propositions historiques

Sont listées ici les propositions dont l'attribution vaut `past_program`.

| Candidat | Thème | Proposition | Date enregistrée |
|---|---|---|---|
| Éric Zemmour | Immigration, sécurité et justice | Réserver les prestations sociales non contributives aux Français et ressortissants de l'Union européenne | 2022-03-25 |
| Marine Le Pen | Éducation et recherche | Instaurer un uniforme au primaire et au collège | 2026-09-16 |
| Jean-Luc Mélenchon | Éducation et recherche | Démanteler Parcoursup et garantir l'accès sans sélection à la formation choisie | 2026-09-16 |
| Jean-Luc Mélenchon | Immigration, sécurité et justice | Légaliser et encadrer le cannabis par un monopole d'État | 2026-09-16 |
| Éric Zemmour | Institutions, démocratie et Europe | Organiser un référendum sur l'immigration, la sécurité et la justice | 2022-03-25 |
| Éric Zemmour | Éducation et recherche | Mettre fin au collège unique et proposer une filière préprofessionnelle dès la quatrième | 2022-03-25 |
| Éric Zemmour | Économie, dette et pouvoir d’achat | Baisser dégressivement la CSG sur les salaires compris entre le SMIC et 2 000 euros | 2022-03-25 |
| Éric Zemmour | Écologie, climat et énergie | Construire au moins 14 EPR2 d'ici 2050 et prolonger le parc nucléaire à au moins 60 ans | 2022-03-25 |
| Éric Zemmour | Santé et protection sociale | Recruter 40 000 personnels hospitaliers et doubler en cinq ans les capacités de formation en santé | 2022-03-25 |
| Fabien Roussel | Retraites et vieillissement | Rétablir par la loi la retraite à 60 ans à taux plein | 2026-09-16 |

## Sources secondaires seules

Une proposition est signalée ici lorsque toutes ses sources actuellement rattachées ont `kind: secondaire`. Cela indique une faiblesse documentaire à traiter ; cela ne tranche pas la véracité de la proposition.

| Candidat | Proposition | Sources |
|---|---|---|
| Jean-Luc Mélenchon | Bloquer les marges des raffineurs pour faire baisser les prix à la pompe | `source-bfmtv-carburant-melenchon-20260915` |
| Bruno Retailleau | Réviser la Constitution pour y inscrire une charte de l'ordre républicain | `source-bfmtv-ordre-republicain-retailleau-20260915` |

## Candidats sans précédent qualifié

Un précédent est dit qualifié lorsqu'il possède une date, une relation, une conclusion et au moins une source complète. L'absence de fiche qualifiée indique une lacune du corpus de track-record, pas l'absence d'antécédent dans la réalité.

| Candidat | Propositions | Fiches de précédent |
|---|---:|---:|
| Jean-Luc Mélenchon | 7 | 0 |
| Raphaël Glucksmann | 6 | 0 |
| Gabriel Attal | 6 | 0 |
| Bruno Retailleau | 7 | 0 |
| Marine Tondelier | 6 | 0 |
| Éric Zemmour | 6 | 0 |

## Limites méthodologiques

- Le rattachement des propositions aux programmes est déduit du candidat : `proposals.json` ne contient pas de `programId`. Les compteurs de programme décrivent donc le corpus du candidat et non une extraction exhaustive de ce document.
- Les cellules vides sont calculées sur les propositions présentes dans `proposals.json` uniquement.
- Les sources secondaires seules sont détectées à partir de `sources.json` et des liens `sourceIds` présents sur chaque proposition.
- Le rapport est une photographie de couverture et ne mesure ni la qualité politique, ni l'exhaustivité réelle des prises de position publiques.

Le JSON complet et les listes machine-readable sont disponibles dans [data/audits/corpus-coverage.json](../data/audits/corpus-coverage.json).
