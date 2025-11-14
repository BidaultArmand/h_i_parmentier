#!/bin/bash

# Script de démarrage pour Smart Grocery Comparator
# Ce script lance le backend, le frontend et le scanner en parallèle

echo "🚀 Lancement de Smart Grocery Comparator..."
echo ""

# Vérifier si les dépendances sont installées
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installation des dépendances backend..."
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installation des dépendances frontend..."
    cd frontend && npm install && cd ..
fi

if [ ! -d "extensions/yuka-scanner-service/node_modules" ]; then
    echo "📦 Installation des dépendances scanner..."
    cd extensions/yuka-scanner-service && npm install && cd ../..
fi

# Fonction pour nettoyer les processus en arrière-plan lors de l'arrêt
cleanup() {
    echo ""
    echo "🛑 Arrêt des serveurs..."
    kill $BACKEND_PID $FRONTEND_PID $SCANNER_PID 2>/dev/null
    exit 0
}

# Capturer Ctrl+C pour nettoyer proprement
trap cleanup INT

# Démarrer le backend
echo "🔧 Démarrage du backend sur http://localhost:5001..."
(cd backend && npm run dev > ../backend.log 2>&1) &
BACKEND_PID=$!

# Démarrer le scanner
echo "🧪 Démarrage du scanner sur http://localhost:5080..."
(cd extensions/yuka-scanner-service && npm run dev > ../../scanner.log 2>&1) &
SCANNER_PID=$!

# Attendre que le backend et scanner démarrent
sleep 2

# Démarrer le frontend
echo "🎨 Démarrage du frontend sur http://localhost:5173..."
(cd frontend && npm run dev > ../frontend.log 2>&1) &
FRONTEND_PID=$!

# Attendre que le frontend démarre
sleep 3

echo ""
echo "✅ Application démarrée avec succès!"
echo ""
echo "📍 URLs disponibles:"
echo "   - Frontend: http://localhost:5173"
echo "   - Page de dev: http://localhost:5173/landing-dev"
echo "   - Backend API: http://localhost:5001/api"
echo "   - Scanner API: http://localhost:5080"
echo ""
echo "📋 Logs:"
echo "   - Backend: tail -f backend.log"
echo "   - Frontend: tail -f frontend.log"
echo "   - Scanner: tail -f scanner.log"
echo ""
echo "⚠️  Appuyez sur Ctrl+C pour arrêter les serveurs"
echo ""

# Garder le script actif et afficher les logs
tail -f backend.log frontend.log scanner.log
