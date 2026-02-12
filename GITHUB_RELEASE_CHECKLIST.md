# GitHub Release Checklist

## Before Making This Repo Public

### ✅ Completed

- [x] Removed all Lovable references from:
  - [x] `arena/vite.config.ts` - removed `lovable-tagger` plugin
  - [x] `arena/index.html` - updated title and meta tags
  - [x] `arena/package.json` - removed `lovable-tagger` dependency
  - [x] `README.md` - removed "(from Lovable)" text
  - [x] Deleted `arena/README.md` (was all Lovable content)

- [x] Environment file protection:
  - [x] `.gitignore` updated with comprehensive rules
  - [x] `arena/.env` is gitignored
  - [x] `packages/contracts/.env` is gitignored
  - [x] `packages/cli/.env` is gitignored
  - [x] Created `.env.example` templates

### ⚠️ REQUIRED BEFORE PUBLIC RELEASE

- [ ] **CLEAN GIT HISTORY** - Secrets detected!
  ```bash
  # Verify secrets in history
  git log --all -p | grep -E "eyJhbGciOiJIUzI1NiIs|sbp_[a-zA-Z0-9]{40,}"
  ```
  
  Use one of these methods:
  - [ ] BFG Repo-Cleaner (recommended)
  - [ ] git-filter-repo
  - [ ] Create fresh repo without history (nuclear option)
  
  See `SECURITY_CLEANUP.md` for detailed instructions.

- [ ] **ROTATE EXPOSED SECRETS**
  - [ ] Regenerate Supabase keys (Project Settings > API)
  - [ ] Create new wallet if private key was exposed
  - [ ] Regenerate Basescan API key

- [ ] **Enable GitHub Security Features**
  - [ ] Settings > Security > Secret scanning - Enable
  - [ ] Settings > Security > Push protection - Enable
  - [ ] Settings > Branches > Branch protection rules

- [ ] **Add License**
  ```bash
  # Add MIT License
curl -o LICENSE https://www.opensource.org/licenses/MIT
  ```

- [ ] **Create GitHub Secrets** (for CI/CD)
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `PRIVATE_KEY` (for deployments)

### 📋 Verification Steps

```bash
# 1. Check no .env files are tracked
git ls-files | grep "\.env" | grep -v "\.env\.example"
# Should return nothing

# 2. Check no secrets in current files
grep -r "sbp_" --include="*.ts" --include="*.tsx" --include="*.js" . | grep -v "node_modules" | grep -v ".env.example"
# Should return nothing

# 3. Check git history is clean
git log --all -p | grep -E "eyJhbGciOiJIUzI1NiIs" | head -5
# Should return nothing after cleanup

# 4. Verify build works
npm run build  # in arena/
```

### 🚀 Publishing

After all checks pass:

```bash
# 1. Commit all cleanup changes
git add .
git commit -m "security: remove lovable refs, add security docs"

# 2. Clean history (if needed) or use new repo
# See SECURITY_CLEANUP.md

# 3. Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/moltball.git
git push -u origin main

# 4. Make repo public on GitHub
# Settings > General > Visibility > Public
```

### 📝 Post-Release

- [ ] Add repo URL to README
- [ ] Create GitHub release with changelog
- [ ] Set up GitHub Actions (optional)
- [ ] Add contribution guidelines (CONTRIBUTING.md)
- [ ] Add code of conduct (CODE_OF_CONDUCT.md)

## Current Status

| Component | Status |
|-----------|--------|
| Code cleanup | ✅ Done |
| .gitignore | ✅ Done |
| .env.example files | ✅ Done |
| Git history | ⚠️ NEEDS CLEANUP |
| Secret rotation | ⚠️ NEEDS ACTION |
| License | ⚠️ NEEDS ADDING |
| GitHub settings | ⚠️ NEEDS CONFIGURING |

**DO NOT MAKE PUBLIC until git history is cleaned and secrets are rotated!**
