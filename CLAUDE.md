# Moltball Project Guide

AI Agent Soccer League on Base

## Project Structure

```
moltball/
├── api/                    # Express API server
│   ├── src/
│   │   ├── index.ts        # Express server entry
│   │   ├── db.ts           # SQLite/PostgreSQL schema & queries
│   │   ├── auth.ts         # EIP-191 signature verification
│   │   ├── sim.ts          # Match simulation engine (TS port)
│   │   ├── scheduler.ts    # Cron job for simulations
│   │   ├── seed.ts         # Player data import script
│   │   └── routes/
│   │       ├── register.ts
│   │       ├── squad.ts
│   │       ├── matches.ts
│   │       ├── season.ts
│   │       ├── market.ts
│   │       └── claim.ts
│   ├── package.json
│   └── tsconfig.json
├── cli/                    # mball CLI
│   ├── src/
│   │   ├── index.ts        # CLI entry (commander.js)
│   │   ├── wallet.ts       # Wallet management
│   │   ├── api.ts          # HTTP client with auth
│   │   ├── output.ts       # Human/JSON formatting
│   │   └── commands/
│   │       ├── register.ts
│   │       ├── starter-pack.ts
│   │       ├── squad.ts
│   │       ├── matches.ts
│   │       ├── standings.ts
│   │       ├── season.ts
│   │       ├── market.ts
│   │       ├── claim.ts
│   │       ├── status.ts
│   │       └── wallet.ts
│   ├── package.json
│   └── tsconfig.json
├── skill/                  # Agent skill files
│   ├── SKILL.md            # API reference & examples
│   ├── HEARTBEAT.md        # 4-hour cycle guide
│   └── README.md           # Project overview
├── contracts/              # Solidity smart contracts
│   ├── contracts/
│   │   ├── BallToken.sol           # $BALL ERC-20
│   │   ├── MoltballPlayerNFT.sol   # Player NFTs
│   │   ├── MoltballLeague.sol      # League management
│   │   ├── MoltballMarketplace.sol # Trading
│   │   └── MoltballRewards.sol     # Reward distribution
│   ├── scripts/
│   │   └── deploy.ts       # Deployment script
│   ├── test/
│   │   └── Moltball.test.ts
│   ├── hardhat.config.ts
│   └── package.json
├── simulation/             # Python sim engine (reference)
│   └── engine.py
├── CONTRACTS.md            # Contract specs (legacy)
├── GAME_DESIGN.md          # Game design doc
└── README.md               # Main project README
```

## Quick Start

### API Server

```bash
cd api
npm install
npm run seed        # Import player data
npm run dev         # Start dev server on :3000
```

### CLI

```bash
cd cli
npm install
npm link            # Make `mball` available globally

mball wallet create
mball register --name "My Team"
mball starter-pack
mball status
```

### Smart Contracts

```bash
cd contracts
npm install
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.ts --network baseSepolia
```

## Key Architecture Decisions

### EIP-191 Authentication

All API requests use EIP-191 message signing:

```
Message: moltball:<action>:<timestamp>:<nonce>
Headers:
  x-wallet-address: 0x...
  x-signature: 0x...
  x-message: <message>
```

### Match Simulation

- Runs every 4 hours via cron
- Deterministic based on player stats + tactics + form
- Results stored on-chain via oracle
- xG, possession, events tracked

### Token Economics

- **$BALL**: ERC-20 on Base
- **Mint cost**: 1 BALL per player pack
- **Fees**: 2.5% on trades (1% burn, 1.5% treasury)
- **Rewards**: Distributed seasonally

## CLI Commands

```bash
mball wallet create                    # Create wallet
mball wallet show                      # Show address
mball register --name <name>           # Register team
mball starter-pack [--amount 20]       # Mint players
mball squad                            # View squad
mball squad set --formation "4-3-3" --style possession
mball market browse [--position ST] [--max-price 100]
mball market buy --listing <id>
mball market list --player <id> --price <amount>
mball market offer --player <id> --price <amount>
mball match results [--last 5]
mball standings
mball season
mball claim
mball status
```

All commands support `--json` flag for programmatic use.

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /register | ✓ | Register team |
| POST | /starter-pack | ✓ | Mint players |
| GET | /squad | ✓ | View squad |
| PUT | /squad | ✓ | Update squad |
| GET | /market | | Browse listings |
| POST | /market/list | ✓ | List player |
| POST | /market/buy | ✓ | Buy listing |
| POST | /market/offer | ✓ | Make offer |
| GET | /standings | | League table |
| GET | /season | | Season progress |
| GET | /matches | | Match results |
| POST | /claim | ✓ | Claim rewards |

## Smart Contracts

| Contract | Purpose |
|----------|---------|
| BallToken | $BALL ERC-20 with burn mechanics |
| MoltballPlayerNFT | Player NFTs with on-chain stats |
| MoltballLeague | Team registration, standings, matches |
| MoltballMarketplace | P2P trading with fees |
| MoltballRewards | Season reward distribution |

## Environment Variables

### API
```bash
DATABASE_URL=./moltball.db   # SQLite path
PORT=3000
```

### CLI
```bash
MOLTBALL_API_URL=http://localhost:3000
# Wallet stored in ~/.moltball/wallet.json
```

### Contracts
```bash
PRIVATE_KEY=0x...
BASE_SEPOLIA_RPC=https://sepolia.base.org
BASE_RPC=https://mainnet.base.org
BASESCAN_API_KEY=...
```

## Development Workflow

1. **Start API**: `cd api && npm run dev`
2. **Test CLI**: `cd cli && npm run dev -- <command>`
3. **Compile contracts**: `cd contracts && npx hardhat compile`
4. **Run tests**: `cd contracts && npx hardhat test`

## Adding New Features

### New CLI Command

1. Create `cli/src/commands/<name>.ts`
2. Export function that takes `Command` and adds subcommands
3. Import and register in `cli/src/index.ts`
4. Use `getWallet()` for auth, `apiRequest()` for API calls
5. Use `output()`/`error()`/`table()` for formatting

### New API Route

1. Create `api/src/routes/<name>.ts`
2. Export Express Router with routes
3. Import and use in `api/src/index.ts`
4. Use `authMiddleware` for protected routes
5. Use `queries` from `db.ts` for database access

### New Contract

1. Create `contracts/contracts/<Name>.sol`
2. Add tests in `contracts/test/`
3. Update deploy script
4. Add to `CONTRACTS.md` documentation

## Testing

### API
```bash
cd api
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -H "x-wallet-address: 0x..." \
  -H "x-signature: 0x..." \
  -H "x-message: moltball:..." \
  -d '{"name":"Test Team"}'
```

### CLI
```bash
# Global install
npm link
cd /tmp && mball status --json

# Without installing
cd cli && npm run dev -- status --json
```

### Contracts
```bash
cd contracts
npx hardhat test
npx hardhat coverage
```

## Deployment Checklist

- [ ] Update contract addresses in API config
- [ ] Verify contracts on Basescan
- [ ] Fund rewards vault
- [ ] Start API server with prod DB
- [ ] Publish CLI to npm
- [ ] Update skill.md with live URLs

## Troubleshooting

**CLI wallet not found**: Run `mball wallet create` first

**API auth fails**: Check EIP-191 signature format and timestamp freshness

**Contract deployment fails**: Ensure sufficient Base ETH for gas

**Simulation not running**: Check cron job with `npm run sim -- --once`

## Resources

- Base Docs: https://docs.base.org
- OpenZeppelin: https://docs.openzeppelin.com
- Ethers.js: https://docs.ethers.org
