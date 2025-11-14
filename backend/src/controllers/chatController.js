import OpenAI from 'openai';
import dotenv from 'dotenv';
import supabase from '../config/supabase.js';

// Ensure environment variables are loaded
dotenv.config();

let openai = null;
if (process.env.OPENAI_API_KEY) {
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
Return ONLY a valid JSON array of recipe objects with this exact structure:
[
  {
    "name": "Recipe Name",
    "description": "Brief description (max 60 chars)",
    "cuisine": "Cuisine type",
    "difficulty": "easy|medium|hard",
    "prepTime": "30 min"
  }
]
Make recipes varied, balanced, and appropriate for the number of meals requested.`;

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
    // Check if OpenAI is configured
    if (!openai) {
      return res.status(503).json({
        success: false,
        error: 'Chat service is not available. OpenAI API key is not configured.'
      });
    }

    const { message, conversationHistory = [], basketId } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
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

    // Build context from key phrases
    const preferencesContext = keyPhrases.length > 0 
      ? `User preferences: ${keyPhrases.join(', ')}` 
      : 'No specific preferences provided';

    const userPrompt = `Generate ${numberOfMeals} recipes for ${numberOfPeople} person(s).
${preferencesContext}

Return ${numberOfMeals} varied recipes as a JSON array.`;

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
