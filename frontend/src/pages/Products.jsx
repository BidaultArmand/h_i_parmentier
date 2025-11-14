import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProductCard from '../components/ProductCard';
import { productsAPI, basketAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Search, Loader2, AlertCircle } from 'lucide-react';

function Products() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [basketId, setBasketId] = useState(null);

  useEffect(() => {
    fetchProducts();
    if (user) {
      initializeBasket();
    }
  }, [user]);

  const initializeBasket = async () => {
    if (!user) return;

    try {
      const response = await basketAPI.create({
        name: 'My Basket',
        userId: user.id
      });
      setBasketId(response.data.data.id);
    } catch (err) {
      console.error('Error creating basket:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll();
      setProducts(response.data.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchProducts();
      return;
    }

    try {
      setLoading(true);
      const response = await productsAPI.search({ q: searchQuery });
      setProducts(response.data.data || []);
      setError(null);
    } catch (err) {
      setError('Search failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToBasket = async (product) => {
    if (!basketId) {
      alert('Please wait while we create your basket...');
      return;
    }

    try {
      await basketAPI.addItem({
        basketId,
        productId: product.id,
        quantity: 1
      });
      alert(`${product.name} added to basket!`);
    } catch (err) {
      alert('Failed to add item to basket');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="container flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <p className="text-muted-foreground">
          Browse and search for your favorite grocery items
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      {error && (
        <Card className="border-destructive/50 bg-destructive/10 p-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p className="font-medium">{error}</p>
          </div>
        </Card>
      )}

      {products.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToBasket={handleAddToBasket}
            />
          ))}
        </div>
      ) : (
        <Card className="p-12">
          <div className="flex flex-col items-center gap-2 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No products found</h3>
            <p className="text-sm text-muted-foreground">
              Try a different search query or browse all products
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

export default Products;
