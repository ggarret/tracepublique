# Grille de notation auditable

## Principe

La grille évalue une **proposition documentée**, pas un candidat dans son
ensemble. Elle ne fabrique pas de classement politique global. Une proposition
peut recevoir plusieurs notes par dimension, ou aucune note si les éléments
nécessaires manquent.

Chaque dimension reçoit un score de 0 à 100 et une justification. Le score ne
doit jamais être interprété sans son niveau de confiance, ses sources et ses
hypothèses.

## Dimensions et pondérations

Les pondérations de référence totalisent 100 %. Elles sont affichées avec
chaque résultat.

| Dimension | Poids | Question évaluée |
| --- | ---: | --- |
| Économique et budgétaire | 20 % | Les effets économiques et les ressources nécessaires sont-ils documentés ? |
| Juridique et institutionnelle | 20 % | La mesure est-elle compatible avec le droit applicable et les compétences mobilisées ? |
| Sociale | 15 % | Les effets sur les groupes concernés, les inégalités et l'accès aux droits sont-ils identifiés ? |
| Environnementale | 15 % | Les effets sur les émissions, les ressources, la santé et les écosystèmes sont-ils documentés ? |
| Éthique et libertés | 15 % | Les risques pour la dignité, les libertés, la non-discrimination et la vie privée sont-ils traités ? |
| Faisabilité de mise en œuvre | 15 % | Le calendrier, les acteurs, les moyens et les mécanismes de contrôle sont-ils crédibles ? |

Chaque dimension est examinée. Lorsqu'aucun effet matériel n'est identifié,
la justification doit l'indiquer explicitement sans inventer un effet favorable
ou défavorable. Une pondération modifiée crée une nouvelle version de la grille
et ne réécrit pas les résultats antérieurs.

## Échelle commune

| Score | Interprétation méthodologique |
| ---: | --- |
| 0–19 | Très fragile : impossibilité documentée ou éléments essentiels absents |
| 20–39 | Faible : obstacles majeurs non traités ou dossier très incomplet |
| 40–59 | Partiel : éléments crédibles mais lacunes importantes ou hypothèses sensibles |
| 60–79 | Plutôt étayé : principaux obstacles traités, réserves encore significatives |
| 80–94 | Fortement étayé : preuves solides, mécanismes précis et limites circonscrites |
| 95–100 | Exceptionnellement documenté pour ce critère, sans signifier « parfait » |

Cette échelle ne permet pas de déduire une préférence politique. Un score bas
peut refléter une proposition incomplète plutôt qu'une proposition
indésirable, et un score haut ne prédit pas son succès.

## Fiche de justification obligatoire

Pour chaque dimension notée, l'enregistrement doit contenir :

- `gridVersion` et date d'évaluation ;
- le score sur 100 ;
- les faits observés et les sources correspondantes ;
- le raisonnement séparé des faits ;
- les hypothèses, données manquantes et objections raisonnables ;
- le niveau de confiance (`forte`, `moyenne` ou `faible`) ;
- l'identité ou le rôle du relecteur et l'historique des corrections.

Une note sans justification vérifiable est invalide. Une source ne prouve pas
à elle seule l'effet attendu : elle établit un fait, tandis que l'effet doit
être présenté comme analyse ou hypothèse, avec le mécanisme qui les relie.

## Règles par dimension

### Économique et budgétaire

Examiner le coût initial et récurrent, les recettes ou économies annoncées,
les effets macroéconomiques, la distribution des coûts et les hypothèses de
calcul. Distinguer un chiffrage officiel d'une estimation indépendante.

### Juridique et institutionnelle

Examiner la base légale, la compétence de l'autorité, la constitutionnalité
présumée sans la déclarer acquise, le droit de l'Union, les engagements
internationaux et les procédures nécessaires. Une difficulté juridique ne vaut
pas impossibilité sans source ou raisonnement explicite.

### Sociale

Identifier les populations touchées, les effets distributifs, l'accès effectif
aux droits, les conditions de travail et les éventuels effets indirects. Éviter
de généraliser à partir d'un seul cas.

### Environnementale

Préciser l'horizon temporel et le périmètre : émissions, énergie, matériaux,
sols, eau, biodiversité ou santé. Signaler les effets déplacés et les
incertitudes de mesure.

### Éthique et libertés

Examiner la nécessité, la proportionnalité, la réversibilité, la
non-discrimination, la vie privée, la liberté d'expression et les voies de
recours. Les préférences morales de l'observateur ne doivent pas être
masquées derrière un vocabulaire technique.

### Faisabilité de mise en œuvre

Examiner les acteurs responsables, le calendrier, les capacités administratives,
les dépendances techniques, l'acceptabilité procédurale, les contrôles et les
indicateurs de suivi. La popularité supposée d'une mesure n'est pas une preuve
de faisabilité.

## Score agrégé

Un score agrégé est calculé **pour une proposition seulement** lorsque les six
dimensions sont documentées. Il s'agit d'une moyenne pondérée suivant la grille
versionnée dans `data/evaluation-criteria.json`. Il doit toujours être présenté
comme un score de robustesse du dossier : précision de la mesure, traitement des
impacts et faisabilité documentée. Ce score n'évalue ni la popularité, ni la
justice supposée, ni l'opportunité politique de la proposition. Aucun agrégat
par candidat, parti ou famille politique n'est produit.

## Abstention et réexamen

Le statut `abstention` est obligatoire si une information essentielle manque,
si l'attribution est ambiguë, si les sources sont inaccessibles ou
contradictoires sans résolution, ou si le calcul dépend d'une hypothèse non
testable. La fiche indique ce qu'il faudrait documenter pour réexaminer le cas.

Les résultats de GPT et Claude sont comparés séparément sur leurs faits,
sources, raisonnements, notes et abstentions. Ils ne sont ni fusionnés ni
départagés par vote automatique.
