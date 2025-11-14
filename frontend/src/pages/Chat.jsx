import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Send, Bot, User, Loader2, Plus, Minus, Users, UtensilsCrossed, Sparkles, Check, X, ArrowLeft, Download } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [numberOfMeals, setNumberOfMeals] = useState(7);
  const [numberOfPeople, setNumberOfPeople] = useState(2);
  const [keyPhrases, setKeyPhrases] = useState([]);
  const [generatedRecipes, setGeneratedRecipes] = useState(null);
  const [ingredientsData, setIngredientsData] = useState(null);
  const [currentStep, setCurrentStep] = useState('input'); // 'input', 'recipes', 'ingredients'
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize with empty messages - no welcome message
    setMessages([]);
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!input.trim() || loading) return;

    setLoading(true);
    const userInput = input;
    setInput('');

    try {
      // Call API to summarize text into key phrases
      const response = await axios.post(`${API_URL}/chat/summarize`, {
        text: userInput
      });

      // Add the key phrases to the context
      const newPhrases = response.data.keyPhrases || [];
      setKeyPhrases(prev => [...prev, ...newPhrases]);

      // Show user message with the original text
      setMessages(prev => [...prev, {
        role: 'user',
        content: userInput,
        timestamp: new Date()
      }]);

      // Show assistant confirmation with key phrases
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'J\'ai noté vos préférences :',
        keyPhrases: newPhrases,
        timestamp: new Date()
      }]);

    } catch (error) {
      console.error('Summarize error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Désolé, j\'ai rencontré une erreur lors de l\'analyse de vos préférences.',
        timestamp: new Date(),
        error: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRecipes = async () => {
    if (loading) return;

    setLoading(true);

    try {
      // Call API to generate recipes based on context
      const response = await axios.post(`${API_URL}/chat/generate-recipes`, {
        keyPhrases,
        numberOfMeals,
        numberOfPeople,
        userId: user?.id
      });

      // Store generated recipes and move to recipes view
      const recipes = response.data.recipes || [];
      setGeneratedRecipes(recipes);
      setCurrentStep('recipes');

    } catch (error) {
      console.error('Generate recipes error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Désolé, j\'ai rencontré une erreur lors de la génération des recettes.',
        timestamp: new Date(),
        error: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleValidateRecipes = async () => {
    if (loading || !generatedRecipes) return;

    setLoading(true);

    try {
      // Call API to generate ingredient list JSON
      const response = await axios.post(`${API_URL}/chat/generate-ingredients`, {
        recipes: generatedRecipes,
        numberOfPeople
      });

      const ingredientsJSON = response.data.ingredients;

      // Store ingredients and move to ingredients view
      setIngredientsData(ingredientsJSON);
      setCurrentStep('ingredients');

    } catch (error) {
      console.error('Generate ingredients error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Désolé, j\'ai rencontré une erreur lors de la génération de la liste de courses.',
        timestamp: new Date(),
        error: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToInput = () => {
    setCurrentStep('input');
    setGeneratedRecipes(null);
  };

  const handleBackToRecipes = () => {
    setCurrentStep('recipes');
    setIngredientsData(null);
  };

  const downloadJSON = () => {
    const dataStr = JSON.stringify(ingredientsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'liste-courses.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  // STEP 1: Input page
  if (currentStep === 'input') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-b from-background to-muted/20 py-8">
        <div className="container max-w-3xl px-4">
        
        {/* Configuration Section - Compact */}
        <div className="mb-6 flex justify-center gap-6">
          {/* Number of Meals */}
          <div className="flex items-center gap-3 px-4 py-3 bg-card border rounded-lg">
            <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setNumberOfMeals(Math.max(1, numberOfMeals - 1))}
              disabled={numberOfMeals <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="text-2xl font-bold min-w-[2.5rem] text-center">
              {numberOfMeals}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setNumberOfMeals(Math.min(21, numberOfMeals + 1))}
              disabled={numberOfMeals >= 21}
            >
              <Plus className="h-3 w-3" />
            </Button>
            <span className="text-xs text-muted-foreground">repas</span>
          </div>

          {/* Number of People */}
          <div className="flex items-center gap-3 px-4 py-3 bg-card border rounded-lg">
            <Users className="h-4 w-4 text-muted-foreground" />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setNumberOfPeople(Math.max(1, numberOfPeople - 1))}
              disabled={numberOfPeople <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="text-2xl font-bold min-w-[2.5rem] text-center">
              {numberOfPeople}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setNumberOfPeople(Math.min(20, numberOfPeople + 1))}
              disabled={numberOfPeople >= 20}
            >
              <Plus className="h-3 w-3" />
            </Button>
            <span className="text-xs text-muted-foreground">pers.</span>
          </div>
        </div>

        {/* Chat Area - Compact */}
        <div className="bg-card border-2 border-primary/20 rounded-2xl shadow-xl overflow-hidden flex flex-col" style={{ height: '180px' }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.length === 0 && !loading && (
              <div className="h-full flex items-center justify-center">
                <p className="text-xs text-muted-foreground text-center max-w-md">
                  Décrivez vos préférences culinaires pour générer vos recettes de la semaine
                </p>
              </div>
            )}
            
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-2 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : message.error
                      ? 'bg-destructive/10 text-destructive border border-destructive/20'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  
                  {/* Key Phrases */}
                  {message.keyPhrases && message.keyPhrases.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {message.keyPhrases.map((phrase, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {phrase}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Recipe Cards */}
                  {message.recipes && message.recipes.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {message.recipes.map((recipe, idx) => (
                        <div key={idx} className="bg-background border rounded-lg p-3 text-left">
                          <h4 className="font-semibold text-sm text-foreground">{recipe.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{recipe.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Ingredients JSON Preview */}
                  {message.ingredientsJSON && (
                    <div className="mt-3 p-3 bg-background border rounded-lg">
                      <p className="text-xs font-mono text-foreground whitespace-pre-wrap">
                        {JSON.stringify(message.ingredientsJSON, null, 2)}
                      </p>
                    </div>
                  )}
                </div>

                {message.role === 'user' && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary">
                    <User className="h-4 w-4 text-secondary-foreground" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl px-4 py-2.5">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t p-3 bg-background/50">
            <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder="Ex: Plats méditerranéens avec produits de saison"
                disabled={loading}
                rows={2}
                className="flex-1 resize-none border border-primary/20 rounded-xl px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-50 bg-background"
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
              <Button 
                type="submit" 
                disabled={loading || !input.trim()} 
                size="icon"
                className="rounded-xl h-10 w-10 shrink-0"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Generate Button */}
        <div className="mt-6 flex justify-center">
          <Button 
            onClick={handleGenerateRecipes}
            disabled={loading}
            size="lg"
            className="gap-2 px-8"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Générer mes recettes
              </>
            )}
          </Button>
        </div>

        </div>
      </div>
    );
  }

  // STEP 2: Recipes page
  if (currentStep === 'recipes') {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background to-muted/20 py-8">
        <div className="container max-w-6xl px-4">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              onClick={handleBackToInput}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Modifier les préférences
            </Button>
            <h2 className="text-2xl font-bold">Vos recettes ({generatedRecipes?.length || 0})</h2>
            <div className="w-40" /> {/* Spacer for alignment */}
          </div>

          {/* Recipes Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {generatedRecipes?.map((recipe, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{recipe.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {recipe.cuisine} • {recipe.difficulty} • {recipe.prepTime}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{recipe.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-3">
            <Button 
              onClick={handleValidateRecipes}
              disabled={loading}
              size="lg"
              className="gap-2 px-8"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Génération de la liste...
                </>
              ) : (
                <>
                  <Check className="h-5 w-5" />
                  Valider et générer la liste de courses
                </>
              )}
            </Button>
            <Button 
              onClick={handleBackToInput}
              disabled={loading}
              variant="outline"
              size="lg"
              className="gap-2 px-8"
            >
              <X className="h-5 w-5" />
              Régénérer
            </Button>
          </div>

        </div>
      </div>
    );
  }

  // STEP 3: Ingredients page
  if (currentStep === 'ingredients') {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background to-muted/20 py-8">
        <div className="container max-w-4xl px-4">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              onClick={handleBackToRecipes}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux recettes
            </Button>
            <h2 className="text-2xl font-bold">Liste de courses</h2>
            <Button
              variant="outline"
              onClick={downloadJSON}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Télécharger JSON
            </Button>
          </div>

          {/* Shopping List */}
          {ingredientsData?.shoppingList && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Ingrédients à acheter</CardTitle>
                <CardDescription>
                  Liste consolidée pour {numberOfPeople} personne{numberOfPeople > 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(
                    ingredientsData.shoppingList.reduce((acc, item) => {
                      if (!acc[item.category]) acc[item.category] = [];
                      acc[item.category].push(item);
                      return acc;
                    }, {})
                  ).map(([category, items]) => (
                    <div key={category}>
                      <h3 className="font-semibold text-sm mb-2 text-primary">{category}</h3>
                      <ul className="space-y-1 ml-4">
                        {items.map((item, idx) => (
                          <li key={idx} className="text-sm flex justify-between">
                            <span>{item.name}</span>
                            <span className="text-muted-foreground">{item.totalQuantity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recipes Detail */}
          {ingredientsData?.recipes && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-4">Détail par recette</h3>
              {ingredientsData.recipes.map((recipe, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle className="text-lg">{recipe.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {recipe.ingredients?.map((ing, ingIdx) => (
                        <li key={ingIdx} className="text-sm flex justify-between">
                          <span>{ing.name}</span>
                          <span className="text-muted-foreground">{ing.quantity}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

        </div>
      </div>
    );
  }
}

export default Chat;
