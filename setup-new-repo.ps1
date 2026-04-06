$ErrorActionPreference = "Stop"

$NEW_REPO = "https://github.com/tashirotakehiro/realtime-meeting-minutes.git"
$SRC_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$WORK_DIR = Join-Path $env:TEMP "rtmm-setup"

Write-Host "=== リアルタイム議事録システム 新リポ移行スクリプト ===" -ForegroundColor Cyan
Write-Host ""

# Clean up previous attempt
if (Test-Path $WORK_DIR) { Remove-Item -Recurse -Force $WORK_DIR }

# Clone new repo
Write-Host "[1/5] 新リポをclone..." -ForegroundColor Yellow
git clone $NEW_REPO $WORK_DIR
Set-Location $WORK_DIR

# Create directories
Write-Host "[2/5] ディレクトリ作成..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path meeting, agents, routes, public, data | Out-Null

# Copy files from source
Write-Host "[3/5] ファイルをコピー..." -ForegroundColor Yellow
Copy-Item "$SRC_DIR\meeting\prompts.js" "meeting\"
Copy-Item "$SRC_DIR\meeting\structurer.js" "meeting\"
Copy-Item "$SRC_DIR\meeting\meeting-manager.js" "meeting\"
Copy-Item "$SRC_DIR\agents\agent-runner.js" "agents\"
Copy-Item "$SRC_DIR\routes\meeting-routes.js" "routes\"
Copy-Item "$SRC_DIR\public\meeting.html" "public\index.html"
New-Item -ItemType File -Force -Path "data\.gitkeep" | Out-Null

# Create .gitignore
@"
node_modules/
.env
data/meetings.json
"@ | Set-Content -Path ".gitignore" -Encoding UTF8

# Create .env.example
@"
ANTHROPIC_API_KEY=your_api_key_here
"@ | Set-Content -Path ".env.example" -Encoding UTF8

# Create package.json
@"
{
  "name": "realtime-meeting-minutes",
  "version": "1.0.0",
  "description": "リアルタイム議事録システム - ピンマイク話者識別 + Claude AI構造化",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.39.0",
    "dotenv": "^16.4.7",
    "express": "^4.18.2",
    "ws": "^8.18.2"
  }
}
"@ | Set-Content -Path "package.json" -Encoding UTF8

# Create server.js
@"
require('dotenv').config()
const express = require('express')
const http = require('http')
const path = require('path')
const fs = require('fs')
const { WebSocketServer } = require('ws')
const meetingManager = require('./meeting/meeting-manager')

const app = express()
const PORT = process.env.PORT || 3000

const DATA_DIR = path.join(__dirname, 'data')
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

app.use(express.json({ limit: '2mb' }))
app.use(express.static(path.join(__dirname, 'public')))

const meetingRoutes = require('./routes/meeting-routes')
app.use('/api/meetings', meetingRoutes)

const server = http.createServer(app)
const wss = new WebSocketServer({ server })

wss.on('connection', (ws, req) => {
  const match = req.url.match(/^\/ws\/meeting\/([^\/?\]+)/)
  if (match) {
    meetingManager.handleConnection(ws, match[1])
  } else {
    ws.close(4000, 'Unknown path')
  }
})

server.listen(PORT, () => {
  console.log('\n  リアルタイム議事録システム')
  console.log('  http://localhost:' + PORT + '\n')
})
"@ | Set-Content -Path "server.js" -Encoding UTF8

# Install
Write-Host "[4/5] npm install..." -ForegroundColor Yellow
npm install

# Commit & push
Write-Host "[5/5] コミット & プッシュ..." -ForegroundColor Yellow
git add -A
git commit -m "リアルタイム議事録システム 初期リリース"
git push -u origin main

Write-Host ""
Write-Host "=== 完了！ ===" -ForegroundColor Green
Write-Host "新リポ: $NEW_REPO"
Write-Host ""
Write-Host "試すには:" -ForegroundColor Cyan
Write-Host "  cd $WORK_DIR"
Write-Host "  copy .env.example .env   # APIキーを設定"
Write-Host "  npm run dev"
Write-Host "  # ブラウザで http://localhost:3000 を開く"
