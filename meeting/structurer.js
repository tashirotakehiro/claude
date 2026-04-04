/**
 * Claude API-based meeting transcript structurer
 * Buffers transcripts and periodically sends them to Claude for structuring
 */

const { runAgent } = require('../agents/agent-runner')
const { STRUCTURER_SYSTEM_PROMPT, SUMMARY_SYSTEM_PROMPT, buildStructureRequest } = require('./prompts')

const BUFFER_INTERVAL_MS = 25000  // 25 seconds
const MIN_TRANSCRIPTS = 1         // minimum transcripts before processing

class MeetingStructurer {
  constructor(meeting, onUpdate) {
    this.meeting = meeting
    this.onUpdate = onUpdate  // callback(structuredData)
    this.buffer = []
    this.timer = null
    this.processing = false
  }

  start() {
    this.timer = setInterval(() => this.flush(), BUFFER_INTERVAL_MS)
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  /**
   * Add a transcript segment to the buffer
   */
  addTranscript(speaker, text, timestamp) {
    this.buffer.push({ speaker, text, timestamp })

    // Auto-flush if we have enough transcripts
    if (this.buffer.length >= 5) {
      this.flush()
    }
  }

  /**
   * Flush the buffer and send to Claude for structuring
   */
  async flush() {
    if (this.processing || this.buffer.length < MIN_TRANSCRIPTS) return

    const transcripts = [...this.buffer]
    this.buffer = []
    this.processing = true

    try {
      const context = this._buildContext()
      const userMessage = buildStructureRequest(transcripts, context)

      const { text } = await runAgent(
        STRUCTURER_SYSTEM_PROMPT,
        [{ role: 'user', content: userMessage }],
        { temperature: 0.3, maxTokens: 2048 }
      )

      const structured = this._parseResponse(text)
      if (structured) {
        this._applyStructuredData(structured, transcripts)
        if (this.onUpdate) {
          this.onUpdate(this._getUpdatePayload())
        }
      }
    } catch (err) {
      console.error('[Structurer] Error:', err.message)
      // Put transcripts back as raw entries so they're not lost
      this._addRawEntries(transcripts)
      if (this.onUpdate) {
        this.onUpdate(this._getUpdatePayload())
      }
    } finally {
      this.processing = false
    }
  }

  /**
   * Build context from current meeting state
   */
  _buildContext() {
    const topics = this.meeting.topics || []
    const currentTopic = topics[topics.length - 1]
    const recentEntries = []

    // Get last 5 entries across all topics
    for (let i = topics.length - 1; i >= 0 && recentEntries.length < 5; i--) {
      const entries = topics[i].entries || []
      for (let j = entries.length - 1; j >= 0 && recentEntries.length < 5; j--) {
        recentEntries.unshift(entries[j])
      }
    }

    return {
      currentTopicTitle: currentTopic ? currentTopic.title : null,
      currentSummary: this.meeting.summary || null,
      recentEntries,
      participants: this.meeting.participants || [],
    }
  }

  /**
   * Parse Claude's JSON response
   */
  _parseResponse(text) {
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/)
      const jsonStr = jsonMatch ? jsonMatch[1] : text
      return JSON.parse(jsonStr.trim())
    } catch (err) {
      console.error('[Structurer] Failed to parse response:', err.message)
      console.error('[Structurer] Raw response:', text.substring(0, 500))
      return null
    }
  }

  /**
   * Apply structured data to the meeting
   */
  _applyStructuredData(data, originalTranscripts) {
    const now = new Date().toISOString()

    // Handle topic change
    if (data.topicChange && data.topicChange.detected && data.topicChange.newTopicTitle) {
      this.meeting.topics.push({
        id: 't' + Date.now().toString(36),
        title: data.topicChange.newTopicTitle,
        startedAt: now,
        summary: '',
        entries: [],
      })
    }

    // Ensure at least one topic exists
    if (this.meeting.topics.length === 0) {
      this.meeting.topics.push({
        id: 't' + Date.now().toString(36),
        title: '議論',
        startedAt: now,
        summary: '',
        entries: [],
      })
    }

    const currentTopic = this.meeting.topics[this.meeting.topics.length - 1]

    // Add structured entries
    if (data.entries) {
      for (const entry of data.entries) {
        currentTopic.entries.push({
          id: 'e' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
          type: entry.type || 'discussion',
          speaker: entry.speakerName || '不明',
          rawText: entry.rawText || '',
          structuredText: entry.structuredText || entry.rawText || '',
          timestamp: now,
        })
      }
    }

    // Add action items
    if (data.newActionItems) {
      for (const item of data.newActionItems) {
        this.meeting.actionItems.push({
          id: 'a' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
          assignee: item.assignee || '未定',
          task: item.task,
          deadline: item.deadline || '',
          status: 'open',
        })
      }
    }

    // Add decisions
    if (data.newDecisions) {
      for (const d of data.newDecisions) {
        this.meeting.decisions.push({
          id: 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
          content: d.content,
          timestamp: now,
        })
      }
    }

    // Add open questions
    if (data.newOpenQuestions) {
      for (const q of data.newOpenQuestions) {
        this.meeting.openQuestions.push({
          id: 'q' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
          content: q.content,
          askedBy: q.askedBy || '不明',
        })
      }
    }

    // Update summary
    if (data.summaryUpdate) {
      this.meeting.summary = data.summaryUpdate
    }

    // Update keywords
    if (data.keywords && data.keywords.length > 0) {
      const existing = new Set(this.meeting.keywords || [])
      for (const kw of data.keywords) {
        existing.add(kw)
      }
      this.meeting.keywords = [...existing]
    }
  }

  /**
   * Add raw entries when structuring fails (fallback)
   */
  _addRawEntries(transcripts) {
    if (this.meeting.topics.length === 0) {
      this.meeting.topics.push({
        id: 't' + Date.now().toString(36),
        title: '議論',
        startedAt: new Date().toISOString(),
        summary: '',
        entries: [],
      })
    }

    const currentTopic = this.meeting.topics[this.meeting.topics.length - 1]
    for (const t of transcripts) {
      currentTopic.entries.push({
        id: 'e' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
        type: 'discussion',
        speaker: t.speaker,
        rawText: t.text,
        structuredText: t.text,
        timestamp: t.timestamp,
      })
    }
  }

  /**
   * Get the current meeting state as an update payload
   */
  _getUpdatePayload() {
    return {
      topics: this.meeting.topics,
      actionItems: this.meeting.actionItems,
      decisions: this.meeting.decisions,
      openQuestions: this.meeting.openQuestions,
      summary: this.meeting.summary,
      keywords: this.meeting.keywords,
    }
  }

  /**
   * Generate final summary using Claude
   */
  async generateFinalSummary() {
    const meetingData = JSON.stringify({
      title: this.meeting.title,
      participants: this.meeting.participants.map(p => p.name),
      topics: this.meeting.topics,
      actionItems: this.meeting.actionItems,
      decisions: this.meeting.decisions,
      openQuestions: this.meeting.openQuestions,
      summary: this.meeting.summary,
    }, null, 2)

    const { text } = await runAgent(
      SUMMARY_SYSTEM_PROMPT,
      [{ role: 'user', content: `以下の会議データから最終議事録を作成してください：\n\n${meetingData}` }],
      { temperature: 0.3, maxTokens: 4096 }
    )

    return text
  }
}

module.exports = { MeetingStructurer }
