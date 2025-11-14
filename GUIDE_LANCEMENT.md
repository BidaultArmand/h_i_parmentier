# 📘 Guide de Lancement Complet - Smart Grocery Comparator

Guide complet pour installer, configurer et lancer l'application Smart Grocery Comparator.

---

## 📋 Table des Matières

1. [Prérequis](#prérequis)
2. [Installation Initiale](#installation-initiale)
3. [Configuration](#configuration)
4. [Lancement de l'Application](#lancement-de-lapplication)
5. [Structure du Projet](#structure-du-projet)
6. [Variables d'Environnement](#variables-denvironnement)
7. [Dépannage](#dépannage)

---

## 🔧 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

### Logiciels Requis

- **Node.js** : Version 16 ou supérieure
  - Vérifier : `node --version`
  - Installer : https://nodejs.org/

- **npm** : Généralement inclus avec Node.js
  - Vérifier : `npm --version`

- **Python** : Version 3.8 ou supérieure (optionnel pour scripts Python)
  - Vérifier : `python3 --version`
  - Installer : https://www.python.org/

- **Git** : Pour cloner le dépôt
  - Vérifier : `git --version`

### Services Externes

- **Compte Supabase** : Base de données PostgreSQL + Authentification
  - Créer un compte : https://supabase.com
  - Créer un nouveau projet

- **Clé API OpenAI** (optionnel, pour fonctionnalités IA)
  - Obtenir une clé : https://platform.openai.com/api-keys

---

## 🚀 Installation Initiale

### 1. Cloner le Dépôt

```bash
git clone <url-du-depot>
cd h_i_parmentier
```

### 2. Installer les Dépendances Backend

```bash
cd backend
npm install
cd ..
```

### 3. Installer les Dépendances Frontend

```bash
cd frontend
npm install
cd ..
```

### 4. Installer les Dépendances Python (si nécessaire)

```bash
# Créer un environnement virtuel Python (recommandé)
python3 -m venv venv

# Activer l'environnement virtuel
# Sur macOS/Linux:
source venv/bin/activate

# Sur Windows:
# venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt
```

---

## ⚙️ Configuration

### 1. Configuration Supabase

1. Aller sur https://supabase.com/dashboard
2. Créer un nouveau projet ou sélectionner un projet existant
3. Aller dans **SQL Editor**
4. Exécuter le script SQL depuis `backend/src/config/database.sql`
5. Aller dans **Settings > API** pour récupérer :
   - **Project URL** (SUPABASE_URL)
   - **anon public key** (SUPABASE_ANON_KEY)
   - **service_role key** (SUPABASE_SERVICE_KEY)

### 2. Créer le Fichier .env Backend

Créer `backend/.env` :

```env
# Supabase Configuration
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_ANON_KEY=votre_cle_anon
SUPABASE_SERVICE_KEY=votre_cle_service_role

# OpenAI Configuration (optionnel)
OPENAI_API_KEY=sk-votre_cle_openai

# Server Configuration
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# CORS (optionnel)
CORS_ORIGIN=http://localhost:5173
```

### 3. Créer le Fichier .env Frontend

Créer `frontend/.env` :

```env
# Backend API URL
VITE_API_URL=http://localhost:5001/api

# Supabase Configuration
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon
```

---

## 🎯 Lancement de l'Application

### Méthode 1 : Script Automatique (Recommandé) ⚡

Le moyen le plus simple de lancer l'application :

```bash
# Depuis la racine du projet
./start.sh
```

Ce script va :
- ✅ Vérifier et installer les dépendances si nécessaire
- ✅ Démarrer le backend sur le port 5001
- ✅ Démarrer le frontend sur le port 5173
- ✅ Afficher les logs en temps réel

**Pour arrêter :** Appuyez sur `Ctrl + C`

**Pour arrêter proprement si nécessaire :**
```bash
./stop.sh
```

### Méthode 2 : Lancement Manuel

#### Terminal 1 - Backend

```bash
cd backend
npm run dev
```

Le backend sera disponible sur : http://localhost:5001

#### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

Le frontend sera disponible sur : http://localhost:5173

---

## 📍 URLs de l'Application

Une fois l'application lancée :

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend Principal** | http://localhost:5173 | Page d'accueil de l'application |
| **Page de Dev** | http://localhost:5173/landing-dev | Page de développement pour l'équipe frontend |
| **Login** | http://localhost:5173/login | Page de connexion |
| **Signup** | http://localhost:5173/signup | Page d'inscription |
| **Products** | http://localhost:5173/products | Liste des produits (authentification requise) |
| **Basket** | http://localhost:5173/basket | Panier d'achat (authentification requise) |
| **Chat** | http://localhost:5173/chat | Assistant IA (authentification requise) |
| **Backend API** | http://localhost:5001/api | API REST |
| **Health Check** | http://localhost:5001/api/health | Vérification de l'état du backend |

---

## 📁 Structure du Projet

```
h_i_parmentier/
├── backend/                 # Serveur Node.js/Express
│   ├── src/
│   │   ├── config/          # Configuration (Supabase, DB)
│   │   ├── controllers/     # Contrôleurs API
│   │   ├── routes/          # Routes API
│   │   ├── middleware/      # Middlewares Express
│   │   ├── models/          # Modèles de données
│   │   ├── app.js           # Configuration Express
│   │   └── server.js        # Point d'entrée serveur
│   ├── package.json
│   └── .env                 # Variables d'environnement (à créer)
│
├── frontend/                # Application React/Vite
│   ├── src/
│   │   ├── components/      # Composants React
│   │   ├── pages/           # Pages de l'application
│   │   ├── contexts/        # Contextes React (Auth, etc.)
│   │   ├── services/        # Services API
│   │   ├── config/          # Configuration
│   │   ├── utils/           # Utilitaires
│   │   └── main.jsx         # Point d'entrée React
│   ├── package.json
│   └── .env                 # Variables d'environnement (à créer)
│
├── venv/                    # Environnement virtuel Python (optionnel)
├── requirements.txt         # Dépendances Python
├── start.sh                 # Script de lancement automatique
├── stop.sh                  # Script d'arrêt
├── README.md                # Documentation générale
├── GUIDE_LANCEMENT.md       # Ce fichier
└── DEMARRAGE_RAPIDE.md      # Guide de démarrage rapide
```

---

## 🔐 Variables d'Environnement

### Backend (.env)

| Variable | Description | Requis |
|----------|-------------|--------|
| `SUPABASE_URL` | URL du projet Supabase | ✅ Oui |
| `SUPABASE_ANON_KEY` | Clé publique Supabase | ✅ Oui |
| `SUPABASE_SERVICE_KEY` | Clé service Supabase | ✅ Oui |
| `OPENAI_API_KEY` | Clé API OpenAI | ⚠️ Optionnel |
| `PORT` | Port du serveur backend | ❌ Non (défaut: 5001) |
| `NODE_ENV` | Environnement (development/production) | ❌ Non |
| `FRONTEND_URL` | URL du frontend pour CORS | ❌ Non |

### Frontend (.env)

| Variable | Description | Requis |
|----------|-------------|--------|
| `VITE_API_URL` | URL de l'API backend | ✅ Oui |
| `VITE_SUPABASE_URL` | URL du projet Supabase | ✅ Oui |
| `VITE_SUPABASE_ANON_KEY` | Clé publique Supabase | ✅ Oui |

**Note :** Les variables frontend doivent commencer par `VITE_` pour être accessibles dans le code React.

---

## 🐛 Dépannage

### Port Déjà Utilisé

Si vous obtenez une erreur "Port already in use" :

```bash
# Arrêter les processus sur les ports
./stop.sh

# Ou manuellement :
# Backend (port 5001)
lsof -ti:5001 | xargs kill -9

# Frontend (port 5173)
lsof -ti:5173 | xargs kill -9
```

### Dépendances Non Installées

```bash
# Réinstaller les dépendances backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Réinstaller les dépendances frontend
cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

### Erreur de Connexion Supabase

1. Vérifier que le fichier `backend/.env` contient les bonnes clés
2. Vérifier que le script SQL a été exécuté dans Supabase
3. Vérifier que le projet Supabase est actif dans le dashboard

### Erreur CORS

1. Vérifier que `FRONTEND_URL` dans `backend/.env` correspond à l'URL du frontend
2. Vérifier que `VITE_API_URL` dans `frontend/.env` correspond à l'URL du backend

### Le Frontend Ne Communique Pas Avec le Backend

1. Vérifier que le backend tourne : http://localhost:5001/api/health
2. Vérifier `frontend/.env` : `VITE_API_URL=http://localhost:5001/api`
3. Vérifier les logs dans la console du navigateur (F12)

### Logs et Debugging

```bash
# Voir les logs du backend (si lancé avec start.sh)
tail -f backend.log

# Voir les logs du frontend (si lancé avec start.sh)
tail -f frontend.log

# Vérifier que les serveurs tournent
lsof -i :5001  # Backend
lsof -i :5173  # Frontend
```

---

## 📚 Commandes Utiles

### Backend

```bash
cd backend

# Démarrer en mode développement (avec auto-reload)
npm run dev

# Démarrer en mode production
npm start

# Voir les logs
npm run dev | tee ../backend.log
```

### Frontend

```bash
cd frontend

# Démarrer le serveur de développement
npm run dev

# Construire pour la production
npm run build

# Prévisualiser le build de production
npm run preview

# Linter le code
npm run lint
```

### Python (si nécessaire)

```bash
# Activer l'environnement virtuel
source venv/bin/activate  # macOS/Linux
# ou
venv\Scripts\activate     # Windows

# Installer les dépendances
pip install -r requirements.txt

# Lister les dépendances installées
pip list

# Mettre à jour les dépendances
pip install --upgrade -r requirements.txt
```

---

## 🎉 C'est Parti !

Votre application devrait maintenant être lancée et fonctionnelle !

### Prochaines Étapes

1. ✅ Ouvrir http://localhost:5173 dans votre navigateur
2. ✅ Tester la création de compte / connexion
3. ✅ Parcourir les produits
4. ✅ Ajouter des produits au panier
5. ✅ Tester l'assistant IA (si configuré)

### Pour l'Équipe de Développement

- **Développement Frontend** : http://localhost:5173/landing-dev
- **API Documentation** : Voir `README.md` pour les endpoints disponibles
- **Base de données** : Vérifier dans Supabase Dashboard

---

## 📞 Support

Pour toute question ou problème :

1. Consulter la section [Dépannage](#dépannage)
2. Vérifier les logs (`backend.log` et `frontend.log`)
3. Consulter `DEMARRAGE_RAPIDE.md` pour un guide plus concis

---

**Bon développement ! 🚀**

