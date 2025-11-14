# 🎯 Système de Profil et Génération de Recettes Personnalisées

## ✅ Fonctionnalités Implémentées

### 1. Page Mon Profil (`/profile`)

La page de profil permet aux utilisateurs de configurer leurs préférences alimentaires et culinaires :

#### **Sections du Profil :**

1. **Préférences de recettes** (badges verts)
   - Rapide à préparer
   - Végétarien
   - Poisson & légumes
   - Viande
   - Cuisine du monde
   - Plats familiaux
   - Recettes légères

2. **Restrictions alimentaires** (badges rouges)
   - Vegan
   - Sans gluten
   - Riche en protéines
   - Faible en calories
   - Faible en glucides
   - Faible en sucre

3. **Objectifs culinaires** (badges bleus)
   - Faire des économies
   - Réduire le gaspillage
   - Gagner du temps
   - Manger équilibré
   - Découvrir de nouvelles recettes

4. **Aliments à exclure** (champ texte libre)
   - Liste des aliments à ne JAMAIS inclure dans les recettes

5. **Critères de sélection des produits** (sliders 0-100)
   - Prix : Pas chers ↔ Qualitatifs
   - Importance du Nutri-Score : Faible ↔ Élevée
   - Importance du bio : Faible ↔ Élevée
   - Origine locale : Faible ↔ Élevée

#### **Fonctionnement :**
- Les données sont sauvegardées dans la table `user_profiles` de Supabase
- API : `GET /api/profile?userId={id}` et `POST /api/profile`
- Bouton de sauvegarde avec feedback visuel (message de succès/erreur)
- Chargement automatique du profil existant

---

### 2. Génération de Recettes avec Profil (OpenAI)

Le système de génération de recettes a été **complètement refondu** pour prendre en compte le profil utilisateur.

#### **Flux de Génération :**

```
Page Chat (/chat)
   ↓
1. Saisie des préférences (texte libre)
   ↓
2. Génération des recettes → PAGE RECETTES
   ↓
3. Validation → PAGE LISTE DE COURSES
```

#### **Données Envoyées à OpenAI (GPT-4) :**

Le prompt enrichi inclut maintenant :

**A) Profil Utilisateur (depuis la base de données) :**
- ✅ Recipe Preferences (préférences de recettes)
- ✅ Dietary Restrictions (restrictions alimentaires - **NON-NÉGOCIABLES**)
- ✅ Culinary Goals (objectifs culinaires)
- ✅ Excluded Foods (aliments à exclure - **JAMAIS INCLUS**)
- ✅ Price Preference (0-100) : influence le choix des ingrédients
- ✅ Nutriscore Importance (0-100) : priorité à la qualité nutritionnelle
- ✅ Organic Importance (0-100) : préférence pour le bio
- ✅ Local Importance (0-100) : préférence pour les produits locaux/de saison

**B) Requête Actuelle :**
- ✅ Number of Meals (nombre de recettes à générer)
- ✅ Number of People (nombre de personnes par recette)
- ✅ User Text (texte libre : "plats méditerranéens", "recettes légères", etc.)

#### **Prompts OpenAI Améliorés :**

**1. RECIPE_GENERATION_PROMPT :**
- Prompt détaillé de ~50 lignes expliquant tous les inputs
- Instructions strictes pour respecter les restrictions et exclusions
- Guidance pour adapter les recettes selon les préférences de prix, nutriscore, bio, local
- Output : JSON array de recettes avec `name`, `description`, `cuisine`, `difficulty`, `prepTime`

**2. INGREDIENTS_PROMPT :**
- Génère la liste de courses consolidée
- Ajuste les quantités selon le nombre de personnes
- Output : JSON avec `recipes[]` (détail par recette) et `shoppingList[]` (liste consolidée par catégorie)

---

### 3. Nouvelles Pages de Navigation

#### **Page 1 : Saisie (currentStep='input')**
- Interface de chat compacte (180px)
- Compteurs de repas (1-21) et personnes (1-20)
- Zone de texte auto-expandable
- Bouton "Générer mes recettes"

#### **Page 2 : Recettes (currentStep='recipes')**
- Grille de vignettes (cards) avec toutes les recettes
- Affichage : nom, description, cuisine, difficulté, temps de préparation
- **Bouton "Modifier les préférences"** (←) : retour à la page 1
- **Bouton "Valider et générer la liste de courses"** (✓)
- **Bouton "Régénérer"** (✗) : retour à la page 1 pour modifier

#### **Page 3 : Liste de Courses (currentStep='ingredients')**
- Section "Ingrédients à acheter" : liste consolidée par catégorie
- Section "Détail par recette" : ingrédients par recette
- **Bouton "Retour aux recettes"** (←)
- **Bouton "Télécharger JSON"** (↓) : export du fichier `liste-courses.json`

---

## 🔧 Modifications Techniques

### Backend (`chatController.js`)

```javascript
// Fonction generateRecipes modifiée
export const generateRecipes = async (req, res) => {
  // 1. Récupération du profil utilisateur depuis Supabase
  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  // 2. Construction du contexte enrichi
  const profileContext = `
    USER PROFILE:
    - Recipe Preferences: ${userProfile.recipe_preferences.join(', ')}
    - Dietary Restrictions: ${userProfile.dietary_restrictions.join(', ')}
    - Excluded Foods: ${userProfile.excluded_foods}
    - Price Preference: ${userProfile.price_preference}/100
    ...
  `;
  
  // 3. Envoi à OpenAI avec prompt complet
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: RECIPE_GENERATION_PROMPT },
      { role: 'user', content: profileContext + currentRequestContext }
    ],
    temperature: 0.8,
    max_tokens: 2000,
  });
}
```

### Frontend (`Chat.jsx`)

```javascript
// Navigation entre 3 étapes
const [currentStep, setCurrentStep] = useState('input');
const [ingredientsData, setIngredientsData] = useState(null);

// Passage du userId à l'API
const handleGenerateRecipes = async () => {
  const response = await axios.post(`${API_URL}/chat/generate-recipes`, {
    keyPhrases,
    numberOfMeals,
    numberOfPeople,
    userId: user?.id  // ✅ Utilisé pour charger le profil
  });
  
  setGeneratedRecipes(response.data.recipes);
  setCurrentStep('recipes');  // ✅ Navigation vers page 2
};

// Téléchargement JSON
const downloadJSON = () => {
  const dataBlob = new Blob([JSON.stringify(ingredientsData, null, 2)], 
    { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = 'liste-courses.json';
  link.click();
};
```

### Frontend (`Profile.jsx`)

```javascript
// Corrections API
const API_URL = 'http://localhost:5000/api';  // ✅ Port corrigé

// Sauvegarde du profil
const handleSave = async () => {
  await axios.post(`${API_URL}/profile`, {
    userId: user.id,
    recipePreferences,
    dietaryRestrictions,
    culinaryGoals,
    excludedFoods,
    pricePreference,
    nutriscoreImportance,
    organicImportance,
    localImportance
  });
};
```

---

## 📊 Architecture de la Base de Données

### Table `user_profiles`

```sql
CREATE TABLE user_profiles (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  recipe_preferences TEXT[] DEFAULT '{}',
  dietary_restrictions TEXT[] DEFAULT '{}',
  culinary_goals TEXT[] DEFAULT '{}',
  excluded_foods TEXT,
  price_preference INT DEFAULT 50,
  nutriscore_importance INT DEFAULT 50,
  organic_importance INT DEFAULT 50,
  local_importance INT DEFAULT 50,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);
```

---

## 🚀 Utilisation

### 1. Configuration du Profil
1. Aller sur `/profile`
2. Sélectionner vos préférences (badges)
3. Renseigner les aliments à exclure
4. Ajuster les sliders selon vos priorités
5. Cliquer sur "Sauvegarder mon profil"

### 2. Génération de Recettes
1. Aller sur `/chat`
2. Ajuster le nombre de repas et de personnes
3. (Optionnel) Écrire un texte pour affiner : "plats méditerranéens", "recettes rapides"
4. Cliquer sur "Générer mes recettes"
5. **OpenAI génère automatiquement des recettes personnalisées en fonction de votre profil**

### 3. Validation et Liste de Courses
1. Sur la page Recettes, cliquer sur "Valider et générer la liste de courses"
2. Consulter la liste consolidée par catégorie
3. Télécharger le JSON si nécessaire

---

## 🎯 Avantages du Système

✅ **Personnalisation Avancée :**
- ChatGPT connaît vos restrictions alimentaires (vegan, sans gluten, etc.)
- Prend en compte vos aliments détestés
- Adapte les recettes à votre budget et vos priorités

✅ **Expérience Utilisateur Fluide :**
- Navigation claire entre 3 étapes
- Possibilité de revenir en arrière à tout moment
- Export JSON pour intégration avec d'autres outils

✅ **Génération Intelligente :**
- Recettes variées et équilibrées
- Respect strict des contraintes (allergies, régimes)
- Adaptation aux objectifs (économies, temps, découverte)

---

## 🔍 Exemples de Comportements

### Exemple 1 : Utilisateur Vegan
**Profil :**
- Dietary Restrictions: ["Vegan"]
- Excluded Foods: "miel, produits laitiers"

**Résultat :**
- ✅ Toutes les recettes sont 100% végétales
- ✅ Aucun ingrédient d'origine animale
- ✅ Pas de miel dans les recettes

### Exemple 2 : Utilisateur Budget Serré
**Profil :**
- Price Preference: 15/100 (produits pas chers)
- Culinary Goals: ["Faire des économies"]

**Résultat :**
- ✅ Recettes avec ingrédients économiques (pâtes, riz, légumes de saison)
- ✅ Évite les produits premium
- ✅ Focus sur le rapport qualité/prix

### Exemple 3 : Utilisateur Santé
**Profil :**
- Nutriscore Importance: 90/100
- Organic Importance: 80/100
- Dietary Restrictions: ["Faible en sucre", "Riche en protéines"]

**Résultat :**
- ✅ Recettes équilibrées avec bons nutriscores
- ✅ Suggestions d'ingrédients bio
- ✅ Évite les sucres ajoutés
- ✅ Recettes riches en protéines (légumineuses, tofu, poisson)

---

## 📝 Notes Importantes

⚠️ **Restrictions Alimentaires = CONTRAINTES STRICTES**
- ChatGPT est explicitement instruit de JAMAIS violer les restrictions
- Les aliments exclus ne doivent JAMAIS apparaître dans les recettes

✅ **Préférences = SUGGESTIONS**
- Les "Recipe Preferences" guident ChatGPT mais ne sont pas absolues
- Permet de la variété même avec des préférences

🔄 **Mise à Jour en Temps Réel**
- Chaque modification du profil est prise en compte à la prochaine génération
- Pas besoin de se déconnecter/reconnecter

---

## 🛠️ Prochaines Améliorations Possibles

- [ ] Historique des recettes générées
- [ ] Notation des recettes (favoris)
- [ ] Export PDF de la liste de courses
- [ ] Intégration avec APIs de supermarchés pour les prix réels
- [ ] Suggestions de substitutions d'ingrédients
- [ ] Calcul des valeurs nutritionnelles par recette
- [ ] Mode "meal prep" pour optimiser la préparation

---

**Développé par Tom - Branche `tom`**
**Date : Novembre 2025**
