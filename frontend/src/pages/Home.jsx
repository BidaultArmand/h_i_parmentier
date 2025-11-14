import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ChefHat, Sparkles, Calendar, Clock } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Video Hero Section */}
      <div className="relative w-full h-[60vh] overflow-hidden">
        <video 
          className="absolute top-0 left-0 w-full h-full object-cover"
          autoPlay 
          loop 
          muted 
          playsInline
        >
          <source src="/ton-fichier-video.mp4" type="video/mp4" />
          Votre navigateur ne supporte pas la vidéo.
        </video>
        
        {/* Overlay sombre pour améliorer la lisibilité du texte */}
        <div className="absolute top-0 left-0 w-full h-full bg-black/60" />
        
        {/* Contenu par-dessus la vidéo */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="container max-w-4xl px-4 text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <ChefHat className="h-20 w-20 text-white drop-shadow-lg" />
                <Sparkles className="h-8 w-8 text-white absolute -top-2 -right-2 drop-shadow-lg" />
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white drop-shadow-2xl">
              Des recettes personnalisées,
              <span className="block text-primary mt-2 drop-shadow-lg">des courses simplifiées</span>
            </h1>

            <p className="text-xl text-white max-w-2xl mx-auto mt-6 drop-shadow-lg">
              Laissez notre IA organiser vos recettes de la semaine et remplir votre panier en quelques secondes.
            </p>

            {/* CTA Principal */}
            <div className="flex justify-center mt-8">
              <Button asChild size="lg" className="text-lg px-8 py-6 h-auto shadow-2xl">
                <Link to="/chat">
                  Gérer mes courses de la semaine
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Rest of content */}
      <div className="flex-1 bg-gradient-to-b from-background to-muted/20">
        <div className="container max-w-4xl py-16 px-4">

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6">
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
    </div>
  );
}
