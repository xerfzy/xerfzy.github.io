# Project audit

Audit date: 2026-10-31. Sources are the public repositories under `github.com/xerfzy` and `github.com/thenamelessone888`. Each repository was read through a partial clone (history, plus file contents on demand). Nothing was checked out, built or executed.

Claim markers used below:

- **[S]** verified in source code or repository history
- **[R]** reported in the repository README or docs, not reproduced here
- **[U]** unverified, or contradicted by the source

The registry that drives the site is `content/projects.json`. This file records the evidence behind it.

Authorship: commits under earlier handles of the same owner are counted as this author's own work. Other contributors are referred to as teammates.

---

## C++ and Systems

### censface-cpp: Featured, detail page
- Repo: https://github.com/xerfzy/censface-cpp. Not a fork. 1 commit (2026-10-31).
- Languages: C++17, CMake, Bash.
- Verified technologies [S]:
  - FFmpeg C API: libavformat, libavcodec, libavutil and libswscale via pkg-config. OpenCV `core`, `imgproc`, `imgcodecs` and `dnn`.
  - `-Wall -Wextra -Wpedantic`.
  - RAII `unique_ptr` deleters for FFmpeg objects (`src/ffmpeg_raii.h`).
- Function: detects heads in JPEG, PNG and MP4 input with a YOLOv8-format ONNX model. It applies glitch, pixelate or blur inside a feathered head mask and writes JPEG, PNG or H.264 MP4.
- Architecture [S]:
  - `main.cpp`: CLI, path safety and signals.
  - `image_pipeline.cpp` and `video_pipeline.cpp`: the `VideoProcessor` class, covering demux → decode → swscale to BGR → rotate → detect, track and filter → swscale to yuv420p → libx264 → mux.
  - `face_detector.cpp`: 640 px letterbox, `cv::dnn::NMSBoxes`, score threshold 0.38, NMS 0.45, at most 64 heads.
  - `filters.cpp`.
  - `docs/PIPELINE.md` walks through every FFmpeg call.
- Notable details [S]:
  - The encoder uses the input stream's time base and reuses each frame's `best_effort_timestamp`, so variable-frame-rate timing survives.
  - The display matrix is read from `AV_PKT_DATA_DISPLAYMATRIX` and applied to the pixels.
  - Audio is stream-copied after an `avformat_query_codec` check.
  - SIGINT exits with 130 and removes partial output; output is written to a temp file and renamed atomically.
- Contribution: a C++ port of the processing core of an earlier, unpublished Censface project by the same author (Android app plus Python reference). The README lists what was ported and what was rewritten. All FFmpeg I/O is new.
- Evidence and tests:
  - The README has a verification table (PSNR against the Python reference, timestamp and audio MD5 equality, peak memory 486 MB vs 490 MB for 6 s and 29 s clips) [R].
  - There is no automated test suite; `scripts/verify_video.sh` is the check script [S].
- Limitations [R]:
  - Tested on one distribution (FFmpeg 9.0.2, OpenCV 5.0.0) only.
  - Detection runs on the CPU every frame.
  - Speed not benchmarked.
  - No license file yet.

### eos-oneplus-nord: Featured, detail page
- Repo: https://github.com/xerfzy/eos-oneplus-nord. Not a fork. 1 commit (2026-10-30).
- Language: Bash.
- Verified [S]:
  - Downloads run through a resumable `curl -C -` worker as systemd user units, renamed only after size and SHA-256 match.
  - `01`, `02` and `04` are read-only `adb` checks.
  - `05` audits the vendor installer against pinned hashes.
  - `06-flash-eos.sh` refuses unless `fastboot getvar product` contains the expected platform and `unlocked=yes`, exactly one device is attached, and the user types `ERASE <serial>`.
- Function: wraps the official /e/OS 4.4.1 installer for the OnePlus Nord AC2001 (`avicii`) with verification gates, and documents Magisk v31.1 rooting.
- Evidence: the README records one successful install on 30 Oct 2026 [R]. The scripts were later generalised, and `01`, `02` and `06` have not been re-run against a phone since [R].
- Limitations: one device model; the flash step is necessarily destructive.

### DSA_H: Archive, no detail page
- Repo: https://github.com/xerfzy/DSA_H. **Fork** of a team repository; 42 commits.
- Language: C.
- Contribution [S]: 7 of 42 commits by this author (binary search tree with edge cases, deletion for singly and doubly linked lists). The other 35 commits are by two teammates.
- Status: archived coursework-era team library.

### qmmp-staging: Excluded
- Fork of the Qmmp media player with **no commits by this author**. Not listed on the site.

---

## Graphics and GPU Computing

### ChaCha20 GPU Image Encryption: Featured, detail page
- Repo: https://github.com/xerfzy/chacha2020ImageEncryption_using_compute_shader. Not a fork. 11 commits, 2026-03-30 to 2026-05-20.
- Languages: C++17 and GLSL 4.30. Builds with CMake (Linux) and a Visual Studio project.
- Verified [S]:
  - `shaders/chacha_compute.ps`: `local_size_x = 256` and an SSBO `uint data[]` at binding 0.
  - The ChaCha20 quarter-round uses the 16/12/8/7 rotations, 10 double rounds (column, then diagonal), and adds the input state back.
  - Each invocation computes **two** 64-byte blocks (counter = `id*2 + b`) and XORs 32 words in place.
- Host side [S] (`main.cpp`):
  - OpenSSL `RAND_bytes` generates the 32-byte key and 12-byte nonce per batch.
  - `stbi_info` header scans plan batches against a VRAM budget entered in the UI.
  - Images are packed into one buffer padded to 128 bytes, then uploaded with `glBufferData(GL_SHADER_STORAGE_BUFFER)`.
  - Then `glDispatchCompute`, `glMemoryBarrier(GL_SHADER_STORAGE_BARRIER_BIT)` and `glMapBuffer` readback.
  - Output is a `.cb` file (count, metadata array, ciphertext) plus a key file.
  - Decryption reuses the same shader.
  - The UI uses Dear ImGui and a native folder picker (imfilebrowser).
- Observations from source:
  - [S] The dispatch size is `ceil(padded / 256)` work groups of 256 invocations, which is one invocation per byte. Each invocation covers 128 bytes, so most invocations compute keystream blocks that fall past the end of the buffer and are discarded by the bounds check. Shrinking the dispatch to `ceil(padded / 128 / 256)` groups is an obvious next step.
  - [S] ChaCha20 here provides confidentiality only: there is no MAC (for example Poly1305), so ciphertext tampering is not detected.
- [S] **Uniform type mismatch.** `shaders/chacha_compute.ps` declares `uniform uint C1..C4, K1..K8, N1..N3`. `main.cpp` sets them with `ComputeShader::setInt`, which calls `glUniform1i`.
  - The OpenGL reference for `glUniform` says: "GL_INVALID_OPERATION is generated if one of the signed integer variants of this function is used to load a uniform variable of type unsigned int". The uniform is then left unchanged (0), and `glGetError` is never checked.
  - On a conforming driver, the keystream would be independent of the generated key and nonce. Round trips would still succeed, because encryption and decryption use the same state.
  - Untested here, and driver leniency varies.
  - Fix: use `glUniform1ui`, then add a known-answer test against the RFC 8439 block-function test vector.
- Throughput: "200–500 MB/s on an RTX 3050 6 GB" [R]. There is no timing code in `main.cpp`, so this figure is **not** used in resumes.
- Limitations: the README says "one 64-byte block per invocation", but the shader does two [U for README wording]. Build outputs and Windows libraries are committed to the repo.

### Ray Marcher (OpenGL fragment shader): Featured, detail page
- Repo: https://github.com/xerfzy/Ray_marcher_using_fragment_shader_in_opengl. Not a fork. 19 commits; code 2026-02-04 to 2026-04-16, README edits to 2026-09-09.
- Languages: C++ and GLSL 4.30 (GLFW, GLAD, GLM; Visual Studio project).
- Verified [S]:
  - Full-screen quad fragment shader (`shaders/FullQuad1.ffs`) doing sphere tracing (`MAX_STEPS 56`, hit epsilon 0.001, max distance 1000).
  - SDFs for sphere, axis-aligned box (Chebyshev form) and plane.
  - Infinite domain repetition with `mod()`.
  - Union via `min()`.
  - Sine displacement.
  - Normals from central differences (step 0.001).
  - Camera position and basis vectors passed as a uniform struct from a C++ free-fly camera (WASD and mouse).
  - Pass 1 renders into an FBO colour texture with a depth-stencil renderbuffer. Pass 2 (`Framebuffer.ffs`) applies a 3×3 Sobel operator and thresholds it.
- **Not found in source [U]:** the README's "subtraction, intersection" SDF operations do not appear in any shader in the repository history. Only union is implemented, so the site and resumes do not claim CSG subtraction or intersection.
- Demos: two YouTube recordings linked from the README. Screenshots `render_sample/1.png` and `4.png` are in the repo.
- Limitations [R/S]:
  - The README calls it work in progress.
  - The scene is hardcoded in the shader.
  - Screen coordinates are normalised by a fixed 1000 px constant.
  - No acceleration structure.

### CPU Ray Tracer: Project, detail page (short)
- Repo: https://github.com/xerfzy/Ray_tracer-learning-project-. Not a fork. 22 commits, 2025-11-09 to 2025-12-14.
- Language: C++14 (CMake).
- Verified [S]:
  - `camera` class with vertical FOV, look-from/look-at and a defocus disk (aperture angle, focus distance).
  - `samples_per_pixel` averaging and recursive `ray_color` with `max_depth`.
  - Materials: Lambertian, metal with fuzz, and dielectric with Schlick reflectance and total-internal-reflection check.
  - Writes PPM to stdout.
  - `std::chrono` timing around the render.
- Contribution: follows *Ray Tracing in One Weekend* closely, as the README says; resources for refraction and the thin-lens camera are listed.
- Output: `output/final.png` and others (real renders).
- Classification: Project (guided learning implementation).

### Ray Marcher (compute shader demo): Experiment
- Repo: https://github.com/xerfzy/Ray_marcher_implemented_in_ComputeShader-Opengl--DemoVersion-. 7 commits, Jan to Feb 2026.
- Verified [S]: the compute shader uses `local_size 10×10` and writes `imageStore` into an `rgba32f` texture bound with `glBindImageTexture`; the result is drawn with a full-screen quad shader.
- Limitation [R]: animated transforms stutter, and this is unresolved. `missl/avregage_glfw_initial_time.txt` holds frame-time samples from debugging it.
- Likely cause [S]: in this repo's `ComputeShader.h`, `setFloat(const std::string&, int value)` takes an `int`. The animated uniforms `t = 5*tan(time)` and `angle = time` are therefore truncated to whole numbers and change in jumps. `tan()` also has poles every π seconds. The fragment-shader repo's `Shader::setFloat` correctly takes a `float`.
- [S] A `GL_TIME_ELAPSED` query wraps the dispatch, but only the last frame's result is printed, at exit.

### learning-vulkan: Experiment
- Repo: https://github.com/xerfzy/learning-vulkan. 10 commits, Jul to Sep 2026.
- Verified [S]: Vulkan-Hpp RAII types for the instance, debug messenger, physical and logical device, queue-family search, surface, swapchain and image views, plus a shader module from Slang compiled to SPIR-V. `createGraphicsPipeline` has been started.
- Shown as learning experience only. No rendering output yet.

### learning-opengl: Experiment
- Repo: https://github.com/xerfzy/learning-opengl. 7 commits, Dec 2025. LearnOpenGL exercises (shaders, textures, transforms).

---

## Android and Mobile

### XrivenixAI: Featured, detail page
- Repo: https://github.com/xerfzy/XrivenixAI. Not a fork. 8 commits, all 2026-09-27 (history imported in one day). The app name in the README and APK is "XrvinexAI"; the repository name "XrivenixAI" is used on the site.
- Languages: Kotlin and C++ (JNI).
- Build [S]: `minSdk 24`, `targetSdk 36`, NDK 28.2, `abiFilters arm64-v8a`, CMake external build. llama.cpp is a git submodule.
- Verified [S]:
  - `app/src/main/cpp/pocketai.cpp` is the JNI bridge: `llama_model_load_from_file`, a main plus an auxiliary context, a batch decode loop, KV-cache prefix reuse (`llama_memory_seq_rm`), grammar-constrained completion and embeddings.
  - Jetpack Compose with Material 3.
  - Room database with migrations 1→4 and FTS5 virtual tables (`tokenize='porter unicode61'`).
  - Packages `knowledge/` (QueryRouter, KnowledgeLayer, MemoryExtractor, MemoryManager), `model/` (catalog, suitability rating, download manager) and `device/` (RAM, storage and CPU-feature profiling).
- Tests [S]: 30 JVM unit-test methods in 5 files, and 29 instrumented test or benchmark methods in 13 files (including `PerfBenchmark.kt` and `MemoryRetrievalBenchmark.kt`). Not run here.
- Performance on a OnePlus Nord CE 3 5G with Qwen 2.5 3B Q4_K_M [R]: about 5–6 tokens/s generation and about 3.2 GB RSS. Time to first token is about 1.8 s with KV reuse versus about 7 s without. A benchmark harness exists in source [S], but the numbers are README-reported.
- Distribution: APK in `releases/` [S]. Not on Google Play.
- Limitations [R]: CPU-only inference; 3 of 12 catalog models tested on a device; Android backup not restricted.

### AgriEdge (team project): Project, no detail page
- Repo: https://github.com/xerfzy/AgriEdge. **Fork** of a teammate's repository; 32 commits, 27 by this author.
- The project report lists a three-person team, submitted October 2026.
- Languages: Dart (Flutter) and JavaScript (Node/Express backend).
- Verified dependencies [S]: `flutter_riverpod`, `go_router`, `drift` with SQLite, `tflite_flutter`, `bluetooth_low_energy`, `cbor`, `cryptography` (Ed25519), `workmanager`, `flutter_map`, and `express` with `better-sqlite3`.
- Teammate's work, from git history [S]:
  - initial app, trained on-device models (disease detection, crop recommendation, price forecast);
  - the first P2P BLE alert mesh, including the CBOR packet format and Ed25519 device identity.
- This author's work [S], commits 2026-10-14 to 2026-10-15:
  - Android build fixes;
  - making the BLE mesh work end to end on Android (`ble_framing.dart`, advertising-set handling, ack-after-store), with P2P regression tests;
  - UI redesign;
  - live Agmarknet prices through data.gov.in, plus MSP data;
  - farm-supplies buy and sell;
  - photo transfer over BLE;
  - a password-gated server control panel and Render deployment;
  - README and data-source docs.
- Live server: `agriedge-yztd.onrender.com` [R]. It did not respond on a quick check (likely free-tier cold start); see `docs/PERFORMANCE_REPORT.md` link check.
- Limitations [R]: ML models are "good enough for a demo, not field-validated".

---

## Games and Interactive Software

### Doofus Diary: Project, detail page
- Repo: https://github.com/xerfzy/HW_2026_Test. Not a fork. 25 commits, 2026-08-19 to 2026-08-21. Made for the Hitwicket game-developer challenge; this was a challenge submission, not employment.
- Language: C# (Unity).
- Verified [S]:
  - `PlayerMovement.cs`: Rigidbody, camera-relative input, single and double jump gated by `ScoreManager`.
  - `ThirdPersonCamera.cs`: spring-damper follow (`springStiffness 20`, `damping 2`, explicit velocity integration).
  - `Pulpit.cs`: lifetime from JSON scaled by progression, fade-in and fade-out coroutines, enum-based movement types.
  - `PulpitSpawner`, `GameManager`, `ScoreManager`, `AudioManager`.
  - `DoofusDiaryLoader` reads `Resources/doofus_diary.json`.
- Demo: https://xerfzy.github.io/HW_2026_Test/Build/ (HTTP 200 on 2026-10-31). The README link to the old host returns 404.

### Slot Machine: Project, no detail page
- Repo: https://github.com/xerfzy/Slot_Machine. 17 commits, 2026-04-29 to 2026-05-03. Made as an internship *assignment*; no internship is claimed.
- Verified [S]:
  - `SlotMachineManager.GetWeightedRandomSymbol()` (cumulative `winWeight`), with results chosen before the spin animation.
  - `ReelController`: coroutine spin, `Mathf.Round` pixel snapping.
  - `CroupierAI`: phrase tables.
  - `Shader/EdgeDetection.shader` ("PostProcess/PixelNoir"): URP HLSL with an 8×8 Bayer ordered dither and Sobel edges sampled from `_BlitTexture`.
- Demo: https://xerfzy.github.io/Slot_Machine/Build/ (HTTP 200). The README link to the old host returns 404.

### FPS Movement Controller: Experiment
- Only a YouTube video (https://youtu.be/c5Gg8ksg7hw). **No source available**, so movement details are [U] and are not used as resume bullets beyond the video's existence.

---

## AI and Machine Learning

### TrackMania TD3: Research, detail page
- Repo: https://github.com/thenamelessone888/RL (secondary account). 11 commits dated 2026-09-22; experiment manifests are dated 2026-09-19.
- Languages: Python (PyTorch) on TMRL 0.7.1.
- Verified [S]:
  - `td3/agent.py`: twin critics (TMRL's `MLPQFunction` reused), `policy_delay = 2`, target policy smoothing (`target_noise_clip = 0.5`), Polyak `tau = 0.005`.
  - TD3+BC-style actor regularisation, `bc_reg_alpha`, with a decaying anchor weight.
  - `td3/models.py`: 256×256 MLP actor.
  - `demonstrations/`: human driving recorder and dataset inspection.
  - `curriculum/`: stage definitions, a per-track reward registry, and promotion gates (window and return threshold).
  - `td3/stuck_recovery.py`: a −0.1 reward after 5 consecutive "stuck" steps (LIDAR minimum ≤ 0.5 and speed ≤ 2).
  - The original DDPG version is archived.
- Tests [S]: 13 pytest test functions across 9 files. The README says "11 tests, all passing" [R] (written before the later additions).
- Results [S, from committed manifests and CSV]:
  - Behaviour-cloning warm start plus BC regularisation prevented the policy collapse seen in attempt 1.
  - An extended 90-round run plateaued at a bimodal return. There was a recurring failure at a fixed wall, root-caused from a 6-episode deterministic trace.
  - The stuck-recovery penalty is live-verified as a mechanism, but its training effect has not been measured.
  - The manifest itself says not to claim "the car learned to drive". The site and resumes follow that.
- Curriculum: infrastructure implemented and unit-tested. Generalisation across tracks is **not** demonstrated.

### Space Shooter DQN: Coursework
- Repo: https://github.com/xerfzy/Space_shooter_using_DQN_vc. 2 commits, Apr 2026. A course review PDF is committed alongside it.
- Verified [S]:
  - Dueling CNN with the Nature-DQN convolution stack (8/4, 4/2, 3/1) and 512-unit value and advantage streams.
  - Double DQN target (online argmax, target evaluation).
  - 50,000-transition `deque` replay buffer, gradient-norm clip 10, ε 1.0 → 0.05 (decay 0.9995), target sync every 500 steps, 10,000 warm-up steps.
  - Input is 4 stacked 84×84 grayscale frames from `pygame.surfarray`.
- Results: `checkpoints/training_progress.png` exists. No numeric evaluation is reported, so no performance claim is made.

### Legal Case Similarity (XAI v2): Experiment
- Repo: https://github.com/xerfzy/xai-v2. 1 day, Apr 2026.
- Verified [S]:
  - Modules `embeddings`, `similarity` (bi-encoder plus cross-encoder rerank), `graph` (NetworkX), `explainability` (attention extraction, leave-one-out SHAP-style scores, LIME, legal concept overlap), `evaluation`, and a Streamlit app.
  - 37 pytest functions.
- Data: **six demo cases**. The evaluation report (silhouette 0.08 and so on) is computed on those six, so no quality claim is made.
- README note [U]: "FAISS IndexFlatIP (ANN, scales to millions)". `IndexFlatIP` is exact search, not approximate.

### Breast Cancer Histopathology Classification: Coursework
- Repo: https://github.com/xerfzy/Breast_cancer_calssification-vc-. Report `.docx` committed.
- Verified [S]: TensorFlow/Keras notebooks for CNN, ResNet, ViT and Swin. The data splitter organises images by 40X, 100X, 200X and 400X magnification (consistent with the BreakHis dataset; the dataset name is not stated in code).
- README mismatch [U]: the README describes the tabular Wisconsin dataset with scikit-learn, which the notebooks do not use.
- Notebook outputs [S]: single-run test accuracies are CNN 0.916, ResNet 0.675, ViT 0.872 and Swin 0.916. These are single, unvalidated runs and are not used as headline claims.

### Image Guessing Game (Image-gen): Archive
- Repo: https://github.com/xerfzy/Image-gen. 4 commits, Jul 2025.
- Verified [S]:
  - Flask app loading a Stable Diffusion checkpoint through `diffusers` on CUDA (fp16).
  - `/generate` creates painting-style images.
  - `/random` asks an OpenAI-compatible endpoint for a prompt and renders it.
  - `/calc` scores the player's description against the hidden prompt by MiniLM cosine similarity.
- README mismatch [U]: the README describes a remote "Stable Diffusion API"; the code runs the model locally.
- Categorised under AI and ML (rather than Web) because the work is the diffusion and embedding pipeline.

---

## Robotics and Embedded Systems

### Multi-UAV Monitoring Prototype: Research, detail page
- Repo: https://github.com/xerfzy/CENTRAL-UAV-DASHBOARD-vc. 5 commits; code 2025-11-03.
- Languages: Python and JavaScript. GitHub reports TypeScript because of an unused Next.js/shadcn scaffold (`app/page.tsx` is a broken generated stub). The working application is Flask.
- Verified [S]:
  - `app.py`: Flask routes, a Flask-SocketIO server and a session login.
  - `models/uav.py`: UAV kinematics toward waypoints by bearing, altitude easing, battery drain, return-to-home below 15% battery, loiter.
  - `services/geofence_manager.py`: ray-casting point-in-polygon.
  - `services/mission_manager.py`.
  - Video feeds: recorded MP4s are read with OpenCV, ORB keypoints are drawn (python_orb_slam3 extractor with `cv2.ORB_create` fallback), and frames are streamed as JPEG data URLs over Socket.IO.
- All telemetry is simulated. No real UAV, flight controller or radio link is involved.
- Relation to the patent application (IN202641060337 A1): this prototype covers a simulated multi-UAV monitoring interface and ORB feature extraction. It does **not** implement collaborative SLAM, peer-to-peer swarm links, crowd-flow estimation, anomaly validation, collision avoidance or failover, which are described in the patent document.
- Limitations: prototype-grade auth and configuration (demo credentials, permissive CORS).

### ESP32-CAM ORB Features: Experiment
- Repo: https://github.com/xerfzy/ESP32-PYTHON-ORB-SLAM-VC. 2 commits, Nov 2025.
- Verified [S]: the ESP32 sketch is based on the standard ESP32-CAM camera web server (JPEG, SVGA/CIF frame sizes). `final2.py` (~30 lines) reads the MJPEG stream with OpenCV, runs an ORB extractor on grayscale frames and draws keypoints.
- README overstatement [U]: "visual tracking and mapping". No tracking or mapping code exists, so it is described as feature extraction only.

---

## Web and Other Software

### Knapsack Visualisation: Coursework
- Repo: https://github.com/xerfzy/Knapsack_visualisation-v-. 5 commits, Nov 2025. Demo video linked.
- Verified [S]: `src/knapsack.jsx` (React state for the DP table, step history and backtrack sequence) and `src/fractional-knapsack.tsx`. A built `dist/` is committed.

### Novr (team project): Archive
- Repo: https://github.com/xerfzy/Novr. 24 commits, May to Jul 2025: 12 by one teammate, 3 by another teammate, 9 by this author.
- Verified [S]: React front end and an Express, MySQL and JWT backend (teammate). This author added the image-generation feature on the Enso page (`enso.js`) and README updates.

---

## Security writing

### ClickFix Malware via Typosquatted NPTEL Domains: Writing (external link)
- Repo: https://github.com/xerfzy/Report-on-ClickFix-Malware-via-Typosquatted-NPTEL-Domain. April 2026.
- Content [S]: an independent threat report with sections on redirect chain, clipboard-hijack landing page, three captured PowerShell payloads (decoded), C2 infrastructure, IOCs and an ATT&CK mapping.
- The report states payloads were analysed in a VM and not executed by the researcher [R]. It also states the campaign was reported to NPTEL and CERT-In [R].

---

## Other repositories
- This portfolio's own repository (the previous site). Superseded by this rebuild.
- `thenamelessone888/XrivenixAI`: empty repository (size 0). Ignored.

## Detail pages chosen
censface-cpp, eos-oneplus-nord, ChaCha20 GPU Image Encryption, Ray Marcher (fragment), CPU Ray Tracer, XrivenixAI, Doofus Diary, TrackMania TD3, Multi-UAV Monitoring Prototype.
