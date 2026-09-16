# Méthodologie de l'Observatoire citoyen

## 1. Périmètre et statut

Le périmètre de travail est la France et l'élection présidentielle française
de 2027. La liste de suivi est une liste de travail non officielle : elle ne
préjuge ni de la candidature définitive ni de la légitimité d'une personne. Le
statut de chaque fiche doit rester explicite (`déclaré`, `investi`, `pressenti`,
`non confirmé` ou `candidature officielle`) et être fondé sur les sources
propres à cette fiche.

Les sources de cadrage actuellement référencées sont [Info.gouv.fr — Élection
présidentielle 2027](https://www.info.gouv.fr/actualite/election-presidentielle-2027),
[la Commission des sondages](https://www.commission-des-sondages.fr/) et la
[politique de qualification des sources](SOURCES.md). Les sources de cadrage
ne remplacent pas les sources de chaque proposition.

## 2. Unité d'analyse

L'unité publiée est une proposition ou une position précisément délimitée,
rattachée à un candidat seulement lorsque l'attribution et le contexte sont
établis. Une fiche distingue :

1. **fait** : ce qui est directement vérifiable ;
2. **source** : le document et le passage qui permettent cette vérification ;
3. **analyse** : les conséquences possibles et le raisonnement ;
4. **opinion** : un jugement attribué à son auteur ;
5. **incertitude** : une limite, contradiction ou donnée manquante.

Le pipeline et la revue humaine doivent empêcher qu'une paraphrase analytique
soit publiée comme une déclaration, qu'un article soit présenté comme une
source primaire ou qu'une position de parti soit automatiquement attribuée à
une personne.

## 3. Protocole de preuve

Pour chaque affirmation importante :

- conserver l'URL, le titre, l'auteur ou éditeur, la date, le type de source et
  la date de consultation ;
- conserver la citation ou le passage utile avec son contexte ;
- privilégier le document original et rattacher les sources secondaires sans
  leur faire dire davantage qu'elles ne disent ;
- noter les contradictions, modifications et liens devenus indisponibles ;
- faire relire humainement toute attribution, citation, intention de mandat,
  source ambiguë ou proposition potentiellement doublonnée.

Une source accessible n'est pas nécessairement une source suffisante. La force
de la preuve porte séparément sur l'existence du document, l'attribution, la
portée de la proposition et les effets analysés.

## 4. Analyse et notation

Les analyses portent sur six dimensions : économique et budgétaire, juridique
et institutionnelle, sociale, environnementale, éthique et libertés, et
faisabilité de mise en œuvre. Les pondérations de référence sont respectivement
20 %, 20 %, 15 %, 15 %, 15 % et 15 %.

La [grille de notation auditable](GRILLE_NOTATION.md) définit l'échelle 0–10,
les justificatifs obligatoires, le calcul agrégé facultatif et les conditions
d'abstention. La [charte de neutralité](CHARTE_NEUTRALITE.md) précise les
garanties éditoriales et l'absence de note politique globale imposée.

Une note décrit la qualité des éléments documentés au regard d'un critère ;
elle ne mesure pas la valeur d'un candidat. Les faits et les conséquences
possibles sont donc affichés séparément. L'incertitude est indépendante de la
note et doit rester visible.

## 5. Règle d'abstention

L'observatoire s'abstient de noter lorsqu'un élément essentiel n'est pas établi,
notamment l'auteur, le périmètre, le coût, la base juridique, les effets ou les
moyens de mise en œuvre. L'abstention est préférable à une note calculée sur
des suppositions. Elle précise les informations manquantes et les conditions
d'un réexamen.

L'absence de preuve ne constitue pas la preuve de l'absence. Elle ne doit donc
pas être codée comme un zéro, une mauvaise intention ou une position politique.

## 6. Comparaison des modèles

GPT et Claude sont traités comme deux chaînes d'analyse distinctes. Pour chaque
exécution, conserver le corpus identique, le prompt et sa version, le modèle et
sa version, la date, les paramètres utiles, la sortie brute, les sources
citées, la vérification humaine et les corrections.

La comparaison porte sur les faits retrouvés, la qualité et la couverture des
sources, les raisonnements, les notes, les abstentions, les omissions et les
erreurs. Une convergence n'est pas une validation indépendante ; une
divergence doit être décrite puis vérifiée. Aucun modèle ne décide seul de la
publication.

## 7. Reproductibilité et gouvernance des changements

Toute analyse doit être rattachée à une version de la grille, de la méthode et
du prompt. Toute modification de critère, pondération, périmètre ou règle de
publication est datée et motivée ; les résultats antérieurs restent
identifiables. Les corrections factuelles et les désaccords d'analyse sont
journalisés séparément.

Les étapes de collecte, qualification, revue et publication restent séparées,
conformément aux documents [INGESTION](INGESTION.md), [PIPELINE](PIPELINE.md),
[REVIEW](REVIEW.md) et [ADMIN](ADMIN.md). Une suggestion issue d'un modèle ou
d'un flux ne constitue jamais à elle seule une publication.

## 8. Limites connues

Les programmes peuvent être incomplets, évolutifs ou non chiffrés ; les effets
réels dépendent du contexte, de l'administration et des réactions des acteurs.
Les données institutionnelles et les sources médiatiques n'ont pas le même
rôle. La grille ne prédit ni le résultat électoral ni le succès d'une politique,
et ne remplace ni une expertise juridique, ni une évaluation budgétaire
complète, ni le débat démocratique.
