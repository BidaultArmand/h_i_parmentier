# 🚀 Démarrage Rapide - Smart Grocery Comparator

## ⚡ Lancement Ultra Rapide (Recommandé)

### Option 1 : Script automatique (1 commande)

```bash
./start.sh
```

Ce script va :
- ✅ Installer les dépendances si nécessaire
- ✅ Démarrer le backend sur http://localhost:5001
- ✅ Démarrer le frontend sur http://localhost:5173
- ✅ Afficher les logs en direct

**Pour arrêter :** Appuyez sur `Ctrl + C`

---

### Option 2 : Arrêt manuel si besoin

Si des processus restent bloqués :

```bash
./stop.sh
```

Ceci arrête tous les serveurs proprement.

---

## 📍 URLs Importantes

Une fois l'application lancée :

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | Page d'accueil |
| **Page de Dev** | http://localhost:5173/landing-dev | Page blanche pour l'équipe frontend |
| **Login** | http://localhost:5173/login | Connexion |
| **Signup** | http://localhost:5173/signup | Inscription |
| **Products** | http://localhost:5173/products | Produits (auth requise) |
| **Chat** | http://localhost:5173/chat | Assistant IA (auth requise) |
| **Backend API** | http://localhost:5001/api | API REST |
| **Health Check** | http://localhost:5001/api/health | Santé du backend |

---

## 🛠️ Méthode Manuelle (2 Terminaux)

Si vous préférez contrôler chaque service séparément :

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```
✅ Backend disponible sur http://localhost:5001

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```
✅ Frontend disponible sur http://localhost:5173

---

## 🔧 Premiers Pas

### 1. Installation initiale (première fois uniquement)

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### 2. Configuration (vérifier les fichiers .env)

**Backend (.env)** :
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
OPENAI_API_KEY=your_openai_key
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
PORT=5001
```

**Frontend (.env)** :
```env
VITE_API_URL=http://localhost:5001/api
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## 🎯 Pour l'Équipe Frontend

Donnez ces instructions à votre équipe :

```bash
# 1. Lancer le projet (depuis la racine)
./start.sh

# 2. Ouvrir dans le navigateur
http://localhost:5173/landing-dev

# 3. Modifier le fichier
frontend/src/pages/LandingPageDev.jsx
```

Le header avec connexion est automatiquement présent !

Voir le guide complet : `LANDING_PAGE_DEV_README.md`

---

## 🐛 Dépannage

### Erreur "Port already in use"

```bash
# Option 1 : Utiliser le script d'arrêt
./stop.sh

# Option 2 : Arrêt manuel
# Backend (port 5001)
lsof -ti:5001 | xargs kill -9

# Frontend (port 5173)
lsof -ti:5173 | xargs kill -9
```

### Les dépendances ne sont pas installées

```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

### Le backend ne se connecte pas à Supabase

Vérifiez que le fichier `backend/.env` contient les bonnes clés Supabase.

### Le frontend ne communique pas avec le backend

1. Vérifiez que le backend tourne sur http://localhost:5001
2. Vérifiez `frontend/.env` : `VITE_API_URL=http://localhost:5001/api`

---

## 📋 Commandes Utiles

```bash
# Voir les logs du backend
tail -f backend.log

# Voir les logs du frontend
tail -f frontend.log

# Redémarrer nodemon (dans le terminal backend)
rs

# Vérifier que les serveurs tournent
lsof -i :5001  # Backend
lsof -i :5173  # Frontend

# Nettoyer les node_modules et réinstaller
cd backend && rm -rf node_modules && npm install
cd frontend && rm -rf node_modules && npm install
```

---

## 🎉 C'est Parti !

Votre application devrait maintenant tourner !

**Développement Landing Page** → http://localhost:5173/landing-dev

Bon hackathon ! 💪
