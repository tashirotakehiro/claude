const { runAgent, runAgentStream } = require('./agent-runner')
const { SHARED_CONTEXT } = require('./prompts/shared-context')

// Import all agent prompts
const { TEAM_LEADER_PROMPT } = require('./prompts/team-leader')
const { PRODUCT_IDEA_PROMPT } = require('./prompts/product-idea')
const { IDEA_REFINEMENT_PROMPT } = require('./prompts/idea-refinement')
const { MARKET_RESEARCH_PROMPT } = require('./prompts/market-research')
const { LP_STRUCTURE_PROMPT } = require('./prompts/lp-structure')
const { CATCHCOPY_BANNER_PROMPT } = require('./prompts/catchcopy-banner')
const { COMPETITIVE_ANALYSIS_PROMPT } = require('./prompts/competitive-analysis')
const { FINANCIAL_VIABILITY_PROMPT } = require('./prompts/financial-viability')
const { SNS_TREND_PROMPT } = require('./prompts/sns-trend')
const { REVIEW_ANALYSIS_PROMPT } = require('./prompts/review-analysis')

const AGENTS = {
  'team-leader':           { name: 'チームリーダー',           color: '#3b5bdb', prompt: TEAM_LEADER_PROMPT },
  'product-idea':          { name: '商品アイデア担当',         color: '#e67700', prompt: PRODUCT_IDEA_PROMPT },
  'idea-refinement':       { name: 'アイデアブラッシュアップ担当', color: '#2b8a3e', prompt: IDEA_REFINEMENT_PROMPT },
  'market-research':       { name: 'マーケ調査担当',           color: '#c2255c', prompt: MARKET_RESEARCH_PROMPT },
  'lp-structure':          { name: 'LP構成案担当',             color: '#7048e8', prompt: LP_STRUCTURE_PROMPT },
  'catchcopy-banner':      { name: 'キャッチコピー・バナー担当', color: '#f59f00', prompt: CATCHCOPY_BANNER_PROMPT },
  'competitive-analysis':  { name: '競合分析担当',             color: '#1098ad', prompt: COMPETITIVE_ANALYSIS_PROMPT },
  'financial-viability':   { name: '収益性分析担当',           color: '#d6336c', prompt: FINANCIAL_VIABILITY_PROMPT },
  'sns-trend':             { name: 'SNSトレンド分析担当',      color: '#ae3ec9', prompt: SNS_TREND_PROMPT },
  'review-analysis':       { name: 'レビュー分析担当',         color: '#0ca678', prompt: REVIEW_ANALYSIS_PROMPT },
}

function buildSystemPrompt(agentId) {
  const agent = AGENTS[agentId]
  if (!agent) throw new Error(`Unknown agent: ${agentId}`)
  return SHARED_CONTEXT + '\n\n' + agent.prompt
}

function buildProjectContext(project) {
  if (!project) return ''
  let ctx = `\n\n## 現在のプロジェクト情報\n`
  ctx += `- プロジェクト名: ${project.name}\n`
  ctx += `- ステータス: ${project.status}\n`
  ctx += `- 現在のステージ: ${project.currentStage}\n`
  if (project.idea) ctx += `- アイデア概要: ${project.idea}\n`
  if (project.research) {
    const filled = Object.entries(project.research).filter(([_, v]) => v).length
    ctx += `- マーケ調査進捗: ${filled}/13セクション完了\n`
  }
  return ctx
}

/**
 * Parse team leader response for action directives
 * Leader embeds JSON blocks like: ```action\n{"invoke":["agent-id"],"context":"..."}\n```
 */
function parseActions(leaderText) {
  const actions = []
  const regex = /```action\s*\n([\s\S]*?)\n```/g
  let match
  while ((match = regex.exec(leaderText)) !== null) {
    try {
      const parsed = JSON.parse(match[1])
      if (parsed.invoke && Array.isArray(parsed.invoke)) {
        actions.push(parsed)
      }
    } catch (e) { /* skip malformed */ }
  }
  return actions
}

/**
 * Get the visible text from leader response (strip action blocks)
 */
function getLeaderVisibleText(leaderText) {
  return leaderText.replace(/```action\s*\n[\s\S]*?\n```/g, '').trim()
}

/**
 * Main orchestration: handle a user message
 * Returns events via onEvent callback: { type, agentId, agentName, color, text }
 */
async function handleMessage(userMessage, project, conversationHistory, onEvent) {
  // Step 1: Team Leader decides what to do
  const leaderSystem = buildSystemPrompt('team-leader') + buildProjectContext(project)

  const leaderMessages = [
    ...conversationHistory.slice(-20), // last 20 messages for context
    { role: 'user', content: userMessage },
  ]

  onEvent({ type: 'agent-start', agentId: 'team-leader', agentName: 'チームリーダー', color: '#3b5bdb' })

  const leaderFullText = await runAgentStream(
    leaderSystem,
    leaderMessages,
    (chunk) => onEvent({ type: 'agent-chunk', agentId: 'team-leader', text: chunk }),
  )

  onEvent({ type: 'agent-end', agentId: 'team-leader', text: getLeaderVisibleText(leaderFullText) })

  // Step 2: Parse actions from leader response
  const actions = parseActions(leaderFullText)

  if (actions.length === 0) return // Leader handled it directly

  // Step 3: Execute specialist agents (parallel within each action)
  for (const action of actions) {
    const agentPromises = action.invoke.map(async (agentId) => {
      if (!AGENTS[agentId]) return
      const agent = AGENTS[agentId]
      const agentSystem = buildSystemPrompt(agentId) + buildProjectContext(project)
      const agentMessages = [
        { role: 'user', content: action.context || userMessage },
      ]

      onEvent({ type: 'agent-start', agentId, agentName: agent.name, color: agent.color })

      const agentText = await runAgentStream(
        agentSystem,
        agentMessages,
        (chunk) => onEvent({ type: 'agent-chunk', agentId, text: chunk }),
      )

      onEvent({ type: 'agent-end', agentId, text: agentText })
      return { agentId, text: agentText }
    })

    await Promise.all(agentPromises)
  }

  // Step 4: If multiple agents ran, leader synthesizes
  if (actions.some(a => a.invoke.length > 0)) {
    const synthMessages = [
      ...leaderMessages,
      { role: 'assistant', content: leaderFullText },
      { role: 'user', content: '各担当エージェントの結果が出ました。ユーザーに分かりやすく要約・統合してください。次のステップも提案してください。' },
    ]

    onEvent({ type: 'agent-start', agentId: 'team-leader', agentName: 'チームリーダー（まとめ）', color: '#3b5bdb' })

    const synthText = await runAgentStream(
      leaderSystem,
      synthMessages,
      (chunk) => onEvent({ type: 'agent-chunk', agentId: 'team-leader-synth', text: chunk }),
    )

    onEvent({ type: 'agent-end', agentId: 'team-leader-synth', text: synthText })
  }
}

module.exports = { handleMessage, AGENTS, parseActions }
