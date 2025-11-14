# Quick Start Guide

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Supabase account with a project created

## Step 1: Initialize Database

1. Go to your Supabase project: https://supabase.com/dashboard
2. Navigate to SQL Editor
3. Copy the contents of `backend/src/config/database.sql`
4. Paste and run the SQL script in the editor

This will create all necessary tables, indexes, and sample data.

## Step 2: Install Dependencies

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm install
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
```

## Step 3: Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server is running on port 5000
📡 API available at http://localhost:5000/api
🏥 Health check: http://localhost:5000/api/health
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

## Step 4: Test the Application

1. Open your browser and go to http://localhost:5173
2. You should see the Smart Grocery Comparator home page
3. Click "Browse Products" to see sample products
4. Try adding products to your basket
5. View your basket by clicking "Basket" in the navigation

## Testing the API Directly

You can test the backend API endpoints:

```bash
# Health check
curl http://localhost:5000/api/health

# Get all products
curl http://localhost:5000/api/products

# Search products
curl "http://localhost:5000/api/products/search?q=banana"
```

## Common Issues

### Port already in use
If port 5000 or 5173 is already in use, you can change them:

**Backend:** Edit `backend/.env` and change `PORT=5000` to another port

**Frontend:** Edit `frontend/vite.config.js` and change the port in the server config

### Supabase connection errors
- Verify your credentials in `.env` files
- Check that you ran the database.sql script
- Ensure your Supabase project is active

### CORS errors
- Make sure the backend is running
- Check that `FRONTEND_URL` in `backend/.env` matches your frontend URL
- Verify the proxy configuration in `frontend/vite.config.js`

## Next Steps

Once everything is running:

1. Explore the features on the home page
2. Try searching for products
3. Add items to your basket
4. Check out the basket optimization and comparison buttons (placeholders for now)

For full documentation, see the main README.md file.

## Development Tips

- Backend auto-reloads on file changes (using nodemon)
- Frontend hot-reloads automatically (using Vite)
- Check browser console for errors
- Check terminal output for backend errors
- Use browser DevTools Network tab to debug API calls

Happy coding!
