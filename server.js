require('dotenv').config()
const express = require('express')
const multer  = require('multer')
const fs      = require('fs')
const path    = require('path')

const app  = express()
const PORT = process.env.PORT || 3000

const UPLOAD_DIR = path.join(__dirname, 'uploads')
const DATA_DIR   = path.join(__dirname, 'data')
const DATA_FILE  = path.join(DATA_DIR, 'sessions.json')

// ── Init dirs ──────────────────────────────────────────
;[UPLOAD_DIR, DATA_DIR].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true })
})
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]')

// ── Multer ─────────────────────────────────────────────
const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (_, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase()
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`)
    },
  }),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    if (/^image\//.test(file.mimetype)) cb(null, true)
    else cb(new Error('Image only'))
  },
})

// ── Middleware ─────────────────────────────────────────
app.use(express.json({ limit: '2mb' }))
app.use(express.static(path.join(__dirname, 'public')))
app.use('/uploads', express.static(UPLOAD_DIR))

// ── DB helpers ─────────────────────────────────────────
function readDB()  { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) }
function writeDB(d){ fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2)) }
function genId()   { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6) }

// ── API ────────────────────────────────────────────────

// GET /api/sessions  — summary list
app.get('/api/sessions', (_, res) => {
  const db = readDB()
  res.json(db.map(({ id, title, imageUrl, annotationCount, createdAt, updatedAt }) => ({
    id, title, imageUrl,
    annotationCount: annotationCount ?? 0,
    createdAt, updatedAt,
  })))
})

// POST /api/sessions  — create (with image upload)
app.post('/api/sessions', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'image required' })
  const session = {
    id:              genId(),
    title:           (req.body.title || '').trim() || '無題のデザイン',
    imageUrl:        `/uploads/${req.file.filename}`,
    imageWidth:      0,
    imageHeight:     0,
    annotations:     [],
    annotationCount: 0,
    createdAt:       new Date().toISOString(),
    updatedAt:       new Date().toISOString(),
  }
  const db = readDB()
  db.unshift(session)
  writeDB(db)
  res.json(session)
})

// GET /api/sessions/:id
app.get('/api/sessions/:id', (req, res) => {
  const s = readDB().find(s => s.id === req.params.id)
  if (!s) return res.status(404).json({ error: 'not found' })
  res.json(s)
})

// PUT /api/sessions/:id  — update title / annotations
app.put('/api/sessions/:id', (req, res) => {
  const db = readDB()
  const i  = db.findIndex(s => s.id === req.params.id)
  if (i === -1) return res.status(404).json({ error: 'not found' })

  const { title, annotations, imageWidth, imageHeight } = req.body
  if (title       !== undefined) db[i].title       = title
  if (annotations !== undefined) {
    db[i].annotations     = annotations
    db[i].annotationCount = annotations.length
  }
  if (imageWidth  !== undefined) db[i].imageWidth  = imageWidth
  if (imageHeight !== undefined) db[i].imageHeight = imageHeight
  db[i].updatedAt = new Date().toISOString()
  writeDB(db)
  res.json(db[i])
})

// DELETE /api/sessions/:id
app.delete('/api/sessions/:id', (req, res) => {
  const db = readDB()
  const s  = db.find(s => s.id === req.params.id)
  if (!s) return res.status(404).json({ error: 'not found' })
  const imgPath = path.join(__dirname, s.imageUrl)
  if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath)
  writeDB(db.filter(s => s.id !== req.params.id))
  res.json({ ok: true })
})

// ── Agent Team Routes ────────────────────────────────
const agentRoutes = require('./routes/agent-routes')
app.use('/api/agent', agentRoutes)

// ── Banner Generation Routes ─────────────────────────
const bannerRoutes = require('./routes/banner-routes')
app.use('/api/banners', bannerRoutes)

// ── Start ──────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  Design Feedback Tool + EC商品企画AIチーム`)
  console.log(`  http://localhost:${PORT}`)
  console.log(`  http://localhost:${PORT}/agent.html`)
  console.log(`  http://localhost:${PORT}/banner.html\n`)
})
