#!/bin/bash

# Script pour arrêter proprement tous les processus de Smart Grocery Comparator

echo "🛑 Arrêt de Smart Grocery Comparator..."

# Arrêter tous les processus Node.js sur les ports 5001 et 5173
echo "🔍 Recherche des processus..."

# Port 5001 (Backend)
BACKEND_PID=$(lsof -ti:5001)
if [ ! -z "$BACKEND_PID" ]; then
    echo "   ⏹️  Arrêt du backend (PID: $BACKEND_PID)..."
    kill -9 $BACKEND_PID 2>/dev/null
else
    echo "   ℹ️  Aucun processus backend trouvé sur le port 5001"
fi

# Port 5173 (Frontend)
FRONTEND_PID=$(lsof -ti:5173)
if [ ! -z "$FRONTEND_PID" ]; then
    echo "   ⏹️  Arrêt du frontend (PID: $FRONTEND_PID)..."
    kill -9 $FRONTEND_PID 2>/dev/null
else
    echo "   ℹ️  Aucun processus frontend trouvé sur le port 5173"
fi

# Arrêter nodemon si présent
NODEMON_PIDS=$(pgrep -f nodemon)
if [ ! -z "$NODEMON_PIDS" ]; then
    echo "   ⏹️  Arrêt de nodemon..."
    kill -9 $NODEMON_PIDS 2>/dev/null
fi

echo ""
echo "✅ Tous les serveurs ont été arrêtés!"
