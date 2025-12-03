#!/bin/bash

echo "🧠 CogniFlow Setup Script"
echo "========================="

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "❌ Ollama not found. Please install Ollama first:"
    echo "   Visit: https://ollama.ai"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker not running. Please start Docker first."
    exit 1
fi

echo "✅ Ollama found"

# Pull Gemma model
echo "📥 Pulling Gemma 2B model..."
ollama pull gemma2:2b

# Start MongoDB container
echo "🐳 Starting MongoDB container..."
docker run -d -p 27017:27017 --name cogniflow-mongodb mongo:latest

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
sleep 5

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo "✅ Setup complete!"
echo ""
echo "🚀 To start CogniFlow:"
echo "   npm start"
echo ""
echo "📊 Then open: http://localhost:3000"
echo ""
echo "💡 Make sure Ollama is running: ollama serve"
