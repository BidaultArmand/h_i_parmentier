import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { basketAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Send, Bot, User, Loader2, ShoppingCart, Plus, Trash2 } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

function Chat() {
  const { user } = useAuth();
  const [baskets, setBaskets] = useState([]);
  const [selectedBasketId, setSelectedBasketId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingBaskets, setLoadingBaskets] = useState(true);
  const [conversationHistory, setConversationHistory] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (user) {
      fetchBaskets();
    }
  }, [user]);

  useEffect(() => {
    // Reset messages when basket changes
    if (selectedBasketId) {
      initializeChatForBasket(selectedBasketId);
    } else {
      // Initialize empty chat if no basket is selected
      initializeEmptyChat();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBasketId]);

  const fetchBaskets = async () => {
    try {
      setLoadingBaskets(true);
      const response = await basketAPI.getAll(user.id);
      setBaskets(response.data.data || []);
      // Auto-select first basket if available
      if (response.data.data && response.data.data.length > 0 && !selectedBasketId) {
        setSelectedBasketId(response.data.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching baskets:', error);
    } finally {
      setLoadingBaskets(false);
    }
  };

  const initializeChatForBasket = async (basketId) => {
    try {
      // Fetch basket details
      const basketResponse = await basketAPI.get(basketId);
      const basket = basketResponse.data.data;
      
      // Set welcome message with basket context
      setMessages([{
        role: 'assistant',
        content: `Hello! I'm your Smart Grocery assistant. You're currently working with the basket "${basket.basket.name}". 

I can help you:
• Add products to this basket
• Optimize your shopping list
• Compare prices across stores
• Suggest sustainable alternatives

What would you like to do with this basket?`,
        timestamp: new Date()
      }]);
      setConversationHistory([]);
    } catch (error) {
      console.error('Error initializing chat for basket:', error);
      setMessages([{
        role: 'assistant',
        content: 'Sorry, I encountered an error loading the basket. Please try again.',
        timestamp: new Date(),
        error: true
      }]);
    }
  };

  const initializeEmptyChat = () => {
    setMessages([{
      role: 'assistant',
      content: `Hello! I'm your Smart Grocery assistant. I can help you:

• Create a new shopping basket based on your needs
• Add products to an existing basket
• Suggest products based on your preferences

Select a basket from the sidebar or create a new one to get started!`,
      timestamp: new Date()
    }]);
    setConversationHistory([]);
  };

  const handleCreateNewBasket = async () => {
    try {
      setLoading(true);
      const response = await basketAPI.create({
        name: `Basket ${new Date().toLocaleDateString()}`,
        userId: user.id
      });
      
      const newBasket = response.data.data;
      setBaskets(prev => [newBasket, ...prev]);
      setSelectedBasketId(newBasket.id);
    } catch (error) {
      console.error('Error creating basket:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I had trouble creating the basket. Please try again.',
        timestamp: new Date(),
        error: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBasket = async (basketId, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this basket?')) return;
    
    try {
      await basketAPI.delete(basketId);
      // Update baskets state and handle selection
      setBaskets(prev => {
        const remaining = prev.filter(b => b.id !== basketId);
        // If we deleted the selected basket, select the first remaining or null
        if (selectedBasketId === basketId) {
          setSelectedBasketId(remaining.length > 0 ? remaining[0].id : null);
        }
        return remaining;
      });
    } catch (error) {
      console.error('Error deleting basket:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I had trouble deleting the basket. Please try again.',
        timestamp: new Date(),
        error: true
      }]);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!input.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/chat`, {
        message: input,
        conversationHistory,
        basketId: selectedBasketId
      });

      const assistantMessage = {
        role: 'assistant',
        content: response.data.message,
        action: response.data.action,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setConversationHistory(response.data.conversationHistory);
      
      // Refresh baskets if a new one was created
      if (response.data.action?.action === 'create_basket') {
        fetchBaskets();
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        error: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBasket = async (action) => {
    try {
      setLoading(true);

      const response = await axios.post(`${API_URL}/chat/create-basket`, {
        userId: user.id,
        basketName: action.basketName || 'AI Shopping List',
        products: action.products
      });

      // Refresh baskets
      await fetchBaskets();
      
      // Select the new basket
      if (response.data.data?.basket) {
        setSelectedBasketId(response.data.data.basket.id);
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `✅ Great! I've created your basket "${action.basketName || 'AI Shopping List'}" with ${action.products.length} products.`,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Create basket error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I had trouble creating the basket. Please try again.',
        timestamp: new Date(),
        error: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined });
    }
  };

  return (
    <div className="flex flex-1 overflow-hidden h-full">
      {/* Sidebar */}
      <div className="w-64 border-r bg-muted/30 flex flex-col overflow-hidden">
        <div className="p-4 border-b">
          <Button
            onClick={handleCreateNewBasket}
            className="w-full gap-2"
            disabled={loading}
          >
            <Plus className="h-4 w-4" />
            New Basket
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {loadingBaskets ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : baskets.length === 0 ? (
            <div className="text-center p-8 text-sm text-muted-foreground">
              No baskets yet. Create one to get started!
            </div>
          ) : (
            <div className="space-y-1">
              {baskets.map((basket) => (
                <div
                  key={basket.id}
                  onClick={() => setSelectedBasketId(basket.id)}
                  className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedBasketId === basket.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium truncate ${
                        selectedBasketId === basket.id ? 'text-primary-foreground' : ''
                      }`}>
                        {basket.name}
                      </div>
                      <div className={`text-xs mt-1 ${
                        selectedBasketId === basket.id 
                          ? 'text-primary-foreground/70' 
                          : 'text-muted-foreground'
                      }`}>
                        {formatDate(basket.created_at)}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity ${
                        selectedBasketId === basket.id 
                          ? 'hover:bg-primary-foreground/20 text-primary-foreground' 
                          : ''
                      }`}
                      onClick={(e) => handleDeleteBasket(basket.id, e)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-hidden flex flex-col p-6">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : message.error
                      ? 'bg-destructive/10 text-destructive border border-destructive/20'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                  {/* Action buttons */}
                  {message.action && message.action.action === 'suggest_products' && (
                    <div className="mt-3 pt-3 border-t space-y-2">
                      <p className="text-xs font-medium mb-2">Suggested products:</p>
                      {message.action.products.map((product, idx) => (
                        <div
                          key={idx}
                          className="text-xs bg-background/50 rounded p-2"
                        >
                          <span className="font-medium">{product.name}</span>
                          {product.quantity > 1 && (
                            <span className="ml-2 text-muted-foreground">
                              x{product.quantity}
                            </span>
                          )}
                        </div>
                      ))}
                      <Button
                        size="sm"
                        className="w-full mt-2 gap-2"
                        onClick={() => handleCreateBasket(message.action)}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Create Basket with These Products
                      </Button>
                    </div>
                  )}
                </div>

                {message.role === 'user' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                    <User className="h-5 w-5 text-secondary-foreground" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div className="bg-muted rounded-lg px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t pt-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={selectedBasketId ? "Type your message... (e.g., 'Add milk to this basket')" : "Type your message... (e.g., 'I need ingredients for pasta dinner')"}
                disabled={loading}
                className="flex-1"
              />
              <Button type="submit" disabled={loading || !input.trim()} className="gap-2">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
