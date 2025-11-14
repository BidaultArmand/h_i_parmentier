import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import Slider from '../components/ui/slider';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // États pour les différentes sections
  const [recipePreferences, setRecipePreferences] = useState([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState([]);
  const [culinaryGoals, setCulinaryGoals] = useState([]);
  const [excludedFoods, setExcludedFoods] = useState('');
  const [pricePreference, setPricePreference] = useState(50);
  const [nutriscoreImportance, setNutriscoreImportance] = useState(50);
  const [organicImportance, setOrganicImportance] = useState(50);
  const [localImportance, setLocalImportance] = useState(50);

  // Options disponibles
  const recipeOptions = [
    'Rapide à préparer',
    'Végétarien',
    'Poisson & légumes',
    'Viande',
    'Cuisine du monde',
    'Plats familiaux',
    'Recettes légères'
  ];

  const restrictionOptions = [
    'Vegan',
    'Sans gluten',
    'Riche en protéines',
    'Faible en calories',
    'Faible en glucides',
    'Faible en sucre'
  ];

  const goalOptions = [
    'Faire des économies',
    'Réduire le gaspillage',
    'Gagner du temps',
    'Manger équilibré',
    'Découvrir de nouvelles recettes'
  ];

  // Charger le profil existant
  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/profile?userId=${user.id}`);
      if (response.data.success && response.data.data) {
        const profile = response.data.data;
        setRecipePreferences(profile.recipe_preferences || []);
        setDietaryRestrictions(profile.dietary_restrictions || []);
        setCulinaryGoals(profile.culinary_goals || []);
        setExcludedFoods(profile.excluded_foods || '');
        setPricePreference(profile.price_preference || 50);
        setNutriscoreImportance(profile.nutriscore_importance || 50);
        setOrganicImportance(profile.organic_importance || 50);
        setLocalImportance(profile.local_importance || 50);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.post(`${API_URL}/profile`, {
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

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Profil sauvegardé avec succès !' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde du profil' });
    } finally {
      setSaving(false);
    }
  };

  const toggleOption = (option, list, setList) => {
    if (list.includes(option)) {
      setList(list.filter(item => item !== option));
    } else {
      setList([...list, option]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-600">Chargement du profil...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mon Profil</h1>
        <p className="text-gray-600">
          Personnalisez vos préférences pour des recommandations adaptées à vos besoins.
        </p>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <div className="space-y-8">
        {/* 1. Préférences de recettes */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">1 • Vos préférences de recettes</h2>
          <p className="text-sm text-gray-600 mb-4">
            Vos repas seront automatiquement adaptés selon vos goûts. Modifiables à tout moment.
          </p>
          <div className="flex flex-wrap gap-2">
            {recipeOptions.map(option => (
              <button
                key={option}
                onClick={() => toggleOption(option, recipePreferences, setRecipePreferences)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  recipePreferences.includes(option)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </Card>

        {/* 2. Restrictions alimentaires */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">2 • Vos restrictions alimentaires</h2>
          <div className="flex flex-wrap gap-2">
            {restrictionOptions.map(option => (
              <button
                key={option}
                onClick={() => toggleOption(option, dietaryRestrictions, setDietaryRestrictions)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  dietaryRestrictions.includes(option)
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </Card>

        {/* 3. Objectifs culinaires */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">3 • Vos objectifs culinaires</h2>
          <p className="text-sm text-gray-600 mb-4">Ce qui vous motive au quotidien.</p>
          <div className="flex flex-wrap gap-2">
            {goalOptions.map(option => (
              <button
                key={option}
                onClick={() => toggleOption(option, culinaryGoals, setCulinaryGoals)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  culinaryGoals.includes(option)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </Card>

        {/* 4. Aliments à exclure */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">4 • Aliments à exclure</h2>
          <p className="text-sm text-gray-600 mb-4">
            Y a-t-il des aliments que vous n'aimez pas ou à éviter ?
          </p>
          <textarea
            value={excludedFoods}
            onChange={(e) => setExcludedFoods(e.target.value)}
            placeholder="Exemple : champignons, coriandre, fruits de mer, poivrons, produits laitiers…"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            rows="4"
          />
        </Card>

        {/* 5. Critères de sélection */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">5 • Vos critères de sélection des produits</h2>
          <p className="text-sm text-gray-600 mb-6">
            Ajustez vos préférences en fonction de votre style de vie.
          </p>
          <div className="space-y-6">
            <Slider
              label="Prix"
              value={pricePreference}
              onChange={setPricePreference}
              leftLabel="Produits pas chers"
              rightLabel="Produits qualitatifs"
            />
            <Slider
              label="Importance du Nutri-Score"
              value={nutriscoreImportance}
              onChange={setNutriscoreImportance}
              leftLabel="Faible"
              rightLabel="Élevée"
            />
            <Slider
              label="Importance du bio"
              value={organicImportance}
              onChange={setOrganicImportance}
              leftLabel="Faible"
              rightLabel="Élevée"
            />
            <Slider
              label="Origine locale"
              value={localImportance}
              onChange={setLocalImportance}
              leftLabel="Faible"
              rightLabel="Élevée"
            />
          </div>
        </Card>
      </div>

      {/* Bouton de sauvegarde */}
      <div className="mt-8 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {saving ? 'Sauvegarde...' : 'Sauvegarder mon profil'}
        </Button>
      </div>
    </div>
  );
};

export default Profile;
