import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Leaf, MapPin, Sparkles, ShoppingCart, Package } from 'lucide-react';

function ProductCard({ product, onAddToBasket }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="aspect-video w-full overflow-hidden bg-muted">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Package className="h-12 w-12" />
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{product.name}</CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{product.store}</span>
          {product.category && (
            <>
              <span>•</span>
              <span>{product.category}</span>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {product.is_organic && (
            <Badge variant="success" className="gap-1">
              <Leaf className="h-3 w-3" />
              Organic
            </Badge>
          )}
          {product.is_local && (
            <Badge variant="info" className="gap-1">
              <MapPin className="h-3 w-3" />
              Local
            </Badge>
          )}
          {product.sustainability_score >= 8 && (
            <Badge variant="warning" className="gap-1">
              <Sparkles className="h-3 w-3" />
              Sustainable
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        <span className="text-2xl font-bold text-primary">
          ${product.price}
        </span>
        <Button onClick={() => onAddToBasket(product)} className="gap-2">
          <ShoppingCart className="h-4 w-4" />
          Add to Basket
        </Button>
      </CardFooter>
    </Card>
  );
}

export default ProductCard;
