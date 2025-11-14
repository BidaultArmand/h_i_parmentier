# 📦 Fichiers de Lancement et Installation

Ce document liste tous les fichiers nécessaires pour lancer l'application.

---

## 📄 Fichiers Créés pour le Lancement

### 1. `requirements.txt`
**Description :** Liste des dépendances Python nécessaires pour les scripts Python du projet.

**Utilisation :**
```bash
# Installer les dépendances Python
pip install -r requirements.txt
```

**Contenu :**
- openfoodfacts (API pour données produits)
- requests (HTTP requests)
- pydantic (validation de données)
- tqdm (progress bars)
- et dépendances associées

---

### 2. `GUIDE_LANCEMENT.md`
**Description :** Guide complet en français pour installer, configurer et lancer l'application.

**Sections incluses :**
- ✅ Prérequis (Node.js, Python, Git, Supabase)
- ✅ Installation initiale pas à pas
- ✅ Configuration détaillée (Supabase, .env)
- ✅ Méthodes de lancement (script automatique + manuel)
- ✅ Structure du projet
- ✅ Variables d'environnement
- ✅ Dépannage complet
- ✅ Commandes utiles

**Quand l'utiliser :** Première installation ou configuration complète

---

### 3. `DEMARRAGE_RAPIDE.md`
**Description :** Guide de démarrage rapide pour les développeurs qui connaissent déjà le projet.

**Quand l'utiliser :** Démarrage quotidien après configuration initiale

---

### 4. Fichiers .env (à créer manuellement)

#### `backend/.env`
**Création :**
```bash
cd backend
cp .env.example .env  # Si .env.example existe
# Sinon créer .env manuellement
```

**Variables requises :**
```env
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_ANON_KEY=votre_cle_anon
SUPABASE_SERVICE_KEY=votre_cle_service_role
OPENAI_API_KEY=sk-votre_cle (optionnel)
PORT=5001
FRONTEND_URL=http://localhost:5173
```

#### `frontend/.env`
**Création :**
```bash
cd frontend
cp .env.example .env  # Si .env.example existe
# Sinon créer .env manuellement
```

**Variables requises :**
```env
VITE_API_URL=http://localhost:5001/api
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon
```

**⚠️ Important :** Les variables frontend doivent commencer par `VITE_`

---

## 🚀 Ordre d'Installation Recommandé

### Étape 1 : Lire la Documentation
1. Lire `GUIDE_LANCEMENT.md` pour une installation complète
2. Ou lire `DEMARRAGE_RAPIDE.md` pour un démarrage rapide

### Étape 2 : Installer les Dépendances

```bash
# Backend (Node.js)
cd backend
npm install

# Frontend (Node.js)
cd ../frontend
npm install

# Python (si nécessaire)
cd ..
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
```

### Étape 3 : Configurer Supabase
1. Créer un projet sur https://supabase.com
2. Exécuter le script SQL : `backend/src/config/database.sql`
3. Récupérer les clés API depuis le dashboard

### Étape 4 : Créer les Fichiers .env
- Créer `backend/.env` avec les variables Supabase
- Créer `frontend/.env` avec les variables nécessaires

### Étape 5 : Lancer l'Application

```bash
# Option 1 : Script automatique (recommandé)
./start.sh

# Option 2 : Manuel (2 terminaux)
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
cd frontend && npm run dev
```

---

## 📋 Checklist d'Installation

Utilisez cette checklist pour vous assurer que tout est configuré :

### Prérequis
- [ ] Node.js 16+ installé (`node --version`)
- [ ] npm installé (`npm --version`)
- [ ] Python 3.8+ installé (optionnel, `python3 --version`)
- [ ] Git installé
- [ ] Compte Supabase créé
- [ ] Clé OpenAI (optionnel, pour fonctionnalités IA)

### Installation
- [ ] Dépendances backend installées (`npm install` dans `backend/`)
- [ ] Dépendances frontend installées (`npm install` dans `frontend/`)
- [ ] Dépendances Python installées (`pip install -r requirements.txt`)

### Configuration
- [ ] Projet Supabase créé
- [ ] Script SQL exécuté dans Supabase
- [ ] Clés Supabase récupérées
- [ ] `backend/.env` créé et configuré
- [ ] `frontend/.env` créé et configuré

### Test
- [ ] Backend démarre sans erreur (http://localhost:5001/api/health)
- [ ] Frontend démarre sans erreur (http://localhost:5173)
- [ ] Connexion à Supabase fonctionne
- [ ] L'application charge correctement

---

## 📚 Documentation Disponible

| Fichier | Description | Utilisation |
|---------|-------------|-------------|
| `README.md` | Documentation générale du projet | Vue d'ensemble |
| `GUIDE_LANCEMENT.md` | Guide complet d'installation et lancement | Installation initiale |
| `DEMARRAGE_RAPIDE.md` | Guide de démarrage rapide | Démarrage quotidien |
| `INSTALLATION.md` | Ce fichier - Liste des fichiers de lancement | Référence rapide |
| `QUICKSTART.md` | Guide de démarrage rapide en anglais | Alternative EN |
| `LANDING_PAGE_DEV_README.md` | Guide pour la page de dev | Développement frontend |

---

## 🆘 Problèmes Courants

### Les fichiers .env ne sont pas reconnus
- Vérifier que les fichiers existent dans `backend/` et `frontend/`
- Vérifier que les noms sont exactement `.env` (pas `.env.txt`)
- Redémarrer les serveurs après modification

### Les dépendances Python ne s'installent pas
- Vérifier que Python 3.8+ est installé
- Utiliser `pip3` au lieu de `pip` si nécessaire
- Activer l'environnement virtuel avant d'installer

### Le backend ne démarre pas
- Vérifier que le port 5001 n'est pas utilisé
- Vérifier que `backend/.env` contient `SUPABASE_URL` et les clés
- Vérifier les logs : `tail -f backend.log`

---

## 💡 Astuces

1. **Utilisez le script de démarrage** : `./start.sh` simplifie tout
2. **Gardez les logs ouverts** : utile pour le débogage
3. **Vérifiez les ports** : utilisez `lsof -i :5001` et `lsof -i :5173`
4. **Sauvegardez vos .env** : créez un template personnel (pas committé dans git)

---

**Pour toute question, consultez `GUIDE_LANCEMENT.md` pour plus de détails !**

