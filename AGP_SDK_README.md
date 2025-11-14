# 🤖 Guide d'Utilisation du SDK AGP (Agent Platform)

Ce guide vous montre comment utiliser le SDK AGP de H Company dans votre projet Smart Grocery Comparator.

---

## 📋 Table des Matières

1. [Configuration Initiale](#configuration-initiale)
2. [Test Autonome (Script Node.js)](#test-autonome-script-nodejs)
3. [Utilisation via l'API REST](#utilisation-via-lapi-rest)
4. [Exemples d'Utilisation](#exemples-dutilisation)
5. [Résolution de Problèmes](#résolution-de-problèmes)

---

## 🔧 Configuration Initiale

### Étape 1 : Installer le SDK (déjà fait)

```bash
npm install @h-company/agp-sdk-js
```

### Étape 2 : Obtenir une Clé API

1. Visitez **Portal-H** : https://portal.h-company.ai
2. Créez un compte ou connectez-vous
3. Générez une clé API pour votre projet
4. Copiez la clé générée

### Étape 3 : Configurer la Clé API

Ouvrez le fichier `backend/.env` et remplacez :

```env
AGP_API_KEY=your_agp_api_key_here
```

Par votre vraie clé API :

```env
AGP_API_KEY=agp_sk_xxxxxxxxxxxxxxxxx
```

---

## 🧪 Test Autonome (Script Node.js)

### Lancer le script de test

Un script de test autonome a été créé pour vérifier que le SDK fonctionne correctement.

```bash
cd backend
node src/testAgp.js
```

### Ce que fait le script

1. ✅ Vérifie que la clé API est configurée
2. ✅ Initialise l'agent AGP
3. ✅ Crée une tâche de recherche de casques anti-bruit
4. ✅ Écoute les événements en temps réel
5. ✅ Affiche les résultats dans le terminal

### Résultat attendu

```
🧪 Test du SDK AGP - Démarrage...

🔑 Authentification avec AGP...
✅ Agent initialisé avec succès!

🚀 Lancement de la tâche de test...
📋 Objectif: Rechercher des écouteurs anti-bruit et résumer les 3 meilleurs résultats

✅ Tâche créée avec l'ID: task_xxxxx

👂 Écoute des événements en temps réel...

📡 [StatusChangeEvent] running
💬 Message: Searching for noise-cancelling headphones...
🌐 Action web: click
...

✅ Tâche terminée avec succès!
🎉 Test du SDK AGP réussi!
```

---

## 🌐 Utilisation via l'API REST

Le SDK est également accessible via des endpoints REST. Le backend doit être lancé :

```bash
cd backend
npm run dev
```

### Endpoints Disponibles

#### 1. Test Simple (Tâche Prédéfinie)

**Endpoint :** `POST http://localhost:5001/api/agp/test`

**Description :** Teste le SDK avec une tâche de recherche de casques anti-bruit.

**Exemple avec cURL :**

```bash
curl -X POST http://localhost:5001/api/agp/test \
  -H "Content-Type: application/json"
```

**Exemple avec Postman :**
- Méthode: `POST`
- URL: `http://localhost:5001/api/agp/test`
- Headers: `Content-Type: application/json`

**Réponse :**

```json
{
  "success": true,
  "message": "AGP test completed successfully",
  "taskId": "task_xxxxx",
  "events": [...],
  "note": "Check Surfer-H for detailed results"
}
```

---

#### 2. Exécuter une Tâche Personnalisée

**Endpoint :** `POST http://localhost:5001/api/agp/run`

**Description :** Exécute une tâche personnalisée avec votre propre objectif.

**Body (JSON) :**

```json
{
  "objective": "Find the best budget laptops under $800",
  "startUrl": "https://google.com"
}
```

**Exemple avec cURL :**

```bash
curl -X POST http://localhost:5001/api/agp/run \
  -H "Content-Type: application/json" \
  -d '{
    "objective": "Find the best budget laptops under $800",
    "startUrl": "https://google.com"
  }'
```

**Réponse :**

```json
{
  "success": true,
  "message": "Task completed successfully",
  "taskId": "task_xxxxx",
  "objective": "Find the best budget laptops under $800",
  "result": "Top budget laptops...",
  "eventsCount": 45,
  "events": [...],
  "note": "Check Surfer-H for full details"
}
```

---

#### 3. Exécuter Plusieurs Tâches en Parallèle

**Endpoint :** `POST http://localhost:5001/api/agp/batch`

**Description :** Exécute plusieurs tâches simultanément.

**Body (JSON) :**

```json
{
  "tasks": [
    {
      "objective": "Check weather for Paris",
      "startUrl": "https://weather.com"
    },
    {
      "objective": "Look up restaurants in Paris",
      "startUrl": "https://google.com"
    }
  ]
}
```

**Exemple avec cURL :**

```bash
curl -X POST http://localhost:5001/api/agp/batch \
  -H "Content-Type: application/json" \
  -d '{
    "tasks": [
      { "objective": "Check weather for Paris", "startUrl": "https://weather.com" },
      { "objective": "Look up restaurants in Paris", "startUrl": "https://google.com" }
    ]
  }'
```

**Réponse :**

```json
{
  "success": true,
  "message": "All tasks completed successfully",
  "tasksCount": 2,
  "results": [
    {
      "id": "task_xxxxx",
      "objective": "Check weather for Paris",
      "status": "completed",
      "result": "Weather data..."
    },
    ...
  ]
}
```

---

#### 4. Comparer les Prix de Produits

**Endpoint :** `POST http://localhost:5001/api/agp/shop`

**Description :** Compare les prix de plusieurs produits.

**Body (JSON) :**

```json
{
  "products": [
    "iPhone 15 Pro",
    "Samsung Galaxy S24",
    "Google Pixel 8"
  ]
}
```

**Exemple avec cURL :**

```bash
curl -X POST http://localhost:5001/api/agp/shop \
  -H "Content-Type: application/json" \
  -d '{
    "products": ["iPhone 15 Pro", "Samsung Galaxy S24", "Google Pixel 8"]
  }'
```

**Réponse :**

```json
{
  "success": true,
  "message": "Shopping comparison completed",
  "productsCount": 3,
  "results": [
    {
      "product": "iPhone 15 Pro",
      "taskId": "task_xxxxx",
      "result": "Price comparison results..."
    },
    ...
  ]
}
```

---

## 💡 Exemples d'Utilisation

### Exemple 1 : Recherche de Produits Alimentaires

```bash
curl -X POST http://localhost:5001/api/agp/run \
  -H "Content-Type: application/json" \
  -d '{
    "objective": "Find organic pasta brands with best reviews",
    "startUrl": "https://amazon.com"
  }'
```

### Exemple 2 : Comparaison de Supermarchés

```bash
curl -X POST http://localhost:5001/api/agp/batch \
  -H "Content-Type: application/json" \
  -d '{
    "tasks": [
      {
        "objective": "Find milk prices at Carrefour",
        "startUrl": "https://carrefour.fr"
      },
      {
        "objective": "Find milk prices at Auchan",
        "startUrl": "https://auchan.fr"
      }
    ]
  }'
```

### Exemple 3 : Recherche Multi-Produits

```bash
curl -X POST http://localhost:5001/api/agp/shop \
  -H "Content-Type: application/json" \
  -d '{
    "products": [
      "Nutella 750g",
      "Carte d'\''Or vanilla ice cream",
      "Barilla spaghetti 500g"
    ]
  }'
```

---

## 🔍 Voir les Résultats

### Option 1 : Dans le Terminal

Les logs apparaissent directement dans le terminal où le backend tourne :

```bash
cd backend
npm run dev

# Vous verrez les logs comme:
📡 [StatusChangeEvent] running
💬 Message: Searching for...
🌐 Action web: click
```

### Option 2 : Sur Surfer-H

Visitez **Surfer-H** : https://surfer.h-company.ai

- Connectez-vous avec votre compte Portal-H
- Visualisez vos tâches en temps réel
- Consultez l'historique complet des actions

### Option 3 : Dans la Réponse API

Les événements sont inclus dans la réponse JSON :

```json
{
  "success": true,
  "events": [
    {
      "type": "ChatMessageEvent",
      "timestamp": "2025-11-14T10:30:00.000Z",
      "data": { "content": "Found 3 results..." }
    }
  ]
}
```

---

## 🐛 Résolution de Problèmes

### Erreur : "AGP_API_KEY is not configured"

**Problème :** La clé API n'est pas définie ou invalide.

**Solution :**
1. Vérifiez `backend/.env`
2. Assurez-vous que `AGP_API_KEY=agp_sk_xxxxx` est présent
3. Redémarrez le backend : `npm run dev`

### Erreur : "Cannot find module '@h-company/agp-sdk-js'"

**Problème :** Le SDK n'est pas installé.

**Solution :**
```bash
cd backend
npm install @h-company/agp-sdk-js
```

### Erreur 401 : "Unauthorized"

**Problème :** Clé API invalide ou expirée.

**Solution :**
1. Vérifiez votre clé sur Portal-H
2. Générez une nouvelle clé si nécessaire
3. Mettez à jour `backend/.env`

### La Tâche ne se Termine Jamais

**Problème :** La tâche est bloquée ou trop complexe.

**Solution :**
1. Vérifiez Surfer-H pour voir l'état de la tâche
2. Simplifiez l'objectif
3. Changez l'URL de départ

### Erreur : "Request timeout"

**Problème :** La tâche prend trop de temps.

**Solution :**
- Les tâches complexes peuvent prendre plusieurs minutes
- Augmentez le timeout si nécessaire
- Vérifiez Surfer-H pour le statut

---

## 📚 Ressources

- **Documentation Officielle** : https://docs.h-company.ai/agp-sdk-js
- **Portal-H** : https://portal.h-company.ai
- **Surfer-H** : https://surfer.h-company.ai
- **Support** : support@h-company.ai

---

## 🎯 Prochaines Étapes

1. ✅ Testez le SDK avec le script autonome
2. ✅ Testez les endpoints API avec Postman/cURL
3. ✅ Consultez Surfer-H pour voir les résultats
4. 💡 Intégrez le SDK dans votre application frontend
5. 🚀 Utilisez-le pour votre hackathon !

---

## 🎉 Exemple Complet d'Intégration

Voici comment intégrer AGP dans votre flux de comparaison de produits :

### Backend (agpController.js)

```javascript
// Rechercher un produit avec AGP
const task = await agent.run(
  `Find the best prices for ${productName} across major retailers`,
  { startUrl: 'https://google.com' }
);

task.onChatMessage((message) => {
  // Envoyer le résultat au frontend en temps réel
  io.emit('agp-update', {
    product: productName,
    result: message.data.content
  });
});

await task.waitForCompletion();
```

### Frontend (React)

```javascript
// Appeler l'API AGP
const searchProduct = async (productName) => {
  const response = await fetch('http://localhost:5001/api/agp/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      objective: `Find prices for ${productName}`,
      startUrl: 'https://google.com'
    })
  });

  const data = await response.json();
  console.log('AGP Result:', data.result);
};
```

Bon hackathon ! 🚀
