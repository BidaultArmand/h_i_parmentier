-- Smart Grocery Database Schema for Supabase

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  store VARCHAR(100) NOT NULL,
  category VARCHAR(100),
  barcode VARCHAR(50) UNIQUE,
  image_url TEXT,
  sustainability_score INT CHECK (sustainability_score >= 0 AND sustainability_score <= 10),
  is_local BOOLEAN DEFAULT false,
  is_organic BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stores table
CREATE TABLE IF NOT EXISTS stores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  type VARCHAR(50), -- supermarket, organic, local, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User baskets table
CREATE TABLE IF NOT EXISTS baskets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) DEFAULT 'My Basket',
  is_shared BOOLEAN DEFAULT false,
  share_code VARCHAR(20) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Basket items table
CREATE TABLE IF NOT EXISTS basket_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  basket_id UUID REFERENCES baskets(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Price history table (for tracking price changes)
CREATE TABLE IF NOT EXISTS price_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  price DECIMAL(10, 2) NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  prefer_sustainable BOOLEAN DEFAULT false,
  prefer_local BOOLEAN DEFAULT false,
  prefer_organic BOOLEAN DEFAULT false,
  max_budget DECIMAL(10, 2),
  favorite_stores TEXT[], -- array of store names
  dietary_restrictions TEXT[], -- array of restrictions
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_store ON products(store);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_basket_items_basket_id ON basket_items(basket_id);
CREATE INDEX IF NOT EXISTS idx_baskets_user_id ON baskets(user_id);
CREATE INDEX IF NOT EXISTS idx_price_history_product_id ON price_history(product_id);

-- Enable Row Level Security (RLS)
ALTER TABLE baskets ENABLE ROW LEVEL SECURITY;
ALTER TABLE basket_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for baskets
CREATE POLICY "Users can view their own baskets"
  ON baskets FOR SELECT
  USING (auth.uid() = user_id OR is_shared = true);

CREATE POLICY "Users can create their own baskets"
  ON baskets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own baskets"
  ON baskets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own baskets"
  ON baskets FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for basket_items
CREATE POLICY "Users can view items in their baskets"
  ON basket_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM baskets
      WHERE baskets.id = basket_items.basket_id
      AND (baskets.user_id = auth.uid() OR baskets.is_shared = true)
    )
  );

CREATE POLICY "Users can add items to their baskets"
  ON basket_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM baskets
      WHERE baskets.id = basket_items.basket_id
      AND baskets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items in their baskets"
  ON basket_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM baskets
      WHERE baskets.id = basket_items.basket_id
      AND baskets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items from their baskets"
  ON basket_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM baskets
      WHERE baskets.id = basket_items.basket_id
      AND baskets.user_id = auth.uid()
    )
  );

-- RLS Policies for user_preferences
CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Insert some sample data
INSERT INTO stores (name, address, type) VALUES
  ('Whole Foods Market', '123 Organic St', 'organic'),
  ('Trader Joes', '456 Value Ave', 'supermarket'),
  ('Walmart', '789 Discount Rd', 'supermarket'),
  ('Local Farmers Market', '321 Fresh Blvd', 'local');

INSERT INTO products (name, description, price, store, category, barcode, sustainability_score, is_local, is_organic) VALUES
  ('Organic Bananas', 'Fresh organic bananas', 2.99, 'Whole Foods Market', 'Fruits', '1234567890123', 8, true, true),
  ('Almond Milk', 'Unsweetened almond milk', 3.49, 'Trader Joes', 'Dairy Alternatives', '9876543210987', 7, false, true),
  ('Free Range Eggs', 'Dozen free range eggs', 5.99, 'Whole Foods Market', 'Dairy & Eggs', '1111222233334', 9, true, true),
  ('Organic Spinach', 'Fresh organic baby spinach', 3.99, 'Local Farmers Market', 'Vegetables', '4444555566667', 10, true, true),
  ('Whole Wheat Bread', 'Artisan whole wheat bread', 4.49, 'Trader Joes', 'Bakery', '7777888899990', 6, false, false);
