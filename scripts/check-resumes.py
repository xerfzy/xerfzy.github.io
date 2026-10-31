#!/usr/bin/env python3
"""ATS text-extraction checks for every PDF in resumes/pdf.

Uses poppler's pdftotext/pdfinfo/pdffonts. Exits non-zero on any failure.
Run from the repository root:  python3 -I scripts/check-resumes.py
"""
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PDF_DIR = ROOT / "resumes" / "pdf"
EXPECTED = [
    "Sre_Cibi_Varsshan_Software_Engineer.pdf",
    "Sre_Cibi_Varsshan_CPP_Systems_Graphics.pdf",
    "Sre_Cibi_Varsshan_Android_Developer.pdf",
    "Sre_Cibi_Varsshan_Game_Programmer.pdf",
    "Sre_Cibi_Varsshan_ML_Engineer.pdf",
]
HEADINGS = ["EDUCATION", "SUMMARY", "PROJECTS", "RESEARCH", "TECHNICAL SKILLS"]
REQUIRED = ["Sre Cibi Varsshan K", "srecibi9@gmail.com", "github.com/xerfzy",
            "linkedin.com/in/sre-cibi-varsshan-k-34149a287", "xerfzy.github.io",
            "Vellore Institute of Technology, Chennai", "Expected 2027",
            "IN202641060337 A1", "not granted"]
FORBIDDEN = [r"(?i)\borion\b",
             r"(?i)passionate", r"(?i)team player", r"(?i)hardworking",
             r"(?i)(?<!not )\bgranted patent\b", r"(?i)\binternship\b"]
# Private identifiers (excluded names etc.) come from the git-ignored local file.
_private = ROOT / ".private-patterns"
if _private.exists():
    for _line in _private.read_text().splitlines():
        if _line.strip() and not _line.startswith("#"):
            FORBIDDEN.append("(?i)" + _line.split("\t", 1)[1])
ALLOWED_NON_ASCII = {"•"}  # bullet marker


def run(*cmd):
    return subprocess.run(cmd, check=True, capture_output=True, text=True).stdout


def check(name):
    errs = []
    pdf = PDF_DIR / name
    if not pdf.exists():
        return [f"missing {pdf.relative_to(ROOT)}"]
    info = run("pdfinfo", str(pdf))
    pages = int(re.search(r"^Pages:\s+(\d+)", info, re.M).group(1))
    if pages != 1:
        errs.append(f"{pages} pages (expected 1)")
    if "Author:          Sre Cibi Varsshan K" not in info:
        errs.append("PDF author metadata missing")
    fonts = run("pdffonts", str(pdf))
    # columns: name, type (may contain spaces), encoding, emb, sub, uni, object, ID
    for line in fonts.splitlines()[2:]:
        cols = line.split()
        if len(cols) >= 5 and "no" == cols[-5]:
            errs.append(f"font not embedded: {cols[0]}")

    raw = run("pdftotext", "-layout", str(pdf), "-")
    flat = " ".join(run("pdftotext", str(pdf), "-").split())
    if not raw.strip():
        errs.append("no extractable text")
    first = next((l.strip() for l in raw.splitlines() if l.strip()), "")
    if first != "Sre Cibi Varsshan K":
        errs.append(f"first line is {first!r}, expected the name")
    for s in REQUIRED:
        if s not in flat:
            errs.append(f"missing text: {s}")
    pos = []
    for h in HEADINGS:
        n = len(re.findall(rf"^\s*{h}\s*$", raw, re.M))
        if n != 1:
            errs.append(f"heading {h} appears {n} times")
        m = re.search(rf"^\s*{h}\s*$", raw, re.M)
        pos.append(m.start() if m else -1)
    if pos != sorted(pos):
        errs.append("headings out of order")
    bad = sorted({c for c in raw if ord(c) > 127 and c not in ALLOWED_NON_ASCII})
    if bad:
        errs.append("non-ASCII characters: " + " ".join(f"U+{ord(c):04X}" for c in bad))
    for pat in FORBIDDEN:
        if re.search(pat, flat):
            errs.append(f"forbidden wording matched: {pat}")
    urls = re.findall(r"(?:github\.com|xerfzy\.github\.io)/[\w./-]+", flat)
    for u in urls:
        if u.endswith("-") and not u.endswith("project-") and not u.endswith("vc-"):
            errs.append(f"URL looks split: {u}")
    for line in raw.splitlines():
        s = line.rstrip()
        if s.endswith("-") and not re.search(r"(?:project|vc)-$", s):
            errs.append(f"line breaks at a hyphen: ...{s[-40:]}")
    bullets = raw.count("•")
    if bullets < 6:
        errs.append(f"only {bullets} bullets extracted")
    return errs, pages, bullets, len(urls)


def main():
    failed = False
    for name in EXPECTED:
        result = check(name)
        if isinstance(result, list):
            print(f"FAIL {name}: {result[0]}")
            failed = True
            continue
        errs, pages, bullets, urls = result
        status = "ok  " if not errs else "FAIL"
        print(f"{status} {name}: {pages} page, {bullets} bullets, {urls} URLs")
        for e in errs:
            print(f"     - {e}")
        failed |= bool(errs)
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
