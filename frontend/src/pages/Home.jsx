import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Video Hero Section - Full Page */}
      <div className="relative w-full h-[calc(100vh-4rem)] overflow-hidden">
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
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white drop-shadow-2xl">
              Des recettes personnalisées,
              <span className="block text-red-500 mt-2 drop-shadow-lg" style={{ WebkitTextStroke: '2px white', paintOrder: 'stroke fill' }}>des courses simplifiées</span>
            </h1>

            {/* CTA Principal */}
            <div className="flex justify-center mt-8">
              <Button asChild size="lg" className="text-lg px-8 py-6 h-auto shadow-2xl bg-red-600 hover:bg-red-700">
                <Link to="/chat">
                  Nouveau caddie
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
