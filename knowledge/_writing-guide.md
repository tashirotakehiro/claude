---
title: "書き手向け規約（knowledge/）"
kind: "guide"
owner: "backoffice"
verified: "2026-09-08"
sources:
  - "本ディレクトリの設計方針（knowledge/ を追加した PR の説明を参照）"
---

# 書き手向け規約

`knowledge/` を追加・更新する人（と、更新を頼まれた Claude）だけが読む。読者向けの入口は `README.md`。規約はこのファイルにだけ書き、他ファイルで繰り返さない。

## 1. 役割分担（何を書き、何を書かないか）
- `knowledge/` ＝ 会社知識（What）。「自社が何者で、何を重視し、何を売っているか」
- `.claude/skills/_shared/` ＝ 商品企画スキルの運用ルール（How）。Notion 書き込み手順・テンプレ契約・キル基準・価格の扱い・市場実測シグナルはそこが正
- Notion「マーケティングGr › ナレッジ・ドキュメント（マニュアル）」 ＝ 業務手順（How）。knowledge は「その仕組みが存在し、正は○○にある」の1〜3行とページ名だけ書く
- 依存方向は skills / agents → knowledge の一方向。knowledge から `.claude/` の ID や手順を逆参照しない

## 2. 事実と「重視する点」を分ける
- `kind: facts`（company/survaq.md・d2c-model.md・products/*）: 事実のみ。「〜すべき」を書かない
- `kind: principles`（company/principles.md）: 価値観・判断基準・やらないこと。数字・商品名・件数・ID を書かない
- `kind: brand`（brands/*.md）: 「## 事実」「## 重視する点」「## やらないこと」「## 出典」の固定順。出典は必ず最終節
- 重視する点は**代表（または marketing）が確認したものだけ**をリポジトリに置く。公開原文（ミッション・三原則・約束）は出典付きで載せてよい。業務解釈・違反例・優先順位は、確認前は見出しだけ残して「確認後に追記」と書く。「（未確認）」ラベル付きで本文に置かない（LLM はラベルを無視して従う）

## 3. frontmatter（5キー固定。値は二重引用符）
```
---
title: "CALQS（カルクス）"
kind: "brand"            # index | guide | facts | principles | brand | reference
owner: "marketing"       # backoffice | logistics | marketing | product-development（個人名は書かない）
verified: "2026-09-08"   # 本文の事実を一次ソースと照合した日（編集日ではない）
sources:
  - "https://calqs-sleep.com（商品ページ・policies/refund-policy）"
  - "shopify: calqs.myshopify.com（shopify_read）"
confirmed_by: "representative"   # principles と、brand の「重視する点／やらないこと」節がある場合のみ。役割名
confirmed_on: "2026-09-20"       # confirmed_by がある場合のみ
---
```

## 4. 出典と時点依存値の書式
- 自社品の主張（仕様・素材・効果・制度・技術）は行末または節末に「（出典: calqs-sleep.com 商品ページ、2026-09 確認）」。出典を付けられない事実は書かない。雛形の記入例にも適用する
- 時点依存値は「（参考 ¥19,800 税込、2026-09 確認、正: Shopify／ヘイマス）」の形。書いてよい時点依存値は catalog の参考価格・カルテの仕様行・公開サイトの送料無料条件だけ
- 件数・順位・在庫・KPI・実績値・通常価格（比較対照価格）は書かない。正は Shopify／のび太くん
- 科学的メカニズムの主張（深部体温 等）は brands/copy-rules.md「使ってよい根拠」表で出典付きのみ管理する。出典が無ければ載せない
- 各ファイル末尾に「## 出典」節を置き、必ず最終節にする（アプリのローダーが「## 出典」以降を除去する）

## 5. ID と参照
- 商品 ID ＝ 製品コード（ヘイマス product_group の型番プレフィックス）。確定前は本店 handle を仮 ID にし「（ID仮）」を付ける
- シリーズ ID ＝ 大文字ケバブ（HOT-PILLOW／DOUBLE-PILLOW／SUPPORT／PILLOW-COVER／MATTRESS）
- 商品カルテの見出しは `### <製品コード> — 正式商品名`。参照は製品コードのみで行い、ファイル名を参照文字列に含めない（所在は catalog「所在」列。ファイル分割で参照が壊れない）
- 見出し名は契約。既存スキルが見出し名で参照する（『価格の扱い』『市場実測シグナル』等）作法に合わせ、knowledge の H2/H3 も改名時は `grep -rn` で参照元を同じ変更で直す

## 6. 字数上限（空白・改行を除く）
| ファイル | 上限 |
|---|---|
| README.md | 3,500 |
| catalog.md／calqs-pillows.md／survaq-store-products.md | 6,000 |
| sources.md | 2,500 |
| _writing-guide.md（雛形・定型文を含む） | 5,000 |
| その他 | 4,000 |

計測: `python3 -c "import re,sys;print(len(re.sub(r'\s','',open(sys.argv[1],encoding='utf-8').read())))" knowledge/README.md`
超えたらファイルを分割し、README の索引を同じ変更で更新する。1タスクで読むのは README＋1〜3ファイル、合計 12,000 字以内を目安にする。

## 7. 書かないもの
原価金額・粗利率・原価内訳・仕入先・メーカー名／API キー・トークン・Notion の DB/ページ ID（正は `_shared/notion-template.md`）／顧客情報／代表以外の個人名（役割・チーム区分で書く）・私的連絡先・Slack ID／件数・順位・KPI・実績値・通常価格／運用手順・GraphQL・メタフィールド名・タグ名・閾値／AI 下書きの未確認候補

## 8. 更新トリガーと commit タグ
commit メッセージの先頭にタグを1つ付ける。PR テンプレは作らない。principles.md と brands の「重視する点／やらないこと」だけは代表が確認してからマージする。

| トリガー | 直す場所 | タグ |
|---|---|---|
| 新商品発売・終売・改名 | products/catalog.md、該当シリーズファイル、glossary.md の略称 | [新商品] |
| 価格改定 | catalog の参考価格列、カルテの参考価格行 | [棚卸し] |
| 四半期の照合（products/* のみ。他は変更時） | 該当ファイルの verified | [棚卸し] |
| 返金・トライアル・保証の制度変更 | brands/calqs.md の制度節、カルテ「FAQ・保証」 | [制度] |
| 広告審査 NG・表現ルール変更 | brands/copy-rules.md「審査で落ちた表現の記録」 | [NG記録] |
| 方針・価値観・仮定値の変更 | principles.md、brands「重視する点」、d2c-model.md 仮定値表（年商目標は services/notion.js の目的文も） | [方針] |
| ツール・アプリ・ページの追加廃止 | sources.md、glossary.md | [構成] |

## 9. commit 前チェック（2本。ヒットは目で確認する）
```
grep -rnE "仕入先|メーカー名|粗利率|原価内訳|token|secret|password|xoxb-" knowledge/
grep -rnE "[0-9０-９,]+件|[0-9]+位|ROAS [0-9]|売上高" knowledge/ --exclude=_writing-guide.md
```

## 10. 読者への届け方（README「読者別の取得方法」の詳細）
- リポジトリ内スキル: SKILL.md 冒頭「まず読むこと」に `knowledge/README.md` と業務別 1〜3 ファイルを相対パスで書く。中身はスキルに写さない
- リポジトリ外の Cowork スキル: SKILL.md に次の段落を追記する（1経路のみ。取得できない場合は推測で埋めない）

  > ## 自社知識の参照
  > 作業開始時に GitHub `tashirotakehiro/claude` の `knowledge/README.md`（ref: main）を get_file_contents で読み、索引の指示に従って必要なファイル（例 `knowledge/brands/calqs.md`）を追加取得する。数字・仕様・制度を使うときは該当行の出典と確認日を成果物に添える。取得できない場合はユーザーに伝え、自社の仕様・価格・制度を推測で断定しない。

- アプリ（同一リポジトリ）: `agents/prompts/shared-context.js` が起動時に company/principles.md と company/d2c-model.md を読む。生成物はコミットしない
- 単発セッション: Claude Code はルート `CLAUDE.md` が誘導する。Cowork／Claude.ai は依頼文に「tashirotakehiro/claude の knowledge/README.md を読み、索引に従って必要なファイルを読んでから始めて」と1行添える

## 11. 雛形
通常ファイル: frontmatter → `# タイトル` → （products と sources だけ）冒頭に「分かること／分からないこと」2〜3行 → 本文（箇条書き・表。段落で書かない）→ `## 出典`。

商品カルテブロック（シリーズファイル内。1商品1ファイルにしない）:
```
### <製品コード> — <正式商品名>
**識別子** 製品コード／型番例／ブランド・シリーズ／handle（本店・サテライト）／参考価格／販売チャネル／トライアル対象／状態・発売年
**解決する悩みとターゲット** 1〜3行
**差別化訴求（3〜4）** 各行に出典
**採用済みの気づき（LP教育セクションの核）** 1行＋Notion ページ名
**仕様（共通技術との差分だけ）** サイズ／素材／固有機能／付属・バリエーション／生産国
**LP一覧** 本店LP／サテライトLP（Notion ページ名）
**FAQ・保証** トライアル条件／保証／よくある質問／表現上の注意
**出典・確認履歴** YYYY-MM-DD 役割: 何を何と突合したか
```
記入例は products/calqs-pillows.md の先頭カルテを実例として使う。

## 出典
- 設計時の調査（2026-09-08）: リポジトリ内の参照関係、Notion「ナレッジ・ドキュメント（マニュアル）」の構成、survaq-mcp のツール群
