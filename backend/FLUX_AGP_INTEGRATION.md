# Flux d'intégration ChatController -> AGP Controller

## Vue d'ensemble

Ce document décrit le flux automatisé qui permet de générer une liste d'ingrédients via ChatController et de lancer automatiquement une recherche AGP sur La Vie Claire.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      FLUX COMPLET                                │
└─────────────────────────────────────────────────────────────────┘

1. Frontend appelle POST /api/chat/generate-ingredients
   ↓
2. ChatController génère la liste d'ingrédients avec OpenAI
   ↓
3. Sauvegarde automatique dans product_to_search.json
   ↓
4. (Optionnel) Déclenchement automatique de la recherche AGP
   ↓
5. AGP recherche les produits sur La Vie Claire
   ↓
6. Résultats sauvegardés dans backend/data/agpresp/
```

## Endpoints

### 1. Générer la liste d'ingrédients

**Endpoint:** `POST /api/chat/generate-ingredients`

**Body:**
```json
{
  "recipes": [
    {
      "name": "Pâtes à l'ail et à l'huile d'olive",
      "description": "Recette simple et rapide"
    }
  ],
  "numberOfPeople": 2,
  "triggerAgpSearch": true  // OPTIONNEL: lance automatiquement la recherche AGP
}
```

**Réponse (sans triggerAgpSearch):**
```json
{
  "success": true,
  "ingredients": {
    "recipes": [
      {
        "name": "Pâtes à l'ail et à l'huile d'olive",
        "ingredients": [
          {"name": "Pâtes", "quantity": "400g", "category": "Féculents"},
          {"name": "Ail", "quantity": "6 gousses", "category": "Légumes"},
          {"name": "Huile d'olive", "quantity": "100ml", "category": "Huiles"}
        ]
      }
    ],
    "shoppingList": [
      {"name": "Pâtes", "totalQuantity": "400g", "category": "Féculents"},
      {"name": "Ail", "totalQuantity": "6 gousses", "category": "Légumes"},
      {"name": "Huile d'olive", "totalQuantity": "100ml", "category": "Huiles"}
    ]
  },
  "savedToFile": true,
  "message": "Ingredients generated and saved to product_to_search.json. Ready for AGP search."
}
```

**Réponse (avec triggerAgpSearch: true):**
```json
{
  "success": true,
  "ingredients": { ... },
  "savedToFile": true,
  "message": "Ingredients generated and saved to product_to_search.json. Ready for AGP search.",
  "agpSearchTriggered": true,
  "agpSearchResult": {
    "success": true,
    "totalIngredients": 3,
    "recipes": ["Pâtes à l'ail et à l'huile d'olive"],
    "results": [
      {
        "ingredient": "Pâtes",
        "quantity": "400g",
        "category": "Féculents",
        "recipe": "Pâtes à l'ail et à l'huile d'olive",
        "taskId": "task_xyz123",
        "status": "completed",
        "result": "Résumé des 4 produits trouvés sur La Vie Claire...",
        "eventsCount": 15
      }
      // ... autres ingrédients
    ],
    "savedFiles": {
      "globalFile": "/path/to/recherche_2025-11-14T14-30-00.txt",
      "productFiles": [...]
    }
  }
}
```

### 2. Lancer manuellement la recherche AGP

Si vous n'avez pas utilisé `triggerAgpSearch: true`, vous pouvez lancer manuellement la recherche :

**Endpoint:** `POST /api/agp/search-from-json`

**Body:** Aucun (lit automatiquement product_to_search.json)

**Réponse:**
```json
{
  "success": true,
  "message": "Recherche terminée avec succès",
  "totalIngredients": 3,
  "recipes": ["Pâtes à l'ail et à l'huile d'olive"],
  "results": [...],
  "savedFiles": {
    "globalFile": "/path/to/recherche_timestamp.txt",
    "productFiles": [...]
  },
  "note": "Consultez Surfer-H pour voir les détails complets de chaque recherche"
}
```

## Fichiers générés

### 1. product_to_search.json

**Emplacement:** `backend/data/product_to_search.json`

**Structure:**
```json
{
  "timestamp": "2025-11-14T14:30:00.000Z",
  "numberOfPeople": 2,
  "recipes": [
    {
      "name": "Pâtes à l'ail et à l'huile d'olive",
      "ingredients": [
        {"name": "Pâtes", "quantity": "400g", "category": "Féculents"},
        {"name": "Ail", "quantity": "6 gousses", "category": "Légumes"},
        {"name": "Huile d'olive", "quantity": "100ml", "category": "Huiles"}
      ]
    }
  ],
  "shoppingList": [
    {"name": "Pâtes", "totalQuantity": "400g", "category": "Féculents"},
    {"name": "Ail", "totalQuantity": "6 gousses", "category": "Légumes"},
    {"name": "Huile d'olive", "totalQuantity": "100ml", "category": "Huiles"}
  ]
}
```

### 2. Résultats AGP

**Emplacement:** `backend/data/agpresp/`

**Fichiers créés:**
- `recherche_2025-11-14T14-30-00.txt` - Résumé global de tous les produits
- `pates_2025-11-14T14-30-00.txt` - Détails pour les pâtes
- `ail_2025-11-14T14-30-00.txt` - Détails pour l'ail
- `huile_d_olive_2025-11-14T14-30-00.txt` - Détails pour l'huile d'olive

## Exemples d'utilisation

### Exemple 1: Flux automatique complet

```bash
curl -X POST http://localhost:3000/api/chat/generate-ingredients \
  -H "Content-Type: application/json" \
  -d '{
    "recipes": [
      {
        "name": "Salade méditerranéenne",
        "description": "Salade fraîche avec tomates, concombres et feta"
      }
    ],
    "numberOfPeople": 4,
    "triggerAgpSearch": true
  }'
```

Cette requête va :
1. Générer la liste d'ingrédients
2. Sauvegarder dans product_to_search.json
3. Lancer automatiquement la recherche AGP
4. Retourner les résultats complets

### Exemple 2: Flux en deux étapes

**Étape 1: Générer la liste**
```bash
curl -X POST http://localhost:3000/api/chat/generate-ingredients \
  -H "Content-Type: application/json" \
  -d '{
    "recipes": [
      {"name": "Pizza margherita", "description": "Pizza classique"}
    ],
    "numberOfPeople": 2
  }'
```

**Étape 2: Lancer la recherche manuellement**
```bash
curl -X POST http://localhost:3000/api/agp/search-from-json
```

## Logs console

Lors de l'exécution, vous verrez dans les logs :

```
✅ Liste d'ingrédients sauvegardée dans /path/to/product_to_search.json
📦 1 recette(s) et 5 ingrédient(s) uniques
🚀 Déclenchement automatique de la recherche AGP...
🔍 Démarrage de la recherche automatique...
📋 1 recette(s) trouvée(s)
🛒 5 ingrédient(s) à rechercher
🚀 Lancement de 5 recherches en parallèle...
✅ 5 tâches créées
⏳ Attente de la complétion de toutes les tâches...
🔄 [Pâtes] Statut: running
💬 [Pâtes] Message: Voici les résultats...
...
✅ Toutes les recherches terminées!
💾 Sauvegarde des résultats dans des fichiers...
✅ Fichier global sauvegardé: recherche_2025-11-14T14-30-00.txt
   ✅ pates_2025-11-14T14-30-00.txt
   ✅ ail_2025-11-14T14-30-00.txt
💾 6 fichier(s) sauvegardé(s) dans backend/data/agpresp
✅ Recherche AGP terminée avec succès!
```

## Monitoring

Pour voir les détails complets de chaque recherche AGP :

1. Consultez les fichiers texte dans `backend/data/agpresp/`
2. Visitez Surfer-H : https://surfer.h-company.ai
3. Cherchez par Task ID fourni dans les résultats

## Notes importantes

- La recherche AGP peut prendre plusieurs minutes selon le nombre d'ingrédients
- Chaque ingrédient génère jusqu'à 4 références de produits sur La Vie Claire
- Les résultats sont sauvegardés automatiquement même en cas d'erreur partielle
- Si `triggerAgpSearch: true`, la requête HTTP peut prendre longtemps (ajoutez un timeout approprié)
- Pour de grandes listes, privilégiez le flux en deux étapes
