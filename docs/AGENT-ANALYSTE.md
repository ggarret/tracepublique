# Agent analyste des entrées RSS

Version du contrat : **2**. Les exemples et cas annotés de référence sont dans
[`tests/fixtures/analyste-cases.json`](../tests/fixtures/analyste-cases.json) et
[`tests/fixtures/validateur-cases.json`](../tests/fixtures/validateur-cases.json).

## Mission

L'agent doit étudier **chaque nouvelle entrée non qualifiée** reçue par le flux RSS. Une entrée déjà qualifiée ne doit pas être renvoyée à l'agent à chaque cycle, sauf demande explicite de remise en revue.

Le pipeline doit mémoriser l'identifiant de source, le statut d'analyse, la version du prompt et la date de qualification.

Une entrée peut être classée comme non pertinente, mais cette décision doit être enregistrée avec une justification.

## Règles de contrat

- `sourceId` est obligatoire et doit reprendre l'identifiant d'entrée reçu.
- `decision`, `candidateConfidence`, `presidentialRelevance`, `confidence` et
  `status` acceptent uniquement les valeurs indiquées dans le contrat.
- `candidateId` et `themeId` sont `null` lorsqu'ils ne peuvent pas être établis
  avec les éléments fournis. Un candidat hors périmètre ne doit pas être
  remplacé par le candidat le plus proche.
- `claim`, `quote`, `primarySource` et `duplicateOf` sont `null` lorsqu'ils ne
  sont pas prouvés ou non applicables. Une citation doit être textuellement
  présente dans le dossier ; une reformulation ne doit pas être placée dans
  `quote`.
- `reasons` et `warnings` sont toujours des tableaux de chaînes, y compris
  lorsqu'ils sont vides.
- Toute ambiguïté d'attribution, de mandat, de source primaire ou de doublon
  impose `decision: "revue_humaine"` et `status: "a_revoir"`.
- Une entrée hors périmètre reste couverte : elle reçoit une décision explicite
  et une justification, elle n'est jamais ignorée.

## Questions obligatoires

Pour chaque entrée, l'agent doit répondre séparément à ces questions :

1. Quel est le contenu factuel de l'entrée ?
2. Un candidat de la présidentielle 2027 est-il identifiable ?
3. Le candidat fait-il partie du périmètre des dix candidats suivis ?
4. La personne parle-t-elle en son nom, au nom d'un parti ou est-elle simplement citée ?
5. S'agit-il d'une proposition, d'une intention, d'une promesse, d'une réaction, d'un commentaire ou d'une information biographique ?
6. La proposition concerne-t-elle un éventuel prochain mandat présidentiel ?
7. Quel thème correspond le mieux à la proposition ?
8. Existe-t-il un doublon dans les données déjà publiées ou dans la boîte d'entrée ?
9. Une source primaire est-elle disponible ?
10. Quel niveau de confiance peut être attribué à chaque réponse ?

## Distinction du prochain mandat

L'agent doit distinguer :

- une mesure explicitement annoncée pour la présidentielle ou un prochain mandat ;
- une position générale du candidat ;
- une action menée dans une fonction actuelle ou passée ;
- une réaction à l'actualité ;
- une hypothèse rapportée par un journaliste ;
- une proposition portée par un parti mais non attribuée au candidat.

Une formulation ambiguë ne doit pas être transformée en promesse présidentielle. Elle doit être classée `à vérifier` ou `revue_humaine`.

## Contrat de sortie

```json
{
  "sourceId": "...",
  "decision": "proposition | position | reaction | biographie | hors_perimetre | revue_humaine",
  "candidateId": "...",
  "candidateConfidence": "forte | moyenne | faible",
  "presidentialRelevance": "prochain_mandat | position_generale | autre_mandat | inconnue",
  "themeId": "...",
  "claim": "...",
  "quote": "...",
  "primarySource": "...",
  "duplicateOf": "...",
  "confidence": "forte | moyenne | faible",
  "reasons": [],
  "warnings": [],
  "status": "a_revoir"
}
```

Les champs `candidateId`, `themeId`, `claim`, `quote`, `primarySource` et
`duplicateOf` peuvent être `null`. Une sortie JSON qui contient une clé
inconnue, une valeur hors énumération, un tableau non textuel ou une citation
absente de l'entrée est non conforme.

## Matrice minimale de couverture

Le jeu de fixtures doit couvrir au minimum : proposition présidentielle
attribuée, position générale, réaction, biographie/hors périmètre, candidat
hors liste, citation absente, attribution ambiguë, doublon probable et source
primaire manquante. Les résultats attendus sont des sorties contractuelles,
pas des jugements sur le fond politique.

## Contrat du validateur

Le validateur consomme la suggestion et les preuves disponibles, puis retourne
uniquement :

```json
{
  "decision": "valide | rejette | revue_humaine",
  "score": 0.0,
  "criteres": [
    {"id": "source_accessible", "resultat": "satisfait | echoue | ambigu", "preuve": "..."}
  ],
  "preuves": [],
  "alertes": [],
  "modele": "...",
  "promptVersion": "validateur-v2"
}
```

Les critères essentiels sont la source accessible, la preuve textuelle,
l'attribution du candidat et la pertinence pour le prochain mandat. Un critère
`echoue` interdit `valide`; un critère `ambigu` impose `revue_humaine`. Une
sortie explicitement `hors_perimetre`, correctement justifiée et sans
affirmation politique publiable, est `rejette`. Le score mesure la conformité
documentaire, jamais la valeur ou la faisabilité de la mesure.

## Garantie de couverture

Le pipeline doit produire un résultat pour chaque entrée RSS : analyse réussie, erreur technique ou échec explicite. Un rapport doit signaler :

- nombre d'entrées reçues ;
- nombre d'entrées analysées ;
- nombre d'erreurs ;
- nombre d'entrées en revue humaine ;
- nombre de propositions candidates ;
- nombre d'entrées classées hors périmètre.

« Ne rien louper » signifie donc que chaque nouvelle entrée est conservée et traitée une fois, avec la possibilité de la remettre en revue. Cela ne signifie pas qu'une entrée déjà qualifiée est retraitée en boucle.
