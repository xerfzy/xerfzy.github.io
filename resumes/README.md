# Resumes

Five role-specific resumes are generated from Typst sources. Contact details and education are defined once, in `sources/common.typ`.

| Source | PDF | Target roles |
|---|---|---|
| `sources/software-engineer.typ` | `pdf/Sre_Cibi_Varsshan_Software_Engineer.pdf` (default) | General / new-grad software engineer |
| `sources/cpp-systems-graphics.typ` | `pdf/Sre_Cibi_Varsshan_CPP_Systems_Graphics.pdf` | C++, Linux/systems, graphics, GPU, native |
| `sources/android-developer.typ` | `pdf/Sre_Cibi_Varsshan_Android_Developer.pdf` | Android / mobile |
| `sources/game-programmer.typ` | `pdf/Sre_Cibi_Varsshan_Game_Programmer.pdf` | Unity / gameplay programmer |
| `sources/ml-engineer.typ` | `pdf/Sre_Cibi_Varsshan_ML_Engineer.pdf` | ML / reinforcement learning |

## Build and check

```sh
bash scripts/build-resumes.sh
```

Requirements:

- Typst 0.13 or newer (tested with 0.15.1);
- poppler (`pdftotext`, `pdfinfo`, `pdffonts`);
- the Liberation Sans font (falls back to DejaVu Sans).

The script compiles all five PDFs with a fixed `SOURCE_DATE_EPOCH`, so the output is byte-for-byte reproducible. It then runs `scripts/check-resumes.py`, which extracts the text of every PDF and fails unless:

- the PDF is one page, with embedded fonts and author metadata;
- the name is the first extracted line;
- email, GitHub, education and the patent status ("not granted") are present;
- the headings EDUCATION, SUMMARY, PROJECTS, RESEARCH and TECHNICAL SKILLS each appear once, in that order;
- the text is plain ASCII (plus the bullet marker);
- no line breaks inside a hyphenated term and no URL is split;
- none of the forbidden phrases appear (see the script).

After building, render the pages and look at them before sending anything:

```sh
pdftoppm -r 100 -png resumes/pdf/Sre_Cibi_Varsshan_Software_Engineer.pdf /tmp/resume
```

## Editing

- **Contact details.** Edit `person` in `sources/common.typ`. `phone` and `location` are `none` placeholders and are printed only when filled in.
- **A bullet.** Use the form "action + technical implementation + purpose or measured result". Use only facts that are in the project source or recorded results; `docs/PROJECT_AUDIT.md` lists what is verified.
- **Characters.** Write ASCII: `-` not dashes, `x` not `×`, and no `~` (a non-breaking space in Typst). In Typst markup, escape `#` as `\#` (as in `C\#`) and avoid `@`, `_` and `<` outside strings. Repository paths go through `repo("user/name")`, which handles underscores.
- **Keywords.** `docs/RESUME_KEYWORD_MATRIX.md` records which keywords each resume deliberately includes and excludes, and why.
- **A new variant.** Copy one source file, add it to the `OUT` table in `scripts/build-resumes.sh` and to `EXPECTED` in `scripts/check-resumes.py`, and add a link to it in `resumes/index.html`.
