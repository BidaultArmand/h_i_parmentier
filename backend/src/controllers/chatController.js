import OpenAI from 'openai';
import supabase from '../config/supabase.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

export const chat = async (req, res) => {
  try {
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
