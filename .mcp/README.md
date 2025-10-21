# MCP Server Setup (Cross-Platform)

## 🎯 Quick Start (3 Steps)

### 1️⃣ Install Dependencies

```bash
# In project root
cd .mcp
npm install
```

**Verify installation:**
```bash
npm list
```

Should show:
- `@modelcontextprotocol/sdk@0.5.0`
- `@notionhq/client@2.2.15`

---

### 2️⃣ Get Your API Keys

#### GitHub Personal Access Token
1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. **Token name:** "SBCC Management System - MCP"
4. **Expiration:** 90 days (or your preference)
5. **Select scopes:**
   - ☑️ `repo` (all repo permissions)
   - ☑️ `read:org`
   - ☑️ `read:user`
6. Click **"Generate token"**
7. **Copy the token** (starts with `ghp_`)
8. ⚠️ **Save it somewhere safe!** You won't see it again.

---

#### Notion API Key
1. Go to: https://www.notion.so/my-integrations
2. Click **"+ New integration"**
3. **Name:** "SBCC Management System"
4. **Associated workspace:** Select your SBCC workspace
5. Click **"Submit"**
6. **Copy the "Internal Integration Token"** (starts with `secret_`)
7. **Important:** Share your SBCC Notion workspace with this integration:
   - Open your Notion workspace
   - Click **"..."** (three dots) in top-right
   - Select **"Connections"**
   - Find and add your "SBCC Management System" integration

---

#### Database URL
Ask your team lead for the Neon PostgreSQL connection string.

**Format:**
```
postgresql://username:password@host.neon.tech/database?sslmode=require
```

You can also find it in `backend/.env` if you have backend access.

---

### 3️⃣ Configure VS Code User Settings

**Important:** API keys go in your **User Settings** (not workspace settings).

#### Open User Settings JSON

**Method 1: Command Palette**
1. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. Type: **"Preferences: Open User Settings (JSON)"**
3. Press Enter

**Method 2: Menu**
- **Mac:** `Code` → `Settings...` → Click `{}` icon (top-right)
- **Windows/Linux:** `File` → `Preferences` → `Settings` → Click `{}` icon

---

#### Add Your API Keys

Add these lines to your User Settings JSON file:

```json
{
  // ... your existing settings ...
  
  // SBCC Management System - Personal API Keys
  // IMPORTANT: This file is outside the git repo (safe)
  "sbcc.databaseUrl": "postgresql://username:password@host.neon.tech/database?sslmode=require",
  "sbcc.githubToken": "ghp_your_actual_github_token_here",
  "sbcc.notionApiKey": "secret_your_actual_notion_key_here"
}
```

**⚠️ Important:**
- Replace the placeholder values with YOUR actual keys from Step 2
- Add a comma after the previous setting if needed
- Keep your existing settings - don't delete anything

**Example:**
```json
{
  "editor.fontSize": 14,
  "workbench.colorTheme": "Dark+",
  
  // Add your SBCC keys here
  "sbcc.databaseUrl": "postgresql://...",
  "sbcc.githubToken": "ghp_...",
  "sbcc.notionApiKey": "secret_..."
}
```

---

#### Save and Restart

1. **Save:** `Cmd+S` (Mac) or `Ctrl+S` (Windows/Linux)
2. **Close VS Code completely:** `Cmd+Q` (Mac) or close all windows
3. **Reopen your project:**
   ```bash
   cd /path/to/sbcc-management-system
   code .
   ```

---

## ✅ Verify It's Working

### Test in Copilot Chat

1. **Open Copilot Chat:** `Cmd+I` (Mac) or `Ctrl+I` (Windows/Linux)
2. **Try these commands:**

#### Test 1: Filesystem + Git
```
@workspace List all Python files in backend/core/
```
**Expected:** List of `.py` files

#### Test 2: Database (Postgres)
```
@workspace Show me the User model database schema
```
**Expected:** Database table structure

#### Test 3: GitHub API
```
@workspace What are the recent commits in this repository?
```
**Expected:** Commit history

#### Test 4: Custom React Server
```
@workspace List all React components in the frontend
```
**Expected:** List of `.jsx` components

#### Test 5: Notion
```
Search my Notion workspace for "SBCC" pages
```
**Expected:** List of Notion pages

---

### If MCP is working:
✅ You'll get detailed responses with file contents, schemas, or data  
✅ MCP servers auto-start every time you open VS Code  
✅ No visible logs needed - it just works!

---

## 🖥️ Platform-Specific Notes

### Windows Users

**User Settings Location:**
```
%APPDATA%\Code\User\settings.json
```

**Open in File Explorer:**
```
Win+R → %APPDATA%\Code\User
```

**Install Node.js:**
- Download from: https://nodejs.org/
- Version: 18.x or higher

---

### Mac Users

**User Settings Location:**
```
~/Library/Application Support/Code/User/settings.json
```

**Open in Finder:**
```
Cmd+Shift+G → ~/Library/Application Support/Code/User
```

**Install Node.js:**
```bash
brew install node
```

---

### Linux Users

**User Settings Location:**
```
~/.config/Code/User/settings.json
```

**Install Node.js:**
```bash
# Ubuntu/Debian
sudo apt install nodejs npm

# Fedora
sudo dnf install nodejs npm

# Verify version (needs 18+)
node --version
```

---

## 🔐 Security Best Practices

### ✅ Your secrets are safe because:

1. **User Settings** are stored **outside the git repository**
   - Located in your OS user directory
   - Never committed to version control
   - Each developer has their own file

2. **Workspace Settings** only contain **references** to User Settings
   - Example: `${config:sbcc.databaseUrl}` (not the actual password)
   - Safe to commit to git

3. **No `.env` files needed** in the project
   - VS Code reads from User Settings
   - MCP servers get environment variables automatically

---

### ⚠️ Never commit:

- ❌ Your personal User `settings.json`
- ❌ API keys in workspace `.vscode/settings.json`
- ❌ `.mcp/.env` file (not needed - delete if exists)
- ❌ Passwords or tokens anywhere in the project

---

### 🛡️ If you accidentally exposed secrets:

1. **Immediately rotate** all API keys:
   - Regenerate GitHub token
   - Regenerate Notion API key
   - Change database password (contact team lead)

2. **Remove from git history** (if committed):
   ```bash
   # Contact team lead for help with this
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .mcp/.env" \
     --prune-empty --tag-name-filter cat -- --all
   ```

---

## 🐛 Troubleshooting

### MCP Servers Not Working

**Check 1: Node.js Version**
```bash
node --version
```
Should be `v18.0.0` or higher.

**Check 2: Dependencies Installed**
```bash
cd .mcp
npm list
```
Should show `@modelcontextprotocol/sdk` and `@notionhq/client`.

**Check 3: API Keys Format**
- `sbcc.databaseUrl` should start with `postgresql://`
- `sbcc.githubToken` should start with `ghp_`
- `sbcc.notionApiKey` should start with `secret_` or `ntn_`

**Check 4: VS Code Restarted**
- MCP servers only start when VS Code opens
- Close completely and reopen

---

### "Cannot find User settings.json"

Use the Command Palette method:

1. `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. Type: **"Preferences: Open User Settings (JSON)"**
3. Press Enter

This will create the file if it doesn't exist.

---

### "Command not found: npx"

**Install Node.js:**
- **Windows:** https://nodejs.org/en/download/
- **Mac:** `brew install node`
- **Linux:** `sudo apt install nodejs npm`

**Verify:**
```bash
node --version    # Should be 18+
npm --version
npx --version
```

---

### Test Custom Servers Manually

#### Test Notion Server

**Mac/Linux:**
```bash
cd .mcp
export NOTION_API_KEY="secret_your_key_here"
node servers/notion-server.js
```

**Windows (PowerShell):**
```powershell
cd .mcp
$env:NOTION_API_KEY="secret_your_key_here"
node servers/notion-server.js
```

**Expected output:**
```
Notion MCP server running on stdio
```

Press `Ctrl+C` to stop.

---

#### Test React Server

```bash
cd .mcp
node servers/react-server.js
```

**Expected output:**
```
React MCP server running on stdio
```

Press `Ctrl+C` to stop.

---

### Still Having Issues?

1. **Check VS Code Output panel:**
   - `View` → `Output`
   - Select **"GitHub Copilot"** from dropdown
   - Look for MCP-related errors

2. **Check VS Code Developer Tools:**
   - `Help` → `Toggle Developer Tools`
   - Go to **Console** tab
   - Filter for "mcp" to see logs

3. **Ask your team:**
   - Discord: `#mcp-setup` channel
   - Tag: `@team-lead`

---

## 📚 What's Installed

### MCP Servers (9 Total)

| Server | Purpose | Auto-Start? | Requires API Key? |
|--------|---------|-------------|-------------------|
| **Filesystem** | Read/write project files | ✅ Always | No |
| **Git** | Git operations (status, log, diff) | ✅ Always | No |
| **Postgres** | Query database, show schemas | ⚠️ If key set | Yes (`sbcc.databaseUrl`) |
| **GitHub** | GitHub API (issues, PRs, commits) | ⚠️ If key set | Yes (`sbcc.githubToken`) |
| **Notion** | Search Notion pages and databases | ⚠️ If key set | Yes (`sbcc.notionApiKey`) |
| **React** | Analyze React components (custom) | ✅ Always | No |
| **Fetch** | Test REST API endpoints | ✅ Always | No |
| **Memory** | Store context across sessions | ✅ Always | No |
| **Puppeteer** | Browser automation, screenshots | ✅ Always | No |

**Note:** Servers without keys fail silently (won't break Copilot).

---

### Custom Servers

#### React Server
**File:** `servers/react-server.js`

**Tools:**
- `list_components` - List all React components
- `get_component` - Get component source code
- `list_pages` - List all pages
- `analyze_imports` - Analyze file dependencies
- `check_package_json` - Check frontend dependencies

**Usage:**
```
@workspace List all React components
@workspace Show me the Button component source
@workspace Analyze imports in LoginPage.jsx
```

---

#### Notion Server
**File:** `servers/notion-server.js`

**Tools:**
- `notion_search` - Search for Notion pages
- `notion_get_page` - Get page content with blocks
- `notion_get_database` - Get database entries

**Usage:**
```
Search Notion for "meeting notes"
Get Notion page with ID abc123
Show me the SBCC database entries
```

---

## 🎨 Additional MCP Servers

### Fetch Server
**Purpose:** Test REST API endpoints from Copilot Chat

**Usage:**
```
Fetch https://api.github.com/repos/emperuna/sbcc-management-system
Test POST request to http://localhost:8000/api/auth/login/
```

---

### Memory Server
**Purpose:** Store development context and decisions

**Usage:**
```
Remember: We're using Tailwind CSS with SBCC orange (#FDB54A)
What did I decide about the login flow?
```

---

### Puppeteer Server
**Purpose:** Browser automation and UI testing

**Usage:**
```
Take a screenshot of http://localhost:5173/login
Fill out the login form and click submit
```

---

## 🎓 For Team Leads

### Sharing Credentials Securely

**❌ Don't:**
- Post in Discord/Slack public channels
- Commit to git
- Email in plain text
- Share in Notion pages (unless encrypted block)

**✅ Do:**
- Use password manager (1Password, Bitwarden)
- Share via encrypted DM
- Share via secure note in private Notion page
- Use team password vault

---

### Onboarding New Members

**Checklist:**

- [ ] New member installs Node.js (v18+)
- [ ] Clones repository
- [ ] Runs `cd .mcp && npm install`
- [ ] Gets API keys from team lead (GitHub, Notion, Database)
- [ ] Opens User Settings JSON (`Cmd+Shift+P` → "Open User Settings (JSON)")
- [ ] Adds three keys: `sbcc.databaseUrl`, `sbcc.githubToken`, `sbcc.notionApiKey`
- [ ] Saves and restarts VS Code
- [ ] Tests with `@workspace` commands in Copilot Chat
- [ ] Confirms working in team standup/channel

**Estimated time:** 10-15 minutes

---

### Common Onboarding Issues

| Issue | Solution |
|-------|----------|
| "Node not found" | Install Node.js 18+ |
| "npm install fails" | Check internet connection, try `npm cache clean --force` |
| "MCP not working" | Verify API keys in **User Settings** (not workspace) |
| "Wrong settings file" | Use Command Palette to open **User Settings (JSON)** |
| "Keys not working" | Check format: `postgresql://`, `ghp_`, `secret_` |

---

## 🔄 Configuration Flow

```
Developer Machine
│
├── User Settings (~/.../User/settings.json)
│   ├── sbcc.databaseUrl: "postgresql://..."     ← Real secrets here
│   ├── sbcc.githubToken: "ghp_..."
│   └── sbcc.notionApiKey: "secret_..."
│
└── Workspace Settings (.vscode/settings.json)
    └── mcp.servers:
        ├── postgres:
        │   └── env:
        │       └── DATABASE_URL: "${config:sbcc.databaseUrl}"  ← Reference
        ├── github:
        │   └── env:
        │       └── GITHUB_PERSONAL_ACCESS_TOKEN: "${config:sbcc.githubToken}"
        └── notion:
            └── env:
                └── NOTION_API_KEY: "${config:sbcc.notionApiKey}"

VS Code combines them → MCP servers receive environment variables
```

---

## 📝 File Structure

```
.mcp/
├── .env.example          ← Template (safe to commit)
├── package.json          ← Dependencies (committed)
├── package-lock.json     ← Version lock (committed)
├── node_modules/         ← Installed packages (gitignored)
├── README.md             ← This file (committed)
└── servers/
    ├── notion-server.js  ← Custom Notion MCP (committed)
    └── react-server.js   ← Custom React MCP (committed)

❌ .env                   ← NOT NEEDED (delete if exists)
```

---

## 🚀 Advanced Usage

### Query Examples

**Database:**
```
@workspace Show me all database tables
@workspace Query the users table for admins
@workspace What's the schema for the Event model?
```

**GitHub:**
```
@workspace List open issues
@workspace Show recent pull requests
@workspace What changed in the last commit?
```

**Files:**
```
@workspace Find all TODO comments in the codebase
@workspace Show me the authentication flow
@workspace List all API endpoints
```

**React:**
```
@workspace Analyze the component hierarchy
@workspace What props does the Button component accept?
@workspace Show me all pages that use the Card component
```

---

## 📅 Maintenance

### Updating Dependencies

```bash
cd .mcp
npm update
npm list
```

### Rotating API Keys

When rotating keys (every 90 days or if compromised):

1. Generate new keys (GitHub, Notion)
2. Update **User Settings** with new keys
3. Restart VS Code
4. Revoke old keys

---

## 📖 Additional Resources

- **MCP Documentation:** https://modelcontextprotocol.io/
- **VS Code Settings:** https://code.visualstudio.com/docs/getstarted/settings
- **GitHub Tokens:** https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token
- **Notion API:** https://developers.notion.com/

---

**Last Updated:** October 21, 2025  
**Tested On:** Windows 11, macOS Sonoma/Sequoia, Ubuntu 22.04/24.04  
**VS Code Version:** 1.94+ (Insiders compatible)  
**Maintained By:** CMSC 309 Team