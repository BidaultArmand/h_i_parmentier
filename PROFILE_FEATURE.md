# Fonctionnalité "Mon Profil"

## 📋 Description

La page "Mon Profil" permet aux utilisateurs de personnaliser leurs préférences alimentaires et culinaires. Ces préférences seront utilisées pour adapter automatiquement les recommandations de recettes et de produits.

## 🎯 Fonctionnalités

### 1. Préférences de recettes
Les utilisateurs peuvent sélectionner leurs types de recettes préférés :
- Rapide à préparer
- Végétarien
- Poisson & légumes
- Viande
- Cuisine du monde
- Plats familiaux
- Recettes légères

### 2. Restrictions alimentaires
Support des restrictions suivantes :
- Vegan
- Sans gluten
- Riche en protéines
- Faible en calories
- Faible en glucides
- Faible en sucre

### 3. Objectifs culinaires
Les utilisateurs peuvent définir leurs motivations :
- Faire des économies
- Réduire le gaspillage
- Gagner du temps
- Manger équilibré
- Découvrir de nouvelles recettes

### 4. Aliments à exclure
Champ texte libre pour spécifier les aliments à éviter (champignons, coriandre, fruits de mer, etc.)

### 5. Critères de sélection des produits
Sliders pour ajuster les priorités (0-100) :
- **Prix** : produits pas cher ↔ produits qualitatifs
- **Nutri-Score** : importance faible ↔ élevée
- **Bio** : importance faible ↔ élevée
- **Origine locale** : importance faible ↔ élevée

## 🚀 Installation

### 1. Base de données (Supabase)

Exécutez le script SQL dans Supabase SQL Editor :

```bash
backend/config/user_profiles.sql
```

Ce script va :
- Créer la table `user_profiles`
- Configurer les politiques RLS (Row Level Security)
- Créer les index nécessaires
- Ajouter les triggers pour `updated_at`

### 2. Backend

Les fichiers suivants ont été créés :
- `backend/src/controllers/profileController.js` - Gestion du profil
- `backend/src/routes/profileRoutes.js` - Routes API
- Routes ajoutées dans `backend/src/app.js`

**Endpoints API :**
- `GET /api/profile?userId=xxx` - Récupérer le profil
- `POST /api/profile` - Créer/Mettre à jour le profil
- `DELETE /api/profile?userId=xxx` - Supprimer le profil

### 3. Frontend

Les fichiers suivants ont été créés :
- `frontend/src/pages/Profile.jsx` - Page du profil
- `frontend/src/components/ui/slider.jsx` - Composant slider réutilisable
- Route ajoutée dans `frontend/src/App.jsx`
- Lien ajouté dans `frontend/src/components/Header.jsx`

## 🔧 Utilisation

1. **Accès** : Connectez-vous et cliquez sur "Mon Profil" dans le header
2. **Configuration** : Sélectionnez vos préférences dans les 5 sections
3. **Sauvegarde** : Cliquez sur "Sauvegarder mon profil"
4. **Modification** : Revenez à tout moment pour modifier vos préférences

## 📊 Structure de données

```typescript
interface UserProfile {
  id: UUID;
  user_id: UUID;
  recipe_preferences: string[];        // Ex: ["Rapide à préparer", "Végétarien"]
  dietary_restrictions: string[];      // Ex: ["Vegan", "Sans gluten"]
  culinary_goals: string[];           // Ex: ["Faire des économies"]
  excluded_foods: string;             // Ex: "champignons, coriandre"
  price_preference: number;           // 0-100
  nutriscore_importance: number;      // 0-100
  organic_importance: number;         // 0-100
  local_importance: number;           // 0-100
  created_at: timestamp;
  updated_at: timestamp;
}
```

## 🔒 Sécurité

- **Row Level Security (RLS)** activé sur la table `user_profiles`
- Les utilisateurs ne peuvent accéder qu'à leur propre profil
- Validation des données côté backend

## 🎨 Design

- Interface responsive
- Boutons interactifs avec feedback visuel
- Sliders personnalisés pour les critères
- Messages de confirmation après sauvegarde
- Couleurs différentes par section (vert, rouge, bleu)

## 🔄 Prochaines étapes

Pour utiliser ces préférences dans les recommandations :

1. **Dans le Chat AI** : Passer le profil dans le contexte du prompt
2. **Dans les recettes** : Filtrer selon les restrictions et préférences
3. **Dans les produits** : Trier selon les critères de sélection
4. **Score personnalisé** : Calculer un score basé sur les préférences de l'utilisateur

## 📝 Exemple d'intégration dans le Chat

```javascript
// Dans chatController.js
const { data: profile } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('user_id', userId)
  .single();

const profileContext = profile ? `
Profil utilisateur :
- Préférences : ${profile.recipe_preferences.join(', ')}
- Restrictions : ${profile.dietary_restrictions.join(', ')}
- Objectifs : ${profile.culinary_goals.join(', ')}
- À exclure : ${profile.excluded_foods}
` : '';

// Ajouter profileContext au prompt système
```

## 🐛 Debugging

Si le profil ne se charge pas :
1. Vérifiez que le script SQL a été exécuté dans Supabase
2. Vérifiez que les politiques RLS sont actives
3. Vérifiez que l'utilisateur est authentifié
4. Consultez la console du navigateur pour les erreurs

## ✅ Tests

Pour tester :
1. Créez un compte ou connectez-vous
2. Allez sur "Mon Profil"
3. Remplissez les différentes sections
4. Cliquez sur "Sauvegarder"
5. Rafraîchissez la page pour vérifier que les données sont conservées
