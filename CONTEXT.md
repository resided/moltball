# Project Context - Last Updated: 2026-02-12

## 🎯 Project Overview
**Moltball** - AI Agent Fantasy Football League on Base
- GitHub: https://github.com/resided/moltball
- Live Site: (deploy when ready)

## 📁 Repository Structure

### Local Folders
- `~/moltball-public` - **ACTIVE REPO** (clean, on GitHub)
- `~/dirtymoltball` - Old repo with secrets (DO NOT USE)

### Key Directories
```
moltball-public/
├── arena/              # React frontend (Vite + shadcn/ui)
│   ├── src/pages/      # UI pages
│   ├── supabase/       # Edge functions (10 functions)
│   └── .env.example    # Template for env vars
├── packages/
│   ├── cli/            # mball CLI for agents
│   ├── contracts/      # Solidity smart contracts
│   └── sdk/            # Shared types
├── scripts/            # SQL seed files (523 players)
└── skill/              # Agent documentation
```

## 🗄️ Database Status

### Supabase Project
- **Project ID**: `orvgnekuhnnirydazqya`
- **URL**: https://orvgnekuhnnirydazqya.supabase.co
- **Status**: Deployed with 10 edge functions

### Player Database
- **Total Players**: 523
- **Coverage**: 20 Premier League teams (2025-26 season)
- **Rarity Distribution**:
  - Premium (86-89): 21 players
  - Gold (82-85): 84 players  
  - Silver (77-81): 241 players
  - Bronze (<77): 177 players

### Top Players
1. Erling Haaland (91) - Man City
2. Rodri (89) - Man City
3. Mohamed Salah (89) - Liverpool
4. Virgil van Dijk (88) - Liverpool
5. Bukayo Saka (88) - Arsenal

### Notable 2025-26 Transfers Updated
- Kevin De Bruyne → Napoli (removed from PL)
- Kyle Walker → Burnley
- Bryan Mbeumo → Man Utd
- João Pedro → Chelsea
- Noni Madueke → Arsenal
- Illia Zabarnyi → PSG
- Milos Kerkez → Liverpool

## 🔧 Environment Setup

### Required .env Files
1. `arena/.env` - Frontend Supabase keys
2. `packages/cli/.env` - CLI Supabase keys
3. `packages/contracts/.env` - Wallet private key, RPC URLs

### Template Files Created
- `.env.example` (root)
- `arena/.env.example`
- `packages/cli/.env.example`
- `packages/contracts/.env.example`

## ✅ Completed Tasks

### Cleanup
- [x] Removed all Lovable references
- [x] Created clean git history (no secrets)
- [x] Pushed to GitHub: https://github.com/resided/moltball
- [x] Deleted SECURITY_CLEANUP.md (no longer needed)
- [x] Updated README.md

### Database
- [x] Deployed 10 edge functions to Supabase
- [x] Seeded 523 Premier League players
- [x] Applied all SQL migrations
- [x] Updated player transfers for 2025-26 season

### Security
- [x] .env files gitignored
- [x] Created .env.example templates
- [x] Secrets NOT in git history (clean repo)

## 🚀 Next Steps (TODO)

### High Priority
- [ ] Rotate Supabase keys (old ones in dirtymoltball history)
- [ ] Create new wallet if private key was in old repo
- [ ] Enable GitHub security features (secret scanning)
- [ ] Deploy frontend (Vercel/Netlify)
- [ ] Test match simulation
- [ ] Test agent CLI

### Features to Add
- [ ] AI agent strategy/behavior system
- [ ] Live match viewer improvements
- [ ] Ballbook social features
- [ ] Pack opening animations
- [ ] Leaderboard rankings

### Smart Contracts
- [ ] Deploy contracts to Base Sepolia
- [ ] Integrate on-chain player ownership
- [ ] Add $BALL token economics

## 📚 Important Files

### Documentation
- `README.md` - Main project readme
- `GAME_DESIGN.md` - Full game mechanics
- `CONTRACTS.md` - Smart contract specs
- `CLAUDE.md` - Developer guide
- `SUPABASE_SETUP.md` - Database setup guide

### SQL Seeds
- `scripts/seed-eafc25-26-complete.sql` - Full 523 player database
- `arena/supabase/seed-premier-league.sql` - Migration file

### Edge Functions (10 deployed)
1. `simulate-match` - Match simulation logic
2. `buy-shares` - Buy player shares
3. `sell-shares` - Sell player shares
4. `open-pack` - Open player packs
5. `buy-card` - Buy player cards
6. `list-card` - List cards for sale
7. `agent-transfers` - Agent squad management
8. `generate-fixtures` - Generate match schedule
9. `seed-data` - Database seeding
10. `resolve-predictions` - Prediction resolution

## 🔑 Key Commands

```bash
# Start frontend
cd ~/moltball-public/arena && npm run dev

# Build CLI
cd ~/moltball-public/packages/cli && npm run build

# Test contracts
cd ~/moltball-public/packages/contracts && npx hardhat test

# Deploy edge functions
cd ~/moltball-public/arena/supabase && supabase functions deploy
```

## ⚠️ Important Notes

1. **DO NOT** use `~/dirtymoltball` - it has secrets in git history
2. **ALWAYS** work in `~/moltball-public`
3. **NEVER** commit `.env` files
4. **ROTATE** Supabase keys before public launch
5. Player SQL files are safe to be public (just game data)

## 🎮 Current Game State

- Database: ✅ Ready with 523 players
- Frontend: ✅ Ready to run
- Edge Functions: ✅ All 10 deployed
- Smart Contracts: ⏳ Not deployed yet
- CLI: ✅ Ready to use

## 📞 Need Help?

Check these files:
- `CLAUDE.md` - Developer guide
- `SUPABASE_SETUP.md` - Database setup
- `GAME_DESIGN.md` - Game mechanics
