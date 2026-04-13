require('dotenv').config()
const express = require('express')
const fs      = require('fs')
const path    = require('path')

const app  = express()
const PORT = process.env.PORT || 3000

const DATA_DIR = path.join(__dirname, 'data')

// ── Init dirs ──────────────────────────────────────────
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

// ── Middleware ─────────────────────────────────────────
app.use(express.json({ limit: '2mb' }))
app.use(express.static(path.join(__dirname, 'public')))

// ── Agent Team Routes ────────────────────────────────
const agentRoutes = require('./routes/agent-routes')
app.use('/api/agent', agentRoutes)

// ── Start ──────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  EC商品企画AIチーム`)
  console.log(`  http://localhost:${PORT}\n`)
})
