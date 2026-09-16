# Registre des programmes et documents de campagne

Le fichier `data/programs.json` recense les pages et documents repérés sur les
sites officiels des campagnes ou des formations politiques. Le premier passage
transversal couvre les dix personnalités suivies, mais ne constitue pas encore
une extraction exhaustive de tous les documents et de toutes leurs mesures.

## Règles de qualification

- `document_programmatique_2027` : document explicitement rattaché à la campagne 2027 ;
- `socle_programmatique_2027` : corpus antérieur explicitement repris comme base de construction du programme 2027 ;
- `programme_progressif_2027` : programme annoncé comme publié par étapes ;
- `programme_collectif_2027` : programme de la formation politique, sans attribution automatique de chaque mesure à la personnalité suivie ;
- `orientations_2027` : axes ou priorités de campagne, sans programme complet ;
- `orientations_formation` : contenu publié par la formation politique, sans attribution automatique à un programme présidentiel ;
- `programme_partiel_2027` : cahier ou document de campagne incomplet ;
- `programme_anterieur_a_requalifier` : programme officiel repéré, mais dont le millésime ou l'applicabilité à 2027 doit être vérifié.

Une page officielle ne suffit pas à créer une proposition. L'extraction devra
conserver le document source, sa date, sa version, une citation courte et le
contexte permettant de vérifier qu'il s'agit bien d'une mesure pour le prochain
mandat.

## Sources initiales

Les dix personnalités suivies disposent désormais d'une entrée dans le registre
et d'au moins six propositions documentées dans le corpus public. Les entrées
portant l'attribution `past_program` restent des archives à requalifier et non
des engagements présumés pour 2027.
Certaines entrées pointent vers un programme, d'autres vers une campagne ou une
formation qui construit encore ses orientations. Cette différence est visible
sur chaque fiche candidat et doit rester visible dans les exports.

La collecte ne copie pas les programmes complets dans le dépôt : elle conserve
les liens, les métadonnées et les extraits nécessaires à l'audit, dans le
respect des droits de réutilisation.
