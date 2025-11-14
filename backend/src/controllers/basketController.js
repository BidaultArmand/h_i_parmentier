import supabase from '../config/supabase.js';

export const getBasket = async (req, res) => {
  try {
    // For now, using a simple approach without auth
    // In production, you'd get user_id from auth token
    const { basketId } = req.query;

    if (!basketId) {
      return res.status(400).json({
        success: false,
        error: 'Basket ID is required'
      });
    }

    const { data: basket, error: basketError } = await supabase
      .from('baskets')
      .select('*')
      .eq('id', basketId)
      .single();

    if (basketError) throw basketError;

    const { data: items, error: itemsError } = await supabase
      .from('basket_items')
      .select(`
        *,
        products (*)
      `)
      .eq('basket_id', basketId);

    if (itemsError) throw itemsError;

    const total = items?.reduce((sum, item) =>
      sum + (item.products.price * item.quantity), 0) || 0;

    res.json({
      success: true,
      data: {
        basket,
        items: items || [],
        total: total.toFixed(2),
        itemCount: items?.length || 0
      }
    });
  } catch (error) {
    console.error('Error fetching basket:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const addToBasket = async (req, res) => {
  try {
    const { basketId, productId, quantity = 1 } = req.body;

    if (!basketId || !productId) {
      return res.status(400).json({
        success: false,
        error: 'Basket ID and Product ID are required'
      });
    }

    // Check if item already exists in basket
    const { data: existing } = await supabase
      .from('basket_items')
      .select('*')
      .eq('basket_id', basketId)
      .eq('product_id', productId)
      .single();

    if (existing) {
      // Update quantity
      const { data, error } = await supabase
        .from('basket_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;

      return res.json({
        success: true,
        message: 'Item quantity updated',
        data
      });
    }

    // Add new item
    const { data, error } = await supabase
      .from('basket_items')
      .insert({ basket_id: basketId, product_id: productId, quantity })
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: 'Item added to basket',
      data
    });
  } catch (error) {
    console.error('Error adding to basket:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const removeFromBasket = async (req, res) => {
  try {
    const { itemId } = req.params;

    const { error } = await supabase
      .from('basket_items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Item removed from basket'
    });
  } catch (error) {
    console.error('Error removing from basket:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const optimizeBasket = async (req, res) => {
  try {
    const { basketId, preferences } = req.body;

    if (!basketId) {
      return res.status(400).json({
        success: false,
        error: 'Basket ID is required'
      });
    }

    // Get current basket items
    const { data: items } = await supabase
      .from('basket_items')
      .select(`
        *,
        products (*)
      `)
      .eq('basket_id', basketId);

    // Placeholder for AI optimization logic
    // TODO: Implement AI-based optimization using OpenAI or similar
    res.json({
      success: true,
      message: 'Basket optimization (AI integration pending)',
      data: {
        originalBasket: items,
        optimizedBasket: items, // TODO: Implement AI optimization
        savings: 0,
        preferences
      }
    });
  } catch (error) {
    console.error('Error optimizing basket:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const compareBasket = async (req, res) => {
  try {
    const { basketId } = req.body;

    if (!basketId) {
      return res.status(400).json({
        success: false,
        error: 'Basket ID is required'
      });
    }

    // Get basket items with products
    const { data: items } = await supabase
      .from('basket_items')
      .select(`
        *,
        products (*)
      `)
      .eq('basket_id', basketId);

    // Get all stores
    const { data: stores } = await supabase
      .from('stores')
      .select('*');

    // TODO: Implement actual price comparison logic across stores
    // For now, return mock comparison
    const comparison = {
      stores: stores?.map(store => ({
        name: store.name,
        total: Math.random() * 50 + 30, // Mock total
        available: items?.length || 0
      })) || [],
      bestDeal: stores?.[0]?.name || 'N/A',
      potentialSavings: 10.00
    };

    res.json({
      success: true,
      data: comparison
    });
  } catch (error) {
    console.error('Error comparing basket:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create a new basket
export const createBasket = async (req, res) => {
  try {
    const { name = 'My Basket', userId } = req.body;

    const { data, error } = await supabase
      .from('baskets')
      .insert({ name, user_id: userId })
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: 'Basket created',
      data
    });
  } catch (error) {
    console.error('Error creating basket:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all baskets for a user
export const getAllBaskets = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const { data: baskets, error } = await supabase
      .from('baskets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: baskets || []
    });
  } catch (error) {
    console.error('Error fetching baskets:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete a basket
export const deleteBasket = async (req, res) => {
  try {
    const { basketId } = req.params;

    if (!basketId) {
      return res.status(400).json({
        success: false,
        error: 'Basket ID is required'
      });
    }

    // Delete basket items first (cascade should handle this, but being explicit)
    const { error: itemsError } = await supabase
      .from('basket_items')
      .delete()
      .eq('basket_id', basketId);

    if (itemsError) throw itemsError;

    // Delete basket
    const { error } = await supabase
      .from('baskets')
      .delete()
      .eq('id', basketId);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Basket deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting basket:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
