const express = require('express')
const router = express.Router()
const manager = require('../meeting/meeting-manager')

// GET /api/meetings - list all meetings
router.get('/', (req, res) => {
  res.json(manager.getMeetings())
})

// POST /api/meetings - create a new meeting
router.post('/', (req, res) => {
  const { title } = req.body || {}
  const meeting = manager.createMeeting(title)
  res.json(meeting)
})

// GET /api/meetings/:id - get meeting details
router.get('/:id', (req, res) => {
  const meeting = manager.getMeeting(req.params.id)
  if (!meeting) return res.status(404).json({ error: 'not found' })
  res.json(meeting)
})

// POST /api/meetings/:id/end - end a meeting
router.post('/:id/end', async (req, res) => {
  try {
    const meeting = await manager.endMeeting(req.params.id)
    if (!meeting) {
      // Maybe it's already ended, try to get it
      const existing = manager.getMeeting(req.params.id)
      if (!existing) return res.status(404).json({ error: 'not found' })
      return res.json(existing)
    }
    res.json(meeting)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/meetings/:id - delete a meeting
router.delete('/:id', (req, res) => {
  const ok = manager.deleteMeeting(req.params.id)
  if (!ok) return res.status(404).json({ error: 'not found' })
  res.json({ ok: true })
})

// GET /api/meetings/:id/export - export as markdown
router.get('/:id/export', (req, res) => {
  const md = manager.exportMeetingMarkdown(req.params.id)
  if (!md) return res.status(404).json({ error: 'not found' })
  res.setHeader('Content-Type', 'text/markdown; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="meeting-${req.params.id}.md"`)
  res.send(md)
})

module.exports = router
