import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Bot, Leaf, DollarSign, Smartphone, Users, BarChart3 } from 'lucide-react';

function Home() {
  const features = [
    {
      icon: Bot,
      title: 'AI-Powered Optimization',
      description: 'Get smart recommendations to save money and reduce waste',
    },
    {
      icon: Leaf,
      title: 'Sustainability Mode',
      description: 'Prefer local and eco-friendly products',
    },
    {
      icon: DollarSign,
      title: 'Price Comparison',
      description: 'Compare prices across multiple stores',
    },
    {
      icon: Smartphone,
      title: 'Barcode Scanning',
      description: 'Scan products for instant information',
    },
    {
      icon: Users,
      title: 'Collaborative Shopping',
      description: 'Share baskets with family and friends',
    },
    {
      icon: BarChart3,
      title: 'Smart Analytics',
      description: 'Track spending and shopping patterns',
    },
  ];

  return (
    <div className="container py-8 space-y-12">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center space-y-6 py-12">
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-accent-green to-accent-lightgreen bg-clip-text text-transparent">
              Smart Grocery Comparator
            </span>
          </h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            Save money and make sustainable choices with AI-powered shopping
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild size="lg">
            <Link to="/products">Browse Products</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/chat">AI Assistant</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tighter">Features</h2>
          <p className="text-muted-foreground">
            Everything you need for smarter grocery shopping
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default Home;
