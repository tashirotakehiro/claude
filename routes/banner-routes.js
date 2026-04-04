const express = require('express')
const fs = require('fs')
const path = require('path')
const archiver = require('archiver')
const multer = require('multer')
const { generateCreativeMatrix } = require('../services/banner-generator')
const { renderAllBanners, BANNER_DIR } = require('../services/banner-renderer')

const router = express.Router()

// Multer for product image upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    if (/^image\//.test(file.mimetype)) cb(null, true)
    else cb(new Error('Image only'))
  },
})

// Store job results in memory (simple approach)
const jobs = new Map()

// ── SSE helper ────────────────────────────────────────────
function sendSSE(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
}

// ── POST /generate — Main banner generation (SSE) ─────────
router.post('/generate', upload.single('productImage'), async (req, res) => {
  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  try {
    const {
      productDescription,
      benefits,
      suggestedCatchcopy,
      targetAudience,
      productImageUrl,
    } = req.body

    // Get product image: either uploaded file or URL
    let productImage
    if (req.file) {
      productImage = req.file.buffer
    } else if (productImageUrl) {
      productImage = productImageUrl
    } else {
      sendSSE(res, 'error', { message: '商品画像が必要です（アップロードまたはURL）' })
      res.end()
      return
    }

    // Phase 1: Generate creative matrix with Claude
    sendSSE(res, 'status', { phase: 'generating-matrix', message: 'クリエイティブマトリクスを生成中...' })

    const specs = await generateCreativeMatrix({
      productDescription: productDescription || '',
      benefits: benefits || '',
      suggestedCatchcopy: suggestedCatchcopy || '',
      targetAudience: targetAudience || '',
    })

    sendSSE(res, 'matrix-ready', { count: specs.length })

    // Phase 2: Render all banners
    sendSSE(res, 'status', { phase: 'rendering', message: `${specs.length}枚のバナーをレンダリング中...` })

    const result = await renderAllBanners(specs, productImage, (progress) => {
      sendSSE(res, 'progress', progress)
    })

    // Store job result
    jobs.set(result.jobId, {
      ...result,
      createdAt: new Date().toISOString(),
      input: { productDescription, benefits, suggestedCatchcopy, targetAudience },
    })

    sendSSE(res, 'done', {
      jobId: result.jobId,
      bannerCount: result.banners.length,
      banners: result.banners.map(b => ({
        id: b.id,
        filename: b.filename,
        error: b.error,
        template: b.spec?.template,
        size: b.spec?.size,
        headline: b.spec?.headline,
      })),
    })
  } catch (err) {
    console.error('Banner generation error:', err)
    sendSSE(res, 'error', { message: err.message })
  }

  res.end()
})

// ── GET /jobs/:jobId — Get job result ─────────────────────
router.get('/jobs/:jobId', (req, res) => {
  const job = jobs.get(req.params.jobId)
  if (!job) return res.status(404).json({ error: 'Job not found' })
  res.json({
    jobId: job.jobId,
    createdAt: job.createdAt,
    bannerCount: job.banners.length,
    banners: job.banners.map(b => ({
      id: b.id,
      filename: b.filename,
      error: b.error,
      template: b.spec?.template,
      size: b.spec?.size,
      headline: b.spec?.headline,
    })),
  })
})

// ── GET /jobs/:jobId/download — ZIP download (must be before :filename) ──
router.get('/jobs/:jobId/download', (req, res) => {
  const jobDir = path.join(BANNER_DIR, req.params.jobId)
  if (!fs.existsSync(jobDir)) return res.status(404).json({ error: 'Job not found' })

  res.setHeader('Content-Type', 'application/zip')
  res.setHeader('Content-Disposition', `attachment; filename="banners-${req.params.jobId}.zip"`)

  const archive = archiver('zip', { zlib: { level: 6 } })
  archive.pipe(res)
  archive.directory(jobDir, false)
  archive.finalize()
})

// ── GET /jobs/:jobId/:filename — Serve individual banner ──
router.get('/jobs/:jobId/:filename', (req, res) => {
  const filePath = path.join(BANNER_DIR, req.params.jobId, req.params.filename)
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Banner not found' })
  res.setHeader('Content-Type', 'image/png')
  fs.createReadStream(filePath).pipe(res)
})

module.exports = router
