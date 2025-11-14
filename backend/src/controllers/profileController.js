import supabase from '../config/supabase.js';

// Récupérer le profil de l'utilisateur
export const getProfile = async (req, res) => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    res.json({
      success: true,
      data: data || null
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile'
    });
  }
};

// Créer ou mettre à jour le profil de l'utilisateur
export const upsertProfile = async (req, res) => {
  try {
    const {
      userId,
      recipePreferences,
      dietaryRestrictions,
      culinaryGoals,
      excludedFoods,
      pricePreference,
      nutriscoreImportance,
      organicImportance,
      localImportance
    } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const profileData = {
      user_id: userId,
      recipe_preferences: recipePreferences || [],
      dietary_restrictions: dietaryRestrictions || [],
      culinary_goals: culinaryGoals || [],
      excluded_foods: excludedFoods || '',
      price_preference: pricePreference !== undefined ? pricePreference : 50,
      nutriscore_importance: nutriscoreImportance !== undefined ? nutriscoreImportance : 50,
      organic_importance: organicImportance !== undefined ? organicImportance : 50,
      local_importance: localImportance !== undefined ? localImportance : 50
    };

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(profileData, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: 'Profile saved successfully',
      data
    });
  } catch (error) {
    console.error('Upsert profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save profile'
    });
  }
};

// Supprimer le profil de l'utilisateur
export const deleteProfile = async (req, res) => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Profile deleted successfully'
    });
  } catch (error) {
    console.error('Delete profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete profile'
    });
  }
};
