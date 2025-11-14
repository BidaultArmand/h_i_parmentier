# Guide de Développement - Landing Page pour l'Équipe Frontend

## 🎯 Objectif

Cette page blanche est configurée pour que votre équipe puisse développer la nouvelle landing page en parallèle du reste du projet, avec tous les outils et le système d'authentification déjà en place.

---

## 🚀 Démarrage Rapide

### 1. Lancer le projet

```bash
cd frontend
npm install
npm run dev
```

Le projet sera accessible sur: **http://localhost:5173**

### 2. Accéder à votre page de développement

URL de travail: **http://localhost:5173/landing-dev**

---

## 📁 Structure du Projet

### Votre fichier de travail principal
```
frontend/src/pages/LandingPageDev.jsx
```

C'est ici que vous allez développer la landing page. Le fichier contient:
- ✅ Un template de base avec des exemples
- ✅ Des commentaires pour vous guider
- ✅ Une structure responsive avec Tailwind CSS
- ✅ Le header avec connexion utilisateur (déjà intégré automatiquement)

### Autres ressources disponibles

```
frontend/
├── src/
│   ├── components/
│   │   ├── Header.jsx              # Header avec connexion (déjà utilisé)
│   │   ├── ui/                     # Composants UI réutilisables
│   │   │   ├── button.jsx
│   │   │   ├── input.jsx
│   │   │   ├── card.jsx
│   │   │   └── badge.jsx
│   │   └── ProductCard.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx         # Contexte d'authentification
│   ├── pages/
│   │   └── LandingPageDev.jsx      # 👈 VOTRE FICHIER DE TRAVAIL
│   └── services/
│       └── api.js                  # Appels API (si besoin)
```

---

## 🎨 Styling avec Tailwind CSS

### Palette de couleurs du projet

Le projet utilise une palette personnalisée définie dans `tailwind.config.js`:

```jsx
// Couleurs principales
<div className="bg-accent-green">         {/* #157C6B - Vert teal */}
<div className="bg-accent-light-green">   {/* #B2E3C2 - Vert clair */}

// Couleurs d'accentuation
<div className="bg-accent-red">           {/* #E54242 - Rouge */}
<div className="bg-accent-pink">          {/* #F8CACA - Rose */}
<div className="bg-accent-peach">         {/* #FFB3A7 - Pêche */}

// Utilisation avec des variantes
<button className="bg-accent-green hover:bg-accent-green/80 text-white">
  Cliquez-moi
</button>
```

### Classes utiles

```jsx
// Container responsive
<div className="container mx-auto px-4">

// Grille responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Flexbox centré
<div className="flex items-center justify-center">

// Card avec shadow
<div className="bg-white rounded-lg shadow-lg p-6">

// Gradient background
<div className="bg-gradient-to-br from-white to-gray-50">
```

---

## 🧩 Composants UI Disponibles

### Button (Bouton)

```jsx
import { Button } from '../components/ui/button';

// Variantes disponibles
<Button variant="default">Bouton par défaut</Button>
<Button variant="outline">Bouton outline</Button>
<Button variant="ghost">Bouton ghost</Button>

// Tailles
<Button size="sm">Petit</Button>
<Button size="default">Normal</Button>
<Button size="lg">Grand</Button>
```

### Card (Carte)

```jsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Titre de la carte</CardTitle>
    <CardDescription>Description de la carte</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Contenu de la carte</p>
  </CardContent>
</Card>
```

### Input (Champ de texte)

```jsx
import { Input } from '../components/ui/input';

<Input type="text" placeholder="Entrez votre texte" />
<Input type="email" placeholder="Email" />
```

### Badge

```jsx
import { Badge } from '../components/ui/badge';

<Badge>Nouveau</Badge>
<Badge variant="secondary">Tag</Badge>
```

---

## 🔗 Icons avec Lucide React

Le projet utilise **Lucide React** pour les icônes.

### Comment utiliser les icônes

```jsx
import { ShoppingCart, User, Search, Star, Heart } from 'lucide-react';

<ShoppingCart className="w-6 h-6 text-accent-green" />
<User size={24} />
<Search className="w-5 h-5" strokeWidth={1.5} />
```

### Icônes populaires disponibles

- `ShoppingCart`, `ShoppingBag`
- `User`, `Users`
- `Star`, `Heart`, `ThumbsUp`
- `Search`, `Filter`
- `ChevronRight`, `ArrowRight`
- `Check`, `X`, `AlertCircle`
- `Menu`, `X` (pour navigation mobile)

Voir toutes les icônes: https://lucide.dev/icons/

---

## 🔐 Authentification (si besoin)

Le système d'authentification est déjà en place et le **Header avec connexion est automatiquement inclus** en haut de votre page.

### Accéder aux informations utilisateur (optionnel)

Si vous avez besoin de savoir si un utilisateur est connecté dans votre page:

```jsx
import { useAuth } from '../contexts/AuthContext';

const LandingPageDev = () => {
  const { user, signOut } = useAuth();

  // user sera null si non connecté, sinon contiendra les infos utilisateur
  console.log(user?.email);

  return (
    <div>
      {user ? (
        <p>Bienvenue {user.email}</p>
      ) : (
        <p>Vous n'êtes pas connecté</p>
      )}
    </div>
  );
};
```

**Note:** Le header gère déjà l'affichage des boutons de connexion/déconnexion, vous n'avez pas besoin de le refaire dans votre page.

---

## 🛠️ Bonnes Pratiques

### 1. Structure responsive

Utilisez les breakpoints Tailwind:
```jsx
<div className="text-sm md:text-base lg:text-lg xl:text-xl">
  Texte responsive
</div>
```

- `sm:` → ≥640px (mobile large)
- `md:` → ≥768px (tablette)
- `lg:` → ≥1024px (desktop)
- `xl:` → ≥1280px (large desktop)

### 2. Accessibilité

```jsx
// Toujours ajouter un alt aux images
<img src="/image.jpg" alt="Description de l'image" />

// Utiliser des balises sémantiques
<section>
  <h2>Titre de section</h2>
  <p>Contenu...</p>
</section>

// Boutons accessibles
<button aria-label="Fermer le menu">
  <X />
</button>
```

### 3. Performance

```jsx
// Images optimisées
<img src="/image.jpg" loading="lazy" alt="..." />

// Lazy loading de composants lourds (si besoin)
import { lazy, Suspense } from 'react';
const HeavyComponent = lazy(() => import('./HeavyComponent'));

<Suspense fallback={<div>Chargement...</div>}>
  <HeavyComponent />
</Suspense>
```

---

## 🔄 Navigation & Liens

### Liens internes (React Router)

```jsx
import { Link } from 'react-router-dom';

<Link to="/products" className="text-accent-green hover:underline">
  Voir les produits
</Link>
```

### Liens externes

```jsx
<a href="https://example.com" target="_blank" rel="noopener noreferrer">
  Lien externe
</a>
```

---

## 📊 Appels API (si besoin)

Si vous devez récupérer des données depuis le backend:

```jsx
import { useState, useEffect } from 'react';
import api from '../services/api';

const LandingPageDev = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.getProducts();
        setProducts(response.data);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div>Chargement...</div>;

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
};
```

---

## 🎯 Exemple de Section Hero

```jsx
<section className="relative bg-gradient-to-br from-accent-green to-teal-700 text-white py-20">
  <div className="container mx-auto px-4">
    <div className="max-w-3xl mx-auto text-center">
      <h1 className="text-5xl md:text-6xl font-bold mb-6">
        Comparez vos Courses Intelligemment
      </h1>
      <p className="text-xl md:text-2xl mb-8 text-white/90">
        Économisez du temps et de l'argent avec notre comparateur intelligent
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button size="lg" variant="secondary">
          Commencer
        </Button>
        <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
          En savoir plus
        </Button>
      </div>
    </div>
  </div>
</section>
```

---

## 🐛 Debug & Outils

### React Developer Tools
Installez l'extension Chrome/Firefox pour debugger vos composants React.

### Console Browser
```jsx
console.log('Debug:', variable);
console.table(arrayOfObjects);
```

### Tailwind CSS IntelliSense
Installez l'extension VS Code pour l'autocomplétion Tailwind.

---

## ✅ Checklist Avant de Merger

- [ ] La page est responsive sur mobile, tablette et desktop
- [ ] Les images ont des attributs `alt`
- [ ] Pas d'erreurs dans la console
- [ ] Les couleurs respectent la palette du projet
- [ ] Les liens fonctionnent correctement
- [ ] Le code est propre et commenté si nécessaire

---

## 📞 Questions ?

Si vous avez des questions ou blocages:
1. Consultez les fichiers existants dans `/frontend/src/pages/` pour des exemples
2. Regardez les composants dans `/frontend/src/components/`
3. Demandez au reste de l'équipe !

---

## 🎉 C'est Parti !

Votre page de développement est prête à l'URL:
👉 **http://localhost:5173/landing-dev**

Le Header avec connexion est déjà en place. À vous de créer une landing page incroyable ! 🚀

Bon hackathon ! 💪
