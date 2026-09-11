---
title: "一次ソース台帳"
kind: "reference"
owner: "backoffice"
verified: "2026-09-11"
sources:
  - "survaq-mcp app_list（2026-09-08）"
  - "survaq-mcp のツール群（shopify_read／notion_read／logiless_read／bigquery_read 等）"
  - "Notion「マーケティングGr › ナレッジ・ドキュメント（マニュアル）」の構成（2026-09-08）"
---

# 一次ソース台帳

分かること: 「この種類の情報は、まずどこを見るか」。
分からないこと: 値そのもの（価格・在庫・KPI・原価）。ここには書かない。

## 使い方
1. 社内アプリの一覧は survaq-mcp の `app_list` を叩くのが正（愛称と用途は glossary.md）。呼び出しは `app_fetch`（実行前にユーザー確認が必要。仕様は各アプリの `/api/mcp-docs`）
2. 下表で「最初に見る場所」を選び、値を引いたら成果物に出典と確認日を添える

## 情報の種類 → 最初に見る場所
| 情報 | 最初に見る | 補足 |
|---|---|---|
| 会社概要・ミッション・沿革 | https://survaq.com | company/survaq.md に転記済み |
| 商品の正式名・handle・現在価格・バリアント・コレクション | Shopify Admin（`shopify_read`。サバキューストア＝survaq、CALQS 公式＝calqs。**店舗を明示する**） | 公開価格は各ストアの商品ページでも確認可 |
| 製品コード・SKU 階層・価格と原価系の指標・メーカー情報 | ヘイマス（商品情報管理） | 原価系の値とメーカー情報は knowledge に書かない |
| 差別化訴求・LP 構成・スペック・KPI（売上／粗利／ROAS） | のび太くん（製品カルテ・全製品 KPI） | KPI は knowledge に書かない |
| 在庫・在庫日数 | 在庫日数管理／ロジレス | |
| 受注・出荷・返品の実務 | ロジレス（`logiless_read`）。運用は logiless-* スキル | |
| 販路別売上・決済会社別の入金 | ツキちゃん | チャネル: Shopify×2、楽天、Amazon、Yahoo!。決済: NP後払い、KOMOJU、SBPS ほか |
| 輸入（中国メーカー）の進行 | PORTA | |
| 広告の成果・クリエイティブ | 広告クリエイティブライブラリ／各媒体 API（`ads_meta_read` 等）／のび太くん | |
| 広告予算の自動調整ルールと履歴 | 広告予算自動調整 | ルール設計の考え方は ads-logic-designer スキル |
| AB テスト | AB テスト結果（OptimizeNext） | |
| GA4・BigQuery の行動データ | `ga4_read`／`bigquery_read`、購入ユーザー行動分析 | |
| 顧客向けの制度（返品・交換・保証・お問い合わせ先） | help.survaq-store.com、各ストアの policies ページ | 要点は brands/calqs.md・brands/survaq-store.md に転記済み |
| 業務手順（商品登録・セール対応・広告媒体別ルール・CRM 設定） | Notion「マーケティングGr › ナレッジ・ドキュメント（マニュアル）」 | 手順は knowledge に写さない（下記ページ名で参照） |
| 商品企画の状態（企画マスターページ・ドシエ・フィードバックログ） | Notion プロジェクト DB。ID の正は `.claude/skills/_shared/notion-template.md` | |
| 週次振り返り | Notion 振り返り DB（weekly-furikaeri-creator スキル） | |

## Notion の主要ページ（名前のみ。ID は書かない）
- 「マーケティングGr › ナレッジ・ドキュメント（マニュアル）」: サイト運用マニュアル（Git でサイト内容を変更する方法／新商品発売: 必要な制作物・商品登録（サバキューストア／CALQS／楽天／Yahoo!／Amazon）・新商品の「試しきる」フロー／セール対応: セールバナー設置・撤去・割引適用・期間限定セール／商品売り切れ時／アフターセル）、モール（楽天市場各種対応方法）、広告掲載（雑誌掲載時）、Shopify 関連（CALQS バナー設置）、ロジレス関連、広告に関して（広告媒体別ルール／広告媒体設定(サバキュー独自の設定/ルール)／広告媒体ごとの知見）、CRM 関連（Sendgrid 設定／LINE 設定）、施策マニュアル（Amazon Vine／クーポンポップアップ／AB テストの設定方法）、枕販売価格、一斉送信メール 送信前チェックリスト
- 「サテライトページの作成・管理」（子: サバキューストア編）
- 商品×LP ページ群: 「<商品名> - CALQS (<store>/<handle>)」「… (satellite <slug>)」の命名
- 「田代メモ」: フィードバックログ・需要調査の証拠パック・LP 構成案の置き場
- プロジェクト DB「商品企画管理 › プロジェクト」: 企画マスターページ（テンプレ「【新商品】企画段階定型」）

## 外部ツール（app_list に載らないもの）
Shopify（2店舗）、Notion、ロジレス、BigQuery、GA4、Meta／Google／Yahoo!／X／Criteo 広告、Google Data Manager、Slack、Google Drive／Sheets／Forms／Calendar、Gmail、楽天 RMS、メールディーラー、SurveyMonkey、OptimizeNext、Sendgrid、LINE 公式アカウント（survaq-mcp のツール名と Notion マニュアル名より。2026-09 確認）

## 出典
- survaq-mcp `app_list`（2026-09-08）、survaq-mcp ツール一覧（2026-09-08）、Notion「ナレッジ・ドキュメント（マニュアル）」子ページ一覧（2026-09-08）
