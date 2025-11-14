import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ChefHat, Sparkles, Calendar, Clock } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
      <div className="container max-w-4xl py-16 px-4">
        
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <ChefHat className="h-20 w-20 text-primary animate-bounce" />
              <Sparkles className="h-8 w-8 text-yellow-500 absolute -top-2 -right-2" />
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Planifiez vos repas de la semaine
            <span className="block text-primary mt-2">en quelques secondes</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Notre assistant IA vous aide à créer des recettes personnalisées, 
            optimiser votre liste de courses et gagner du temps au quotidien.
          </p>
        </div>

        {/* CTA Principal */}
        <div className="flex justify-center mb-16">
          <Button asChild size="lg" className="text-lg px-8 py-6 h-auto">
            <Link to="/chat" className="gap-3">
              <ChefHat className="h-6 w-6" />
              Créer mes recettes de la semaine
            </Link>
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="p-6 rounded-lg bg-card border text-center space-y-3">
            <div className="flex justify-center">
              <Calendar className="h-10 w-10 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Planning hebdomadaire</h3>
            <p className="text-sm text-muted-foreground">
              Organisez tous vos repas de la semaine en une seule fois
            </p>
          </div>

          <div className="p-6 rounded-lg bg-card border text-center space-y-3">
            <div className="flex justify-center">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Recettes personnalisées</h3>
            <p className="text-sm text-muted-foreground">
              L'IA s'adapte à vos goûts, restrictions et préférences
            </p>
          </div>

          <div className="p-6 rounded-lg bg-card border text-center space-y-3">
            <div className="flex justify-center">
              <Clock className="h-10 w-10 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Gain de temps</h3>
            <p className="text-sm text-muted-foreground">
              Liste de courses automatique et recettes rapides
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
