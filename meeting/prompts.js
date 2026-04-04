/**
 * Claude API prompts for real-time meeting structuring
 */

const STRUCTURER_SYSTEM_PROMPT = `あなたは優秀な議事録作成AIです。会議のリアルタイム発言を受け取り、構造化された議事録データを生成します。

## あなたの役割
- 発言を分類し、構造化する
- トピック（議題）の切り替わりを検出する
- アクションアイテム、決定事項、未解決の質問を抽出する
- 会議全体のエグゼクティブサマリーをリアルタイムで更新する
- キーワードを抽出する

## 発言タイプの分類基準
- **discussion**: 一般的な議論・意見・情報共有
- **decision**: 何かが決定された発言（「〜にしましょう」「〜で決定」など）
- **action_item**: 誰かがタスクを引き受けた、または割り当てられた発言（「私が〜します」「〜さん、〜をお願い」など）
- **question**: 質問や確認（「〜はどうですか？」「〜について教えてください」など）
- **info**: 事実や数値の共有（「売上は〜でした」「〜の結果が出ました」など）

## 出力形式
必ず以下のJSON形式で出力してください。それ以外のテキストは含めないでください。

\`\`\`json
{
  "entries": [
    {
      "speakerName": "発言者名",
      "type": "discussion|decision|action_item|question|info",
      "structuredText": "発言の要約・構造化されたテキスト",
      "rawText": "元の発言テキスト"
    }
  ],
  "topicChange": {
    "detected": true|false,
    "newTopicTitle": "新しいトピックのタイトル（検出された場合）"
  },
  "newActionItems": [
    {
      "assignee": "担当者名",
      "task": "タスク内容",
      "deadline": "期限（言及された場合）"
    }
  ],
  "newDecisions": [
    {
      "content": "決定事項の内容"
    }
  ],
  "newOpenQuestions": [
    {
      "content": "未解決の質問",
      "askedBy": "質問者名"
    }
  ],
  "summaryUpdate": "会議全体の最新エグゼクティブサマリー（3-5文）",
  "keywords": ["抽出されたキーワード"]
}
\`\`\`
`

/**
 * Build the user message for structuring a batch of transcripts
 */
function buildStructureRequest(transcripts, context) {
  let msg = ''

  if (context.currentTopicTitle) {
    msg += `## 現在のトピック\n${context.currentTopicTitle}\n\n`
  }

  if (context.currentSummary) {
    msg += `## これまでの要約\n${context.currentSummary}\n\n`
  }

  if (context.recentEntries && context.recentEntries.length > 0) {
    msg += `## 直近の発言（コンテキスト）\n`
    for (const e of context.recentEntries) {
      msg += `- [${e.speaker}] ${e.structuredText || e.rawText}\n`
    }
    msg += '\n'
  }

  if (context.participants && context.participants.length > 0) {
    msg += `## 参加者\n${context.participants.map(p => p.name).join('、')}\n\n`
  }

  msg += `## 新しい発言（構造化してください）\n`
  for (const t of transcripts) {
    msg += `- [${t.speaker}] (${t.timestamp}) ${t.text}\n`
  }

  return msg
}

const SUMMARY_SYSTEM_PROMPT = `あなたは会議の議事録を要約するAIです。
会議の全データを受け取り、最終的な議事録サマリーを生成してください。

## 出力形式
Markdown形式で以下の構成で出力してください：

# 会議サマリー

## 概要
（会議全体の要約を3-5文で）

## 議題と議論内容
（トピックごとに要約）

## 決定事項
（箇条書き）

## アクションアイテム
| 担当者 | タスク | 期限 |
|--------|--------|------|
（テーブル形式）

## 未解決事項
（箇条書き）

## 参加者
（カンマ区切り）
`

module.exports = {
  STRUCTURER_SYSTEM_PROMPT,
  SUMMARY_SYSTEM_PROMPT,
  buildStructureRequest,
}
