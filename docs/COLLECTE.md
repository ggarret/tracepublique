# Stratégie de collecte multi-canaux

## Principe

La collecte doit fonctionner même lorsqu'un candidat ne propose ni RSS ni API. Le système repose sur des adaptateurs indépendants plutôt que sur une source unique.

```text
site officiel       ─┐
programme PDF       ─┤
vidéo originale     ─┤→ sources candidates → dédoublonnage → qualification → publication
flux média          ─┤
réseaux sociaux     ─┘
```

## Priorité des canaux

1. document ou déclaration originale du candidat ;
2. archive du site officiel ;
3. vidéo ou transcription originale ;
4. compte rendu de média ;
5. source contextuelle institutionnelle.

## Fiche de disponibilité

Une fiche de suivi par candidat devra indiquer :

- URL du site officiel ;
- présence d'un programme ;
- présence d'un sitemap ;
- pages ou flux vidéo identifiés ;
- sources média utilisables pour la veille ;
- date de dernière vérification ;
- problèmes de collecte rencontrés.

Cette fiche est un outil de transparence : elle rend visible pourquoi certains candidats peuvent avoir plus de données accessibles que d'autres.

## Monitoring de X

X sera suivi comme un canal de veille, pas comme une preuve automatiquement validée.

Avant toute collecte, chaque compte devra être enregistré dans `data/accounts.json` avec :

- candidat associé ;
- identifiant et URL du compte ;
- date de vérification ;
- méthode de vérification ;
- lien depuis le site officiel ou une autre source primaire ;
- statut : `à vérifier`, `confirmé`, `contesté` ou `inactif`.

La certification visible sur la plateforme ne suffira pas à établir l'identité d'un compte. La confirmation devra idéalement venir d'un lien croisé depuis le site officiel, un programme ou une déclaration publique.

Les publications X seront conservées avec leur URL, leur date, leur texte original et, si nécessaire, une capture ou une archive autorisée. Un repost, une citation ou un commentaire devra être distingué d'une proposition formulée directement par le candidat.

Le monitoring automatique sera activé seulement après décision sur le mode d'accès autorisé à la plateforme et sur les limites de conservation et de republication.
