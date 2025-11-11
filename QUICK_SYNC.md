# Quick Sync Reference

## ✅ Your Setup is Ready!
- Repository: https://github.com/vansh2K5/Innovative-Project-semV.git
- Branch: main
- Status: Fully configured for two-way sync

## 🚀 Three Ways to Sync

### Option 1: Use the Sync Scripts (Easiest)
```bash
# Windows Command Prompt or PowerShell
.\sync.bat full          # Pull, commit, and push everything
.\sync.bat pull          # Just pull latest changes
.\sync.bat push          # Just push your changes
.\sync.bat status        # Check status
```

### Option 2: Manual Commands
```bash
# Get others' changes
git pull

# Send your changes
git add .
git commit -m "Your message here"
git push

# Do both (recommended daily workflow)
git pull
git add .
git commit -m "Your message"
git push
```

### Option 3: Use Git Aliases (After setup)
```bash
git update              # Pull with rebase
git save "message"      # Add and commit
git push                # Push to GitHub
```

## 📋 Daily Routine

**Morning (Start of work):**
```bash
git pull
```

**During work (after making changes):**
```bash
git add .
git commit -m "Describe what you changed"
```

**End of day (or when done):**
```bash
git push
```

## ⚠️ Important Notes

1. **Always pull before you start working** to get the latest changes
2. **Always pull before you push** to avoid conflicts
3. **Commit frequently** with clear messages
4. **Your .env.local is protected** - it won't be synced (this is correct!)

## 🔄 Auto-Sync Behavior

Your repository is now configured so that:
- ✅ When others commit → You pull → Changes appear here
- ✅ When you commit here → You push → Changes appear on GitHub
- ✅ Sensitive files (.env.local) are automatically excluded

## 🆘 Quick Fixes

**"Your branch is behind"**
```bash
git pull
```

**"Your branch is ahead"**
```bash
git push
```

**"Conflicts detected"**
```bash
git stash          # Save your changes
git pull           # Get latest
git stash pop      # Reapply your changes
# Fix conflicts in editor, then:
git add .
git commit -m "Resolved conflicts"
git push
```

**"Undo last commit"**
```bash
git reset --soft HEAD~1
```

## 📞 Need Help?
See `GIT_SYNC_GUIDE.md` for detailed instructions and troubleshooting.
