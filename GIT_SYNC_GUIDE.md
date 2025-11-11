# Git Sync Guide

## Current Setup ✅
Your repository is already connected to GitHub:
- **Remote**: https://github.com/vansh2K5/Innovative-Project-semV.git
- **Branch**: main (tracking origin/main)
- **Status**: Working tree clean

## Daily Workflow

### 1. Before Starting Work (Pull Latest Changes)
```bash
git pull
```
This fetches and merges any changes from GitHub that others have committed.

### 2. Making Changes Locally
```bash
# Check what files you've modified
git status

# Add specific files
git add <filename>

# Or add all changes
git add .

# Commit with a descriptive message
git commit -m "Your descriptive message here"
```

### 3. Push Your Changes to GitHub
```bash
git push
```

### 4. Complete Sync Workflow (Recommended)
```bash
# Pull latest changes first
git pull

# Add your changes
git add .

# Commit your changes
git commit -m "Your message"

# Push to GitHub
git push
```

## Quick Commands

### Sync from GitHub (Get others' changes)
```bash
git pull
```

### Sync to GitHub (Send your changes)
```bash
git add .
git commit -m "Your message"
git push
```

### Check Status
```bash
# See what's changed locally
git status

# See commit history
git log --oneline -10

# Check if you're behind/ahead of GitHub
git fetch
git status
```

## Handling Conflicts

If someone else pushed changes while you were working:

1. **Stash your changes** (temporarily save them):
   ```bash
   git stash
   ```

2. **Pull latest changes**:
   ```bash
   git pull
   ```

3. **Reapply your changes**:
   ```bash
   git stash pop
   ```

4. **Resolve any conflicts** in your editor, then:
   ```bash
   git add .
   git commit -m "Resolved conflicts"
   git push
   ```

## Best Practices

1. **Pull before you start working** - Always run `git pull` when you begin
2. **Commit often** - Make small, logical commits with clear messages
3. **Pull before you push** - Run `git pull` before `git push` to avoid conflicts
4. **Write clear commit messages** - Describe what changed and why
5. **Don't commit sensitive files** - Use `.gitignore` for secrets, API keys, etc.

## Automated Sync (Optional)

### Set up Git to automatically pull on open:
Add this to your IDE settings or create a script that runs `git pull` when you open the project.

### Set up push reminders:
Configure your IDE to remind you to push uncommitted changes.

## Troubleshooting

### "Your branch is behind 'origin/main'"
```bash
git pull
```

### "Your branch is ahead of 'origin/main'"
```bash
git push
```

### "Diverged branches"
```bash
git pull --rebase
# Or if you prefer merge
git pull
```

### Undo last commit (keep changes)
```bash
git reset --soft HEAD~1
```

### Discard all local changes
```bash
git reset --hard origin/main
```

## Current Repository Info
- Remote URL: https://github.com/vansh2K5/Innovative-Project-semV.git
- Default Branch: main
- Last Commit: feat: Complete event management system with authentication and error handling
