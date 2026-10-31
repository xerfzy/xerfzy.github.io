# Resume keyword and evidence matrix

Built on 2026-10-31. There is no universal ATS score, so this document does not compute one. For each resume it records:

- what representative postings ask for;
- which of those the projects actually demonstrate, and where the evidence is;
- what is missing;
- which keywords were included or deliberately left out.

Evidence references point to `docs/PROJECT_AUDIT.md` and to files in the project repositories.

## Postings sampled

Accessed 2026-10-31. Several had already closed. Where the full page could not be fetched, the requirement text comes from the search-result excerpt of that page.

| Family | Source | Notes |
|---|---|---|
| New-grad SWE | Cohesity, Software Engineer (New Grad 2026): https://jobs.accel.com/companies/cohesity/jobs/89698885-software-engineer-new-grad-2026 | Fetched. "Strong programming skills in any of C, C++, Go, Python, Java"; "Proficient in Data Structures, Algorithms, and Systems Design"; BE/B.Tech CS. Closed. |
| New-grad SWE | Graduate listings excerpted via search (itjobboard, wearedevelopers, Virtual Vocations) | Data structures and algorithms, version control, one main language, fundamentals. |
| C++ / Linux | Siemens early-career C++/Linux (Pune), https://jobs.siemens.com/en_US/externaljobs/JobDetail/494912 (excerpt) | "C++ fundamentals, a working understanding of Linux concepts, and debugging ability". Related postings add modern C++ (11–20), STL, smart pointers, CMake, Git, gdb/valgrind, IPC and threads. |
| C++ | Ashdown Group, Software Engineer (C++), via itjobboard listing page (fetched 2026-10-31) | C++, large codebases, troubleshooting and debugging; networking protocols as a plus. |
| Graphics / GPU | LunarG, Graphics Software Engineer (2026-01-20), https://www.lunarg.com/wp-content/uploads/2026/01/Graphics-Software-Engineer-Req-2026-01-20-Google-Docs.pdf | Fetched PDF. C++20; familiarity with Vulkan, D3D12, WebGPU, OpenXR, Metal; GPU architectures; Bash, Python, CMake, Git. Desirable: Linux, shader languages (SPIR-V, HLSL, GLSL, Slang), compilers (glslang, SPIRV-tools, Slang), Mesa, ray tracing. 3+ years or graphics-focused master's study. |
| Graphics / GPU | Qualcomm GPU Software Engineer (entry-level tag), https://jointaro.com/jobs/qualcomm/gpu-software-engineer (excerpt) | Drivers for OpenGL ES, Vulkan, DX11/12; C/C++; GPU ML acceleration. |
| Graphics / GPU | Search excerpts (ziprecruiter, itjobswatch, a junior 3D graphics posting) | One graphics API (OpenGL/Vulkan/DX), GLSL/HLSL, C++, computer graphics background. |
| Android | Calix Associate Software Engineer (Android), Bangalore, https://offcampusjobs4u.com/calix-recruitment-2026-associate-software-engineer-android-bangalore/ (excerpt) | Kotlin, Jetpack Compose; 1–2 years. |
| Android | Junior Android postings via search (hh1.az, greenhouse/coherentsolutions, motorist.my) | Kotlin, Compose, MVVM, Room/SQLite, ViewModel, coroutines/Flow, Gradle, REST, testing, Hilt. |
| Unity | Uni Dreams Junior Programmer (2026), https://workwithindies.com/careers/uni-dreams-junior-programmer (excerpt; page now 404) | Core gameplay systems in C#: player movement, combat, enemy behaviour. |
| Unity | India fresher Unity listings via search (theindiajobs, teamlease, recooty) | C#, OOP, Unity physics and particles, game loop, UI, animation, Git/Perforce, mobile optimisation, a project portfolio. |
| Junior ML | Junior ML Engineer postings via search (itjobboard, weekday.works/cloud202, a Hertz junior autonomous-systems role) | Python, PyTorch, NumPy/Pandas, ML fundamentals, computer vision; RL as a plus; CUDA, detection and tracking desirable. |
| Junior ML | Indian fresher CV/ML listings (Mad Street Den early-career, Cognizant/Persistent CV fresher) via search | PyTorch, Python, Linux, Git; portfolio emphasised. |

Recurring across nearly all families: a CS degree, C++ or Python, version control, debugging, and a portfolio of real projects. Experience requirements (1–3+ years) appear even on "junior" postings. They cannot be met by projects and are not addressed by adding keywords.

---

## A. General Software Engineering: `Sre_Cibi_Varsshan_Software_Engineer.pdf`

**Target:** new-grad or junior software engineer.

**Common requirements:** one strong language, data structures and algorithms, version control, testing, debugging, Linux, systems design basics.

| Keyword | Evidence |
|---|---|
| C++17, CMake, Linux | censface-cpp (`CMakeLists.txt`, `src/*.cpp`) |
| RAII, resource management | censface-cpp `src/ffmpeg_raii.h` |
| Kotlin, Android, JNI | XrivenixAI (`app/src/main/cpp/pocketai.cpp`, Kotlin packages) |
| SQLite, full-text search | XrivenixAI Room schema with FTS5 |
| Testing | XrivenixAI: 30 JVM and 29 instrumented test methods. TD3: 13 pytest functions. |
| Bash, checksums, safety checks | eos-oneplus-nord `scripts/*.sh` |
| Python, PyTorch | TrackMania TD3 `td3/` |
| Git | All repositories |
| Debugging and root cause | TD3 known-issues trace analysis |

**Missing or unverified:** professional experience, CI pipelines, code review in a team, cloud, distributed systems, gdb/valgrind use (not evidenced in any repo).

**Included:** C++17, Kotlin, Python, Bash, Linux, CMake, Git, FFmpeg, OpenCV, SQLite, JNI, PyTorch, unit testing, pytest, JUnit.

**Excluded deliberately:** Java (no Java code verified), Go, cloud (AWS/GCP), Docker, CI/CD, microservices, gdb/valgrind, "systems design" as a claimed skill.

## B. C++ / Linux / Systems / Graphics / GPU: `Sre_Cibi_Varsshan_CPP_Systems_Graphics.pdf`

**Target:** C++ engineer, junior systems or Linux developer, graphics programmer, GPU software engineer, native application developer.

**Common requirements:** modern C++, STL, Linux, CMake, Git, one graphics API (OpenGL/Vulkan), GLSL/HLSL, GPU architecture familiarity, debugging and profiling.

| Keyword | Evidence |
|---|---|
| C++17, STL, RAII | censface-cpp, ChaCha20 (`main.cpp`) |
| FFmpeg (libavformat, libavcodec, libswscale), video timestamps | censface-cpp `src/video_pipeline.cpp` |
| OpenCV (dnn, imgproc) | censface-cpp `src/face_detector.cpp`, `filters.cpp` |
| OpenGL 4.3, GLSL compute shaders, SSBO, memory barriers | ChaCha20 `shaders/chacha_compute.ps`, `main.cpp` |
| GLSL fragment shaders, SDF ray marching, FBO, post-processing | Ray marcher `shaders/FullQuad1.ffs`, `Framebuffer.ffs`, `Source.cpp` |
| imageStore / image2D compute output | Compute ray marcher `shaders/ComputeShader.ps` |
| Ray tracing, materials, depth of field | CPU ray tracer `camera.h`, `material.h` |
| Vulkan (learning), Vulkan-Hpp, Slang, SPIR-V | learning-vulkan `main.cpp`, `shader.slang` |
| JNI, NDK, CMake cross-build | XrivenixAI `app/src/main/cpp` |
| Linux, Bash, adb/fastboot | eos-oneplus-nord |
| Buffer management, batching by memory budget | ChaCha20 `make_batches`, `img_loader.h` |

**Missing or unverified:** CUDA, Vulkan beyond setup, DirectX, multithreading, SIMD, profilers (Nsight, RenderDoc, perf), kernel or driver work, IPC, networking.

**Included:** C++17, C, GLSL, HLSL (Slot Machine shader), Linux, CMake, GCC, Git, OpenGL, compute shaders, SSBO, FBO, ray marching, ray tracing, FFmpeg, OpenCV, JNI, buffer management, Vulkan, labelled as learning.

**Excluded deliberately:** CUDA, OpenCL, DirectX, multithreading, SIMD, performance profiling, kernel development, "production Vulkan".

- No performance figure is used. ChaCha20's README throughput has no timing code behind it.
- No "secure encryption" claim is made, because of the open uniform-type issue (see the audit).

## C. Android / Mobile: `Sre_Cibi_Varsshan_Android_Developer.pdf`

**Target:** junior Android developer, associate software engineer (Android).

**Common requirements:** Kotlin, Jetpack Compose, MVVM/ViewModel, Room/SQLite, coroutines/Flow, Gradle, REST/networking, testing, Hilt.

| Keyword | Evidence |
|---|---|
| Kotlin, Jetpack Compose (Material 3) | XrivenixAI `ui/*.kt`, `build.gradle.kts` |
| ViewModel, StateFlow, coroutines | XrivenixAI `SetupViewModel.kt`; 83 `suspend fun`, `Dispatchers.IO.limitedParallelism(1)` |
| Room, migrations, FTS5 | XrivenixAI `data/AppDatabase.kt`, `schemas/` |
| WorkManager, foreground download, HTTP Range resume, SHA-256 | XrivenixAI `model/ModelDownloadManager.kt` |
| JNI, NDK, CMake, llama.cpp | XrivenixAI `cpp/pocketai.cpp` |
| JUnit, instrumented tests, benchmarks | XrivenixAI `app/src/test`, `app/src/androidTest` |
| Offline-first, on-device inference, privacy | XrivenixAI (no backend). AgriEdge (offline TFLite, BLE relay). |
| Flutter, Dart, Bluetooth LE | AgriEdge (team; this author's commits only) |
| adb, fastboot, Android platform | eos-oneplus-nord |

**Missing or unverified:** Hilt/DI, Retrofit, MVVM across a large app, Play Store publication, CI, Java.

**Included:** Kotlin, Jetpack Compose, Material 3, ViewModel, StateFlow, Coroutines, Room, SQLite, FTS5, WorkManager, JNI, Android NDK, CMake, JUnit, Flutter, Dart, Bluetooth LE, adb, fastboot.

**Excluded deliberately:** Hilt, Retrofit, Java, Play Store, Firebase, RxJava. AgriEdge's ML models are excluded too, because a teammate trained them.

## D. Game Programming / Unity: `Sre_Cibi_Varsshan_Game_Programmer.pdf`

**Target:** junior Unity or gameplay programmer.

**Common requirements:** C#, Unity, gameplay systems (movement, combat, enemies), physics, UI, animation, Git, a portfolio, game jams.

| Keyword | Evidence |
|---|---|
| Unity, C#, Rigidbody movement, camera-relative input | Doofus Diary `PlayerMovement.cs` |
| Spring-damper camera | `ThirdPersonCamera.cs` |
| Animator | `PlayerMovement.cs` (`SetFloat`, `SetTrigger`) |
| Game state, scoring, progression, audio manager | `GameManager.cs`, `ScoreManager.cs`, `AudioManager.cs` |
| Data-driven config (JSON) | `DoofusDiaryLoader.cs`, `doofus_diary.json` |
| Coroutines | `Pulpit.cs` (fades), `SlotMachineManager.cs` (staggered reels) |
| Weighted RNG, ScriptableObjects | Slot Machine `SlotMachineManager.cs`, `SymbolData.cs` |
| URP, HLSL, ShaderLab, post-processing | Slot Machine `Shader/EdgeDetection.shader` |
| WebGL builds | Live builds on xerfzy.github.io |
| Real-time rendering, GLSL | Ray marcher |
| Game AI (DQN, TD3) | Space Shooter DQN, TrackMania TD3 |

**Missing or unverified:** combat and enemy AI inside Unity, NavMesh, multiplayer, mobile optimisation, console, Unreal (mentioned on the old site, no evidence), game jams, shipped commercial titles.

**Included:** Unity 6, C#, URP, HLSL, ShaderLab, Rigidbody physics, Animator, coroutines, ScriptableObjects, JSON configuration, WebGL, GLSL, OpenGL, Pygame, PyTorch.

**Excluded deliberately:** Unreal Engine, multiplayer/Netcode, NavMesh, mobile optimisation. The FPS controller is excluded because only a video exists and its features cannot be verified.

## E. AI / ML / Reinforcement Learning: `Sre_Cibi_Varsshan_ML_Engineer.pdf`

**Target:** junior ML engineer, RL or research engineer intern, computer-vision fresher roles.

**Common requirements:** Python, PyTorch, NumPy/Pandas, ML fundamentals, CV, RL as a plus, Git, Linux, a portfolio.

| Keyword | Evidence |
|---|---|
| PyTorch, TD3, actor-critic, twin critics, target smoothing | TrackMania TD3 `td3/agent.py`, `models.py` |
| Behaviour cloning, TD3+BC regularisation | `demonstrations/`, `td3/config.py` |
| Experiment tracking, manifests, metrics CSV | `experiments/*/manifest.md`, `results/` |
| pytest | `tests/` (13 functions) |
| DQN, Double DQN, dueling CNN, replay buffer, Huber loss | Space Shooter DQN `agent.py`, `model.py` |
| CNN, ResNet, ViT, Swin (TensorFlow/Keras) | Breast cancer notebooks |
| Sentence-Transformers, FAISS, cross-encoder, SHAP, LIME | xai-v2 `src/` |
| On-device LLM inference, embeddings, hybrid retrieval | XrivenixAI |
| OpenCV, ORB features | Multi-UAV prototype, ESP32 experiment |

**Missing or unverified:** production deployment, MLOps, large-scale training, distributed training, CUDA kernels, model serving, validated benchmark results.

**Included:** Python, PyTorch, TensorFlow/Keras, NumPy, reinforcement learning, TD3, DQN, behaviour cloning, CNN, Vision Transformer, Sentence-Transformers, FAISS, SHAP, LIME, llama.cpp, OpenCV, pytest, Linux, Git.

**Excluded deliberately:** MLOps, Kubernetes, model serving, LLM fine-tuning, CUDA.

- The TD3 results are reported as a plateau, not as a trained driving agent.
- The breast-cancer accuracies are labelled single-run coursework results.
- The xai-v2 metrics are not used at all, since they were computed on six demo cases.
