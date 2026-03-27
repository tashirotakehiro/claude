const express = require('express')
const fs = require('fs')
const path = require('path')
const { handleMessage, AGENTS } = require('../agents/orchestrator')

const router = express.Router()

const PROJECTS_FILE = path.join(__dirname, '..', 'data', 'projects.json')
const CONVERSATIONS_FILE = path.join(__dirname, '..', 'data', 'conversations.json')

// ── DB helpers ──
function readProjects() { return JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf8')) }
function writeProjects(d) { fs.writeFileSync(PROJECTS_FILE, JSON.stringify(d, null, 2)) }
function readConversations() { return JSON.parse(fs.readFileSync(CONVERSATIONS_FILE, 'utf8')) }
function writeConversations(d) { fs.writeFileSync(CONVERSATIONS_FILE, JSON.stringify(d, null, 2)) }
function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6) }

// ── GET /api/agent/agents — list available agents ──
router.get('/agents', (_, res) => {
  const list = Object.entries(AGENTS).map(([id, a]) => ({ id, name: a.name, color: a.color }))
  res.json(list)
})

// ── GET /api/agent/projects — list projects ──
router.get('/projects', (_, res) => {
  res.json(readProjects())
})

// ── POST /api/agent/projects — create project ──
router.post('/projects', (req, res) => {
  const { name } = req.body
  const project = {
    id: genId(),
    name: name || '新規プロジェクト',
    status: 'アイデア生成',
    currentStage: 1,
    idea: null,
    research: {
      s1_overview: null,
      s2_differentiation: null,
      s3_problems: null,
      s4_target: null,
      s5_volume: null,
      s6_price: null,
      s7_concerns: null,
      s8_competitors: null,
      s9_buying_criteria: null,
      s10_catchcopy: null,
      s11_lp_structure: null,
      s12_product_specs: null,
      s13_conclusion: null,
    },
    lpStructure: null,
    catchcopies: [],
    financials: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const projects = readProjects()
  projects.unshift(project)
  writeProjects(projects)
  res.json(project)
})

// ── GET /api/agent/projects/:id ──
router.get('/projects/:id', (req, res) => {
  const p = readProjects().find(p => p.id === req.params.id)
  if (!p) return res.status(404).json({ error: 'not found' })
  res.json(p)
})

// ── PUT /api/agent/projects/:id ──
router.put('/projects/:id', (req, res) => {
  const projects = readProjects()
  const i = projects.findIndex(p => p.id === req.params.id)
  if (i === -1) return res.status(404).json({ error: 'not found' })
  Object.assign(projects[i], req.body, { updatedAt: new Date().toISOString() })
  writeProjects(projects)
  res.json(projects[i])
})

// ── DELETE /api/agent/projects/:id ──
router.delete('/projects/:id', (req, res) => {
  const projects = readProjects()
  writeProjects(projects.filter(p => p.id !== req.params.id))
  const convs = readConversations()
  delete convs[req.params.id]
  writeConversations(convs)
  res.json({ ok: true })
})

// ── GET /api/agent/conversations/:projectId ──
router.get('/conversations/:projectId', (req, res) => {
  const convs = readConversations()
  res.json(convs[req.params.projectId] || [])
})

// ── POST /api/agent/chat — SSE streaming chat ──
router.post('/chat', (req, res) => {
  const { projectId, message } = req.body
  if (!message) return res.status(400).json({ error: 'message required' })

  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  })

  const sendSSE = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
  }

  // Get project and conversation
  const projects = readProjects()
  const project = projects.find(p => p.id === projectId) || null
  const convs = readConversations()
  const history = convs[projectId] || []

  // Save user message to history
  const userMsg = { role: 'user', content: message, timestamp: new Date().toISOString() }
  if (projectId) {
    if (!convs[projectId]) convs[projectId] = []
    convs[projectId].push(userMsg)
    writeConversations(convs)
  }

  // Build conversation messages for Claude (role: user/assistant only)
  const claudeHistory = history
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .map(m => ({ role: m.role, content: m.content }))

  const agentResponses = []

  handleMessage(message, project, claudeHistory, (event) => {
    switch (event.type) {
      case 'agent-start':
        sendSSE('agent-start', { agentId: event.agentId, agentName: event.agentName, color: event.color })
        break
      case 'agent-chunk':
        sendSSE('agent-chunk', { agentId: event.agentId, text: event.text })
        break
      case 'agent-end':
        sendSSE('agent-end', { agentId: event.agentId, text: event.text })
        agentResponses.push({ agentId: event.agentId, text: event.text })
        break
    }
  })
    .then(() => {
      // Save assistant responses to conversation
      if (projectId && agentResponses.length > 0) {
        const convs = readConversations()
        for (const resp of agentResponses) {
          convs[projectId].push({
            role: 'assistant',
            agentId: resp.agentId,
            content: resp.text,
            timestamp: new Date().toISOString(),
          })
        }
        writeConversations(convs)
      }
      sendSSE('done', { success: true })
      res.end()
    })
    .catch((err) => {
      console.error('Agent error:', err)
      sendSSE('error', { message: err.message || 'Agent execution failed' })
      res.end()
    })
})

module.exports = router
