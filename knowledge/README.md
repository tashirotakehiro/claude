---
title: "サバキュー知識ベース"
kind: "index"
owner: "backoffice"
verified: "2026-09-08"
sources:
  - "https://survaq.com"
  - "https://survaq-store.com"
  - "https://calqs-sleep.com"
---

# サバキュー知識ベース（knowledge/）

株式会社サバキューが「何者で、何を重視し、何を売っているか」を、Claude・スキル・アプリが前提知識として読むための正本。

## 使い方（3行）
1. 「タスク別に読むファイル」で自分の業務の行を見て、指定の1〜3ファイルだけ読む
2. 数字・仕様・価格・制度を成果物に書くときは、該当行の（出典・確認日）を添える。ここに無いことは「未記載」と言い、推測で補わない
3. `knowledge/`＝会社知識（What）。`.claude/skills/_shared/`＝商品企画スキルの運用ルール（How）。別物。書き方・更新ルールは `_writing-guide.md`

## 30秒サマリー（数字はここに書かない）
- 株式会社サバキュー（Survaq Inc.、岐阜市）。ミッション「あったらいいな」をそのままにしない。少人数で企画から販売まで回す → company/survaq.md
- 判断基準は三原則 DELIGHT／EMPATHY／HONESTY と「お客様との約束」 → company/principles.md
- 事業は D2C EC（SNS広告→LP→購入）。自社企画商品を Shopify 2店舗とモールで販売 → company/d2c-model.md
- サバキューストア: 『Nice product. Have a nice life.』「面白い・便利・ワクワク」を届ける（自社企画品＋セレクト品） → brands/survaq-store.md
- CALQS（カルクス）: 「がんばらなくていい睡眠環境」の寝具ブランド。ホッとする枕／ダブル枕が中核 → brands/calqs.md。文章ルール → brands/copy-rules.md
- 主力商品の一覧と ID → products/catalog.md。詳細 → products/calqs-pillows.md、products/survaq-store-products.md
- 数字はどこで引くか → sources.md。略称 → glossary.md

## ファイル索引
| パス | 内容 |
|---|---|
| _writing-guide.md | 書き手向け: 規約・更新ルール・チェック・雛形・外部スキル用定型文 |
| company/survaq.md | 会社の事実: 基本情報・沿革・事業・チーム（部門対応表）・公開URL |
| company/principles.md | 重視する点の正本: ミッション・三原則・約束・やらないこと・優先順位・業務別の適用 |
| company/d2c-model.md | D2C事業モデル: 仕組み・企画時の仮定値・収益式・絶対条件 |
| brands/survaq-store.md | サバキューストア: 事実（公開サイトの約束）／重視する点／やらないこと |
| brands/calqs.md | CALQS: 事実（シリーズ・返金ポリシー・トライアル・チャネル別制度差・LP体系・セール制御）／重視する点／やらないこと |
| brands/copy-rules.md | 文章ルール（共通＋ブランド固有）: 薬機法/景表法・根拠表・正式表記・二重価格・命名/UTM・審査NG記録 |
| products/catalog.md | 主力自社企画商品の1表（ID・正式名・handle・参考価格・チャネル・トライアル対象・状態・所在） |
| products/calqs-pillows.md | CALQS 共通技術＋シリーズ別の商品カルテ（仕様・訴求・LP・FAQ・保証） |
| products/survaq-store-products.md | サバキューストア自社企画品の表＋商品カルテ |
| sources.md | 情報の種類→最初に見る一次ソースとツール。チャネル・決済・広告運用規約の所在 |
| glossary.md | 社内アプリ愛称・業務用語・商品略称→ID・接尾辞・ドメイン |

鮮度は各ファイル先頭の `verified`（一次ソースと照合した日）。products/* は3か月超なら「要再確認」扱い。

## タスク別に読むファイル
| 業務 | 読む順（本ファイルの次に） | 読まなくてよい |
|---|---|---|
| 商品企画（.claude/skills の企画スキル群） | company/principles.md → company/d2c-model.md → products/catalog.md。自社照会は＋該当カルテ（所在は catalog）。market-research は＋対象 brands/*.md | sources.md、copy-rules.md |
| LPコピー・広告クリエイティブ（lp-copywriting／meta-ads-*／バナー生成） | brands/calqs.md → brands/copy-rules.md → products/calqs-pillows.md「共通技術」＋該当カルテ。ストア商品は brands/survaq-store.md と survaq-store-products.md に置き換える | principles.md（トーンは copy-rules に集約）、d2c-model.md |
| セール・キャンペーン設定（calqs-sale-form） | brands/calqs.md「トライアル制度」「セール制御」節 → products/catalog.md（正式商品名。title 検索の複数マッチ回避） | それ以外 |
| CS・物流・受注 | brands/calqs.md の制度3節（返金ポリシー・トライアル・チャネル別）→ 該当カルテ「FAQ・保証」 | d2c-model.md、copy-rules.md |
| アプリ・スキル開発 | sources.md → glossary.md → company/principles.md（プロンプトに埋める場合） | products/* |
| 週次振り返り・バックオフィス（weekly-furikaeri-creator） | glossary.md → company/survaq.md「チーム」 | brands/*、products/* |
| 会社を初めて知る／新セッションの前提知識 | company/principles.md → company/survaq.md | それ以外 |

## 読者別の取得方法
- リポジトリ内のスキル: SKILL.md 冒頭「まず読むこと」に `knowledge/README.md` と上表の1〜3ファイルを相対パスで書く
- リポジトリ外の Cowork スキル: GitHub MCP get_file_contents（tashirotakehiro/claude、ref main）で本ファイルを読み、上表のファイルを同じ手段で追加取得（非公開のため raw URL 不可）
- アプリ: `agents/prompts/shared-context.js` が起動時に company/principles.md と company/d2c-model.md を読む
- 単発セッション: Claude Code はルートの CLAUDE.md が本ファイルへ誘導。Cowork／Claude.ai の手順と定型文は `_writing-guide.md`

## 引用ルール
- 自社品の主張（仕様・素材・効果・制度）は、この知識ベースの出典付きの行か、Shopify／ヘイマス／Notion の一次ソースを引く。出典の無い主張はしない
- 参考価格は「YYYY-MM 時点の参考」と明記すれば会話・下書きで引用可。広告・LP・CS 回答に載せる価格と、在庫・件数・KPI は sources.md の一次ソースで再確認する
- principles.md に無い「やらないこと」「優先順位」を判断基準に持ち込まない（未確定はユーザーに確認）