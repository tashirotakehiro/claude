---
title: "サバキューストア（SurvaQ Store）"
kind: "brand"
owner: "marketing"
verified: "2026-09-11"
sources:
  - "https://survaq-store.com（トップ・policies・商品ページ）"
  - "shopify: survaq.myshopify.com（shopify_read shop／products／metafieldDefinitions／deliveryProfiles）"
  - "https://help.survaq-store.com"
  - "https://survaq.com（BUSINESS）"
---

# サバキューストア（SurvaQ Store）

## 事実
### 位置づけ
- 自社 EC 1号店。Shopify ストア（公開ドメイン https://survaq-store.com、shop 名「SurvaQ Store」）。2022 年開設（出典: survaq.com COMPANY、2026-09 確認）
- 役割: 自社企画品（CALQS 商品を含む）とセレクト品を扱う「「あったらいいな」を集めた自社運営ECストア」（出典: survaq.com BUSINESS、2026-09 確認）。CALQS 公式の商品は原則すべてここでも同 SKU で併売され、広告流入用のサテライト LP・旧 LP・モール流入用ページもこのストア上に置かれている（出典: shopify_read 両店舗突合、2026-09 確認）
- コンセプト文（Shopify ストア説明）: 「はじめまして。SurvaQ（サバキュー）ストアです。我々は『Nice product. Have a nice life.』をコンセプトに、海外で人気のある「面白い！」「あったら便利！」「ワクワクする！」ものをお届けしています。」（出典: shopify_read survaq shop.description、2026-09 確認）
- 公開サイトのキャッチ: 「「あったらいいな」がここにある」／「今より"もう一歩"生活を豊かにする商品を」／「SurvaQ（サバキュー）は「今までなかった便利な製品」を企画・設計し、国内・海外に向けて販売しています。「あったらいいな」を実現する、ここでしか手に入らない商品を皆様にお届けします。」（出典: survaq-store.com トップ、2026-09 確認）
- カテゴリ（5領域）: PC／キッチン／生活雑貨／美容／寝具（出典: survaq-store.com、2026-09 確認）

### 公開サイトの約束（フッターガイド4項目）
「3,000円以上送料無料」「国内在庫・国内発送」「様々なお支払い方法」「丁寧なお客様対応」（出典: survaq-store.com フッター画像の alt、2026-09 確認）。Shopify ストア説明の3項目版は company/principles.md。

### 取引条件（要点。正は policies ページとヘルプセンター）
- 送料: 宅急便 600 円、購入 3,000 円以上で無料（参考、2026-09 確認、正: Shopify 配送設定・特商法表記）
- 支払: クレジットカード、コンビニ決済、NP後払い（手数料あり、請求書発行から14日以内）、銀行振込（決済代行 KOMOJU）ほか。フッターの決済アイコンは Visa／Mastercard／Amex／JCB／PayPal／Google Pay／PayPay／Shop Pay（出典: 特商法表記・ヘルプセンター・フッター、2026-09 確認）
- 発送: 在庫品は注文から1〜3営業日以内、複数商品は原則同時出荷。配送日時指定・再配達依頼は受けない（出典: 特商法表記・ヘルプセンター、2026-09 確認）
- 返品: 初期不良は発送後30日以内、顧客都合は未開封のみ・事務手数料 880 円（税込）。申請はマイページから（出典: survaq-store.com/policies/refund-policy、ヘルプセンター、2026-09 確認）。**文書間で日数表記が揺れている**（返金ポリシー内に「発送後7日間」の受付不可条件、利用規約は「到着日から7日以内」）ため、CS 回答は必ずヘルプセンターの現行記事で確認する
- 配送は日本国内限定（出典: 利用規約、2026-09 確認）

### ストアの仕組み（存在と正の所在だけ）
- サテライト LP: Shopify 商品を `satellite-` 接頭の handle で公開し、専用メタフィールド（サテライト用 URL・ロゴ・OGP・表示用商品名）で見せ方を変える。Meta 広告のリンク先は原則サテライト（ドメイン BAN リスク回避）。作り方の正は Notion「サテライトページの作成・管理 › サバキューストア編」（2026-09 確認）
- カートフォーム差し替えと期間限定（セール用）フォーム、v2 フォーム切替、Criteo フィード制御、OptimizeNext（AB テスト）用フラグ、Google ショッピング用のメタフィールドがある（出典: shopify_read metafieldDefinitions、2026-09 確認。値・設定手順は書かない）
- 計測タグ: GTM、Meta コンバージョン、Clarity（ヒートマップ）、OptimizeNext（出典: Notion「サテライトページの作成・管理」、2026-09 確認）
- 顧客導線: LINE 友だち追加、ポイント（easyPoints）、メール（AVADA）、レコメンド専用ページ（`_rec`）、Secret Sale コレクション（出典: shopify_read collections／メタフィールド、survaq-store.com、2026-09 確認）
- モール: 楽天市場店（2024・2025 年に「月間優良ショップ」受賞）、Amazon、Yahoo!ショッピング（出典: survaq.com NEWS、ツキちゃん集計区分、2026-09 確認）

### 運用マニュアルの所在（Notion「ナレッジ・ドキュメント（マニュアル）」）
商品登録（サバキューストア／CALQS／楽天／Yahoo!／Amazon）、新商品発売時の必要な制作物、新商品の「試しきる」フロー、セールバナー設置・撤去・割引適用、期間限定セール、商品売り切れ時、アフターセル、クーポンポップアップ、AB テストの設定方法（2026-09 確認。手順は knowledge に写さない）

## 重視する点
確認後に追記（ヒアリングシート D-9）。公開原文として使えるもの: 「お客様との約束」3項目（company/principles.md）と上記フッターガイド4項目。

## やらないこと
確認後に追記。

## 出典
- https://survaq-store.com（トップ／policies/legal-notice／refund-policy／terms-of-service、2026-09-11 確認）
- shopify_read survaq（shop／products／collections／metafieldDefinitions／deliveryProfiles、2026-09-11）
- https://help.survaq-store.com（配送料・発送時期・返品交換・お問い合わせ先、2026-09-11 確認）
- https://survaq.com BUSINESS／NEWS（2026-09-11 確認）
- Notion「サテライトページの作成・管理 › サバキューストア編」「ナレッジ・ドキュメント（マニュアル）」（2026-09-11 確認）
