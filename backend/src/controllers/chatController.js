import dotenv from 'dotenv';
import OpenAI from 'openai';
import supabase from '../config/supabase.js';

// Ensure environment variables are loaded
dotenv.config();

// Initialize OpenAI only if API key is provided
let openai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here') {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} else {
  console.warn('⚠️  OpenAI API key not configured. Chat features will be disabled.');
}

const SYSTEM_PROMPT = `You are a smart grocery shopping assistant. Help users create shopping lists and add products to their baskets.

When a user asks for products:
1. Suggest relevant products based on their needs
2. Provide product names, estimated prices, and why they're good choices
3. If a basket is selected, add products directly to that basket. If no basket is selected, ask if they want to create a new basket.

When a basket is active, you should:
- Reference the basket by name in your responses
- Add products directly to the basket when the user requests it
- Help optimize the basket contents
- Compare prices for items in the basket

Format your responses in a friendly, conversational way. When suggesting products, use this JSON format at the end of your message:
{
  "action": "suggest_products" | "create_basket" | "add_to_basket",
  "products": [{"name": "Product Name", "category": "Category", "quantity": 1}],
  "basketName": "Optional basket name",
  "basketId": "Basket ID if adding to existing basket"
}

Keep suggestions practical and based on common grocery items.`;

const SUMMARIZE_PROMPT = `You are an assistant that extracts key preferences from user text about food.
Extract 3-5 key phrases that capture the main preferences.
Return ONLY a JSON array of strings, nothing else.
Example: ["repas frais", "cuisine espagnole", "nourriture enfants"]`;

const RECIPE_GENERATION_PROMPT = `You are a professional chef assistant. Generate creative and practical recipes based on user preferences.

INPUTS YOU WILL RECEIVE:
1. User Profile (from their settings):
   - Recipe Preferences: Array of recipe styles they prefer (e.g., "Rapide à préparer", "Végétarien", "Cuisine du monde")
   - Dietary Restrictions: Array of dietary requirements (e.g., "Vegan", "Sans gluten", "Faible en calories")
   - Culinary Goals: Array of user motivations (e.g., "Faire des économies", "Gagner du temps", "Manger équilibré")
   - Excluded Foods: String listing foods to NEVER include in recipes
   - Price Preference: Number 0-100 (0=cheap products, 100=premium quality products)
   - Nutriscore Importance: Number 0-100 (how much they care about nutritional quality)
   - Organic Importance: Number 0-100 (preference for organic products)
   - Local Importance: Number 0-100 (preference for local/seasonal products)

2. Current Request (USER'S IMMEDIATE NEEDS - HIGHEST PRIORITY):
   - Number of Meals: How many different recipes to generate
   - Number of People: How many servings per recipe
   - User Text: Specific preferences or requests for this week (e.g., "plats méditerranéens", "recettes légères")

CONSTRAINT HIERARCHY (PRIORITY ORDER):

🔴 LEVEL 1 - ABSOLUTE RESTRICTIONS (NEVER VIOLATE):
   - Dietary Restrictions from profile: These are NON-NEGOTIABLE health/ethical requirements (e.g., vegetarian, vegan, gluten-free, allergies)
   - Excluded Foods from profile: These are FORBIDDEN ingredients that must NEVER appear in any recipe
   - Extreme slider values: Price at 0 = use only very cheap ingredients, Price at 100 = only premium ingredients
   - Extreme slider values: Nutriscore at 100 = only A/B nutriscore recipes, Nutriscore at 0 = ignore nutrition
   
   ⚠️ CRITICAL: If User Text conflicts with Level 1 restrictions, ADAPT the request to respect the restriction.
   Example: User is vegetarian + asks for "spaghetti bolognese" → Generate "Spaghetti Bolognese Végétarienne" with lentils/soy

🟡 LEVEL 2 - STRONG PREFERENCES (PRIORITIZE):
   - User Text from current request: This reflects the user's IMMEDIATE desire for THIS WEEK
   - This takes precedence over general profile preferences
   - Be creative to satisfy this request while respecting Level 1 restrictions
   
🟢 LEVEL 3 - BACKGROUND PREFERENCES (GUIDE):
   - Recipe Preferences from profile: General styles to favor (e.g., "Rapide", "Cuisine du monde")
   - Culinary Goals from profile: Overall motivations (e.g., "Faire des économies", "Manger équilibré")
   - Moderate slider values (30-70): Use as general guidance
   - Organic/Local importance: Mention in descriptions when high (>70)

DECISION LOGIC:
1. Start with User Text (Level 2) as the primary inspiration
2. Check Level 1 restrictions and modify the recipe if needed to comply
3. Use Level 3 preferences to refine choices when Level 2 is ambiguous
4. If User Text is vague/empty, rely more heavily on Level 3 preferences

EXAMPLES:
- User is vegetarian (Level 1) + wants "burger" (Level 2) → "Burger Végétarien au Steak de Haricots Noirs"
- User excludes "poisson" (Level 1) + wants "cuisine méditerranéenne" (Level 2) → Focus on légumes grillés, pâtes, couscous
- User wants "recettes rapides" (Level 2) + profile says "Faire des économies" (Level 3) → Quick AND cheap recipes
- Price slider at 10/100 (Level 1) + wants "plats gastronomiques" (Level 2) → Gastronomic recipes with cheap ingredients (creative)

Return ONLY a valid JSON array of recipe objects with this exact structure:
[
  {
    "name": "Recipe Name",
    "description": "Brief description (max 60 chars)",
    "cuisine": "Cuisine type",
    "difficulty": "easy|medium|hard",
    "prepTime": "30 min",
    "imageSearch": "simple search term for food image (e.g., 'pasta carbonara', 'grilled chicken')"
  }
]

Make recipes varied, balanced, and appropriate for the number of meals and people requested.`;

const INGREDIENTS_PROMPT = `You are a meal planning assistant. Generate a complete shopping list from the given recipes.
Return ONLY a valid JSON object with this exact structure:
{
  "recipes": [
    {
      "name": "Recipe Name",
      "ingredients": [
        {"name": "Ingredient", "quantity": "200g", "category": "Légumes"}
      ]
    }
  ],
  "shoppingList": [
    {"name": "Ingredient", "totalQuantity": "400g", "category": "Légumes"}
  ]
}
Consolidate duplicate ingredients and adjust quantities for the number of people.`;

export const chat = async (req, res) => {
  try {
    const { message, conversationHistory = [], basketId } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Check if OpenAI is available
    if (!openai) {
      return res.status(503).json({
        success: false,
        error: 'OpenAI service is not configured. Please add OPENAI_API_KEY to your .env file.',
        message: 'AI chat is currently unavailable. Please configure the OpenAI API key to use this feature.'
      });
    }

    // Get available products from database for context
    const { data: products } = await supabase
      .from('products')
      .select('name, category, price, store')
      .limit(50);

    const productsContext = products ?
      `\n\nAvailable products in database: ${products.map(p => `${p.name} (${p.category}, $${p.price})`).join(', ')}` :
      '';

    // Get basket context if basketId is provided
    let basketContext = '';
    if (basketId) {
      const { data: basket } = await supabase
        .from('baskets')
        .select('name')
        .eq('id', basketId)
        .single();

      const { data: basketItems } = await supabase
        .from('basket_items')
        .select(`
          *,
          products (name, category, price, store)
        `)
        .eq('basket_id', basketId);

      if (basket) {
        basketContext = `\n\nCurrent basket context:
- Basket name: ${basket.name}
- Basket ID: ${basketId}
${basketItems && basketItems.length > 0 ? `- Current items in basket: ${basketItems.map(item => `${item.products.name} (x${item.quantity})`).join(', ')}` : '- Basket is currently empty'}
When the user asks to add products, use this basket ID (${basketId}) to add items.`;
      }
    }

    // Build conversation with context
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT + productsContext + basketContext },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const assistantMessage = completion.choices[0].message.content;

    // Try to parse action from response
    let action = null;
    let actionData = null;

    const jsonMatch = assistantMessage.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        actionData = JSON.parse(jsonMatch[0]);
        action = actionData.action;
      } catch (e) {
        console.log('No valid JSON action found');
      }
    }

    res.json({
      success: true,
      message: assistantMessage.replace(/\{[\s\S]*\}/, '').trim(),
      action: actionData,
      conversationHistory: [
        ...conversationHistory,
        { role: 'user', content: message },
        { role: 'assistant', content: assistantMessage }
      ]
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process chat message'
    });
  }
};

export const createBasketFromChat = async (req, res) => {
  try {
    const { userId, basketName, products } = req.body;

    if (!userId || !products || products.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'User ID and products are required'
      });
    }

    // Create new basket
    const { data: basket, error: basketError } = await supabase
      .from('baskets')
      .insert({
        user_id: userId,
        name: basketName || 'AI Shopping List'
      })
      .select()
      .single();

    if (basketError) throw basketError;

    // Find or create products and add to basket
    const basketItems = [];

    for (const product of products) {
      // Try to find existing product
      let { data: existingProduct } = await supabase
        .from('products')
        .select('*')
        .ilike('name', `%${product.name}%`)
        .limit(1)
        .single();

      // If not found, create a placeholder (you can enhance this)
      if (!existingProduct) {
        const { data: newProduct } = await supabase
          .from('products')
          .insert({
            name: product.name,
            category: product.category || 'General',
            price: product.price || 0,
            store: 'To be determined',
            description: 'Added via AI assistant'
          })
          .select()
          .single();

        existingProduct = newProduct;
      }

      if (existingProduct) {
        // Add to basket
        const { data: item } = await supabase
          .from('basket_items')
          .insert({
            basket_id: basket.id,
            product_id: existingProduct.id,
            quantity: product.quantity || 1
          })
          .select()
          .single();

        basketItems.push(item);
      }
    }

    res.json({
      success: true,
      message: 'Basket created successfully',
      data: {
        basket,
        items: basketItems
      }
    });
  } catch (error) {
    console.error('Create basket error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create basket'
    });
  }
};

// NEW ENDPOINT 1: Summarize user text into key phrases
export const summarizePreferences = async (req, res) => {
  try {
    if (!openai) {
      return res.status(503).json({
        success: false,
        error: 'Chat service is not available. OpenAI API key is not configured.'
      });
    }

    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: SUMMARIZE_PROMPT },
        { role: 'user', content: text }
      ],
      temperature: 0.3,
      max_tokens: 200,
    });

    const responseText = completion.choices[0].message.content.trim();
    
    // Parse JSON response
    let keyPhrases = [];
    try {
      keyPhrases = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse key phrases:', e);
      // Fallback: split by lines or commas
      keyPhrases = responseText.split(/[\n,]/).map(s => s.trim().replace(/^["-]/, '').replace(/["']$/, '')).filter(Boolean);
    }

    res.json({
      success: true,
      keyPhrases
    });
  } catch (error) {
    console.error('Summarize error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to summarize preferences'
    });
  }
};

// NEW ENDPOINT 2: Generate recipes based on context
export const generateRecipes = async (req, res) => {
  try {
    if (!openai) {
      return res.status(503).json({
        success: false,
        error: 'Chat service is not available. OpenAI API key is not configured.'
      });
    }

    const { keyPhrases = [], numberOfMeals, numberOfPeople, userId } = req.body;

    if (!numberOfMeals || !numberOfPeople) {
      return res.status(400).json({
        success: false,
        error: 'Number of meals and people are required'
      });
    }

    // Fetch user profile from database
    let userProfile = null;
    if (userId) {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (data && !error) {
        userProfile = data;
      }
    }

    // Build comprehensive context with clear hierarchy
    let level1Restrictions = [];
    let level2Priority = '';
    let level3Preferences = [];
    
    if (userProfile) {
      // LEVEL 1: Absolute restrictions
      if (userProfile.dietary_restrictions?.length > 0) {
        level1Restrictions.push(`🔴 DIETARY RESTRICTIONS (MANDATORY): ${userProfile.dietary_restrictions.join(', ')}`);
      }
      if (userProfile.excluded_foods && userProfile.excluded_foods.trim() !== '') {
        level1Restrictions.push(`🔴 EXCLUDED FOODS (FORBIDDEN): ${userProfile.excluded_foods}`);
      }
      
      // Check for extreme slider values (0-20 or 80-100 are considered absolute)
      if (userProfile.price_preference <= 20) {
        level1Restrictions.push(`🔴 PRICE CONSTRAINT: Only use very cheap, budget-friendly ingredients (Price=${userProfile.price_preference}/100)`);
      } else if (userProfile.price_preference >= 80) {
        level1Restrictions.push(`🔴 PRICE CONSTRAINT: Only use premium, high-quality ingredients (Price=${userProfile.price_preference}/100)`);
      }
      
      if (userProfile.nutriscore_importance >= 80) {
        level1Restrictions.push(`🔴 NUTRITION CONSTRAINT: Only recipes with Nutriscore A or B, very healthy (Nutriscore=${userProfile.nutriscore_importance}/100)`);
      } else if (userProfile.nutriscore_importance <= 20) {
        level1Restrictions.push(`🔴 NUTRITION CONSTRAINT: User doesn't care about nutritional balance (Nutriscore=${userProfile.nutriscore_importance}/100)`);
      }
      
      // LEVEL 3: Background preferences
      if (userProfile.recipe_preferences?.length > 0) {
        level3Preferences.push(`Recipe Style Preferences: ${userProfile.recipe_preferences.join(', ')}`);
      }
      if (userProfile.culinary_goals?.length > 0) {
        level3Preferences.push(`Culinary Goals: ${userProfile.culinary_goals.join(', ')}`);
      }
      
      // Moderate slider values go to Level 3
      if (userProfile.price_preference > 20 && userProfile.price_preference < 80) {
        level3Preferences.push(`Price Preference: ${userProfile.price_preference}/100`);
      }
      if (userProfile.nutriscore_importance > 20 && userProfile.nutriscore_importance < 80) {
        level3Preferences.push(`Nutriscore Importance: ${userProfile.nutriscore_importance}/100`);
      }
      if (userProfile.organic_importance > 30) {
        level3Preferences.push(`Organic Preference: ${userProfile.organic_importance}/100${userProfile.organic_importance >= 70 ? ' (HIGH - mention organic when possible)' : ''}`);
      }
      if (userProfile.local_importance > 30) {
        level3Preferences.push(`Local/Seasonal Preference: ${userProfile.local_importance}/100${userProfile.local_importance >= 70 ? ' (HIGH - prioritize seasonal products)' : ''}`);
      }
    }

    // LEVEL 2: Current request (highest priority for creative direction)
    if (keyPhrases.length > 0) {
      level2Priority = `🟡 USER'S IMMEDIATE REQUEST (PRIMARY INSPIRATION): "${keyPhrases.join(', ')}"`;
    } else {
      level2Priority = `🟡 USER'S IMMEDIATE REQUEST: No specific theme provided - use profile preferences`;
    }

    // Build the final prompt with clear hierarchy
    let profileContext = '';
    
    if (level1Restrictions.length > 0) {
      profileContext += `\n🔴 LEVEL 1 - ABSOLUTE RESTRICTIONS (NEVER VIOLATE):\n${level1Restrictions.map(r => `  ${r}`).join('\n')}\n`;
    } else {
      profileContext += `\n🔴 LEVEL 1 - ABSOLUTE RESTRICTIONS: None\n`;
    }
    
    profileContext += `\n${level2Priority}\n`;
    
    if (level3Preferences.length > 0) {
      profileContext += `\n🟢 LEVEL 3 - BACKGROUND PREFERENCES (GUIDE WHEN POSSIBLE):\n${level3Preferences.map(p => `  - ${p}`).join('\n')}\n`;
    } else {
      profileContext += `\n🟢 LEVEL 3 - BACKGROUND PREFERENCES: None specified\n`;
    }

    const userPrompt = `${profileContext}

TASK:
- Generate ${numberOfMeals} different recipes for ${numberOfPeople} person(s)
- Start with Level 2 (user's immediate request) as primary inspiration
- Adapt creatively to satisfy Level 1 restrictions if there's a conflict
- Use Level 3 to guide style and details

CRITICAL: If the user's request conflicts with Level 1 restrictions, adapt the request intelligently.
Example: Vegetarian + wants "burger" → Create a delicious vegetarian burger
Example: Excludes fish + wants "Mediterranean" → Focus on vegetables, pasta, legumes

Return ONLY the JSON array, nothing else.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: RECIPE_GENERATION_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0].message.content.trim();
    
    // Parse JSON response
    let recipes = [];
    try {
      // Remove markdown code blocks if present
      const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      recipes = JSON.parse(cleanedText);
    } catch (e) {
      console.error('Failed to parse recipes:', e);
      console.error('Response was:', responseText);
      return res.status(500).json({
        success: false,
        error: 'Failed to parse recipe response'
      });
    }

    res.json({
      success: true,
      recipes
    });
  } catch (error) {
    console.error('Generate recipes error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate recipes'
    });
  }
};

// NEW ENDPOINT 3: Generate ingredients JSON from recipes
export const generateIngredients = async (req, res) => {
  try {
    if (!openai) {
      return res.status(503).json({
        success: false,
        error: 'Chat service is not available. OpenAI API key is not configured.'
      });
    }

    const { recipes, numberOfPeople } = req.body;

    if (!recipes || recipes.length === 0 || !numberOfPeople) {
      return res.status(400).json({
        success: false,
        error: 'Recipes and number of people are required'
      });
    }

    const recipesText = recipes.map(r => `- ${r.name}: ${r.description}`).join('\n');

    const userPrompt = `Generate a complete shopping list for these recipes for ${numberOfPeople} person(s):

${recipesText}

Return a detailed JSON with ingredients per recipe and a consolidated shopping list.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: INGREDIENTS_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 3000,
    });

    const responseText = completion.choices[0].message.content.trim();
    
    // Parse JSON response
    let ingredients = {};
    try {
      const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      ingredients = JSON.parse(cleanedText);
    } catch (e) {
      console.error('Failed to parse ingredients:', e);
      console.error('Response was:', responseText);
      return res.status(500).json({
        success: false,
        error: 'Failed to parse ingredients response'
      });
    }

    res.json({
      success: true,
      ingredients
    });
  } catch (error) {
    console.error('Generate ingredients error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate ingredients'
    });
  }
};

// NEW ENDPOINT 4: Generate recipe images using DALL-E for multiple recipes
export const generateRecipeImages = async (req, res) => {
  try {
    if (!openai) {
      return res.status(503).json({
        success: false,
        error: 'OpenAI service is not available.'
      });
    }

    const { recipes } = req.body;

    if (!recipes || recipes.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Recipes array is required'
      });
    }

    console.log(`Generating ${recipes.length} images with DALL-E...`);

    // Generate images for all recipes in parallel
    const imagePromises = recipes.map(async (recipe) => {
      try {
        // Simple, concise prompt for faster generation
        const prompt = `Food photo: ${recipe.name}`;

        const response = await openai.images.generate({
          model: "dall-e-2", // DALL-E 2: faster and cheaper ($0.02 vs $0.04)
          prompt: prompt,
          n: 1,
          size: "512x512", // Smaller size for speed and cost
        });

        return {
          recipeName: recipe.name,
          imageUrl: response.data[0].url,
          success: true
        };
      } catch (error) {
        console.error(`Failed to generate image for ${recipe.name}:`, error.message);
        return {
          recipeName: recipe.name,
          imageUrl: null,
          success: false,
          error: error.message
        };
      }
    });

    const results = await Promise.all(imagePromises);

    res.json({
      success: true,
      images: results
    });
  } catch (error) {
    console.error('Generate images error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate images',
      details: error.message
    });
  }
};
