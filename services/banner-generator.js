const Anthropic = require('@anthropic-ai/sdk')

const client = new Anthropic()

const SYSTEM_PROMPT = `あなたは日本のD2C EC商品のSNS広告クリエイティブディレクターです。
与えられた商品情報をもとに、50パターンのバナー広告仕様をJSON配列で出力してください。

## 出力ルール

1. 必ずJSON配列のみを出力（説明文や\`\`\`は不要）
2. 配列の要素数は正確に50
3. サイズ配分: 1080x1080を17枚、1080x1920を17枚、1200x628を16枚
4. 10種のテンプレートを各5枚ずつ均等に使用
5. 最低15種類の異なる配色を使用
6. コピーはサイズに合わせて文字数調整:
   - 1080x1080: headline 8〜20文字
   - 1080x1920: headline 5〜15文字（大きく表示するため短めに）
   - 1200x628: headline 10〜25文字（横長なので少し長めOK）

## テンプレートタイプ（必ず全10種を使用）

1. "before-after" — Before/After分割（左が悩み・右が解決後）
2. "big-benefit" — ベネフィット大文字＋小さな商品画像
3. "testimonial" — 口コミ風「」付き体験談
4. "urgency" — 期間限定・緊急性訴求
5. "problem-agitation" — 悩み煽り型「まだ○○で悩んでますか？」
6. "number-stats" — 数字・実績強調
7. "minimal-premium" — ミニマル・高級感（余白多め）
8. "magazine" — 雑誌風エディトリアル
9. "ugc-style" — UGC風・カジュアルSNS投稿風
10. "comparison" — 比較型

## コピーアーキタイプ（5種を均等に使用）

A. Benefit直球型: 直接的なベネフィット訴求
B. 好奇心型: 「なぜ○○は△△なのか？」「○○が"ズルい"と言った理由」
C. Before/After型: 変化を端的に表現
D. 数字・権威型: 具体的数字や専門家の推薦
E. 共感型: ターゲットの悩みへの共感から入る

## 配色のガイドライン

日本のSNS広告で効果的な配色パターン:
- 暖色系（赤・オレンジ・ピンク）: 緊急性、女性向け
- 寒色系（青・ネイビー）: 信頼感、男性向け
- 白ベース: 清潔感、高級感
- 黒ベース: プレミアム感、男性向け
- パステル: 優しさ、ナチュラル
- ゴールド系: 高級感、特別感
- グリーン系: 自然、健康

## 各オブジェクトの形式

{
  "id": (1-50の連番),
  "size": "1080x1080" | "1080x1920" | "1200x628",
  "template": (上記10種のいずれか),
  "headline": (メインキャッチコピー),
  "subheadline": (サブコピー、1行),
  "cta": (CTAボタンテキスト、4-8文字),
  "badge": (バッジテキスト、なければnull),
  "colorScheme": {
    "bg": "#hex",
    "accent": "#hex",
    "text": "#hex",
    "subtext": "#hex"
  },
  "fontStyle": "gothic-bold" | "gothic-light" | "rounded",
  "productImagePosition": "left" | "right" | "center" | "bottom" | "background",
  "copyArchetype": "A" | "B" | "C" | "D" | "E",
  "layoutNote": (レイアウト補足: 例 "テキスト上部・商品画像下部" など短く)
}`

/**
 * Generate 50 banner specs using Claude API
 * @param {Object} input - Product information
 * @param {string} input.productDescription - What the product is
 * @param {string} input.benefits - Key benefits
 * @param {string} input.suggestedCatchcopy - User's suggested catchcopy
 * @param {string} input.targetAudience - Target audience description
 * @returns {Promise<Array>} Array of 50 banner spec objects
 */
async function generateCreativeMatrix(input) {
  const userMessage = `以下の商品情報で50パターンのバナー広告仕様を生成してください。

【商品説明】
${input.productDescription}

【ベネフィット】
${input.benefits}

【おすすめキャッチコピー案】
${input.suggestedCatchcopy}

【ターゲット】
${input.targetAudience}

上記を踏まえて、日本のSNS広告で「当たりやすい」50パターンのJSON配列を出力してください。`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 16384,
    temperature: 0.9,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  })

  const text = response.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('')

  // Extract JSON array from response (handle potential markdown wrapping)
  let jsonStr = text.trim()
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  }

  const specs = JSON.parse(jsonStr)

  if (!Array.isArray(specs)) {
    throw new Error('Claude did not return a JSON array')
  }

  return specs
}

module.exports = { generateCreativeMatrix }
