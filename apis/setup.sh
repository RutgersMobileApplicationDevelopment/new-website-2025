#!/bin/bash

# RUMAD APIs Setup Script
# This script sets up the entire RUMAD API platform

set -e

echo "🚀 Setting up RUMAD APIs Platform..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Docker is running${NC}"
echo ""

# 1. Start infrastructure
echo "📦 Starting infrastructure (Redis + Postgres)..."
cd infra
docker-compose up -d
cd ..
echo -e "${GREEN}✓ Infrastructure started${NC}"
echo ""

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 5
echo -e "${GREEN}✓ Services ready${NC}"
echo ""

# 2. Setup API server
echo "🔧 Setting up API server..."
cd apps/api
if [ ! -f .env ]; then
  cp .env.example .env
  echo -e "${YELLOW}→ Created .env file from .env.example${NC}"
fi
npm install
echo -e "${GREEN}✓ API server setup complete${NC}"
cd ../..
echo ""

# 3. Setup Playground
echo "🎨 Setting up Playground..."
cd apps/playground
if [ ! -f .env.local ]; then
  cp .env.example .env.local
  echo -e "${YELLOW}→ Created .env.local file from .env.example${NC}"
fi
npm install
echo -e "${GREEN}✓ Playground setup complete${NC}"
cd ../..
echo ""

# 4. Setup Client library
echo "📚 Setting up Client library..."
cd packages/rumad-client
npm install
echo -e "${GREEN}✓ Client library setup complete${NC}"
cd ../..
echo ""

# Summary
echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✓ RUMAD APIs Setup Complete!         ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Start the API server:"
echo -e "   ${YELLOW}cd apps/api && npm run dev${NC}"
echo ""
echo "2. Start the Playground (in a new terminal):"
echo -e "   ${YELLOW}cd apps/playground && npm run dev${NC}"
echo ""
echo "3. Open the Playground:"
echo -e "   ${YELLOW}http://localhost:3002${NC}"
echo ""
echo "4. Test the API:"
echo -e "   ${YELLOW}curl -H 'x-api-key: demo_key_12345' http://localhost:3001/v1/quotes${NC}"
echo ""
echo "📚 Documentation:"
echo "   - README: apis/README.md"
echo "   - API Docs: http://localhost:3002/docs (after starting playground)"
echo "   - Headers Guide: http://localhost:3002/headers"
echo ""
echo "🔑 Demo API Keys:"
echo "   - demo_key_12345 (Free tier)"
echo "   - test_key_67890 (Basic tier)"
echo "   - admin_key_abcde (Pro tier)"
echo ""
echo -e "${GREEN}Happy coding! 🎉${NC}"
