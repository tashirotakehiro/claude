# tashirotakehiro/claude

株式会社サバキュー（D2C EC。SurvaQ Store と寝具ブランド CALQS を運営）の、Claude 向けスキル・知識・社内AIアプリを置くリポジトリ。

## 最初に読むもの
- 自社の前提知識（会社・重視する点・ブランド・商品）は `knowledge/README.md` から読む。README の「タスク別に読むファイル」に従い、1〜3ファイルだけ追加で読む
- 自社品に関する主張（仕様・価格・制度・効果）は、knowledge の出典付きの行か、一次ソース（Shopify／ヘイマス／Notion）を引く。どちらにも無ければ「未記載」と言い、推測で補わない

## ディレクトリの役割
- `knowledge/` … 会社知識（What）。書き方・更新ルールは `knowledge/_writing-guide.md`
- `.claude/skills/` … Claude Code／Cowork 用スキル。`_shared/` は商品企画スキルの運用ルール（Notion 書き込み・キル基準・価格の扱い）で、knowledge とは別物
- `server.js`＋`agents/`＋`services/`＋`public/` … 社内AIアプリ「EC商品企画AIチーム」（Express＋Anthropic SDK）。`agents/prompts/` がプロンプト層
- `data/` … アプリのランタイムデータ（コミットしない前提の作業ファイル）

## 変更時の約束
- Go/No-Go 判定は人間が行う。AI は判断材料を出す（`.claude/skills/_shared/business-model.md` と一致させる）
- 事業モデルの数値（単価帯・原価率・広告費比率・年商目標 等）は `knowledge/company/d2c-model.md` の仮定値表だけに書き、他のファイルからはそこを参照する
