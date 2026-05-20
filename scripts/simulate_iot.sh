#!/bin/bash

# IoT Simulator Launcher
# Automatically loads credentials from .env and executes the simulation

echo "🛰️  Initializing IoT Simulation Link..."

# 1. Locate and load environment variables
if [ -f "apps/web/.env.local" ]; then
  export $(grep -v '^#' apps/web/.env.local | xargs)
  SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
  SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
elif [ -f "apps/mobile/.env" ]; then
  export $(grep -v '^#' apps/mobile/.env | xargs)
fi

if [ -z "$SUPABASE_URL" ]; then
  echo "❌ Error: SUPABASE_URL not found in environment files."
  exit 1
fi

# 2. Run the Node simulation script
SUPABASE_URL=$SUPABASE_URL SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY node scripts/iot_simulator.js
