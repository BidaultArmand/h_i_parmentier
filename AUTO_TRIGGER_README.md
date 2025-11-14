# 🔄 Déclenchement Automatique de la Recherche AGP

Le système de surveillance automatique détecte les modifications du fichier JSON et lance automatiquement la recherche sur La Vie Claire.

---

## 🎯 Comment ça Fonctionne

### 1. Surveillance Active

Dès que le backend démarre, un **watcher** surveille le fichier :
```
backend/data/product_to_search.json
```

### 2. Détection Automatique

Quand le fichier est **modifié** ou **écrasé** :
- ✅ Le watcher détecte le changement
- ✅ Attend 1 seconde (debounce) pour s'assurer que l'écriture est complète
- ✅ Valide la structure JSON
- ✅ Lance automatiquement la recherche AGP

### 3. Recherche en Arrière-Plan

La recherche se lance automatiquement :
- 📋 Lit les recettes et ingrédients
- 🚀 Lance les recherches en parallèle sur La Vie Claire
- 💾 Sauvegarde les résultats dans `backend/data/agpresp/`
- 📝 Affiche les logs dans le terminal du backend

---

## 🚀 Utilisation

### Démarrer le Serveur

```bash
cd backend
npm run dev
```

Vous verrez :
```
🚀 Server is running on port 5001
📡 API available at http://localhost:5001/api
🏥 Health check: http://localhost:5001/api/health

👁️  Démarrage de la surveillance du fichier product_to_search.json...
📂 Chemin surveillé: /path/to/backend/data/product_to_search.json
✅ Surveillance active! Le système détectera automatiquement les modifications.
```

### Déclencher une Recherche

**Méthode 1 : Modifier le fichier manuellement**

1. Ouvrez `backend/data/product_to_search.json`
2. Modifiez ou ajoutez des ingrédients
3. Sauvegardez le fichier
4. La recherche se lance automatiquement ! 🎉

**Méthode 2 : Via votre workflow amont**

Si votre workflow écrase le fichier JSON :
1. Le workflow écrit le nouveau JSON
2. Le watcher détecte le changement
3. La recherche se lance automatiquement

---

## 📊 Logs en Temps Réel

Quand une modification est détectée, vous verrez dans le terminal :

```
🔔 Événement détecté: change sur product_to_search.json

═══════════════════════════════════════════════════════════════
🚀 DÉCLENCHEMENT AUTOMATIQUE DE LA RECHERCHE AGP
═══════════════════════════════════════════════════════════════
📅 Date: 14/11/2025 15:30:45
📂 Fichier: /path/to/backend/data/product_to_search.json
───────────────────────────────────────────────────────────────

📋 1 recette(s) détectée(s)
🛒 5 ingrédient(s) à rechercher

🔍 Lancement de la recherche sur La Vie Claire...

🔍 Démarrage de la recherche automatique...
📋 1 recette(s) trouvée(s)
🛒 5 ingrédient(s) à rechercher
🚀 Lancement de 5 recherches en parallèle...
✅ 5 tâches créées

🔄 [Quinoa] Statut: running
🌐 [Quinoa] Action: goto
💬 [Quinoa] Message: Searching for Quinoa...
...

✅ Toutes les recherches terminées!
💾 Sauvegarde des résultats dans des fichiers...
✅ Fichier global sauvegardé: recherche_2025-11-14T15-30-45.txt
   ✅ quinoa_2025-11-14T15-30-45.txt
   ✅ huile_d_olive_2025-11-14T15-30-45.txt
   ...

💾 6 fichier(s) sauvegardé(s) dans backend/data/agpresp

═══════════════════════════════════════════════════════════════
✅ RECHERCHE AUTOMATIQUE TERMINÉE
═══════════════════════════════════════════════════════════════
📊 Résultats: 5 produit(s) recherché(s)
💾 Fichiers sauvegardés dans: backend/data/agpresp/
📁 Fichier global: recherche_2025-11-14T15-30-45.txt
───────────────────────────────────────────────────────────────
```

---

## 🛡️ Protections Intégrées

### 1. Debounce (1 seconde)
Évite les déclenchements multiples si le fichier est modifié plusieurs fois rapidement.

### 2. Verrou de Traitement
Si une recherche est en cours, les nouvelles modifications sont ignorées jusqu'à la fin.

### 3. Validation JSON
Le fichier est validé avant de lancer la recherche :
- Structure `recipes` array obligatoire
- Au moins 1 recette
- Au moins 1 ingrédient

### 4. Gestion des Erreurs
Si une erreur survient, elle est loggée mais le watcher continue de fonctionner.

---

## 📁 Structure des Fichiers Générés

Les fichiers sont automatiquement créés dans `backend/data/agpresp/` :

```
backend/data/agpresp/
├── recherche_2025-11-14T15-30-45.txt  ← Fichier global (AUTOMATIQUE)
├── quinoa_2025-11-14T15-30-45.txt
├── legumes_de_saison_2025-11-14T15-30-45.txt
├── huile_d_olive_2025-11-14T15-30-45.txt
└── ...
```

Les fichiers générés automatiquement sont marqués `(AUTOMATIQUE)` dans le titre.

---

## 🔧 Intégration avec Votre Workflow

### Workflow Recommandé

```
1. Votre système génère une liste de courses
   ↓
2. Écrit/écrase backend/data/product_to_search.json
   ↓
3. Le watcher détecte le changement
   ↓
4. Recherche AGP lancée automatiquement
   ↓
5. Résultats sauvegardés dans backend/data/agpresp/
   ↓
6. Votre système lit les résultats depuis les fichiers .txt
```

### Exemple de Script Python (Workflow Amont)

```python
import json
import time

# 1. Générer la liste de courses
courses = {
    "recipes": [
        {
            "name": "Ma recette",
            "ingredients": [
                {"name": "Quinoa", "quantity": "100g", "category": "Céréales"},
                {"name": "Tomates", "quantity": "200g", "category": "Légumes"}
            ]
        }
    ]
}

# 2. Écrire le fichier JSON (déclenche automatiquement la recherche)
with open('backend/data/product_to_search.json', 'w', encoding='utf-8') as f:
    json.dump(courses, f, ensure_ascii=False, indent=2)

print("✅ Fichier écrit, recherche AGP déclenchée automatiquement!")

# 3. Attendre que la recherche se termine (optionnel)
time.sleep(180)  # ~3 minutes pour 5-10 produits

# 4. Lire les résultats
import glob
latest_file = max(glob.glob('backend/data/agpresp/recherche_*.txt'), key=os.path.getctime)
with open(latest_file, 'r', encoding='utf-8') as f:
    resultats = f.read()
    print(resultats)
```

---

## ⚙️ Configuration

### Désactiver le Watcher

Si vous voulez désactiver le déclenchement automatique, commentez cette ligne dans `backend/src/server.js` :

```javascript
// startWatching();
```

### Modifier le Délai de Debounce

Dans `backend/src/services/agpWatcher.js`, ligne ~49 :

```javascript
debounceTimer = setTimeout(() => {
  handleFileChange();
}, 1000);  // ← Modifier ce délai (en millisecondes)
```

---

## 🐛 Résolution de Problèmes

### La recherche ne se déclenche pas

**Vérifications :**
1. Le backend est bien démarré (`npm run dev`)
2. Le fichier `backend/data/product_to_search.json` existe
3. Le fichier JSON est valide (tester avec `node -c`)
4. Vérifier les logs du backend

### Déclenchements Multiples

Si le watcher se déclenche plusieurs fois :
- Augmenter le délai de debounce (ligne ~49 de `agpWatcher.js`)
- Vérifier qu'aucun autre processus ne modifie le fichier

### Erreur "Une recherche est déjà en cours"

C'est normal ! Le watcher ignore les modifications tant qu'une recherche est en cours.
Attendez la fin de la recherche actuelle.

---

## 📊 Surveillance des Résultats

### En Temps Réel (Terminal Backend)

Les logs s'affichent en direct dans le terminal où tourne le backend.

### Fichiers de Résultats

Consultez `backend/data/agpresp/` pour voir tous les fichiers générés.

### Via Surfer-H

Visitez https://surfer.h-company.ai pour voir les screenshots et détails complets.

---

## 💡 Conseils d'Utilisation

### 1. Tester avec Peu de Produits d'Abord

Commencez avec 1-2 produits pour tester le système :

```json
{
  "recipes": [{
    "name": "Test",
    "ingredients": [
      {"name": "Quinoa", "quantity": "100g", "category": "Céréales"}
    ]
  }]
}
```

### 2. Surveiller les Logs

Gardez un terminal ouvert avec les logs du backend pour voir l'activité.

### 3. Automatiser la Lecture des Résultats

Créez un script qui lit automatiquement le dernier fichier généré :

```bash
# Lire le fichier global le plus récent
ls -t backend/data/agpresp/recherche_*.txt | head -1 | xargs cat
```

---

## 🎉 Prêt à Utiliser !

Le système est maintenant configuré. Dès que vous modifiez le fichier JSON, la recherche se lance automatiquement !

**Test Simple :**

```bash
# Terminal 1 : Démarrer le backend
cd backend && npm run dev

# Terminal 2 : Modifier le JSON (déclenche la recherche)
echo '{
  "recipes": [{
    "name": "Test",
    "ingredients": [{"name": "Quinoa", "quantity": "100g", "category": "Céréales"}]
  }]
}' > backend/data/product_to_search.json

# Regarder les logs dans le Terminal 1 !
```

Bon hackathon ! 🚀
