/**
 * Notion連携サービス
 * 商品企画管理ページとの読み書きを行う
 *
 * 注意: このモジュールはNotion APIキーが設定されている場合に使用可能
 * 現時点ではプレースホルダー実装。MCP経由での連携は今後対応。
 */

const NOTION_PROJECT_DB = 'collection://174b9edd-0d82-815d-a28c-000b1b069e30'
const NOTION_PARENT_PAGE = '174b9edd0d8280c6ba2fc3ab8d0f0b4e'

// マーケ調査13セクションのキーとNotionでの見出し対応
const SECTION_HEADINGS = {
  s1_overview: '1.商品概要',
  s2_differentiation: '2.流通商品との差別化ポイント',
  s3_problems: '3.どんな悩み・課題を解決するか',
  s4_target: '4.ターゲット（性別、年齢、職業、趣味趣向等）',
  s5_volume: '5.ターゲットの量の推測',
  s6_price: '6.想定販売価格',
  s7_concerns: '7.懸念点（売れない可能性について）',
  s8_competitors: '8.他社の類似商品',
  s9_buying_criteria: '9.この商品カテゴリを購入する際の選び方',
  s10_catchcopy: '10.バナーのキャッチコピー案',
  s11_lp_structure: '11.LPのFVとざっくり構成案',
  s12_product_specs: '12.LPの内容から見る商品仕様',
  s13_conclusion: '13.マーケ担当的結論',
}

/**
 * Build markdown content from research sections for Notion export
 */
function buildResearchMarkdown(research) {
  if (!research) return ''

  let md = '## 目的\n- 年間3000万円以上の販売が見込めそうかの見極め\n- 必須条件になる商品仕様の決定記入項目\n\n'

  for (const [key, heading] of Object.entries(SECTION_HEADINGS)) {
    md += `## ${heading}\n`
    md += research[key] ? research[key] + '\n\n' : '（未調査）\n\n'
  }

  return md
}

/**
 * Parse Notion market research page content into our 13-section format
 */
function parseResearchFromNotion(notionContent) {
  const research = {}
  const headingPattern = /## (\d+)\./g

  for (const [key, heading] of Object.entries(SECTION_HEADINGS)) {
    const sectionNum = heading.match(/^(\d+)\./)?.[1]
    if (!sectionNum) continue

    const regex = new RegExp(`## ${sectionNum}\\..*?\n([\\s\\S]*?)(?=## \\d+\\.|$)`)
    const match = notionContent.match(regex)
    if (match) {
      research[key] = match[1].trim()
    }
  }

  return research
}

module.exports = {
  NOTION_PROJECT_DB,
  NOTION_PARENT_PAGE,
  SECTION_HEADINGS,
  buildResearchMarkdown,
  parseResearchFromNotion,
}
