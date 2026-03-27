/**
 * Web検索サービス
 * エージェントがWeb検索を行うためのヘルパー
 *
 * 注意: 現時点ではエージェントのプロンプト内で検索指示を出す形で対応。
 * Claude APIのtool_use機能を使った自動検索は今後対応。
 */

/**
 * Format search results for agent context
 */
function formatSearchResults(results) {
  if (!results || !Array.isArray(results)) return 'No results'
  return results.map((r, i) => `${i + 1}. ${r.title}\n   URL: ${r.url}\n   ${r.snippet || ''}`).join('\n\n')
}

/**
 * Build search context string from keyword
 */
function buildSearchContext(keyword, category) {
  return `以下のキーワードで調査してください: "${keyword}"
カテゴリ: ${category}
Amazon、楽天、その他ECサイトでの類似商品の情報を分析してください。`
}

module.exports = {
  formatSearchResults,
  buildSearchContext,
}
