import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Send, Bot, User, Loader2, Plus, Minus, Users, UtensilsCrossed, Sparkles, Check, X, ArrowLeft, Download, RefreshCw } from 'lucide-react';
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
  
  // Recipe management
  const [allGeneratedRecipes, setAllGeneratedRecipes] = useState([]); // Toutes les recettes générées
  const [displayedRecipes, setDisplayedRecipes] = useState([]); // Recettes actuellement affichées
  const [recipeStack, setRecipeStack] = useState([]); // Pile des recettes non encore utilisées
  const [removedRecipes, setRemovedRecipes] = useState([]); // Historique des recettes supprimées (ne plus reproposer)
  const [replacingRecipeIndex, setReplacingRecipeIndex] = useState(null); // Index de la recette en cours de remplacement
  const [recipeImages, setRecipeImages] = useState({}); // Store generated images by recipe name
  
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
      const newHeight = Math.min(Math.max(textarea.scrollHeight, 48), 160); // Min 48px, Max 160px
      textarea.style.height = newHeight + 'px';
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
      // Demander plus de recettes que nécessaire (50% de plus pour avoir des remplaçants)
      const recipesToGenerate = Math.ceil(numberOfMeals * 1.5);
      
      // Call API to generate recipes based on context
      const response = await axios.post(`${API_URL}/chat/generate-recipes`, {
        keyPhrases,
        numberOfMeals: recipesToGenerate,
        numberOfPeople,
        userId: user?.id
      });

      // Store all generated recipes
      const recipes = response.data.recipes || [];
      setAllGeneratedRecipes(recipes);
      
      // Display only the requested number
      const displayed = recipes.slice(0, numberOfMeals);
      
      // Initialize the stack with remaining recipes
      const stack = recipes.slice(numberOfMeals);
      setRecipeStack(stack);
      
      // Reset removed recipes
      setRemovedRecipes([]);
      
      // Generate all images at once before showing the page
      console.log('Generating images for all recipes...');
      const imagesResponse = await axios.post(`${API_URL}/chat/generate-images`, {
        recipes: recipes // Generate for ALL recipes (displayed + stack)
      });
      
      // Store images in a map
      const imagesMap = {};
      if (imagesResponse.data.success) {
        imagesResponse.data.images.forEach(img => {
          if (img.success && img.imageUrl) {
            imagesMap[img.recipeName] = img.imageUrl;
          }
        });
      }
      setRecipeImages(imagesMap);
      
      // Now display the recipes with images
      setDisplayedRecipes(displayed);
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
    if (loading || !displayedRecipes || displayedRecipes.length === 0) return;

    setLoading(true);

    try {
      // Call API to generate ingredient list JSON with DISPLAYED recipes only
      const response = await axios.post(`${API_URL}/chat/generate-ingredients`, {
        recipes: displayedRecipes,
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
    setDisplayedRecipes([]);
    setAllGeneratedRecipes([]);
    setRecipeStack([]);
    setRemovedRecipes([]);
    setRecipeImages({});
  };

  const handleBackToRecipes = () => {
    setCurrentStep('recipes');
    setIngredientsData(null);
  };

  // Replace a recipe with the next one from the stack
  const handleReplaceRecipe = async (indexToReplace) => {
    setReplacingRecipeIndex(indexToReplace);

    try {
      // Get the recipe being removed
      const removedRecipe = displayedRecipes[indexToReplace];
      
      // Add it to the removed recipes list (won't be proposed again)
      setRemovedRecipes(prev => [...prev, removedRecipe]);

      // Check if we have recipes in the stack
      if (recipeStack.length > 0) {
        // Use the first recipe from the stack
        const newRecipe = recipeStack[0];
        
        // Update displayed recipes
        const newDisplayed = [...displayedRecipes];
        newDisplayed[indexToReplace] = newRecipe;
        setDisplayedRecipes(newDisplayed);
        
        // Remove the used recipe from the stack
        setRecipeStack(prev => prev.slice(1));
        
        // Image should already be generated since we generated all at once
        
      } else {
        // Stack is empty, need to generate more recipes
        const response = await axios.post(`${API_URL}/chat/generate-recipes`, {
          keyPhrases,
          numberOfMeals: 5, // Generate 5 new recipes to refill the stack
          numberOfPeople,
          userId: user?.id
        });

        const newRecipes = response.data.recipes || [];
        
        if (newRecipes.length > 0) {
          // Filter out recipes that have been removed
          const availableNewRecipes = newRecipes.filter(
            newRecipe => !removedRecipes.some(removed => removed.name === newRecipe.name) &&
                         !displayedRecipes.some(displayed => displayed.name === newRecipe.name)
          );
          
          if (availableNewRecipes.length > 0) {
            // Generate images for new recipes
            const imagesResponse = await axios.post(`${API_URL}/chat/generate-images`, {
              recipes: availableNewRecipes
            });
            
            // Store new images
            if (imagesResponse.data.success) {
              const newImagesMap = { ...recipeImages };
              imagesResponse.data.images.forEach(img => {
                if (img.success && img.imageUrl) {
                  newImagesMap[img.recipeName] = img.imageUrl;
                }
              });
              setRecipeImages(newImagesMap);
            }
            
            // Use the first new recipe for replacement
            const newDisplayed = [...displayedRecipes];
            newDisplayed[indexToReplace] = availableNewRecipes[0];
            setDisplayedRecipes(newDisplayed);
            
            // Add remaining new recipes to the stack
            const newStack = availableNewRecipes.slice(1);
            setRecipeStack(prev => [...prev, ...newStack]);
            
            // Add new recipes to all generated recipes
            setAllGeneratedRecipes(prev => [...prev, ...availableNewRecipes]);
          } else {
            // Très rare : toutes les nouvelles recettes ont déjà été proposées
            console.warn('All new recipes were already proposed');
          }
        }
      }
    } catch (error) {
      console.error('Replace recipe error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Désolé, erreur lors du remplacement de la recette.',
        timestamp: new Date(),
        error: true
      }]);
    } finally {
      setReplacingRecipeIndex(null);
    }
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

        {/* Chat Area - Dynamic Height */}
        <div 
          className="bg-card border-2 border-primary/20 rounded-2xl shadow-xl overflow-hidden flex flex-col transition-all duration-300"
          style={{ 
            minHeight: '180px',
            maxHeight: messages.length === 0 ? '180px' : '500px',
            height: messages.length === 0 ? '180px' : 'auto'
          }}
        >
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ maxHeight: messages.length > 0 ? '420px' : 'none' }}>
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
                rows={1}
                className="flex-1 resize-none border border-primary/20 rounded-xl px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-50 bg-background transition-all duration-200"
                style={{ minHeight: '48px', maxHeight: '160px', overflow: 'hidden' }}
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
            <h2 className="text-2xl font-bold">Vos recettes ({displayedRecipes?.length || 0})</h2>
            <div className="w-40" /> {/* Spacer for alignment */}
          </div>

          {/* Recipes Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {displayedRecipes?.map((recipe, idx) => {
              const imageUrl = recipeImages[recipe.name];
              
              // Fallback gradient if no image
              const firstLetter = recipe.name.charAt(0).toUpperCase();
              const colors = [
                'from-orange-400 to-red-500',
                'from-green-400 to-emerald-500',
                'from-blue-400 to-indigo-500',
                'from-purple-400 to-pink-500',
                'from-yellow-400 to-orange-500',
                'from-teal-400 to-cyan-500',
              ];
              const colorClass = colors[idx % colors.length];
              
              return (
                <Card key={idx} className="hover:shadow-lg transition-shadow relative group overflow-hidden">
                  {/* Recipe Image */}
                  <div className="relative h-48 w-full overflow-hidden bg-muted">
                    {imageUrl ? (
                      // DALL-E generated image
                      <img 
                        src={imageUrl}
                        alt={recipe.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      // Fallback gradient if image generation failed
                      <div className={`w-full h-full bg-gradient-to-br ${colorClass} flex items-center justify-center`}>
                        <div className="text-center text-white">
                          <div className="text-6xl font-bold mb-2">{firstLetter}</div>
                          <div className="text-sm font-medium px-4">{recipe.cuisine}</div>
                        </div>
                      </div>
                    )}
                    
                    {/* Replace button overlay */}
                    <div className="absolute top-2 right-2">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        onClick={() => handleReplaceRecipe(idx)}
                        disabled={replacingRecipeIndex === idx}
                        title="Remplacer cette recette"
                      >
                        {replacingRecipeIndex === idx ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{recipe.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {recipe.cuisine} • {recipe.difficulty} • {recipe.prepTime}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-2">{recipe.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Action Button - Centered */}
          <div className="flex justify-center">
            <Button 
              onClick={handleValidateRecipes}
              disabled={loading || !displayedRecipes || displayedRecipes.length === 0}
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
                  Valider les recettes
                </>
              )}
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
