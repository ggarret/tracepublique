# Ingestion, qualification et doublons

## Objectif

Le site doit pouvoir être enrichi en permanence sans publier plusieurs fois la même proposition ni perdre les nouvelles sources qui la documentent.

## Principe de dédoublonnage

Une proposition politique est une entité éditoriale unique. Les articles, programmes et déclarations qui la mentionnent sont des sources rattachées à cette entité.

Le système utilisera trois niveaux :

1. **Doublon exact** : même URL ou même identifiant de source.
2. **Doublon probable** : même candidat, même thème et formulation très proche.
3. **Proposition liée** : formulations différentes mais portant sur la même mesure ; validation éditoriale nécessaire.

## Identifiant stable

Chaque proposition recevra un identifiant stable et un fingerprint calculé à partir de :

- candidat ;
- thème ;
- texte normalisé de la proposition ;
- date de première publication.

La normalisation devra gérer les accents, la casse, les espaces, la ponctuation et les formulations courantes sans détruire le texte original affiché au citoyen.

## Workflow de qualification

```text
source détectée
  → extraction de la proposition
  → recherche de doublons
  → rattachement à une fiche existante ou création d'une fiche
  → vérification humaine
  → publication
```

## Qualification des sources

La source d'une proposition peut être primaire ou secondaire, mais son rôle doit être visible :

- **primaire** : programme, site officiel, déclaration écrite, document de campagne ;
- **secondaire** : article de presse ou média qui rapporte la proposition ;
- **contextuelle** : rapport institutionnel, étude ou précédent utilisé pour l'analyse.

La diversité des sources est souhaitable, mais elle ne doit pas créer une fausse équivalence. Cette classification ne cherche pas à attribuer une couleur politique au média. Elle décrit uniquement la distance entre la source et la parole du candidat.

Un média généraliste comme BFMTV peut donc être utilisé pour repérer rapidement une proposition ou documenter la manière dont elle a été rapportée. Il sera classé comme source secondaire, sauf lorsqu'il héberge directement une vidéo ou une transcription de l'intervention originale.

Règle de publication :

- si le candidat a publié un programme, un texte ou une vidéo originale, cette source est prioritaire ;
- si seule une source médiatique rapporte la proposition, elle peut être conservée mais son statut secondaire doit être visible ;
- l'analyse ne doit jamais transformer un article en citation directe du candidat sans preuve ;
- une formulation incertaine doit rester incertaine jusqu'à vérification.

Le projet extrait donc factuellement ce qui est annoncé, sans produire de jugement sur l'orientation éditoriale du média.

## Neutralité du corpus

Les sources collectées seront évaluées selon des critères documentés :

- origine identifiable ;
- date et auteur vérifiables ;
- citation ou formulation précise ;
- distinction claire entre fait, commentaire et éditorial ;
- absence de reprise non vérifiée lorsque la source primaire est disponible.

Les comptes sociaux des candidats et partis seront intégrés dans une étape ultérieure.

## Découverte RSS

Le script `yarn discover:rss` lit `data/feeds.json`, récupère les entrées des flux configurés et écrit une boîte d'entrée dans `data/inbox/`.

Cette étape ne publie aucune proposition. Elle ne fait que découvrir des sources candidates, les dédupliquer par URL et les marquer `à qualifier`. Une validation humaine doit ensuite :

- confirmer que la source contient une proposition politique ;
- identifier le candidat concerné ;
- extraire la formulation exacte ;
- rattacher la source à une proposition existante ou en créer une nouvelle ;
- vérifier le contexte et le statut de la déclaration.

Le projet ne suppose pas que chaque candidat dispose d'un flux RSS fiable. Les flux RSS des médias sont un canal de découverte parmi d'autres, pas la source de vérité.

Le script `yarn enrich:sources` peut ensuite récupérer uniquement les métadonnées publiques des pages découvertes : titre HTML, description, URL canonique, statut HTTP et date de collecte. Il ne recopie pas automatiquement le contenu intégral des articles.

## Canaux de collecte

Chaque candidat pourra être suivi avec une combinaison de canaux :

- site officiel et pages de programme ;
- sitemap XML ou pages d'archives ;
- comptes vidéo officiels ;
- communiqués et documents PDF ;
- flux RSS de médias généralistes ;
- recherche manuelle dans la presse ;
- réseaux sociaux officiels à l'étape 2.

Le monitoring de X fera partie de l'étape 2 avec un registre préalable des comptes confirmés. Il servira à détecter une déclaration nouvelle ; la publication nécessitera toujours une qualification et un rattachement à une source.

Pour chaque candidat et chaque canal, le projet conservera un statut : `disponible`, `instable`, `à vérifier` ou `indisponible`. L'absence de RSS ne doit donc pas empêcher le suivi d'un candidat.
