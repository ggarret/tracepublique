# Prompts versionnés

Les prompts sont des artefacts du projet. Toute modification importante doit :

- changer le numéro de version ;
- être documentée dans le journal des décisions ;
- être testée sur un jeu de cas connus ;
- conserver les résultats comparables entre modèles.

Prompts actuels :

- [Agent analyste v2](analyste-v2.md)
- [Bot validateur v2](validateur-v2.md)

Les versions v1 restent conservées pour permettre la comparaison historique. Les
fixtures annotées de référence sont dans [`tests/fixtures/`](../tests/fixtures/).
Toute nouvelle version doit être évaluée sur ces cas avant d'être utilisée.
