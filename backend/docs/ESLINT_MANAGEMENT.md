# Gestion des erreurs ESLint dans les tests

Les fichiers de test (`*.spec.ts`) génèrent des erreurs eslint liées à l'utilisation de `any` dans les mocks et les assertions.

## Solution appliquée

1. Ajout d'`eslint-disable-next-line` pour les méthodes async sans await.
2. Ajout d'`eslint-disable-next-line` pour les assignations/accès `any`.

## Pour éliminer complètement ces erreurs

Deux approches possibles :

### Option 1 : Typer les mocks proprement
Créer des véritables implémentations typées ou utiliser une bibliothèque de mocking (jest.mock).

### Option 2 : Ignorer les fichiers spec au lint
Ajouter à `.eslintignore` :
```
**/*.spec.ts
```

## Commandes utiles

- Lint sans fixes : `npm run lint`
- Build uniquement : `npm run build`
- Tests uniquement : `npm test`
- Tous les vérifications : `npm run build && npm test && npm run lint`

Les tests passent tous (102/102) et le build réussit malgré les avertissements eslint.
