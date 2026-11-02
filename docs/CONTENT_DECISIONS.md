# Content decisions

This records choices made while rebuilding the site and resumes, so that they can be revisited deliberately rather than by accident. The evidence for each project is in `PROJECT_AUDIT.md`.

## Identity and contact
- The site identity is **xerf**. The title is "xerf"; the brief's "A Guide to My Work" subtitle was dropped at the owner's request. The tagline is "KISP — Keep It Secure, Performant." (verbatim). The full name appears on the About page, the research record and the resumes.
- **Email conflict.** The September 2026 resume PDF used `srecibi@gmail.com`; the previous site (commit b376a4a) and the account use `srecibi9@gmail.com`. The owner confirmed **srecibi9@gmail.com**, and it is used everywhere.
- **Not on the resumes:**
  - phone and location: `resumes/sources/common.typ` has placeholders set to `none`;
  - the registration number: never published.
- **On the resumes:** email, GitHub, LinkedIn (`linkedin.com/in/sre-cibi-varsshan-k-34149a287`, supplied by the owner) and the portfolio address `xerfzy.github.io`.
- **GitHub.** Earlier account handles that still appear in some repository READMEs are not linked. Only `github.com/xerfzy` and `github.com/thenamelessone888` (the TrackMania RL repository) are used.

## Base URL and hosting
- The base URL is `https://xerfzy.github.io/`. Canonical links, `og:url`, `sitemap.xml` and `robots.txt` use it.
- That address only works once this repository is renamed to `xerfzy.github.io`. The rename is the owner's decision and has not been done.
- All internal links are relative, so the site also works at the repository's current project-site subpath or any other subpath. The 404 page uses root-absolute links, because it is served for missing paths at any depth.

## Categories
The seven requested categories are kept unchanged. Each project has exactly one canonical category.

| Category | Projects | Notes |
|---|---|---|
| C++ and Systems | censface-cpp, eos-oneplus-nord, DSA_H | eos-oneplus-nord is Bash/Linux tooling for Android devices. It is filed under systems because the work is Linux-side verification, not app development. |
| Graphics and GPU Computing | ChaCha20 GPU encryption, both ray marchers, CPU ray tracer, learning-vulkan, learning-opengl | ChaCha20 is filed here, not under security: the engineering is the GPU compute mapping. |
| Android and Mobile | XrivenixAI, Censface, AgriEdge | XrivenixAI runs an LLM, but it is an Android app first (as the brief requires). |
| Games and Interactive Software | Doofus Diary, Slot Machine, FPS controller | |
| AI and Machine Learning | TrackMania TD3, Space Shooter DQN, Legal Case Similarity (xai-v2), Breast Cancer classification, Image Guessing Game | **Image-gen moved here from "Web and experiments".** Its code runs a local Stable Diffusion pipeline and embedding-similarity scoring; the Flask front end is incidental. |
| Robotics and Embedded Systems | Multi-UAV Monitoring Prototype, ESP32-CAM ORB Features | |
| Web and Other Software | Knapsack Visualisation, Novr | |

## Tiers
- **Featured:** censface-cpp, eos-oneplus-nord, ChaCha20 GPU encryption, the fragment-shader ray marcher, XrivenixAI. Each has working code, documentation and verifiable detail.
- **Research:**
  - TrackMania TD3, which has research-style experiment manifests;
  - the Multi-UAV prototype, which is related engineering work for the published patent application.
- **Project:** CPU ray tracer (guided by a book), Censface, AgriEdge (team), Doofus Diary, Slot Machine.
- **Coursework:** Space Shooter DQN (a course review PDF is committed), Breast Cancer classification (a report is committed), Knapsack Visualisation.
- **Experiment:** compute-shader ray marcher, learning-vulkan, learning-opengl, FPS controller, xai-v2, ESP32 ORB.
- **Archive:** DSA_H (team fork), Image Guessing Game, Novr (team).
- ChaCha20 stays Featured despite the open uniform-type issue. Its page states the issue and the fix plainly instead of hiding it.

## Naming
- Display titles drop the `-vc` / `-v-` suffixes from repository names. Repository URLs are unchanged.
- **XrivenixAI.** The repository is named XrivenixAI; the app label, APK and README use "XrvinexAI". The site uses the repository name and states the app label once on the detail page.
- **Doofus Diary** is the game in `HW_2026_Test`. **AgriEdge** and **Novr** are marked "(team project)".

## Authorship and scope
- **AgriEdge.**
  - A fork of a teammate's repository for a three-person project.
  - Only this author's commits are described: Android BLE fixes and framing, live data, UI, server panel and deployment.
  - The ML models were trained by a teammate and are not claimed.
- **DSA_H** is a team fork. Only the BST and linked-list deletion contributions are claimed.
- **Novr** is a team project. Only the image-generation feature on the Enso page is claimed.
- **qmmp-staging** is a fork with no commits by this author, so it is not listed.
- **censface-cpp** is described as a port of an earlier, unpublished project by the same author.
- **The FPS controller** has only a demo video on the author's channel. It is listed as "video only". Its movement features are not claimed in resumes.
- **Hitwicket and the Slot Machine.** The Hitwicket challenge entry and the Slot Machine assignment are described as a challenge submission and an assignment. No internship or employment is implied.

## Patent and the related project
- The research page gives the formal record (application and publication numbers, dates, journal number, inventors, applicant, classification) and links the official PDF.
- The status reads **"Published patent application. Not granted."**
- The title is kept as published, including the spelling "Crowed", with a note saying so.
- The Multi-UAV page is called "related engineering work". It lists what the prototype does (simulated telemetry, geofencing, ORB keypoints on recorded video) and explicitly lists the disclosed features it does **not** implement.

## Claims and numbers
Claims are marked in the audit as verified in source, README-reported, or unverified. Rules applied:

- Numbers measured by the author and recorded in a repository (XrivenixAI tokens/s and time to first token; censface-cpp timestamp, audio and memory checks) are used with the device or conditions stated.
- ChaCha20's "200–500 MB/s" is not used anywhere as a result, because no timing code exists.
- README claims contradicted by the source are not repeated:
  - SDF subtraction and intersection;
  - "trails" on Doofus Diary platforms;
  - "tracking and mapping" in the ESP32 experiment;
  - "ANN" for FAISS `IndexFlatIP`;
  - the Wisconsin dataset description in the breast-cancer README.
- The TD3 results are described as a plateau, and curriculum learning as implemented but not evaluated.
- The breast-cancer accuracies are labelled as single-run coursework results. The xai-v2 metrics (six demo cases) are not used.

## Things found while auditing (owner to decide)
These are noted on project pages where relevant. The external repositories were not modified.

- ChaCha20: the `uint` uniforms are set with `glUniform1i`; this should be fixed with `glUniform1ui` plus an RFC 8439 test vector. The dispatch is also about 128× oversized.
- Compute ray marcher: `ComputeShader::setFloat` takes an `int`, which is the likely cause of the animation stutter.
- Several READMEs link old usernames or GitHub Pages addresses that now return 404. The working demo addresses are on `xerfzy.github.io`.
- Repository-hygiene issues that should not be published in detail were reported to the owner privately.

## Writing
Four notes, each derived from source or committed results and labelled with its basis. There are no invented posts. The ClickFix threat report is linked as an external security report.

## Removed from the old site
The removed items are still in git history:

- the Orion pages (`about.html`, `blog.html`, `projects.html`, `resume.html`);
- `css/` (Google Fonts import, card grid, reveal animations);
- `js/` (an empty `background.js`, client-side card rendering, scroll-reveal);
- the placeholder LinkedIn link;
- `assets/resume.pdf`, superseded by the five generated resumes and recoverable from commit b9898e1.

## Site format
- The site was first produced by a generator (`scripts/build.mjs` reading `content/*.json`). At the owner's request it is now plain hand-edited HTML: the generator and `content/` were removed, and the generated pages became the source. They are recoverable from commit 28e3a04.
- Look: black background, green monospace text, one centred column. The header, nav, breadcrumbs, page titles and footer are centred; paragraphs and lists are left-aligned inside the column for readability.
