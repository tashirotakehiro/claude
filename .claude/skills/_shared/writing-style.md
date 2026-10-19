# 書き方と画像のルール（商品企画スキル共通）

人は大量の文章を読まない。**チャットも Notion も「ささっと読めて、核心だけが目に入る」密度で書く。**
型は agent-workspace の my-marketing-research（`members/tashiro-takehiro/skills/marketing-research/references/golden-example.md`）に揃える。

## 文章の密度（数値で守る）
- **1行 40 字以内が目安、60 字を超えたら必ず割る。** 1行に1論点
- **親の行＝結論、子の行＝補足。入れ子は2段まで。** 1項目の親は7個まで
- **太字は核心だけ、各項目1〜3か所。** 太字だけ読んでも中身が分かるように置く
- **本文に書かないもの:** 出典・調査日・確信度・n 数・「※」の注記・計算の途中式・「未確認」の羅列。これらは各ページ末尾の「根拠・出典」トグル1つにまとめる
- 推測で埋めない。分からないことは本文に書かず、チャットで伝える
- 薬機法・景表法に触れる表現（治る・改善 等）をコピーに使わない（それ以上の法規チェックは商品企画ではしない）
- Notion に書く前に下書きを scratchpad に置き、密度チェックを通す:
  `python3 .claude/skills/_shared/scripts/check_density.py <draft.md>`（見出しは `### ` で書く。**NG 0 件**になるまで直す）

## AIは判断しない
- 案の順位付け・生存/没の裁定・Go/No-Go・YES/NO 判定・★の自己採点は出さない
- 代わりに**懸念（売れないと思う理由・弱点）**を材料として並べる。懸念は判定ではなく「この点で売れないかもしれない」という事実と推論
- 販売価格・価格の根拠は書かない（`business-model.md`「価格の扱い」）。競合の価格は書く

## チャットでの報告
- 要約は 5〜10 行。表を使ってよい。詳細は Notion に書いてリンクを送る
- ユーザーに決めてほしいことは、最後に1〜2個だけ聞く

## 画像（作る・自分で見る・見せる・貼る）
### 作る
- `ai_call` で OpenAI の画像エンドポイントを叩く（`ai_image_gen` は使わない。出力が社内認証の内側に置かれ、Notion に貼れず、自分でも見られない）
  - URL: `https://gateway.ai.cloudflare.com/v1/4ba07cbf9289649f2220412fcb512357/survaq-ai-gateway/openai/images/generations`
  - body: `{"model":"gpt-image-1","n":1,"size":"1536x1024","quality":"medium","output_format":"jpeg","prompt":"…"}`（`high` は60秒でタイムアウトする）
  - レスポンスは自動でファイルに退避される → `python3 .claude/skills/_shared/scripts/decode_image.py <退避先> <scratchpad>/<名前>.jpg`
- プロンプトは英語。実際の使用シーンの写真調。文字・ロゴの写り込みを禁止
- 構造を見せたいときは「説明用に片側を透かす／断面」と明示する。位置関係（何が何の内側か、どこから見た構図か）は具体的に書く

### 自分の目で見る（必須）
- **Read で画像を開いて、自分で確かめる。** 別の AI に「意図通りか」を聞いて済ませない（印象評価は見落とす）
- 確かめること: 意図した部品が写っているか／位置関係（内側・外側・どこから見えるか）／人の顔や手の破綻／文字・ロゴの混入／不審・不気味に見えないか
- ずれていたらプロンプトを直して作り直す。直せなかったずれは、見せるときに一言添える

### 見せる
- チャットでは `SendUserFile` で画像を送る（社内リンクを貼るだけにしない）

### Notion に貼る
- `notion-create-file-upload`（filename: `<名前>.jpg`）→ 返った `upload_url` に
  `curl -X POST -H "authorization: <upload_headers の値>" -F "file=@<path>;type=image/jpeg" <upload_url>`
  → 返る `markdown_source`（`file-upload://…`）を画像として貼る
- 一度貼った file-upload は再利用できない。貼り直すときは上げ直す
