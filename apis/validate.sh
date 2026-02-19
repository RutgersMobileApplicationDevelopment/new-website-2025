#!/bin/bash

# RUMAD APIs Validation Script
# Checks if everything is set up correctly

set -e

echo "🔍 Validating RUMAD APIs Setup..."
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Function to check if a file exists
file_exists() {
  [ -f "$1" ]
}

# Function to check if a directory exists
dir_exists() {
  [ -d "$1" ]
}

echo -e "${BLUE}=== Prerequisites ===${NC}"

# Check Node.js
if command_exists node; then
  NODE_VERSION=$(node -v)
  echo -e "${GREEN}✓ Node.js installed: ${NODE_VERSION}${NC}"
  
  # Check if version is 20 or higher
  MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
  if [ "$MAJOR_VERSION" -lt 20 ]; then
    echo -e "${YELLOW}⚠ Node.js version should be 20+, found v${MAJOR_VERSION}${NC}"
    WARNINGS=$((WARNINGS + 1))
  fi
else
  echo -e "${RED}✗ Node.js not found${NC}"
  ERRORS=$((ERRORS + 1))
fi

# Check npm
if command_exists npm; then
  NPM_VERSION=$(npm -v)
  echo -e "${GREEN}✓ npm installed: ${NPM_VERSION}${NC}"
else
  echo -e "${RED}✗ npm not found${NC}"
  ERRORS=$((ERRORS + 1))
fi

# Check Docker
if command_exists docker; then
  echo -e "${GREEN}✓ Docker installed${NC}"
  
  # Check if Docker is running
  if docker info >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Docker is running${NC}"
  else
    echo -e "${RED}✗ Docker is not running${NC}"
    ERRORS=$((ERRORS + 1))
  fi
else
  echo -e "${RED}✗ Docker not found${NC}"
  ERRORS=$((ERRORS + 1))
fi

echo ""
echo -e "${BLUE}=== Project Structure ===${NC}"

# Check directory structure
DIRS=(
  "apps/api"
  "apps/playground"
  "infra"
  "packages/rumad-client"
)

for dir in "${DIRS[@]}"; do
  if dir_exists "$dir"; then
    echo -e "${GREEN}✓ $dir exists${NC}"
  else
    echo -e "${RED}✗ $dir missing${NC}"
    ERRORS=$((ERRORS + 1))
  fi
done

echo ""
echo -e "${BLUE}=== Configuration Files ===${NC}"

# Check API configuration
if file_exists "apps/api/.env"; then
  echo -e "${GREEN}✓ apps/api/.env exists${NC}"
else
  if file_exists "apps/api/.env.example"; then
    echo -e "${YELLOW}⚠ apps/api/.env missing (run: cp apps/api/.env.example apps/api/.env)${NC}"
    WARNINGS=$((WARNINGS + 1))
  else
    echo -e "${RED}✗ apps/api/.env.example missing${NC}"
    ERRORS=$((ERRORS + 1))
  fi
fi

# Check Playground configuration
if file_exists "apps/playground/.env.local"; then
  echo -e "${GREEN}✓ apps/playground/.env.local exists${NC}"
else
  if file_exists "apps/playground/.env.example"; then
    echo -e "${YELLOW}⚠ apps/playground/.env.local missing (run: cp apps/playground/.env.example apps/playground/.env.local)${NC}"
    WARNINGS=$((WARNINGS + 1))
  else
    echo -e "${RED}✗ apps/playground/.env.example missing${NC}"
    ERRORS=$((ERRORS + 1))
  fi
fi

echo ""
echo -e "${BLUE}=== Dependencies ===${NC}"

# Check if node_modules exist
MODULES=(
  "apps/api/node_modules"
  "apps/playground/node_modules"
  "packages/rumad-client/node_modules"
)

ALL_INSTALLED=true
for module in "${MODULES[@]}"; do
  if dir_exists "$module"; then
    echo -e "${GREEN}✓ ${module} installed${NC}"
  else
    echo -e "${YELLOW}⚠ ${module} not installed${NC}"
    ALL_INSTALLED=false
    WARNINGS=$((WARNINGS + 1))
  fi
done

if [ "$ALL_INSTALLED" = false ]; then
  echo -e "${YELLOW}→ Run './setup.sh' or 'npm run setup' to install dependencies${NC}"
fi

echo ""
echo -e "${BLUE}=== Infrastructure ===${NC}"

# Check if Docker containers are running
if command_exists docker; then
  if docker ps | grep -q rumad-redis; then
    echo -e "${GREEN}✓ Redis container running${NC}"
  else
    echo -e "${YELLOW}⚠ Redis container not running${NC}"
    WARNINGS=$((WARNINGS + 1))
  fi
  
  if docker ps | grep -q rumad-postgres; then
    echo -e "${GREEN}✓ Postgres container running${NC}"
  else
    echo -e "${YELLOW}⚠ Postgres container not running${NC}"
    WARNINGS=$((WARNINGS + 1))
  fi
  
  if [ "$WARNINGS" -gt 0 ]; then
    echo -e "${YELLOW}→ Run 'cd infra && docker-compose up -d' to start infrastructure${NC}"
  fi
fi

echo ""
echo -e "${BLUE}=== Summary ===${NC}"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║  ✓ All checks passed!                 ║${NC}"
  echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
  echo ""
  echo "You're ready to run:"
  echo "  1. cd apps/api && npm run dev"
  echo "  2. cd apps/playground && npm run dev"
elif [ $ERRORS -eq 0 ]; then
  echo -e "${YELLOW}⚠ ${WARNINGS} warning(s) found${NC}"
  echo ""
  echo "Setup is mostly complete, but some optional items are missing."
  echo "Review warnings above and run suggested commands."
  exit 0
else
  echo -e "${RED}✗ ${ERRORS} error(s) and ${WARNINGS} warning(s) found${NC}"
  echo ""
  echo "Please fix the errors above before proceeding."
  echo "Run './setup.sh' to automatically set up the project."
  exit 1
fi
