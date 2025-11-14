# 🎯 Guide Rapide : Mon Profil et Génération de Recettes Personnalisées

## 🚀 Démarrage Rapide

### 1. Lancer l'Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Backend : http://localhost:5000
Frontend : http://localhost:5174

---

## 📋 Étape 1 : Configurer Mon Profil

### Accès
Aller sur `/profile` ou cliquer sur "Mon Profil" dans le header

### Configuration

#### A) Préférences de Recettes (badges verts)
Sélectionnez vos styles de cuisine préférés :
- ✅ Rapide à préparer
- ✅ Végétarien
- ✅ Poisson & légumes
- ✅ Viande
- ✅ Cuisine du monde
- ✅ Plats familiaux
- ✅ Recettes légères

**Impact :** ChatGPT privilégiera ces types de recettes

#### B) Restrictions Alimentaires (badges rouges)
**IMPORTANT : Ces restrictions sont STRICTES et NON-NÉGOCIABLES**
- ⛔ Vegan
- ⛔ Sans gluten
- ⛔ Riche en protéines
- ⛔ Faible en calories
- ⛔ Faible en glucides
- ⛔ Faible en sucre

**Impact :** ChatGPT ne générera JAMAIS de recettes violant ces restrictions

#### C) Objectifs Culinaires (badges bleus)
Ce qui vous motive :
- 💰 Faire des économies
- ♻️ Réduire le gaspillage
- ⏱️ Gagner du temps
- 🥗 Manger équilibré
- 🌟 Découvrir de nouvelles recettes

**Impact :** ChatGPT adaptera les recettes à vos objectifs

#### D) Aliments à Exclure (champ texte)
Listez les aliments que vous n'aimez pas ou devez éviter :
```
Exemple : champignons, coriandre, fruits de mer, poivrons, produits laitiers
```

**Impact :** Ces aliments ne seront JAMAIS inclus dans les recettes

#### E) Critères de Sélection (sliders 0-100)

**Prix (0=pas cher, 100=premium)**
- 0-30 : Produits économiques, basiques
- 31-70 : Bon rapport qualité/prix
- 71-100 : Produits premium, bio, artisanaux

**Nutriscore Importance (0=faible, 100=élevée)**
- 0-30 : Pas de priorité nutritionnelle
- 31-70 : Équilibre raisonnable
- 71-100 : Focus sur les aliments sains (Nutriscore A-B)

**Bio Importance (0=faible, 100=élevée)**
- 0-30 : Pas de préférence bio
- 31-70 : Bio quand c'est possible
- 71-100 : Maximum d'ingrédients bio

**Origine Locale (0=faible, 100=élevée)**
- 0-30 : Pas d'importance
- 31-70 : Produits locaux préférés
- 71-100 : Priorité aux produits de saison et locaux

### Sauvegarde
Cliquez sur **"Sauvegarder mon profil"** en bas de page

✅ Message de confirmation : "Profil sauvegardé avec succès !"

---

## 🍳 Étape 2 : Générer des Recettes

### Accès
Aller sur `/chat` ou cliquer sur "Chat" dans le header

### Page 1 : Saisie des Préférences

#### 1. Ajuster les Compteurs
- **Nombre de repas** : 1 à 21 (défaut : 7)
  - Correspond au nombre de recettes différentes
  - Exemple : 7 = une semaine complète
  
- **Nombre de personnes** : 1 à 20 (défaut : 2)
  - Ajuste les quantités par recette
  - Exemple : 4 = famille de 4

#### 2. (Optionnel) Préciser les Préférences
Dans la zone de chat, vous pouvez ajouter des précisions pour cette semaine :

**Exemples :**
```
plats méditerranéens, produits de saison
```
```
recettes légères, sans friture
```
```
cuisine asiatique, rapide à préparer
```
```
plats réconfortants pour l'hiver
```

Si vous ne renseignez rien, ChatGPT utilisera uniquement votre profil.

#### 3. Générer
Cliquez sur **"Générer mes recettes"** ✨

⏳ ChatGPT prend environ 10-20 secondes pour :
1. Lire votre profil complet
2. Analyser vos préférences du moment
3. Générer des recettes personnalisées

---

### Page 2 : Vos Recettes

Vous êtes automatiquement redirigé vers une grille de vignettes affichant toutes vos recettes.

#### Informations Affichées
Chaque card montre :
- 📝 **Nom de la recette**
- 🌍 **Type de cuisine** (italienne, française, asiatique...)
- ⚡ **Difficulté** (easy, medium, hard)
- ⏱️ **Temps de préparation** (30 min, 1h...)
- 📄 **Description courte**

#### Actions Disponibles

**← Modifier les préférences**
- Retour à la page 1
- Permet de changer le texte ou les compteurs
- Régénère complètement les recettes

**✓ Valider et générer la liste de courses**
- Passe à la page 3
- Génère la liste complète des ingrédients
- Ajuste les quantités selon le nombre de personnes

**✗ Régénérer**
- Raccourci pour retourner à la page 1
- Même effet que "Modifier les préférences"

---

### Page 3 : Liste de Courses

Affichage de la liste de courses complète et téléchargeable.

#### Section 1 : Ingrédients à Acheter

Liste consolidée organisée par catégories :
- 🥬 **Légumes** : tomates (500g), oignons (3 unités)...
- 🥩 **Viandes & Poissons** : poulet (800g), saumon (400g)...
- 🥛 **Produits Laitiers** : lait (1L), fromage (200g)...
- 🌾 **Féculents** : riz (400g), pâtes (500g)...
- 🧂 **Épices & Condiments** : huile d'olive (100ml), ail (4 gousses)...

**Avantages :**
- ✅ Quantités consolidées (pas de doublons)
- ✅ Ajustées au nombre de personnes
- ✅ Organisées pour faciliter les courses

#### Section 2 : Détail par Recette

Liste des ingrédients pour chaque recette individuellement :
```
Recette 1 : Poulet aux Légumes
- Poulet : 400g
- Carottes : 200g
- Oignons : 1 unité
...
```

**Utilité :** Vérifier les ingrédients spécifiques à chaque plat

#### Actions Disponibles

**← Retour aux recettes**
- Revenir à la page 2 (vue des recettes)
- Permet de consulter à nouveau les recettes

**↓ Télécharger JSON**
- Télécharge le fichier `liste-courses.json`
- Format structuré pour intégration avec d'autres outils
- Contient : `recipes[]` et `shoppingList[]`

---

## 💡 Conseils d'Utilisation

### Configurez Bien Votre Profil
Plus votre profil est précis, plus les recettes seront adaptées :
- ✅ Renseignez vos restrictions (allergies, régimes)
- ✅ Listez les aliments que vous détestez
- ✅ Ajustez les sliders selon vos priorités réelles

### Utilisez le Texte Libre pour Affiner
Le champ de chat est idéal pour :
- Demandes saisonnières : "légumes d'automne", "plats d'été"
- Occasions : "repas festif", "pique-nique"
- Contraintes : "moins de 30 minutes", "sans four"
- Envies : "cuisine indienne", "plats végétariens"

### Régénérez Sans Hésiter
- Vous n'aimez pas une recette ? → Cliquez sur "Régénérer"
- ChatGPT créera de nouvelles suggestions différentes
- Aucune limite de génération

### Sauvegardez le JSON
Le fichier JSON peut être utilisé pour :
- Import dans une app de liste de courses
- Partage avec votre famille
- Archivage de vos menus de la semaine

---

## 🔍 Exemples d'Utilisation

### Exemple 1 : Famille Végétarienne Pressée

**Profil :**
- Restrictions : Végétarien
- Préférences : Rapide à préparer, Plats familiaux
- Objectifs : Gagner du temps
- Exclusions : champignons

**Page Chat :**
- Repas : 7
- Personnes : 4
- Texte : "recettes de 30 minutes maximum"

**Résultat :**
✅ 7 recettes végétariennes rapides
✅ Adaptées pour 4 personnes
✅ Sans champignons
✅ Focus sur la simplicité

---

### Exemple 2 : Régime Vegan Bio Budget Modéré

**Profil :**
- Restrictions : Vegan, Faible en sucre
- Objectifs : Manger équilibré
- Prix : 40/100 (raisonnable)
- Bio : 85/100 (important)
- Nutriscore : 90/100 (très important)

**Page Chat :**
- Repas : 5
- Personnes : 2
- Texte : "plats complets et équilibrés"

**Résultat :**
✅ 5 recettes 100% végétales
✅ Sans sucres ajoutés
✅ Ingrédients bio privilégiés
✅ Excellente valeur nutritionnelle
✅ Budget contrôlé

---

### Exemple 3 : Découverte Culinaire

**Profil :**
- Préférences : Cuisine du monde
- Objectifs : Découvrir de nouvelles recettes
- Exclusions : coriandre, piment fort

**Page Chat :**
- Repas : 10
- Personnes : 2
- Texte : "cuisines asiatiques, méditerranéennes et sud-américaines"

**Résultat :**
✅ 10 recettes internationales variées
✅ Découverte de nouvelles saveurs
✅ Sans coriandre ni piments forts
✅ Mélange de cuisines du monde

---

## ⚠️ Résolution de Problèmes

### "Erreur lors de la génération des recettes"
**Causes possibles :**
1. Backend non lancé → Vérifier que le serveur tourne sur le port 5000
2. Clé OpenAI invalide → Vérifier le fichier `backend/.env`
3. Timeout → Réessayer (parfois OpenAI met du temps)

**Solution :**
```bash
# Terminal backend
cd backend
npm run dev
```

### "Profil non sauvegardé"
**Causes possibles :**
1. Non connecté → Se reconnecter
2. Problème Supabase → Vérifier les credentials

**Solution :**
Vérifier que vous êtes bien authentifié (header devrait afficher votre email)

### "Les recettes ne respectent pas mes restrictions"
**Rare mais possible si :**
1. ChatGPT a mal interprété
2. Restriction ambiguë

**Solution :**
1. Vérifier que les restrictions sont bien sauvegardées dans le profil
2. Régénérer les recettes
3. Si le problème persiste, préciser dans le texte libre : "strictement sans gluten"

---

## 📱 Interface et Navigation

### Header (Toujours Visible)
- Logo/Nom de l'app
- Home
- Products
- Chat ← **Génération de recettes**
- Mon Profil ← **Configuration**
- Sign out

### Workflow Optimal
```
1. Se connecter
   ↓
2. Aller sur "Mon Profil" → Configurer une première fois
   ↓
3. Aller sur "Chat" → Générer les recettes de la semaine
   ↓
4. Valider → Télécharger la liste de courses
   ↓
5. (Optionnel) Modifier le profil si les recettes ne conviennent pas
```

---

## 🎯 Avantages de Cette Approche

### Personnalisation Poussée
- Chaque génération est unique et adaptée à VOUS
- Prend en compte 8+ paramètres simultanément
- Évolution possible du profil au fil du temps

### Respect des Contraintes
- Restrictions alimentaires = IMPÉRATIF (jamais violées)
- Exclusions = GARANTIES (ingrédients bannnis)
- Préférences = SUGGESTIONS (guide sans imposer)

### Gain de Temps
- Plus besoin de chercher des recettes manuellement
- Liste de courses générée automatiquement
- Export JSON pour intégrations futures

### Flexibilité
- Modification du profil à tout moment
- Régénération illimitée
- Précisions ponctuelles possibles (texte libre)

---

## 🔐 Données et Confidentialité

### Stockage
- Profil utilisateur : Base de données Supabase (sécurisée)
- Recettes générées : Non sauvegardées (volatiles)
- Historique : Non conservé (privacy-first)

### OpenAI
- Envoi : Profil + Requête actuelle
- Utilisation : Génération de recettes uniquement
- Conservation : Selon politique OpenAI (généralement 30 jours)

---

**Bon appétit et bonnes générations ! 🍽️✨**
