const fs = require('fs')
const path = require('path')
const https = require('https')
const http = require('http')
const { renderBanner } = require('./banner-templates')

const BANNER_DIR = path.join(__dirname, '..', 'banners')

// Ensure banners directory exists
if (!fs.existsSync(BANNER_DIR)) fs.mkdirSync(BANNER_DIR, { recursive: true })

/**
 * Fetch an image from URL and return as Buffer
 */
function fetchImage(url) {
  return new Promise((resolve, reject) => {
    // Support local file paths
    if (url.startsWith('/') || url.startsWith('./')) {
      const absPath = url.startsWith('/')
        ? path.join(__dirname, '..', url)
        : path.resolve(url)
      try {
        resolve(fs.readFileSync(absPath))
      } catch (e) {
        reject(new Error(`Failed to read local file: ${absPath}`))
      }
      return
    }

    const client = url.startsWith('https') ? https : http
    client.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchImage(res.headers.location).then(resolve).catch(reject)
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} fetching image`))
      }
      const chunks = []
      res.on('data', chunk => chunks.push(chunk))
      res.on('end', () => resolve(Buffer.concat(chunks)))
      res.on('error', reject)
    }).on('error', reject)
  })
}

/**
 * Render all banner specs and save as PNGs
 * @param {Array} specs - Array of banner spec objects from Claude
 * @param {string|Buffer} productImage - Product image URL, local path, or Buffer
 * @param {Function} onProgress - Called with { completed, total, bannerId } after each render
 * @returns {Promise<Object>} { jobId, bannerDir, banners: [{ id, path, spec }] }
 */
async function renderAllBanners(specs, productImage, onProgress) {
  const jobId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  const jobDir = path.join(BANNER_DIR, jobId)
  fs.mkdirSync(jobDir, { recursive: true })

  // Fetch product image once
  let imgBuffer
  if (Buffer.isBuffer(productImage)) {
    imgBuffer = productImage
  } else {
    imgBuffer = await fetchImage(productImage)
  }

  const banners = []
  const concurrency = 8
  let completed = 0

  // Process in batches for concurrency control
  for (let i = 0; i < specs.length; i += concurrency) {
    const batch = specs.slice(i, i + concurrency)
    const results = await Promise.allSettled(
      batch.map(async (spec) => {
        try {
          const pngBuffer = await renderBanner(spec, imgBuffer)
          const filename = `banner-${String(spec.id).padStart(3, '0')}.png`
          const filePath = path.join(jobDir, filename)
          fs.writeFileSync(filePath, pngBuffer)

          completed++
          if (onProgress) {
            onProgress({ completed, total: specs.length, bannerId: spec.id })
          }

          return { id: spec.id, filename, spec }
        } catch (err) {
          completed++
          if (onProgress) {
            onProgress({ completed, total: specs.length, bannerId: spec.id, error: err.message })
          }
          return { id: spec.id, error: err.message, spec }
        }
      })
    )

    for (const r of results) {
      banners.push(r.status === 'fulfilled' ? r.value : { error: r.reason?.message })
    }
  }

  return { jobId, bannerDir: jobDir, banners }
}

module.exports = { renderAllBanners, fetchImage, BANNER_DIR }
