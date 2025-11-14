-- Table pour les profils utilisateurs
-- À exécuter dans Supabase SQL Editor

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- 1. Préférences de recettes (tableau de strings)
  recipe_preferences TEXT[] DEFAULT '{}',
  
  -- 2. Restrictions alimentaires (tableau de strings)
  dietary_restrictions TEXT[] DEFAULT '{}',
  
  -- 3. Objectifs culinaires (tableau de strings)
  culinary_goals TEXT[] DEFAULT '{}',
  
  -- 4. Aliments à exclure (texte libre)
  excluded_foods TEXT DEFAULT '',
  
  -- 5. Critères de sélection des produits (valeurs de 0 à 100)
  price_preference INTEGER DEFAULT 50 CHECK (price_preference >= 0 AND price_preference <= 100),
  nutriscore_importance INTEGER DEFAULT 50 CHECK (nutriscore_importance >= 0 AND nutriscore_importance <= 100),
  organic_importance INTEGER DEFAULT 50 CHECK (organic_importance >= 0 AND organic_importance <= 100),
  local_importance INTEGER DEFAULT 50 CHECK (local_importance >= 0 AND local_importance <= 100),
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Politique de sécurité RLS (Row Level Security)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent lire leur propre profil
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Les utilisateurs peuvent créer leur propre profil
CREATE POLICY "Users can create own profile"
  ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Les utilisateurs peuvent supprimer leur propre profil
CREATE POLICY "Users can delete own profile"
  ON user_profiles
  FOR DELETE
  USING (auth.uid() = user_id);

-- Commentaires pour la documentation
COMMENT ON TABLE user_profiles IS 'Profils utilisateurs avec préférences alimentaires et critères de sélection';
COMMENT ON COLUMN user_profiles.recipe_preferences IS 'Préférences de recettes : rapide, végétarien, poisson, viande, etc.';
COMMENT ON COLUMN user_profiles.dietary_restrictions IS 'Restrictions alimentaires : vegan, sans gluten, etc.';
COMMENT ON COLUMN user_profiles.culinary_goals IS 'Objectifs culinaires : économies, réduire gaspillage, etc.';
COMMENT ON COLUMN user_profiles.excluded_foods IS 'Aliments à exclure en texte libre';
COMMENT ON COLUMN user_profiles.price_preference IS 'Préférence prix : 0=pas cher, 100=qualitatif';
COMMENT ON COLUMN user_profiles.nutriscore_importance IS 'Importance du Nutri-Score : 0=faible, 100=élevée';
COMMENT ON COLUMN user_profiles.organic_importance IS 'Importance du bio : 0=faible, 100=élevée';
COMMENT ON COLUMN user_profiles.local_importance IS 'Importance de l''origine locale : 0=faible, 100=élevée';
