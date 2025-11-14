# 🛒 Recherche de Produits sur La Vie Claire avec AGP

Ce guide explique comment utiliser l'endpoint AGP pour rechercher automatiquement les produits de votre fichier JSON sur le site La Vie Claire.

---

## 🎯 Fonctionnement

L'endpoint `/api/agp/search-from-json` :
1. ✅ Lit le fichier `backend/data/product_to_search.json`
2. ✅ Extrait tous les ingrédients de toutes les recettes
3. ✅ Lance une recherche AGP en **parallèle** pour chaque ingrédient
4. ✅ Pour chaque produit, trouve jusqu'à **4 références** sur La Vie Claire
5. ✅ Analyse le prix, Nutriscore, label bio et origine
6. ✅ Retourne un résumé détaillé avec les meilleures options

---

## 📋 Structure du Fichier JSON

Le fichier `backend/data/product_to_search.json` doit avoir cette structure :

```json
{
  "recipes": [
    {
      "name": "Nom de la recette",
      "ingredients": [
        {
          "name": "Nom du produit",
          "quantity": "quantité",
          "category": "catégorie"
        }
      ]
    }
  ]
}
```

### Exemple actuel

```json
{
  "recipes": [
    {
      "name": "Salade de quinoa aux légumes de saison",
      "ingredients": [
        {
          "name": "Quinoa",
          "quantity": "100g",
          "category": "Céréales"
        },
        {
          "name": "Légumes de saison",
          "quantity": "200g",
          "category": "Légumes"
        },
        {
          "name": "Huile d'olive",
          "quantity": "2 cuillères à soupe",
          "category": "Huiles"
        },
        {
          "name": "Sel",
          "quantity": "1 pincée",
          "category": "Épices"
        },
        {
          "name": "Poivre",
          "quantity": "1 pincée",
          "category": "Épices"
        }
      ]
    }
  ]
}
```

---

## 🚀 Comment Lancer la Recherche

### Option 1 : Avec cURL

```bash
curl -X POST http://localhost:5001/api/agp/search-from-json \
  -H "Content-Type: application/json"
```

### Option 2 : Avec Postman

1. Méthode : `POST`
2. URL : `http://localhost:5001/api/agp/search-from-json`
3. Headers : `Content-Type: application/json`
4. Body : **Laisser vide** (l'endpoint lit directement le fichier JSON)
5. Cliquez sur "Send"

### Option 3 : Avec JavaScript (Frontend)

```javascript
const searchProducts = async () => {
  try {
    const response = await fetch('http://localhost:5001/api/agp/search-from-json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log('Résultats:', data);
  } catch (error) {
    console.error('Erreur:', error);
  }
};

searchProducts();
```

---

## 💾 Sauvegarde Automatique des Résultats

Les résultats sont automatiquement sauvegardés dans **`backend/data/agpresp/`** :

### 📁 Fichiers Générés

1. **Fichier global** : `recherche_YYYY-MM-DDTHH-MM-SS.txt`
   - Contient TOUS les résultats de la recherche
   - Format lisible et structuré
   - Un fichier par recherche

2. **Fichiers par produit** : `nom_produit_YYYY-MM-DDTHH-MM-SS.txt`
   - Un fichier par ingrédient
   - Détails spécifiques à chaque produit
   - Même timestamp que le fichier global

### 📄 Exemple de Contenu

```txt
═══════════════════════════════════════════════════════════════
PRODUIT: Quinoa
═══════════════════════════════════════════════════════════════

📋 INFORMATIONS GÉNÉRALES
─────────────────────────────────────────────────────────────
• Nom: Quinoa
• Quantité demandée: 100g
• Catégorie: Céréales
• Recette: Salade de quinoa aux légumes de saison

📝 RÉSULTATS DE LA RECHERCHE SUR LA VIE CLAIRE
─────────────────────────────────────────────────────────────

1. Quinoa Bio Blonde - La Vie Claire
   - Prix: 4,50€/500g
   - Nutriscore: A
   - Label: Agriculture Biologique
   ...
```

---

## 📊 Format de la Réponse API

```json
{
  "success": true,
  "message": "Recherche terminée avec succès",
  "totalIngredients": 5,
  "recipes": ["Salade de quinoa aux légumes de saison"],
  "savedFiles": {
    "globalFile": "/path/to/backend/data/agpresp/recherche_2025-11-14T14-30-45.txt",
    "productFiles": [
      "/path/to/backend/data/agpresp/quinoa_2025-11-14T14-30-45.txt",
      "/path/to/backend/data/agpresp/huile_d_olive_2025-11-14T14-30-45.txt"
    ]
  },
  "results": [
    {
      "ingredient": "Quinoa",
      "quantity": "100g",
      "category": "Céréales",
      "recipe": "Salade de quinoa aux légumes de saison",
      "taskId": "task_xxxxx-xxxxx-xxxxx",
      "status": "completed",
      "result": "Résumé détaillé avec les 4 meilleures références:\n1. Quinoa Bio... Prix: 4.50€, Nutriscore: A...",
      "error": null,
      "eventsCount": 25
    },
    {
      "ingredient": "Légumes de saison",
      "quantity": "200g",
      "category": "Légumes",
      "recipe": "Salade de quinoa aux légumes de saison",
      "taskId": "task_yyyyy-yyyyy-yyyyy",
      "status": "completed",
      "result": "Résumé détaillé...",
      "error": null,
      "eventsCount": 30
    }
    // ... autres ingrédients
  ],
  "note": "Consultez Surfer-H pour voir les détails complets de chaque recherche"
}
```

---

## 🔍 Détails de Chaque Résultat

Pour chaque ingrédient, vous recevez :

| Champ | Description |
|-------|-------------|
| **ingredient** | Nom de l'ingrédient recherché |
| **quantity** | Quantité demandée dans la recette |
| **category** | Catégorie du produit |
| **recipe** | Nom de la recette d'origine |
| **taskId** | ID de la tâche AGP (pour voir sur Surfer-H) |
| **status** | Statut : `running`, `completed`, `failed` |
| **result** | Résumé final avec les 4 meilleures références |
| **error** | Message d'erreur si échec |
| **eventsCount** | Nombre d'événements capturés |

---

## 📝 Ce que l'Agent Recherche

Pour chaque produit, l'agent AGP :

### 1. Va sur La Vie Claire
- URL : https://mescoursesenligne.lavieclaire.com/

### 2. Recherche le Produit
- Utilise la barre de recherche
- Tape le nom exact du produit

### 3. Analyse jusqu'à 4 Références
Pour chaque référence, l'agent extrait :
- ✅ **Prix** (€)
- ✅ **Nutriscore** (A, B, C, D, E)
- ✅ **Label Bio** (oui/non)
- ✅ **Origine** (France, Europe, etc.)
- ✅ **Marque**
- ✅ **Conditionnement** (poids, volume)

### 4. Retourne un Résumé
Exemple de résumé :

```
Résumé des références pour Quinoa:

1. Quinoa Bio Blonde - La Vie Claire
   - Prix: 4,50€/500g
   - Nutriscore: A
   - Label: Agriculture Biologique
   - Origine: Pérou

2. Quinoa Tricolore Bio - Priméal
   - Prix: 5,20€/500g
   - Nutriscore: A
   - Label: AB + Équitable
   - Origine: Bolivie

3. Quinoa Rouge Bio - Markal
   - Prix: 4,80€/500g
   - Nutriscore: A
   - Label: Agriculture Biologique
   - Origine: Équateur

4. Quinoa Blanc Bio - Celnat
   - Prix: 4,30€/500g
   - Nutriscore: A
   - Label: Agriculture Biologique
   - Origine: France
```

---

## 👀 Voir les Détails Complets

### Sur Surfer-H

1. Allez sur : https://surfer.h-company.ai
2. Connectez-vous avec votre compte Portal-H
3. Vous verrez toutes vos tâches en cours/terminées
4. Cliquez sur un `taskId` pour voir :
   - Screenshots de chaque étape
   - Actions effectuées par l'agent
   - Historique complet de navigation

### Dans les Logs du Backend

Le backend affiche les événements en temps réel :

```bash
🔍 Démarrage de la recherche des produits depuis le JSON...
📋 1 recette(s) trouvée(s)
🛒 5 ingrédient(s) à rechercher
🚀 Lancement de 5 recherches en parallèle...
✅ 5 tâches créées

🔄 [Quinoa] Statut: running
💬 [Quinoa] Message: Searching for Quinoa...
🌐 [Quinoa] Action: click
💬 [Quinoa] Message: Found 4 references for Quinoa...
🔄 [Quinoa] Statut: completed

✅ Toutes les recherches terminées!
```

---

## ⏱️ Temps d'Exécution

- **1 produit** : ~30-60 secondes
- **5 produits** (en parallèle) : ~2-3 minutes
- **10 produits** (en parallèle) : ~3-5 minutes

Le temps varie selon :
- Complexité de la recherche
- Nombre de références trouvées
- Temps de chargement du site

---

## 🛠️ Ajouter des Produits

### Pour ajouter de nouveaux produits à rechercher :

1. Ouvrez `backend/data/product_to_search.json`
2. Ajoutez une nouvelle recette ou de nouveaux ingrédients :

```json
{
  "recipes": [
    {
      "name": "Salade de quinoa aux légumes de saison",
      "ingredients": [
        // ... ingrédients existants ...
      ]
    },
    {
      "name": "Pâtes carbonara",
      "ingredients": [
        {
          "name": "Pâtes spaghetti",
          "quantity": "250g",
          "category": "Féculents"
        },
        {
          "name": "Parmesan",
          "quantity": "50g",
          "category": "Fromages"
        },
        {
          "name": "Œufs",
          "quantity": "3",
          "category": "Œufs"
        }
      ]
    }
  ]
}
```

3. Relancez la recherche avec l'endpoint

---

## 🐛 Résolution de Problèmes

### Erreur : "Fichier product_to_search.json non trouvé"

**Solution :**
- Vérifiez que le fichier existe dans `backend/data/product_to_search.json`
- Vérifiez les permissions du fichier

### Erreur : "AGP_API_KEY is not configured"

**Solution :**
- Vérifiez que `backend/.env` contient `AGP_API_KEY=votre_cle`
- Relancez le backend

### Statut "failed" pour un produit

**Raisons possibles :**
- Produit introuvable sur La Vie Claire
- Nom du produit mal orthographié
- Site temporairement inaccessible

**Solution :**
- Vérifiez le nom du produit dans le JSON
- Essayez avec un nom plus générique (ex: "quinoa" au lieu de "quinoa rouge bio")
- Consultez Surfer-H pour voir l'erreur exacte

### La Recherche Prend Trop de Temps

**Solution :**
- Réduisez le nombre de produits
- Divisez en plusieurs recherches
- Vérifiez votre connexion internet

---

## 💡 Conseils d'Utilisation

### 1. Noms de Produits Efficaces

✅ **Bien :**
- "Quinoa"
- "Pâtes spaghetti"
- "Huile d'olive"
- "Tomates"

❌ **Moins bien :**
- "Quinoa bio équitable origine Pérou" (trop spécifique)
- "Des légumes" (trop vague)

### 2. Optimiser les Recherches

- Commencez avec 1-2 produits pour tester
- Augmentez progressivement
- Surveillez les logs pour détecter les problèmes

### 3. Exploiter les Résultats

```javascript
// Exemple : Filtrer les produits par prix
const resultatsParPrix = data.results
  .sort((a, b) => extractPrice(a.result) - extractPrice(b.result));

// Exemple : Trouver les produits Bio
const produitsBio = data.results
  .filter(r => r.result.includes('Bio'));
```

---

## 📚 Intégration dans Votre Application

### Exemple Complet React

```jsx
import { useState } from 'react';

const SearchProducts = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/agp/search-from-json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleSearch} disabled={loading}>
        {loading ? 'Recherche en cours...' : 'Lancer la recherche'}
      </button>

      {results && (
        <div>
          <h2>Résultats ({results.totalIngredients} produits)</h2>
          {results.results.map((item, index) => (
            <div key={index} className="product-card">
              <h3>{item.ingredient}</h3>
              <p><strong>Quantité:</strong> {item.quantity}</p>
              <p><strong>Catégorie:</strong> {item.category}</p>
              <p><strong>Recette:</strong> {item.recipe}</p>
              <p><strong>Statut:</strong> {item.status}</p>
              <div className="result">
                <pre>{item.result}</pre>
              </div>
              <a href={`https://surfer.h-company.ai/tasks/${item.taskId}`} target="_blank">
                Voir sur Surfer-H
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

---

## 🎉 Prêt à Utiliser !

Votre endpoint de recherche est maintenant opérationnel :

```bash
curl -X POST http://localhost:5001/api/agp/search-from-json
```

Les résultats de La Vie Claire arriveront dans quelques minutes ! 🚀

Bon hackathon ! 💪
