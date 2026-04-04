const { createCanvas, loadImage, registerFont } = require('canvas')
const path = require('path')

// ── Font mapping ──────────────────────────────────────────
const FONT_MAP = {
  'gothic-bold': { family: 'IPAPGothic', weight: 'bold' },
  'gothic-light': { family: 'IPAPGothic', weight: 'normal' },
  'rounded': { family: 'IPAPGothic', weight: 'bold' },  // fallback since rounded not available
}

function getFont(style, size, weight) {
  const f = FONT_MAP[style] || FONT_MAP['gothic-bold']
  return `${weight || f.weight} ${size}px "${f.family}", "IPAGothic", sans-serif`
}

// ── Size parsing ──────────────────────────────────────────
function parseSize(sizeStr) {
  const [w, h] = sizeStr.split('x').map(Number)
  return { width: w, height: h }
}

// ── Drawing helpers ───────────────────────────────────────

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function drawBadge(ctx, text, x, y, bgColor, textColor, fontSize = 24) {
  if (!text) return
  ctx.font = getFont('gothic-bold', fontSize, 'bold')
  const metrics = ctx.measureText(text)
  const pw = 20, ph = 10
  const bw = metrics.width + pw * 2
  const bh = fontSize + ph * 2

  ctx.fillStyle = bgColor
  roundRect(ctx, x, y, bw, bh, bh / 2)
  ctx.fill()

  ctx.fillStyle = textColor
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, x + bw / 2, y + bh / 2)
}

function drawCTA(ctx, text, cx, cy, bgColor, textColor, fontSize = 28) {
  ctx.font = getFont('gothic-bold', fontSize, 'bold')
  const metrics = ctx.measureText(text)
  const pw = 40, ph = 16
  const bw = metrics.width + pw * 2
  const bh = fontSize + ph * 2

  ctx.fillStyle = bgColor
  roundRect(ctx, cx - bw / 2, cy - bh / 2, bw, bh, bh / 2)
  ctx.fill()

  ctx.fillStyle = textColor
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, cx, cy)
}

function wrapText(ctx, text, maxWidth) {
  const chars = [...text]
  const lines = []
  let current = ''
  for (const ch of chars) {
    const test = current + ch
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current)
      current = ch
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines
}

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, align = 'left') {
  ctx.textAlign = align
  const lines = wrapText(ctx, text, maxWidth)
  for (let i = 0; i < lines.length; i++) {
    const ax = align === 'center' ? x + maxWidth / 2 : align === 'right' ? x + maxWidth : x
    ctx.fillText(lines[i], ax, y + i * lineHeight)
  }
  return lines.length
}

function drawProductImage(ctx, img, x, y, maxW, maxH) {
  const scale = Math.min(maxW / img.width, maxH / img.height)
  const dw = img.width * scale
  const dh = img.height * scale
  const dx = x + (maxW - dw) / 2
  const dy = y + (maxH - dh) / 2
  ctx.drawImage(img, dx, dy, dw, dh)
}

// ── Template implementations ──────────────────────────────

const templates = {}

// 1. Before/After
templates['before-after'] = (ctx, spec, img, w, h) => {
  const { colorScheme: cs, headline, subheadline, cta, badge, fontStyle } = spec
  const isVertical = h > w

  if (isVertical) {
    // Top half = before (dark/muted), bottom half = after (accent)
    ctx.fillStyle = '#555555'
    ctx.fillRect(0, 0, w, h / 2)
    ctx.fillStyle = cs.accent
    ctx.fillRect(0, h / 2, w, h / 2)

    // Before label
    ctx.font = getFont(fontStyle, 28, 'bold')
    ctx.fillStyle = '#ffffff88'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText('BEFORE', w / 2, 30)

    // Problem text
    ctx.font = getFont(fontStyle, 36, 'bold')
    ctx.fillStyle = '#ffffffcc'
    drawWrappedText(ctx, subheadline, 60, h / 4 - 30, w - 120, 44, 'center')

    // After label
    ctx.font = getFont(fontStyle, 28, 'bold')
    ctx.fillStyle = cs.text + '88'
    ctx.textAlign = 'center'
    ctx.fillText('AFTER', w / 2, h / 2 + 30)

    // Headline
    const hlSize = Math.min(56, w / (headline.length * 0.7))
    ctx.font = getFont(fontStyle, hlSize, 'bold')
    ctx.fillStyle = cs.text
    drawWrappedText(ctx, headline, 60, h * 0.6, w - 120, hlSize * 1.3, 'center')

    // Product image
    drawProductImage(ctx, img, w / 4, h * 0.75, w / 2, h * 0.18)

    // CTA
    drawCTA(ctx, cta, w / 2, h - 80, cs.text, cs.accent)
  } else {
    // Left = before, right = after
    ctx.fillStyle = '#555555'
    ctx.fillRect(0, 0, w / 2, h)
    ctx.fillStyle = cs.accent
    ctx.fillRect(w / 2, 0, w / 2, h)

    ctx.font = getFont(fontStyle, 24, 'bold')
    ctx.fillStyle = '#ffffff88'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText('BEFORE', w / 4, 30)

    ctx.font = getFont(fontStyle, 28, 'normal')
    ctx.fillStyle = '#ffffffcc'
    drawWrappedText(ctx, subheadline, 40, h / 3, w / 2 - 80, 36, 'center')

    ctx.font = getFont(fontStyle, 24, 'bold')
    ctx.fillStyle = cs.text + '88'
    ctx.textAlign = 'center'
    ctx.fillText('AFTER', w * 3 / 4, 30)

    const hlSize = Math.min(44, (w / 2 - 80) / (Math.min(headline.length, 8) * 0.8))
    ctx.font = getFont(fontStyle, hlSize, 'bold')
    ctx.fillStyle = cs.text
    drawWrappedText(ctx, headline, w / 2 + 40, h * 0.15, w / 2 - 80, hlSize * 1.3, 'center')

    drawProductImage(ctx, img, w * 0.55, h * 0.45, w * 0.35, h * 0.35)
    drawCTA(ctx, cta, w * 3 / 4, h - 60, cs.text, cs.accent)
  }

  if (badge) drawBadge(ctx, badge, 20, 20, cs.accent, cs.text)
}

// 2. Big Benefit
templates['big-benefit'] = (ctx, spec, img, w, h) => {
  const { colorScheme: cs, headline, subheadline, cta, badge, fontStyle } = spec

  ctx.fillStyle = cs.bg
  ctx.fillRect(0, 0, w, h)

  // Large headline
  const maxCharsPerLine = h > w ? 8 : 12
  const hlSize = Math.min(h > w ? 90 : 72, (w - 120) / Math.min(headline.length, maxCharsPerLine) * 1.2)
  ctx.font = getFont(fontStyle, hlSize, 'bold')
  ctx.fillStyle = cs.text
  ctx.textBaseline = 'top'
  const linesUsed = drawWrappedText(ctx, headline, 60, h * 0.1, w - 120, hlSize * 1.25, 'left')

  // Subheadline
  const subY = h * 0.1 + linesUsed * hlSize * 1.25 + 20
  ctx.font = getFont(fontStyle, 28, 'normal')
  ctx.fillStyle = cs.subtext
  drawWrappedText(ctx, subheadline, 60, subY, w - 120, 36, 'left')

  // Product image (bottom right or bottom center)
  const imgArea = h > w ? 0.35 : 0.4
  drawProductImage(ctx, img, w * 0.5, h * (1 - imgArea) - 20, w * 0.45, h * imgArea - 40)

  // CTA
  drawCTA(ctx, cta, w / 2, h - 70, cs.accent, cs.text)

  // Badge
  if (badge) drawBadge(ctx, badge, 60, h * 0.1 - 50, cs.accent, cs.text)
}

// 3. Testimonial
templates['testimonial'] = (ctx, spec, img, w, h) => {
  const { colorScheme: cs, headline, subheadline, cta, badge, fontStyle } = spec

  ctx.fillStyle = cs.bg
  ctx.fillRect(0, 0, w, h)

  // Quote marks
  ctx.font = `bold ${120}px serif`
  ctx.fillStyle = cs.accent + '40'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText('\u300C', 30, h * 0.08)

  // Testimonial text (headline as the quote)
  const hlSize = Math.min(48, (w - 160) / Math.min(headline.length, 10) * 1.1)
  ctx.font = getFont(fontStyle, hlSize, 'bold')
  ctx.fillStyle = cs.text
  ctx.textBaseline = 'top'
  const lines = drawWrappedText(ctx, `\u300C${headline}\u300D`, 80, h * 0.15, w - 160, hlSize * 1.4, 'left')

  // Attribution / subheadline
  const attrY = h * 0.15 + lines * hlSize * 1.4 + 20
  ctx.font = getFont(fontStyle, 24, 'normal')
  ctx.fillStyle = cs.subtext
  ctx.textAlign = 'right'
  ctx.textBaseline = 'top'
  ctx.fillText(`\u2015 ${subheadline}`, w - 80, attrY)

  // Star rating
  ctx.font = '32px sans-serif'
  ctx.fillStyle = '#FFD700'
  ctx.textAlign = 'left'
  ctx.fillText('\u2605\u2605\u2605\u2605\u2605', 80, attrY + 40)

  // Product image
  const imgY = h > w ? h * 0.6 : h * 0.5
  const imgH = h > w ? h * 0.25 : h * 0.35
  drawProductImage(ctx, img, w * 0.25, imgY, w * 0.5, imgH)

  // CTA
  drawCTA(ctx, cta, w / 2, h - 70, cs.accent, cs.text)

  if (badge) drawBadge(ctx, badge, w - 250, 20, cs.accent, cs.text)
}

// 4. Urgency
templates['urgency'] = (ctx, spec, img, w, h) => {
  const { colorScheme: cs, headline, subheadline, cta, badge, fontStyle } = spec

  // Bold background
  ctx.fillStyle = cs.accent
  ctx.fillRect(0, 0, w, h)

  // Diagonal stripe pattern
  ctx.strokeStyle = cs.bg + '15'
  ctx.lineWidth = 40
  for (let i = -h; i < w + h; i += 80) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i + h, h)
    ctx.stroke()
  }

  // Top banner bar
  ctx.fillStyle = cs.bg
  ctx.fillRect(0, 0, w, h * 0.12)
  ctx.font = getFont(fontStyle, 28, 'bold')
  ctx.fillStyle = cs.accent
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(badge || '\u671F\u9593\u9650\u5B9A\uFF01\u4ECA\u3060\u3051\u7279\u5225\u4FA1\u683C', w / 2, h * 0.06)

  // Headline
  const hlSize = Math.min(h > w ? 72 : 56, (w - 120) / Math.min(headline.length, 8) * 1.1)
  ctx.font = getFont(fontStyle, hlSize, 'bold')
  ctx.fillStyle = cs.text
  ctx.textBaseline = 'top'

  // Text shadow
  ctx.shadowColor = 'rgba(0,0,0,0.3)'
  ctx.shadowBlur = 8
  ctx.shadowOffsetX = 2
  ctx.shadowOffsetY = 2
  drawWrappedText(ctx, headline, 60, h * 0.18, w - 120, hlSize * 1.3, 'center')
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0

  // Subheadline
  ctx.font = getFont(fontStyle, 28, 'normal')
  ctx.fillStyle = cs.text + 'dd'
  drawWrappedText(ctx, subheadline, 60, h * 0.48, w - 120, 36, 'center')

  // Product image
  drawProductImage(ctx, img, w * 0.25, h * 0.55, w * 0.5, h * 0.25)

  // CTA (high contrast)
  drawCTA(ctx, cta, w / 2, h - 80, cs.text, cs.accent, 32)
}

// 5. Problem Agitation
templates['problem-agitation'] = (ctx, spec, img, w, h) => {
  const { colorScheme: cs, headline, subheadline, cta, badge, fontStyle } = spec

  ctx.fillStyle = cs.bg
  ctx.fillRect(0, 0, w, h)

  // Problem text (top, muted)
  ctx.font = getFont(fontStyle, 32, 'normal')
  ctx.fillStyle = cs.subtext
  ctx.textBaseline = 'top'
  drawWrappedText(ctx, subheadline, 60, h * 0.08, w - 120, 42, 'center')

  // Down arrow
  ctx.font = '48px sans-serif'
  ctx.fillStyle = cs.accent
  ctx.textAlign = 'center'
  ctx.fillText('\u25BC', w / 2, h * 0.2)

  // Solution headline (big, accent colored)
  const hlSize = Math.min(h > w ? 64 : 52, (w - 120) / Math.min(headline.length, 9) * 1.1)
  ctx.font = getFont(fontStyle, hlSize, 'bold')
  ctx.fillStyle = cs.accent
  ctx.textBaseline = 'top'
  drawWrappedText(ctx, headline, 60, h * 0.28, w - 120, hlSize * 1.3, 'center')

  // Product image
  drawProductImage(ctx, img, w * 0.2, h * 0.55, w * 0.6, h * 0.28)

  // CTA
  drawCTA(ctx, cta, w / 2, h - 70, cs.accent, cs.text)

  if (badge) drawBadge(ctx, badge, 20, 20, cs.accent, cs.text)
}

// 6. Number/Stats
templates['number-stats'] = (ctx, spec, img, w, h) => {
  const { colorScheme: cs, headline, subheadline, cta, badge, fontStyle } = spec

  ctx.fillStyle = cs.bg
  ctx.fillRect(0, 0, w, h)

  // Extract numbers from headline for emphasis
  const numMatch = headline.match(/[\d,.]+万?個?人?%?/)
  const numStr = numMatch ? numMatch[0] : ''

  if (numStr) {
    // Giant number
    const numSize = Math.min(h > w ? 140 : 100, w * 0.6 / Math.max(numStr.length, 3))
    ctx.font = getFont(fontStyle, numSize, 'bold')
    ctx.fillStyle = cs.accent
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(numStr, w / 2, h * 0.2)

    // Rest of headline
    const rest = headline.replace(numStr, '').trim()
    ctx.font = getFont(fontStyle, 36, 'bold')
    ctx.fillStyle = cs.text
    drawWrappedText(ctx, rest, 60, h * 0.32, w - 120, 46, 'center')
  } else {
    const hlSize = Math.min(56, (w - 120) / Math.min(headline.length, 10) * 1.1)
    ctx.font = getFont(fontStyle, hlSize, 'bold')
    ctx.fillStyle = cs.text
    ctx.textBaseline = 'top'
    drawWrappedText(ctx, headline, 60, h * 0.12, w - 120, hlSize * 1.3, 'center')
  }

  // Subheadline
  ctx.font = getFont(fontStyle, 26, 'normal')
  ctx.fillStyle = cs.subtext
  ctx.textBaseline = 'top'
  drawWrappedText(ctx, subheadline, 60, h * 0.45, w - 120, 34, 'center')

  // Product image
  drawProductImage(ctx, img, w * 0.25, h * 0.56, w * 0.5, h * 0.26)

  // CTA
  drawCTA(ctx, cta, w / 2, h - 70, cs.accent, cs.text)

  if (badge) drawBadge(ctx, badge, 20, 20, cs.accent, cs.text, 20)
}

// 7. Minimal Premium
templates['minimal-premium'] = (ctx, spec, img, w, h) => {
  const { colorScheme: cs, headline, subheadline, cta, badge, fontStyle } = spec

  ctx.fillStyle = cs.bg
  ctx.fillRect(0, 0, w, h)

  // Thin accent line
  ctx.fillStyle = cs.accent
  ctx.fillRect(w * 0.35, h * 0.08, w * 0.3, 2)

  // Headline (centered, elegant spacing)
  const hlSize = Math.min(h > w ? 48 : 40, (w - 200) / Math.min(headline.length, 10) * 1.1)
  ctx.font = getFont(fontStyle, hlSize, 'bold')
  ctx.fillStyle = cs.text
  ctx.textBaseline = 'top'
  // Letter spacing effect
  const chars = [...headline]
  ctx.textAlign = 'center'
  let totalW = 0
  for (const ch of chars) totalW += ctx.measureText(ch).width + 4
  let cx = (w - totalW) / 2
  const headlineY = h * 0.12
  for (const ch of chars) {
    ctx.textAlign = 'left'
    ctx.fillText(ch, cx, headlineY)
    cx += ctx.measureText(ch).width + 4
  }

  // Thin line below headline
  ctx.fillStyle = cs.accent
  ctx.fillRect(w * 0.35, headlineY + hlSize + 20, w * 0.3, 1)

  // Product image (large, centered)
  const imgH = h * 0.4
  drawProductImage(ctx, img, w * 0.15, h * 0.3, w * 0.7, imgH)

  // Subheadline
  ctx.font = getFont(fontStyle, 22, 'normal')
  ctx.fillStyle = cs.subtext
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText(subheadline, w / 2, h * 0.75)

  // CTA (minimal style, just text with underline)
  ctx.font = getFont(fontStyle, 24, 'normal')
  ctx.fillStyle = cs.accent
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText(cta, w / 2, h - 80)
  const ctaW = ctx.measureText(cta).width
  ctx.fillRect(w / 2 - ctaW / 2, h - 52, ctaW, 1)
}

// 8. Magazine
templates['magazine'] = (ctx, spec, img, w, h) => {
  const { colorScheme: cs, headline, subheadline, cta, badge, fontStyle } = spec

  ctx.fillStyle = cs.bg
  ctx.fillRect(0, 0, w, h)

  const isVertical = h > w

  if (isVertical) {
    // Top: product image with overlay
    drawProductImage(ctx, img, 0, 0, w, h * 0.5)

    // Gradient overlay from bottom of image
    const grad = ctx.createLinearGradient(0, h * 0.3, 0, h * 0.5)
    grad.addColorStop(0, cs.bg + '00')
    grad.addColorStop(1, cs.bg)
    ctx.fillStyle = grad
    ctx.fillRect(0, h * 0.3, w, h * 0.2)

    // Bottom: editorial text
    ctx.fillStyle = cs.bg
    ctx.fillRect(0, h * 0.5, w, h * 0.5)

    // Category tag
    ctx.font = getFont(fontStyle, 18, 'normal')
    ctx.fillStyle = cs.accent
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText('FEATURE', 60, h * 0.53)

    // Headline
    const hlSize = Math.min(44, (w - 120) / Math.min(headline.length, 8) * 1.0)
    ctx.font = getFont(fontStyle, hlSize, 'bold')
    ctx.fillStyle = cs.text
    drawWrappedText(ctx, headline, 60, h * 0.58, w - 120, hlSize * 1.4, 'left')

    // Subheadline
    ctx.font = getFont(fontStyle, 22, 'normal')
    ctx.fillStyle = cs.subtext
    drawWrappedText(ctx, subheadline, 60, h * 0.78, w - 120, 30, 'left')

    drawCTA(ctx, cta, w / 2, h - 70, cs.accent, cs.text)
  } else {
    // Left: image, right: text (magazine layout)
    drawProductImage(ctx, img, 0, 0, w * 0.45, h)

    ctx.font = getFont(fontStyle, 16, 'normal')
    ctx.fillStyle = cs.accent
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText('FEATURE', w * 0.5, 40)

    const hlSize = Math.min(36, (w * 0.45 - 40) / Math.min(headline.length, 8) * 1.0)
    ctx.font = getFont(fontStyle, hlSize, 'bold')
    ctx.fillStyle = cs.text
    drawWrappedText(ctx, headline, w * 0.5, 70, w * 0.45 - 20, hlSize * 1.3, 'left')

    ctx.font = getFont(fontStyle, 20, 'normal')
    ctx.fillStyle = cs.subtext
    drawWrappedText(ctx, subheadline, w * 0.5, h * 0.55, w * 0.45 - 20, 28, 'left')

    drawCTA(ctx, cta, w * 0.72, h - 50, cs.accent, cs.text, 22)
  }

  if (badge) drawBadge(ctx, badge, 20, 20, cs.accent, cs.text, 18)
}

// 9. UGC Style
templates['ugc-style'] = (ctx, spec, img, w, h) => {
  const { colorScheme: cs, headline, subheadline, cta, badge, fontStyle } = spec

  // Slightly off-white background (Instagram feel)
  ctx.fillStyle = '#fafafa'
  ctx.fillRect(0, 0, w, h)

  // Fake Instagram-like header
  const headerH = 60
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, w, headerH)
  ctx.strokeStyle = '#dbdbdb'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, headerH)
  ctx.lineTo(w, headerH)
  ctx.stroke()

  // Avatar circle
  ctx.fillStyle = cs.accent
  ctx.beginPath()
  ctx.arc(40, headerH / 2, 18, 0, Math.PI * 2)
  ctx.fill()

  ctx.font = getFont('gothic-bold', 18, 'bold')
  ctx.fillStyle = '#262626'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('\u304A\u3059\u3059\u3081\u30A2\u30A4\u30C6\u30E0', 68, headerH / 2)

  // Product image (main area)
  const imgTop = headerH
  const imgH = h > w ? h * 0.5 : h * 0.55
  drawProductImage(ctx, img, 0, imgTop, w, imgH)

  // Text area below
  const textTop = imgTop + imgH + 15
  ctx.font = getFont('gothic-bold', 26, 'bold')
  ctx.fillStyle = '#262626'
  ctx.textBaseline = 'top'
  drawWrappedText(ctx, headline, 20, textTop, w - 40, 34, 'left')

  ctx.font = getFont('gothic-light', 20, 'normal')
  ctx.fillStyle = '#8e8e8e'
  drawWrappedText(ctx, subheadline, 20, textTop + 80, w - 40, 28, 'left')

  // CTA at bottom
  drawCTA(ctx, cta, w / 2, h - 50, cs.accent, '#ffffff', 24)

  if (badge) drawBadge(ctx, badge, w - 200, headerH + 10, 'rgba(0,0,0,0.7)', '#ffffff', 18)
}

// 10. Comparison
templates['comparison'] = (ctx, spec, img, w, h) => {
  const { colorScheme: cs, headline, subheadline, cta, badge, fontStyle } = spec

  ctx.fillStyle = cs.bg
  ctx.fillRect(0, 0, w, h)

  const isVertical = h > w

  // Title
  ctx.font = getFont(fontStyle, 28, 'bold')
  ctx.fillStyle = cs.text
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText(headline, w / 2, 30)

  if (isVertical) {
    const colW = w * 0.43
    const startY = 90
    const colH = h * 0.55

    // Left column (other / muted)
    ctx.fillStyle = '#e0e0e0'
    roundRect(ctx, w * 0.04, startY, colW, colH, 12)
    ctx.fill()
    ctx.font = getFont(fontStyle, 22, 'bold')
    ctx.fillStyle = '#888888'
    ctx.textAlign = 'center'
    ctx.fillText('\u4ED6\u793E\u88FD\u54C1', w * 0.04 + colW / 2, startY + 20)

    // Sad indicators
    const items = ['\u00D7 \u4FA1\u683C\u304C\u9AD8\u3044', '\u00D7 \u52B9\u679C\u304C\u8584\u3044', '\u00D7 \u7D9A\u3051\u306B\u304F\u3044']
    ctx.font = getFont(fontStyle, 20, 'normal')
    ctx.fillStyle = '#999999'
    ctx.textAlign = 'left'
    items.forEach((item, i) => {
      ctx.fillText(item, w * 0.08, startY + 70 + i * 40)
    })

    // Right column (ours / accent)
    ctx.fillStyle = cs.accent + '22'
    roundRect(ctx, w * 0.53, startY, colW, colH, 12)
    ctx.fill()
    ctx.strokeStyle = cs.accent
    ctx.lineWidth = 3
    roundRect(ctx, w * 0.53, startY, colW, colH, 12)
    ctx.stroke()

    ctx.font = getFont(fontStyle, 22, 'bold')
    ctx.fillStyle = cs.accent
    ctx.textAlign = 'center'
    ctx.fillText('\u5F53\u793E\u88FD\u54C1', w * 0.53 + colW / 2, startY + 20)

    // Product image in right column
    drawProductImage(ctx, img, w * 0.57, startY + 55, colW - 30, colH * 0.4)

    // Happy indicators
    const goodItems = ['\u25CB \u304A\u624B\u9803\u4FA1\u683C', '\u25CB \u5B9F\u611F\u529B\u304C\u9055\u3046', '\u25CB \u7D9A\u3051\u3084\u3059\u3044']
    ctx.font = getFont(fontStyle, 20, 'normal')
    ctx.fillStyle = cs.accent
    ctx.textAlign = 'left'
    goodItems.forEach((item, i) => {
      ctx.fillText(item, w * 0.57, startY + colH * 0.55 + 30 + i * 40)
    })

    // Subheadline
    ctx.font = getFont(fontStyle, 24, 'normal')
    ctx.fillStyle = cs.subtext
    ctx.textAlign = 'center'
    drawWrappedText(ctx, subheadline, 40, h * 0.76, w - 80, 32, 'center')

    // CTA
    drawCTA(ctx, cta, w / 2, h * 0.88, cs.accent, cs.text)
    if (badge) drawBadge(ctx, badge, w * 0.53, h * 0.65, cs.accent, cs.text, 18)
  } else {
    // Horizontal: left vs right
    const colW = w * 0.4
    const startY = 80
    const colH = h * 0.55

    ctx.fillStyle = '#e0e0e0'
    roundRect(ctx, w * 0.05, startY, colW, colH, 12)
    ctx.fill()
    ctx.font = getFont(fontStyle, 20, 'bold')
    ctx.fillStyle = '#888'
    ctx.textAlign = 'center'
    ctx.fillText('\u4ED6\u793E', w * 0.05 + colW / 2, startY + 15)

    ctx.fillStyle = cs.accent + '22'
    roundRect(ctx, w * 0.55, startY, colW, colH, 12)
    ctx.fill()
    ctx.strokeStyle = cs.accent
    ctx.lineWidth = 2
    roundRect(ctx, w * 0.55, startY, colW, colH, 12)
    ctx.stroke()
    ctx.font = getFont(fontStyle, 20, 'bold')
    ctx.fillStyle = cs.accent
    ctx.textAlign = 'center'
    ctx.fillText('\u5F53\u793E', w * 0.55 + colW / 2, startY + 15)

    drawProductImage(ctx, img, w * 0.6, startY + 50, colW - 30, colH - 70)

    // Subheadline + CTA
    ctx.font = getFont(fontStyle, 20, 'normal')
    ctx.fillStyle = cs.subtext
    ctx.textAlign = 'center'
    ctx.fillText(subheadline, w / 2, h - 60)
    drawCTA(ctx, cta, w / 2, h - 25, cs.accent, cs.text, 20)
  }
}

// ── Main render function ──────────────────────────────────

/**
 * Render a banner spec to a Canvas buffer (PNG)
 * @param {Object} spec - Banner spec from Claude
 * @param {Buffer|string} productImage - Product image as Buffer or file path
 * @returns {Promise<Buffer>} PNG buffer
 */
async function renderBanner(spec, productImage) {
  const { width, height } = parseSize(spec.size)
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  // Load product image
  const img = await loadImage(productImage)

  // Get template function
  const templateFn = templates[spec.template]
  if (!templateFn) {
    throw new Error(`Unknown template: ${spec.template}`)
  }

  // Render
  templateFn(ctx, spec, img, width, height)

  return canvas.toBuffer('image/png')
}

module.exports = { renderBanner, templates }
