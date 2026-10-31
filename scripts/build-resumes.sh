#!/usr/bin/env bash
# Compiles every resume from resumes/sources/*.typ into resumes/pdf/ and runs the
# text-extraction checks in scripts/check-resumes.sh.
# Requires: typst (0.13 or newer), pdftotext and pdfinfo (poppler).
set -euo pipefail
cd "$(dirname "$0")/.."

declare -A OUT=(
  [software-engineer]=Sre_Cibi_Varsshan_Software_Engineer.pdf
  [cpp-systems-graphics]=Sre_Cibi_Varsshan_CPP_Systems_Graphics.pdf
  [android-developer]=Sre_Cibi_Varsshan_Android_Developer.pdf
  [game-programmer]=Sre_Cibi_Varsshan_Game_Programmer.pdf
  [ml-engineer]=Sre_Cibi_Varsshan_ML_Engineer.pdf
)

mkdir -p resumes/pdf
# A fixed creation date keeps the PDFs byte-for-byte reproducible.
export SOURCE_DATE_EPOCH=${SOURCE_DATE_EPOCH:-1793404800}  # 2026-10-31T00:00:00Z

for src in "${!OUT[@]}"; do
  typst compile --root resumes/sources "resumes/sources/$src.typ" "resumes/pdf/${OUT[$src]}"
  printf '%-28s -> %s (%s page(s))\n' "$src.typ" "${OUT[$src]}" "$(pdfinfo "resumes/pdf/${OUT[$src]}" | awk '/^Pages:/{print $2}')"
done

python3 -I scripts/check-resumes.py
