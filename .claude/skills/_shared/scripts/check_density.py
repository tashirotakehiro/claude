#!/usr/bin/env python3
"""Notion に書く前の下書き (Notion-flavored Markdown) が「ささっと読める密度」か機械的に確かめる。

元: agent-workspace の members/tashiro-takehiro/skills/marketing-research/scripts/check_density.py のコピー。
直すときは両方そろえる。

使い方: python3 check_density.py <draft.md>
NG が1つでもあれば終了コード1。NG を直してから Notion に書く。

チェック内容 (正解見本 references/golden-example.md から逆算した上限):
- 1行の文字数: 本文 40 字超は警告、60 字超は NG (リンク先 URL・太字記号は数えない)
- 表のセル: 30 字超は NG
- セクションの親項目数: 8 個以上は NG (12 は └ の小見出しごとに数える)
- 入れ子: 親から数えて 2 段より深いのは NG
- 本文に注記・出典・確信度を書かない (「根拠・出典」トグルの中だけ許す)
- 1-1 は表、6 は2行まで、13 は「最終判定：」が空欄で、3つの問いに YES/NO が付いている
"""
import re
import sys

WARN_LEN, NG_LEN, CELL_LEN, MAX_TOP = 40, 60, 30, 7
BANNED = ["※", "確信度", "出典", "確認日", "時点", "換算", "表示から", ".md", "n=", "下書き",
          "未検証", "仮定値のみ"]
EVIDENCE_TOGGLE = "根拠・出典"


def visible(s: str) -> str:
    s = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", s)          # 画像
    s = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", s)       # リンクは表示文字だけ
    s = re.sub(r"<[^>]+>", "", s)                        # タグ
    s = s.replace("**", "").replace("`", "")
    return s.strip()


def main(path: str) -> int:
    lines = open(path, encoding="utf-8").read().splitlines()
    ng, warn = [], []
    section = group = None
    top_count, in_evidence = {}, False
    section_lines = {}
    bullet_tabs = [len(l) - len(l.lstrip("\t")) for l in lines if l.lstrip("\t").startswith(("- ", "1. "))]
    base = min(bullet_tabs) if bullet_tabs else 0

    for no, raw in enumerate(lines, 1):
        body = raw.lstrip("\t")
        tabs = len(raw) - len(body)
        if f"<summary>{EVIDENCE_TOGGLE}" in body:
            in_evidence = True
            continue
        if in_evidence:
            if body.startswith("</details>"):
                in_evidence = False
            continue
        if body.startswith("### "):
            section = group = body[4:].strip()
            top_count[section] = 0
            section_lines[section] = []
            continue
        if not body or section is None:
            continue
        section_lines[section].append(body)
        where = f"L{no} [{section[:12]}]"

        if body.startswith("<td>"):
            cell = visible(body)
            if len(cell) > CELL_LEN:
                ng.append(f"{where} 表のセルが {len(cell)} 字 (上限 {CELL_LEN}): {cell[:40]}…")
            continue
        if body.startswith("└"):
            group = f"{section} {body}"
            top_count[group] = 0
            continue
        if body.startswith(("<", "![")):
            continue

        text = visible(re.sub(r"^(- |\d+\. )", "", body))
        is_bullet = body.startswith(("- ", "1. ")) or re.match(r"^\d+\. ", body)
        if is_bullet:
            depth = tabs - base
            if depth == 0:
                top_count[group] += 1
            if depth >= 2 and not body.startswith("![") :
                ng.append(f"{where} 入れ子が {depth + 1} 段目 (2段まで): {text[:30]}")
        if len(text) > NG_LEN:
            ng.append(f"{where} {len(text)} 字 (上限 {NG_LEN}): {text[:40]}…")
        elif len(text) > WARN_LEN:
            warn.append(f"{where} {len(text)} 字: {text[:40]}…")
        for b in BANNED:
            if b in body:
                ng.append(f"{where} 本文に「{b}」(根拠・出典トグルへ移す): {text[:30]}")

    for sec, n in top_count.items():
        if n > MAX_TOP:
            ng.append(f"[{sec[:12]}] 親項目が {n} 個 (上限 {MAX_TOP})。補足は子に、根拠はトグルへ")
    for sec, body in section_lines.items():
        if sec.startswith("1-1") and not any(l.startswith("<table") for l in body):
            ng.append("[1-1] 表になっていない")
        if sec.startswith("6.") and len([l for l in body if not l.startswith("<")]) > 2:
            ng.append("[6] 価格と広告費上限の2行までにする")
        if sec.startswith("13"):
            final = [l for l in body if l.startswith("最終判定")]
            if not final:
                ng.append("[13] 「最終判定：」の行が無い")
            elif re.sub(r"^最終判定[:：]", "", final[0]).strip():
                ng.append("[13] 最終判定は空欄にする（人が書く）")
            judged = [l for l in body if re.search(r"[:：]\s*\*\*(YES|NO)\*\*\s*$", l)]
            if len(judged) != 3:
                ng.append(f"[13] YES/NO（太字）が付いた問いが {len(judged)} 個（3個にする）")

    for w in warn:
        print("警告", w)
    for n in ng:
        print("NG  ", n)
    print(f"--- NG {len(ng)} 件 / 警告 {len(warn)} 件")
    return 1 if ng else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1]))
