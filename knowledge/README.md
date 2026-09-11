---
title: "サバキュー知識ベース"
kind: "index"
owner: "backoffice"
verified: "2026-09-11"
sources:
  - "https://survaq.com"
  - "https://survaq-store.com"
  - "https://calqs-sleep.com"
---

# サバキュー知識ベース（knowledge/）

株式会社サバキューが「何者で、何を重視し、何を売っているか」を、Claude・スキル・アプリが読むための正本。

## 使い方（3行）
1. 「タスク別に読むファイル」で自分の業務の行を見て、指定の1〜3ファイルだけ読む
2. 数字・仕様・価格・制度を成果物に書くときは、該当行の（出典・確認日）を添える。ここに無いことは「未記載」と言い、推測で補わない
3. `knowledge/`＝会社知識（What）。`.claude/skills/_shared/`＝商品企画スキルの運用ルール（How）。手順は Notion マニュアル。書き方は `_writing-guide.md`

## 30秒サマリー（数字はここに書かない）
- 株式会社サバキュー（Survaq Inc.、岐阜市）。ミッション「「あったらいいな」を、そのままにしない。」 → company/survaq.md
- 判断基準は三原則 DELIGHT／EMPATHY／HONESTY と「お客様との約束」。Go/No-Go と販売価格は人が決める → company/principles.md
- 事業は D2C EC（SNS広告→LP→購入）。自社企画商品を Shopify 2店舗とモールで販売 → company/d2c-model.md
- サバキューストア: 『Nice product. Have a nice life.』「あったらいいな」がここにある → brands/survaq-store.md
- CALQS（カルクス）: 「がんばるあなたに、がんばらなくていい睡眠環境を。」首を40度で15分温める枕のブランド → brands/calqs.md。文章・広告ルール → brands/copy-rules.md
- 主力商品の一覧と ID → products/catalog.md。カルテ → products/calqs-hot-pillow.md（共通技術）／calqs-double-pillow.md／calqs-others.md／survaq-store-products.md
- 数字の引き先 → sources.md。略称 → glossary.md

## ファイル索引
| パス | 内容 |
|---|---|
| _writing-guide.md | 書き手向け: 規約・更新ルール・チェック・雛形 |
| company/survaq.md | 会社の事実: 基本情報・事業・沿革・工程・チーム・窓口 |
| company/principles.md | 重視する点の正本: ミッション・三原則・約束（公開原文）。業務解釈は代表確認後に追記 |
| company/d2c-model.md | D2C 事業モデル: 仕組み・企画時の仮定値表・収益式・絶対条件 |
| brands/survaq-store.md | サバキューストア: 事実（約束・取引条件・仕組み）／重視する点／やらないこと |
| brands/calqs.md | CALQS: 事実（ブランド・シリーズ・返金ポリシー・トライアル・チャネル別制度差・保証・LP 体系・セール制御）／重視する点／やらないこと |
| brands/copy-rules.md | 文章・広告ルール: 正式表記・薬機法/景表法・トーン・根拠表・命名/UTM・NG 記録 |
| products/catalog.md | 主力自社企画商品の1表（仮 ID・正式名・handle・参考価格・トライアル・状態・所在） |
| products/calqs-hot-pillow.md | CALQS 共通技術＋ホッとする枕シリーズのカルテ |
| products/calqs-double-pillow.md | ダブル枕シリーズ・クワトロ枕のカルテ |
| products/calqs-others.md | 腰枕・足枕・サポーター・枕カバー・マットレス・ウェアのカルテ |
| products/survaq-store-products.md | サバキューストア自社企画品（CALQS 以外）の表＋カルテ |
| sources.md | 情報の種類→最初に見る一次ソースとツール。Notion 主要ページ名 |
| glossary.md | 社内アプリ愛称・業務用語・商品略称→ID・handle 接尾辞 |

鮮度は各ファイル先頭の `verified`（一次ソースと照合した日）。products/* は3か月超なら要再確認。

## タスク別に読むファイル
| 業務 | 読む順（本ファイルの次に） | 読まなくてよい |
|---|---|---|
| 商品企画（.claude/skills の企画スキル群） | company/principles.md → company/d2c-model.md → products/catalog.md。自社照会は＋該当カルテ（所在は catalog） | sources.md、copy-rules.md |
| LP コピー・広告クリエイティブ（lp-copywriting／meta-ads-*） | brands/calqs.md → brands/copy-rules.md → products/calqs-hot-pillow.md「共通技術」＋該当カルテ。ストア商品は brands/survaq-store.md と survaq-store-products.md | principles.md、d2c-model.md |
| セール・キャンペーン設定（calqs-sale-form） | brands/calqs.md「トライアル制度」「セール制御の所在」→ products/catalog.md（正式商品名） | それ以外 |
| CS・物流・受注（logiless-*） | brands/calqs.md の制度3節（返金ポリシー・トライアル・チャネル別・保証）→ 該当カルテ「FAQ・保証」 | d2c-model.md、copy-rules.md |
| アプリ・スキル開発 | sources.md → glossary.md → company/principles.md（プロンプトに埋める場合） | products/* |
| 週次振り返り・バックオフィス（weekly-furikaeri-creator） | glossary.md → company/survaq.md「チーム・文化」 | brands/*、products/* |
| 会社を初めて知る／新セッションの前提知識 | company/principles.md → company/survaq.md | それ以外 |

## 読者別の取得方法
- リポジトリ内のスキル: SKILL.md 冒頭「まず読むこと」に `knowledge/README.md` と上表の1〜3ファイルを相対パスで書く
- リポジトリ外の Cowork スキル: GitHub MCP get_file_contents（tashirotakehiro/claude、ref main）で本ファイルを読み、上表のファイルを同じ手段で追加取得。public の間は raw URL（raw.githubusercontent.com/tashirotakehiro/claude/main/knowledge/…）の WebFetch でも可
- アプリ: `agents/prompts/shared-context.js` が起動時に company/principles.md と company/d2c-model.md を読む
- 単発セッション: Claude Code はルートの CLAUDE.md が本ファイルへ誘導。Cowork／Claude.ai は依頼文に「knowledge/README.md を読んでから」と1行添える

## 引用ルール
- 自社品の主張（仕様・素材・効果・制度）は、この知識ベースの出典付きの行か、Shopify／ヘイマス／Notion の一次ソースを引く。出典の無い主張はしない
- 参考価格は「YYYY-MM 時点の参考」と明記すれば会話・下書きで引用可。広告・LP・CS 回答に載せる価格と、在庫・件数・KPI は一次ソースで再確認する
- principles.md に無い「やらないこと」「優先順位」を判断基準に持ち込まない（未確定はユーザーに確認）

## 出典
- 各ファイルの frontmatter `sources` を参照
