/**
 * Meeting Manager - handles meeting state, WebSocket connections, and orchestration
 */

const fs = require('fs')
const path = require('path')
const { MeetingStructurer } = require('./structurer')

const DATA_FILE = path.join(__dirname, '..', 'data', 'meetings.json')

// Ensure data file exists
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, '[]')
}

function readMeetings() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
}

function writeMeetings(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

// Active meeting sessions (in-memory)
// Map<meetingId, { meeting, structurer, clients: Set<ws> }>
const activeSessions = new Map()

/**
 * Create a new meeting
 */
function createMeeting(title) {
  const meeting = {
    id: genId(),
    title: title || '無題の会議',
    status: 'active',
    participants: [],
    startedAt: new Date().toISOString(),
    endedAt: null,
    topics: [],
    actionItems: [],
    decisions: [],
    openQuestions: [],
    summary: '',
    keywords: [],
  }

  const meetings = readMeetings()
  meetings.unshift(meeting)
  writeMeetings(meetings)

  return meeting
}

/**
 * Get all meetings
 */
function getMeetings() {
  return readMeetings().map(m => ({
    id: m.id,
    title: m.title,
    status: m.status,
    participantCount: m.participants.length,
    startedAt: m.startedAt,
    endedAt: m.endedAt,
  }))
}

/**
 * Get a single meeting by ID
 */
function getMeeting(id) {
  return readMeetings().find(m => m.id === id) || null
}

/**
 * Save meeting to disk
 */
function saveMeeting(meeting) {
  const meetings = readMeetings()
  const idx = meetings.findIndex(m => m.id === meeting.id)
  if (idx !== -1) {
    meetings[idx] = meeting
    writeMeetings(meetings)
  }
}

/**
 * Delete a meeting
 */
function deleteMeeting(id) {
  const meetings = readMeetings()
  const filtered = meetings.filter(m => m.id !== id)
  if (filtered.length === meetings.length) return false
  writeMeetings(filtered)
  // Clean up active session if any
  const session = activeSessions.get(id)
  if (session) {
    session.structurer.stop()
    activeSessions.delete(id)
  }
  return true
}

/**
 * Get or create an active session for a meeting
 */
function getOrCreateSession(meetingId) {
  if (activeSessions.has(meetingId)) {
    return activeSessions.get(meetingId)
  }

  const meeting = getMeeting(meetingId)
  if (!meeting || meeting.status !== 'active') return null

  const session = {
    meeting,
    clients: new Set(),
    structurer: null,
  }

  // Create structurer with broadcast callback
  session.structurer = new MeetingStructurer(meeting, (updateData) => {
    broadcast(meetingId, { type: 'structured-update', ...updateData })
    saveMeeting(meeting)
  })
  session.structurer.start()

  activeSessions.set(meetingId, session)
  return session
}

/**
 * Broadcast a message to all clients in a meeting
 */
function broadcast(meetingId, message) {
  const session = activeSessions.get(meetingId)
  if (!session) return

  const data = JSON.stringify(message)
  for (const client of session.clients) {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(data)
    }
  }
}

/**
 * Handle a new WebSocket connection
 */
function handleConnection(ws, meetingId) {
  const session = getOrCreateSession(meetingId)
  if (!session) {
    ws.send(JSON.stringify({ type: 'error', message: '会議が見つかりません' }))
    ws.close()
    return
  }

  session.clients.add(ws)

  // Send current meeting state
  ws.send(JSON.stringify({
    type: 'init',
    meeting: session.meeting,
  }))

  ws.on('message', (raw) => {
    let msg
    try {
      msg = JSON.parse(raw.toString())
    } catch {
      return
    }

    switch (msg.type) {
      case 'join': {
        const participant = {
          id: genId(),
          name: msg.name || '匿名',
          deviceId: msg.deviceId || '',
          mode: msg.mode || 'remote',
        }
        // Avoid duplicate names
        const exists = session.meeting.participants.find(p => p.name === participant.name)
        if (!exists) {
          session.meeting.participants.push(participant)
          saveMeeting(session.meeting)
        }
        ws.participantName = participant.name
        broadcast(meetingId, {
          type: 'participant-joined',
          participant: exists || participant,
          participants: session.meeting.participants,
        })
        break
      }

      case 'join-local-participants': {
        // Host adding multiple local participants (face-to-face mode)
        const newParticipants = msg.participants || []
        for (const p of newParticipants) {
          const exists = session.meeting.participants.find(ep => ep.name === p.name)
          if (!exists) {
            session.meeting.participants.push({
              id: genId(),
              name: p.name,
              deviceId: p.deviceId || '',
              mode: 'local',
            })
          }
        }
        saveMeeting(session.meeting)
        broadcast(meetingId, {
          type: 'participants-updated',
          participants: session.meeting.participants,
        })
        break
      }

      case 'transcript': {
        const { speaker, text, timestamp } = msg
        if (!text || !text.trim()) break

        // Broadcast raw transcript immediately for live display
        broadcast(meetingId, {
          type: 'transcript-raw',
          speaker: speaker || ws.participantName || '不明',
          text: text.trim(),
          timestamp: timestamp || new Date().toISOString(),
        })

        // Add to structurer buffer
        session.structurer.addTranscript(
          speaker || ws.participantName || '不明',
          text.trim(),
          timestamp || new Date().toISOString()
        )
        break
      }

      case 'speaking': {
        broadcast(meetingId, {
          type: 'speaking',
          speaker: msg.speaker || ws.participantName || '不明',
          isSpeaking: msg.isSpeaking,
        })
        break
      }

      case 'end-meeting': {
        endMeeting(meetingId)
        break
      }
    }
  })

  ws.on('close', () => {
    session.clients.delete(ws)
    // Don't remove participant - they might reconnect
    if (session.clients.size === 0 && session.meeting.status === 'active') {
      // Keep session alive for a bit in case of reconnection
      setTimeout(() => {
        const s = activeSessions.get(meetingId)
        if (s && s.clients.size === 0) {
          // No one reconnected, but don't end the meeting
          // Just clean up the in-memory session
          s.structurer.stop()
          activeSessions.delete(meetingId)
        }
      }, 60000) // 1 minute grace period
    }
  })
}

/**
 * End a meeting
 */
async function endMeeting(meetingId) {
  const session = activeSessions.get(meetingId)
  if (!session) return null

  // Flush any remaining transcripts
  await session.structurer.flush()

  // Generate final summary
  try {
    const finalSummary = await session.structurer.generateFinalSummary()
    session.meeting.finalSummary = finalSummary
  } catch (err) {
    console.error('[MeetingManager] Failed to generate final summary:', err.message)
  }

  session.meeting.status = 'ended'
  session.meeting.endedAt = new Date().toISOString()
  saveMeeting(session.meeting)

  broadcast(meetingId, {
    type: 'meeting-ended',
    meeting: session.meeting,
  })

  session.structurer.stop()
  activeSessions.delete(meetingId)

  return session.meeting
}

/**
 * Export meeting as markdown
 */
function exportMeetingMarkdown(id) {
  const meeting = getMeeting(id)
  if (!meeting) return null

  if (meeting.finalSummary) return meeting.finalSummary

  // Fallback: generate markdown from structured data
  let md = `# ${meeting.title}\n\n`
  md += `**日時**: ${new Date(meeting.startedAt).toLocaleString('ja-JP')}${meeting.endedAt ? ' 〜 ' + new Date(meeting.endedAt).toLocaleString('ja-JP') : ' (進行中)'}\n`
  md += `**参加者**: ${meeting.participants.map(p => p.name).join('、')}\n\n`

  if (meeting.summary) {
    md += `## 概要\n${meeting.summary}\n\n`
  }

  if (meeting.topics.length > 0) {
    md += `## 議題と議論内容\n\n`
    for (const topic of meeting.topics) {
      md += `### ${topic.title}\n`
      for (const entry of topic.entries) {
        const icon = { discussion: '💬', decision: '✅', action_item: '📋', question: '❓', info: 'ℹ️' }[entry.type] || '💬'
        md += `- ${icon} **${entry.speaker}**: ${entry.structuredText}\n`
      }
      md += '\n'
    }
  }

  if (meeting.decisions.length > 0) {
    md += `## 決定事項\n`
    for (const d of meeting.decisions) {
      md += `- ✅ ${d.content}\n`
    }
    md += '\n'
  }

  if (meeting.actionItems.length > 0) {
    md += `## アクションアイテム\n\n`
    md += `| 担当者 | タスク | 期限 | ステータス |\n`
    md += `|--------|--------|------|------------|\n`
    for (const a of meeting.actionItems) {
      md += `| ${a.assignee} | ${a.task} | ${a.deadline || '-'} | ${a.status} |\n`
    }
    md += '\n'
  }

  if (meeting.openQuestions.length > 0) {
    md += `## 未解決事項\n`
    for (const q of meeting.openQuestions) {
      md += `- ❓ ${q.content} (${q.askedBy})\n`
    }
    md += '\n'
  }

  return md
}

module.exports = {
  createMeeting,
  getMeetings,
  getMeeting,
  saveMeeting,
  deleteMeeting,
  handleConnection,
  endMeeting,
  exportMeetingMarkdown,
}
