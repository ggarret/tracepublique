# Architecture d'ingestion et de publication

## Recommandation

Le projet doit utiliser un pipeline spécialisé plutôt qu'un agent autonome qui modifie directement le site public. Le pipeline doit être idempotent : une source déjà qualifiée n'est pas renvoyée à l'agent à chaque cycle.

L'agent IA peut extraire une proposition, proposer un rattachement et expliquer une proximité avec une fiche existante. La décision de publication doit passer par des règles déterministes et, pour les cas ambigus, une validation humaine.

## Flux v0 avec JSON versionné

```text
Flux RSS / sources officielles
        ↓
Collecteur
        ↓
data/inbox/discovered-sources.json
        ↓
Normalisation, dédoublonnage et comparaison avec l'historique
        ↓
Nouvelles entrées ou entrées remises en revue uniquement
        ↓
Agent IA : extraction, classification, proposition de rattachement
        ↓
Bot validateur à critères explicites
        ↓
Validation humaine pour les cas ambigus ou sensibles
        ↓
Publication d'un snapshot JSON versionné
        ↓
Build Next.js statique
        ↓
Déploiement
```

## Rôle de chaque couche

### 1. Collecteur

Il récupère les URLs, titres, dates et métadonnées disponibles. Il doit être relançable sans créer de doublons.

### 2. Normaliseur

Il uniformise les URLs, les dates, les espaces, les accents et les formulations techniques. Le texte original doit toujours être conservé séparément.

### 3. Dédoublonnage déterministe

Avant d'appeler une IA, le système vérifie :

- URL déjà connue ;
- identifiant de source déjà connu ;
- fingerprint candidat + thème + formulation normalisée ;
- titre ou contenu identique après normalisation.

Cette couche doit être prévisible, testable et indépendante d'un modèle.

### 4. Agent IA spécialisé

L'agent reçoit chaque nouvelle source non qualifiée. Il ne doit pas recevoir uniquement les éléments déjà préfiltrés comme probablement pertinents, sinon les faux négatifs disparaissent du système. Il peut retourner un JSON structuré avec :

- proposition extraite ;
- candidat supposé ;
- thème proposé ;
- source et citation ;
- proposition existante potentiellement correspondante ;
- niveau de confiance ;
- justification ;
- incertitudes et champs manquants.

Il doit aussi identifier le candidat, distinguer une proposition pour un prochain mandat d'une simple réaction ou position générale, et produire une décision explicite lorsqu'une entrée est hors périmètre.

Il ne doit pas avoir le droit d'écrire directement dans les données publiées.

### 5. Bot validateur

Un second composant peut contrôler la proposition produite par l'agent d'extraction. Il ne juge pas la valeur politique de la mesure ; il vérifie sa conformité au protocole.

Critères possibles :

- source accessible et URL valide ;
- candidat identifiable ;
- date identifiable ;
- formulation attribuable au candidat ;
- distinction entre citation et reformulation ;
- thème cohérent ;
- proposition suffisamment précise ;
- doublon traité ;
- niveau de confiance justifié ;
- absence d'affirmation non sourcée dans le résumé.

Le bot doit produire une décision structurée :

```json
{
  "decision": "valide | rejette | revue_humaine",
  "score": 0.0,
  "criteres": [],
  "preuves": [],
  "alertes": [],
  "modele": "...",
  "promptVersion": "..."
}
```

La sortie `revue_humaine` est essentielle. Le bot doit pouvoir s'abstenir dès qu'une source est ambiguë, qu'une citation ne peut pas être vérifiée ou que deux modèles sont en désaccord.

### 6. Validation humaine

Les contrôles déterministes et le bot peuvent valider la conformité de cas simples, mais les cas ambigus vont dans une file de revue : nouvelle proposition, fusion, rejet, source insuffisante, candidat non identifié ou sujet sensible.

La validation automatique ne doit jamais être irréversible. Chaque décision doit conserver le résultat du bot, la version du modèle, les critères exécutés et la possibilité d'une correction humaine.

### 7. Publication atomique

La publication doit produire un nouveau snapshot complet et cohérent. Le site ne doit jamais lire un mélange de fichiers issus de deux versions différentes.

Le pipeline doit :

1. générer les fichiers dans un répertoire temporaire ;
2. valider les relations et doublons ;
3. lancer le build statique ;
4. remplacer le snapshot public uniquement si tout réussit ;
5. conserver le commit, le rapport et la date de publication.

## Évolution vers PostgreSQL

Lorsque le backend sera activé, `data/inbox` deviendra une file de travail en base. Les mêmes statuts seront conservés : `détectée`, `extraite`, `à vérifier`, `validée`, `publiée`, `rejetée`, `fusionnée`.

Le JSON restera utile comme export public versionné, même après le passage à PostgreSQL.

## Prototype v0 sans agent externe

Le script `yarn extract:suggestions` applique une première extraction lexicale aux sources de la boîte d'entrée. Il propose un candidat et un thème lorsque le titre contient des indices connus, mais place toujours le résultat en `revue_humaine`. Le titre est privilégié pour limiter les faux positifs ; le contexte enrichi est conservé pour la revue et l'agent sémantique.

Ce prototype sert à tester le format du pipeline et ses contrôles. Il ne remplace pas l'agent IA sémantique prévu ensuite.

Le mode normal est idempotent. Les scripts utilisent les statuts suivants pour la boîte d'entrée : `détectée`, `à_qualifier`, `enrichie`, `erreur`, `à_revoir`, `qualifiée`, `rejetée`, `publiée` et `fusionnée`. Les quatre derniers statuts sont terminaux : une source terminale n'est jamais renvoyée à l'agent. Une erreur technique reste conservée et peut être retentée au cycle suivant.

La clé de dédoublonnage d'une source est calculée à partir de l'URL normalisée (schéma et hôte normalisés, fragment et paramètres de suivi supprimés), avec un repli déterministe sur l'empreinte éditeur + titre + URL. Le premier enregistrement conservé gagne ; les relances ne dupliquent ni sources ni suggestions. Une suggestion est indexée par `sourceId` et les statuts déjà enregistrés sont préservés.

Le mode normal ne traite que les sources non terminales sans suggestion existante. Un recalcul explicite est possible avec `yarn extract:suggestions -- --refresh`; il ne traite toujours pas les sources terminales.

Le script `yarn review:report` génère ensuite `data/inbox/review-report.md`, un rapport versionné permettant de relire chaque entrée avant toute publication.
