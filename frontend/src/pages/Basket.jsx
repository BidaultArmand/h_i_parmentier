import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { basketAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Loader2, ShoppingCart, Trash2, Sparkles, TrendingDown, AlertCircle } from 'lucide-react';
import { Badge } from '../components/ui/badge';

function Basket() {
  const { user } = useAuth();
  const [basket, setBasket] = useState(null);
  const [basketId, setBasketId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      initializeAndFetchBasket();
    } else {
      setLoading(false);
    }
  }, [user]);

  const initializeAndFetchBasket = async () => {
    try {
      const response = await basketAPI.create({
        name: 'My Basket',
        userId: user.id
      });
      const newBasketId = response.data.data.id;
      setBasketId(newBasketId);
      await fetchBasket(newBasketId);
    } catch (err) {
      console.error('Error initializing basket:', err);
      setLoading(false);
    }
  };

  const fetchBasket = async (id = basketId) => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await basketAPI.get(id);
      setBasket(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to load basket');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await basketAPI.removeItem(itemId);
      fetchBasket();
    } catch (err) {
      alert('Failed to remove item');
      console.error(err);
    }
  };

  const handleOptimize = async () => {
    try {
      const response = await basketAPI.optimize({
        basketId,
        preferences: {
          sustainability: true,
          local: true
        }
      });
      alert('Optimization feature coming soon!');
      console.log(response.data);
    } catch (err) {
      alert('Optimization failed');
      console.error(err);
    }
  };

  const handleCompare = async () => {
    try {
      const response = await basketAPI.compare({ basketId });
      alert('Price comparison feature coming soon!');
      console.log(response.data);
    } catch (err) {
      alert('Comparison failed');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="container flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading basket...</p>
        </div>
      </div>
    );
  }

  if (!basketId || !basket || !basket.items || basket.items.length === 0) {
    return (
      <div className="container py-8">
        <Card className="p-12">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <ShoppingCart className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Your basket is empty</h2>
              <p className="text-muted-foreground">
                Start adding products to your basket to get started!
              </p>
            </div>
            <Button asChild className="mt-4">
              <a href="/products">Browse Products</a>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Your Basket</h1>
          <p className="text-muted-foreground">
            {basket.itemCount} {basket.itemCount === 1 ? 'item' : 'items'} in your basket
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleOptimize} variant="outline" className="gap-2">
            <Sparkles className="h-4 w-4" />
            AI Optimize
          </Button>
          <Button onClick={handleCompare} variant="outline" className="gap-2">
            <TrendingDown className="h-4 w-4" />
            Compare Stores
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-destructive/50 bg-destructive/10 p-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p className="font-medium">{error}</p>
          </div>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {basket.items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{item.products.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.products.store}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Qty: {item.quantity}</Badge>
                      {item.products.is_organic && (
                        <Badge variant="success">Organic</Badge>
                      )}
                      {item.products.is_local && (
                        <Badge variant="info">Local</Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      ${(item.products.price * item.quantity).toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ${item.products.price} each
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${basket.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Items</span>
                  <span className="font-medium">{basket.itemCount}</span>
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-2xl font-bold text-primary">${basket.total}</span>
                </div>
              </div>
              <Button className="w-full" size="lg">
                Checkout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Basket;
