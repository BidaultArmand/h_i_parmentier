# Smart Grocery Comparator

An AI-powered grocery shopping platform that helps users save money, make sustainable choices, and optimize their shopping experience.

## Features

- **AI-Powered Basket Optimizer**: Get smart recommendations to save money
- **Smart Chrome Extension / Mobile App**: Shop from anywhere
- **AI Sustainability / Local Preference Mode**: Prefer eco-friendly and local products
- **Collaborative Shopping Mode**: Share baskets with family and friends
- **Product Scanning**: Barcode/receipt/vision scanning capabilities

## Tech Stack

### Backend
- Node.js + Express
- Supabase (PostgreSQL database + Authentication)
- REST API architecture

### Frontend
- React 18
- Vite (build tool)
- React Router (navigation)
- Axios (API calls)

## Project Structure

```
smartgrocery/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── supabase.js
│   │   │   └── database.sql
│   │   ├── controllers/
│   │   │   ├── productController.js
│   │   │   └── basketController.js
│   │   ├── routes/
│   │   │   ├── productRoutes.js
│   │   │   └── basketRoutes.js
│   │   ├── app.js
│   │   └── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   └── ProductCard.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Products.jsx
│   │   │   └── Basket.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── config/
│   │   │   └── supabase.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── .env.example
└── README.md
```

## Setup Instructions

### 1. Supabase Setup

1. Create a Supabase account at https://supabase.com
2. Create a new project
3. Go to SQL Editor and run the schema from `backend/src/config/database.sql`
4. Get your credentials from Project Settings > API:
   - Project URL
   - Anon/Public Key
   - Service Role Key

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and add your Supabase credentials:
# SUPABASE_URL=your_project_url
# SUPABASE_ANON_KEY=your_anon_key
# SUPABASE_SERVICE_KEY=your_service_role_key

# Start the backend server
npm run dev
```

The backend will run on http://localhost:5000

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and add:
# VITE_API_URL=http://localhost:5000/api
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Start the development server
npm run dev
```

The frontend will run on http://localhost:5173

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/search?q=query` - Search products
- `POST /api/products/scan` - Scan barcode

### Basket
- `POST /api/basket/create` - Create new basket
- `GET /api/basket?basketId=id` - Get basket
- `POST /api/basket` - Add item to basket
- `DELETE /api/basket/:itemId` - Remove item
- `POST /api/basket/optimize` - AI optimize basket (coming soon)
- `POST /api/basket/compare` - Compare prices across stores (coming soon)

## Database Schema

### Tables
- `products` - Product catalog
- `stores` - Store information
- `baskets` - User baskets
- `basket_items` - Items in baskets
- `price_history` - Price tracking
- `user_preferences` - User settings

## Next Steps

### Phase 1: Core Features (Current)
- ✅ Basic project structure
- ✅ Supabase integration
- ✅ Product browsing
- ✅ Basket management
- ⏳ Testing and refinement

### Phase 2: AI Integration
- OpenAI integration for basket optimization
- Price prediction algorithms
- Personalized recommendations

### Phase 3: Advanced Features
- Barcode scanning (mobile camera API)
- Receipt scanning (OCR)
- Image recognition for products
- Collaborative shopping (real-time updates)

### Phase 4: Extensions
- Chrome extension development
- Mobile app (React Native)
- Browser automation for price scraping

## Contributing

This is a hackathon project. Contributions and suggestions are welcome!

## License

MIT
