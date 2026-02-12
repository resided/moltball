# Security Cleanup Guide

## ⚠️ URGENT: Secrets Detected in Git History

Your git history contains sensitive data that MUST be cleaned before making this repo public.

## Detected Secrets

- JWT tokens (`eyJhbGciOiJIUzI1NiIs...`)
- Supabase keys (`sbp_...`)
- Potential private keys

## Cleanup Options

### Option 1: BFG Repo-Cleaner (Recommended)

```bash
# Install BFG
brew install bfg  # macOS
# or download from https://rtyley.github.io/bfg-repo-cleaner/

# Create a file with patterns to remove
echo "eyJhbGciOiJIUzI1NiIs" > passwords.txt
echo "sbp_" >> passwords.txt

# Run BFG
bfg --replace-text passwords.txt

# Clean up
rm passwords.txt
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (DESTRUCTIVE!)
git push origin --force --all
```

### Option 2: git-filter-repo

```bash
# Install git-filter-repo
pip install git-filter-repo

# Remove files with secrets from history
git filter-repo --path arena/.env --path packages/contracts/.env --path packages/cli/.env --invert-paths

# Or replace text patterns
git filter-repo --replace-text <(echo "eyJhbGciOiJIUzI1NiIs==>REMOVED")
```

### Option 3: Nuclear Option (New Repo)

If history cleanup is too complex:

```bash
# Create fresh repo without history
mkdir moltball-clean
cd moltball-clean
git init

# Copy all current files (not .env!)
cp -r ../moltball/* .
rm -rf .git  # Remove old git history

# Re-initialize
git init
git add .
git commit -m "Initial commit"

# Push to new repo
git remote add origin https://github.com/YOUR_USERNAME/moltball.git
git push -u origin main
```

## Prevention

### 1. Pre-commit Hooks

```bash
# Install pre-commit
pip install pre-commit

# Create .pre-commit-config.yaml
cat > .pre-commit-config.yaml << 'EOF'
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: detect-private-key
      - id: check-added-large-files
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.4.0
    hooks:
      - id: detect-secrets
EOF

pre-commit install
```

### 2. GitHub Secret Scanning

Enable in repo settings: Settings > Security > Secret scanning

### 3. Rotate Exposed Secrets

After cleanup, ROTATE ALL EXPOSED KEYS:

1. **Supabase**: Project Settings > API > Regenerate keys
2. **Wallet**: Create new wallet, transfer funds
3. **Basescan**: Generate new API key

## Files That Should NEVER Be Committed

```
.env
.env.local
.env.*.local
*.key
*.pem
*secret*
*private*
node_modules/
```

## Verification

After cleanup, verify:

```bash
# Check for secrets in history
git log --all -p | grep -E "eyJhbGciOiJIUzI1NiIs|sbp_[a-zA-Z0-9]{40,}"

# Should return nothing
```

## Current .env Files Status

| File | Gitignored | Status |
|------|------------|--------|
| arena/.env | ✅ | Safe |
| packages/contracts/.env | ✅ | Safe |
| packages/cli/.env | ✅ | Safe |

## Remember

**NEVER** commit `.env` files!
**ALWAYS** use `.env.example` as templates!
