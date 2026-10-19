#!/usr/bin/env python3
"""ai_call (OpenAI images/generations) のレスポンスから画像を取り出して保存する。

元: agent-workspace の members/tashiro-takehiro/skills/marketing-research/scripts/decode_image.py のコピー。

使い方: python3 decode_image.py <ai_call の保存先ファイル> <出力パス.jpg>
ai_call のレスポンスは大きすぎてコンテキストに入らず、自動でファイルに退避される。
そのファイルから b64_json を取り出してデコードする。
"""
import base64
import re
import sys

src, out = sys.argv[1], sys.argv[2]
text = open(src, encoding="utf-8", errors="ignore").read()
m = re.search(r'"b64_json"\s*:\s*"([A-Za-z0-9+/=\\n]+)"', text)
if not m:
    sys.exit("b64_json が見つからない。エラーレスポンスの可能性があるので中身を確認する")
data = base64.b64decode(m.group(1).replace("\\n", ""))
open(out, "wb").write(data)
print(f"{out} ({len(data):,} bytes)")
