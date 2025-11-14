import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

// ---------------------------------------------
// PAGE HOME — FEUILLE BLANCHE POUR FRONT-END DEV
// Garder uniquement les redirections principales.
// ---------------------------------------------

export default function Home() {
  return (
    <div className="container py-8">

      {/* CTA principaux conservés */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
        <Button asChild size="lg">
          <Link to="/products">Browse Products</Link>
        </Button>

        <Button asChild size="lg" variant="outline">
          <Link to="/chat">AI Assistant</Link>
        </Button>
      </div>

      {/* Zone totalement vierge */}
      {/* Les dev front peuvent repartir de zéro ici */}

    </div>
  );
}
