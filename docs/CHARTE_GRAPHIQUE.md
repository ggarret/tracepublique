# Charte graphique

## Positionnement

Le site doit évoquer une source d'information sérieuse, calme, lisible et vérifiable. L'interface privilégie la compréhension du contenu sur l'effet visuel.

La direction retenue est celle d'un journal de données civique : éditorial dans
la hiérarchie, rigoureux dans les métadonnées et volontairement sobre dans les
effets visuels.

L'expression visuelle est celle d'un média civique contemporain : une structure
très blanche, une typographie de titre assumée et des repères colorés limités aux
éléments qui ont un sens documentaire.

## Direction visuelle

- fond principal blanc ;
- texte principal noir ou presque noir ;
- hiérarchie visuelle nette ;
- espaces blancs structurants, sans éloigner les informations liées ;
- interfaces plates, sans effets décoratifs inutiles ;
- couleurs utilisées uniquement lorsqu'elles portent une information ;
- couleurs des formations utilisées comme repères discrets sur les portraits et
  les cartes, jamais comme jugement ni comme statut d'évaluation.

## Couleurs

```css
:root {
  --paper: #ffffff;
  --ink: #0b0b0b;
  --muted: #666660;
  --soft: #f3f3f0;
  --soft-strong: #e9e9e4;
  --line: #d9d9d3;
  --signal: #d83a2e;
  --focus: #1759b7;
}
```

Les couleurs positive, avertissement et négative doivent décrire un statut ou un niveau de confiance, jamais une orientation politique.

## Typographie

- Manrope Variable pour le texte courant, les interfaces et les légendes ;
- Space Grotesk Variable pour les titres, les nombres clés et la marque ;
- pile monospace système pour dates, statuts, identifiants et métadonnées ;
- taille de texte confortable, au minimum 16 px sur desktop et mobile ;
- titres courts et fortement hiérarchisés ;
- largeur de lecture limitée pour les textes longs ;
- citations et sources visuellement distinctes du commentaire éditorial ;
- nombres, notes et dates alignés pour faciliter la comparaison.

Les titres utilisent une graisse forte et un interlettrage resserré. Le texte
courant reste à 16 px minimum et les libellés récurrents à 14 px minimum ; seuls
les identifiants secondaires peuvent descendre à 12 px.

Les fontes sont embarquées par le projet via Fontsource. Le rendu ne dépend donc
pas d'un service tiers au chargement de la page.

## Identités politiques et portraits

- un portrait sert à identifier la personne, sans cadrage valorisant ou
  dévalorisant intentionnel ;
- un logo sert uniquement à identifier une formation politique ;
- la couleur d'une formation peut souligner sa carte ou son portrait, mais ne
  doit jamais être réutilisée comme score ;
- chaque URL de logo et sa page source sont conservées dans le référentiel des
  candidats ;
- un monogramme textuel remplace automatiquement une image indisponible.

## Couleurs d'évaluation

Les six critères disposent de couleurs stables pour faciliter le repérage :
bleu pour l'économie, turquoise pour le droit, magenta pour les effets sociaux,
vert pour l'environnement, ocre pour l'éthique et violet pour la faisabilité.
Ces couleurs identifient une catégorie, pas un résultat.

Les scores utilisent une seconde échelle indépendante : rouge de 0 à 3, ambre
de 4 à 6 et vert de 7 à 10. La valeur numérique et le libellé restent toujours
affichés afin que la couleur ne soit jamais le seul vecteur d'information.

## Mise en page

La page doit rendre visibles rapidement :

1. ce qui est affirmé ;
2. par qui et quand ;
3. la source originale ;
4. le statut de vérification ;
5. l'analyse et ses limites.

L'accueil commence directement par l'état du corpus et le flux des dernières
propositions. Les fiches de proposition suivent une structure répétable : titre,
résumé, sources, analyses séparées, notation, niveau de confiance et identifiant
public. Les métadonnées d'audit restent visibles dans une colonne dédiée sur
grand écran et remontent avant le contenu sur mobile.

## Composants prioritaires

- en-tête simple avec navigation principale ;
- recherche globale ;
- fiche candidat ;
- fiche proposition ;
- carte de source ;
- badge de statut ;
- tableau de comparaison ;
- bloc de citation ;
- panneau de méthodologie ;
- historique des versions ;
- formulaire de signalement d'erreur.

## Accessibilité

- contraste conforme aux recommandations WCAG ;
- navigation complète au clavier ;
- focus visible ;
- structure sémantique HTML ;
- ne jamais transmettre une information uniquement par la couleur ;
- tableaux lisibles sur mobile ;
- liens de sources explicites ;
- textes alternatifs pour les images et graphiques.

## Règles de contenu

- préférer les phrases courtes ;
- afficher les sources près des affirmations ;
- éviter les adjectifs évaluatifs non définis ;
- distinguer clairement les faits des analyses ;
- afficher les incertitudes plutôt que les masquer ;
- ne pas utiliser de formulations sensationnalistes.
