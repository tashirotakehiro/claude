#!/bin/bash
set -e

NEW_REPO="https://github.com/tashirotakehiro/realtime-meeting-minutes.git"
SRC_DIR="$(cd "$(dirname "$0")" && pwd)"
WORK_DIR="/tmp/rtmm-setup-$$"

echo "=== リアルタイム議事録システム 新リポ移行スクリプト ==="
echo ""

# Clone new repo
echo "[1/5] 新リポをclone..."
git clone "$NEW_REPO" "$WORK_DIR"
cd "$WORK_DIR"

# Create directories
echo "[2/5] ディレクトリ作成..."
mkdir -p meeting agents routes public data

# Copy files from source
echo "[3/5] ファイルをコピー..."
cp "$SRC_DIR/meeting/prompts.js" meeting/
cp "$SRC_DIR/meeting/structurer.js" meeting/
cp "$SRC_DIR/meeting/meeting-manager.js" meeting/
cp "$SRC_DIR/agents/agent-runner.js" agents/
cp "$SRC_DIR/routes/meeting-routes.js" routes/
cp "$SRC_DIR/public/meeting.html" public/index.html
touch data/.gitkeep

# Create new files
cat > .gitignore << 'GITEOF'
node_modules/
.env
data/meetings.json
GITEOF

cat > .env.example << 'ENVEOF'
ANTHROPIC_API_KEY=your_api_key_here
ENVEOF

cat > package.json << 'PKGEOF'
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
PKGEOF

cat > server.js << 'SRVEOF'
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
  const match = req.url.match(/^\/ws\/meeting\/([^/?]+)/)
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
SRVEOF

# Install & commit & push
echo "[4/5] npm install..."
npm install

echo "[5/5] コミット & プッシュ..."
git add -A
git commit -m "リアルタイム議事録システム 初期リリース"
git push -u origin main

echo ""
echo "=== 完了！==="
echo "新リポ: $NEW_REPO"
echo ""
echo "試すには:"
echo "  cd $WORK_DIR"
echo "  cp .env.example .env  # APIキーを設定"
echo "  npm run dev"
echo "  # ブラウザで http://localhost:3000 を開く"
