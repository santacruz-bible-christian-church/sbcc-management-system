# MCP Server Setup (Cross-Platform)

## 🎯 Quick Start (3 Steps)

### 1️⃣ Install Dependencies

```bash
# In project root
cd .mcp
npm install
```

### 2️⃣ Get Your API Keys

#### GitHub Token
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes: ☑️ `repo`, ☑️ `read:org`, ☑️ `read:user`
4. Copy the token (starts with `ghp_`)

#### Notion API Key
1. Go to: https://www.notion.so/my-integrations
2. Click "+ New integration"
3. Name: "SBCC Management System"
4. Select workspace: "SBCC"
5. Copy the "Internal Integration Token" (starts with `secret_`)
6. **Important:** Share your SBCC Notion workspace with this integration
   - Open Notion → Click "..." → Connections → Add your integration

#### Database URL
Ask your team lead for the Neon PostgreSQL connection string.

### 3️⃣ Configure VS Code

Open **User Settings** (one-time setup):

**Mac:** `Code` → `Settings...` → `User`  
**Windows/Linux:** `File` → `Preferences` → `Settings`

Click `{}` icon (top-right) to edit JSON directly.

Add these lines:

```json
{
  "sbcc.databaseUrl": "paste_your_database_url_here",
  "sbcc.githubToken": "paste_your_github_token_here",
  "sbcc.notionApiKey": "paste_your_notion_api_key_here"
}
```

**Save the file** and **restart VS Code**.

---

## ✅ Verify It's Working

### Test MCP Servers in Copilot Chat:

1. Open Copilot Chat panel (Ctrl+I / Cmd+I)
2. Try these commands:

```
@workspace List all Python files in backend/core/

@workspace Show me the database schema

@workspace What's the current git status?
```

If you get results, MCP is working! 🎉

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
Download from: https://nodejs.org/

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
```

---

## 🔐 Security

### ✅ Your secrets are safe because:
- User settings file is **not** in the project (outside git repo)
- Each team member uses their **own** API keys
- `.mcp/.env` is gitignored (for local testing only)

### ⚠️ Never commit:
- ❌ Your personal User `settings.json`
- ❌ API keys in workspace `.vscode/settings.json`
- ❌ `.mcp/.env` file

---

## 🐛 Troubleshooting

### "Cannot find User settings.json"

**Mac:**
1. Open VS Code
2. Press `Cmd+Shift+P`
3. Type: "Preferences: Open User Settings (JSON)"
4. Hit Enter

**Windows/Linux:**
1. Open VS Code
2. Press `Ctrl+Shift+P`
3. Type: "Preferences: Open User Settings (JSON)"
4. Hit Enter

### MCP Servers Not Working

**Check:**
1. ✅ Node.js installed: `node --version` (should be 18+)
2. ✅ MCP dependencies installed: `cd .mcp && npm install`
3. ✅ User settings configured with your API keys
4. ✅ VS Code restarted after adding keys

**Test in VS Code terminal:**
```bash
# Should show installed packages
cd .mcp && npm list
```

### "Command not found: npx"

**Solution:** Install Node.js
- **Windows:** https://nodejs.org/en/download/
- **Mac:** `brew install node`
- **Linux:** `sudo apt install nodejs npm`

Verify:
```bash
node --version
npm --version
npx --version
```

### Notion Server Not Working

**Test manually:**

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

Should output: `Notion MCP server running on stdio`

### Still Having Issues?

1. Check VS Code Output panel:
   - `View` → `Output`
   - Select "GitHub Copilot" from dropdown

2. Check VS Code Developer Tools:
   - `Help` → `Toggle Developer Tools`
   - Look for MCP-related errors in Console

3. Ask in team Discord: `#mcp-setup` channel

---

## 📚 What's Installed

| Server | Purpose | Works Without Config? |
|--------|---------|----------------------|
| **Filesystem** | Read/write project files | ✅ Yes |
| **Git** | Git operations | ✅ Yes |
| **PostgreSQL** | Query database | ❌ Needs `databaseUrl` |
| **GitHub** | GitHub API | ❌ Needs `githubToken` |
| **Notion** | Notion API | ❌ Needs `notionApiKey` |

---

## 🎨 Frontend MCP Servers

### React Server (Custom)
- **File:** `servers/react-server.js`
- **Purpose:** React component analysis and frontend tooling
- **Tools:**
  - `list_components` - List all React components
  - `get_component` - Get component source code
  - `list_pages` - List all pages
  - `analyze_imports` - Analyze file dependencies
  - `check_package_json` - Check frontend dependencies

### Fetch Server
- **Package:** `@modelcontextprotocol/server-fetch`
- **Purpose:** Test REST API endpoints
- **Usage:** Test your Django API from frontend

### Memory Server
- **Package:** `@modelcontextprotocol/server-memory`
- **Purpose:** Store development context and decisions
- **Usage:** Remember component patterns, styling choices, etc.

### Puppeteer Server
- **Package:** `@modelcontextprotocol/server-puppeteer`
- **Purpose:** Browser automation and UI testing
- **Usage:** Take screenshots, test forms, automate workflows

---

## 🎓 For Team Leads

### Sharing Credentials Securely

**Don't:**
- ❌ Post in Discord/Slack
- ❌ Commit to git
- ❌ Email in plain text

**Do:**
- ✅ Share via password manager (1Password, Bitwarden)
- ✅ Share via secure note (Notion secure block)
- ✅ Direct message in encrypted channel

### Onboarding Checklist

- [ ] New member clones repo
- [ ] Installs Node.js
- [ ] Runs `cd .mcp && npm install`
- [ ] Gets API keys (GitHub, Notion)
- [ ] Adds keys to User `settings.json`
- [ ] Restarts VS Code
- [ ] Tests with `@workspace` command
- [ ] Confirms working in team standup

---

**Last Updated:** October 2024  
**Tested On:** Windows 11, macOS Sonoma, Ubuntu 22.04  
**Maintained By:** CMSC 309 Team