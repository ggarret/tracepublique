# Grille de notation auditable (version 2.0)

## Objet et limites

La grille évalue la **robustesse documentaire d'une proposition précise** :
ce qui est formulé, ce qui est sourcé, les impacts traités et les conditions
de mise en œuvre. Elle ne note ni un candidat, ni un parti, ni une idéologie,
ni la légitimité ou l'opinion politique d'une mesure.

La fiabilité de l'attribution est un contrôle indépendant. Elle est affichée
à part et ne modifie aucune sous-note. Une attribution faible ou ambiguë peut
conduire à l'abstention, mais ne devient jamais un malus politique. La qualité
documentaire du dossier est également distincte de l'analyse propre à GPT ou à
Claude : leurs sorties et leurs éventuelles notes restent séparées.

Le nombre affiché `/100` doit être nommé **score de robustesse documentaire de
la proposition**. Il ne s'agit ni d'un score de qualité politique, ni d'un
consensus GPT/Claude, ni d'une probabilité de succès.

## Critères et pondérations

Les six critères sont versionnés dans `data/evaluation-criteria.json` et leurs
poids totalisent 100 %.

| Critère | Poids | Ce qui est observé |
| --- | ---: | --- |
| Économie et budget | 20 % | Coûts, financement, hypothèses et effets économiques |
| Droit et institutions | 20 % | Base légale, compétence, procédure et contraintes supérieures |
| Effets sociaux | 15 % | Publics touchés, distribution, égalité et accès effectif |
| Environnement | 15 % | Périmètre, horizon, impacts et effets déplacés |
| Éthique et libertés | 15 % | Droits concernés, nécessité, proportionnalité et recours |
| Faisabilité | 15 % | Responsables, calendrier, moyens, contrôles et indicateurs |

Chaque critère possède cinq bandes observables. Les bandes ne sont pas des
jugements de valeur : elles décrivent la quantité, la qualité et la couverture
des éléments vérifiables disponibles.

| Intervalle | Niveau commun | Ancre de lecture |
| ---: | --- | --- |
| 0–19 | Non documenté | Aucun élément déterminant vérifiable, ou impossibilité établie non traitée |
| 20–39 | Très partiel | Un élément existe, mais les conditions déterminantes manquent |
| 40–59 | Partiel | Éléments plausibles et sourcés, avec lacunes importantes |
| 60–79 | Étayé | Principaux éléments et limites documentés |
| 80–100 | Très étayé | Dossier reproductible, complet sur les éléments déterminants, limites circonscrites |

L'intervalle est une ancre, pas une permission d'inventer des décimales. La
valeur entière choisie doit être justifiée par les éléments du critère et ne
peut pas dépasser la bande dont elle reprend les conditions. Un score de 100
signifie seulement que le dossier est très étayé au regard du périmètre
observé ; il ne signifie pas « vrai », « juste » ou « parfait ».

## Procédure reproductible

Pour chaque proposition et chaque critère :

1. figer l'identifiant et la version du corpus, la version de la grille, la
   date et le rôle de l'évaluateur ;
2. lister les faits observés, chacun relié à un ou plusieurs `sourceIds` du
   dossier ;
3. séparer ces faits de l'inférence, des hypothèses et des opinions attribuées ;
4. choisir la bande dont l'ancre est satisfaite, puis une valeur entière dans
   cette bande ;
5. consigner les informations manquantes, objections raisonnables et raisons
   d'incertitude ;
6. faire relire l'attribution et la note avant publication.

Le calcul global, lorsqu'il est autorisé, est déterministe :

```text
score = arrondi(Σ(score_critère × poids_critère) / Σ(poids_critère))
```

Les six critères doivent être présents, uniques, compris entre 0 et 100 et
adossés à des sources du dossier. L'agrégat conserve `coverage: 100` lorsque
les six poids sont présents. Si un critère est abstenu ou manque, aucun
agrégat n'est produit : l'absence de preuve n'est jamais convertie en zéro.

Les résultats antérieurs portant `methodologyVersion: "1.0"` ne sont pas
recalculés par cette mise à jour. Ils restent des notes historiques
provisoires ; la grille 2.0 constitue le référentiel des nouvelles évaluations
et doit être indiquée dans toute nouvelle fiche.

## Incertitude et abstention

L'incertitude est indépendante de la note. Elle décrit la solidité de ce que
l'on sait, pas l'opinion de l'évaluateur sur la mesure. Une nouvelle fiche doit
indiquer un niveau (`faible`, `moyenne` ou `forte`), ses raisons et, lorsque
c'est pertinent, un intervalle plausible. Une contradiction non résolue, une
source inaccessible ou une hypothèse non testable doit rester visible.

Le statut `abstention` est obligatoire si l'auteur, le périmètre, un élément
déterminant du critère ou la source nécessaire n'est pas suffisamment établi.
L'abstention précise ce qu'il faudrait documenter pour réexaminer le cas ; elle
n'est ni une note nulle, ni une sanction.

## Séparation des quatre objets

1. **Attribution** : qui a dit ou publié quoi, dans quel contexte et avec quel
   degré de fiabilité. Cette information est affichée séparément.
2. **Dossier** : qualité et couverture des preuves de la proposition au regard
   des six critères. C'est le seul objet du score /100.
3. **Analyse IA** : faits retenus, sources, raisonnement, limites et décision
   de GPT ou de Claude, conservés par modèle et par exécution.
4. **Légitimité ou opinion politique** : préférence, opportunité, justice
   supposée ou jugement normatif. Cet objet n'est jamais noté.

GPT et Claude ne forment donc pas un jury. Une convergence n'est pas une
validation indépendante et le site ne doit pas appeler une moyenne éventuelle
un « consensus ». Les désaccords, abstentions et corrections humaines restent
visibles.

## Fiche obligatoire

Une nouvelle évaluation comporte au minimum, dans `evaluation` :
`methodologyVersion: "2.0"`, `gridVersion: "2.0"`, `evaluatedAt`, un `corpus`
ou un `prompt` avec `id` et `version`, un `reviewer` avec `id` et `role`, une
`confidence` et une `uncertainty` avec niveau et raisons. Une fiche notée
déclare également `aggregation` (`moyenne-ponderee`, grille 2.0, six critères,
arrondi à l'entier le plus proche).

Pour chaque critère noté, la fiche contient une valeur, la bande choisie
(`band` avec ses bornes et son libellé), une justification, les faits observés,
les `sourceIds`, les informations manquantes et l'incertitude. Si la preuve est
insuffisante, le critère porte une `abstention` avec motif, informations
manquantes et conditions de réexamen, sans `value` ni `band`; l'évaluation
globale est alors au statut `abstention` et ne porte aucune agrégation.
Une justification sans preuve correspondante est invalide. Une source établit
un fait ; elle ne prouve pas à elle seule l'effet analysé.
