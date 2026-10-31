#import "common.typ": *

#show: resume.with(
  subtitle: "Software Engineer",
  keywords: ("Software Engineer", "C++", "Linux", "Kotlin", "Python"),
)

Relevant coursework: Data Structures and Algorithms, Computer Graphics, Machine Learning, Computer Vision.

#section("Summary")
Computer science student building native software: a C++17 video tool on the FFmpeg C API, an offline Android LLM app with a JNI bridge to llama.cpp, verified Linux install tooling, GPU compute shaders and a from-scratch TD3 agent.

#section("Projects")

#project("censface-cpp", "C++17, FFmpeg, OpenCV, CMake, Linux", "Oct 2026", url: repo("xerfzy/censface-cpp"))[
- Built a Linux command-line tool that demuxes and decodes video with libavformat and libavcodec, converts frames with libswscale, runs OpenCV DNN head detection and effects, and encodes H.264 MP4 in a single pass.
- Preserved source timing by encoding in the input stream's time base with each frame's own timestamp; copied audio packets without re-encoding and applied the display-matrix rotation to pixels.
- Managed every FFmpeg object with RAII (unique_ptr with custom deleters); added atomic temp-file output, SIGINT cancellation and a batch script; verified 24 of 24 frame timestamps and byte-identical audio preserved on a test clip.
]

#project("XrivenixAI - offline Android LLM assistant", "Kotlin, Jetpack Compose, Room, JNI, C++", "Sep 2026", url: repo("xerfzy/XrivenixAI"))[
- Integrated llama.cpp through a C++ JNI bridge built with the Android NDK and CMake, with streaming generation and KV-cache reuse between turns.
- Designed a model-independent memory layer on Room/SQLite: FTS5 full-text search, embedding similarity and entity links merged into one score, plus validation that de-duplicates facts and versions them by topic.
- Wrote 30 JVM unit tests and 29 instrumented tests and benchmarks; measured about 5-6 tokens/s generation and about 1.8 s to first token with KV reuse (about 7 s without) for a 3B model on a Snapdragon 782G phone.
]

#project("eos-oneplus-nord - verified Android OS install tooling", "Bash, Linux, adb, fastboot", "Oct 2026", url: repo("xerfzy/eos-oneplus-nord"))[
- Wrote Bash scripts that resume and SHA-256-verify a 2.1 GB image download, check device identity and firmware over adb, and audit the vendor installer against pinned hashes before anything runs.
- Gated the destructive flash on fastboot product and unlock state, a single attached device and a typed serial confirmation; used the tooling to install /e/OS on a OnePlus Nord.
]

#project("ChaCha20 GPU Image Encryption", "C++17, OpenGL 4.3, GLSL, OpenSSL", "Mar - May 2026", url: repo("xerfzy/chacha2020ImageEncryption_using_compute_shader"))[
- Implemented the ChaCha20 block function in a GLSL compute shader; each invocation generates two keystream blocks and XORs them into a shader storage buffer (SSBO) holding a packed batch of images.
- Planned memory-bounded batches from image headers alone and implemented the upload, dispatch, memory barrier and mapped readback path with a Dear ImGui interface.
]

#project("TrackMania TD3 - reinforcement learning research", "Python, PyTorch, TMRL, pytest", "Sep 2026", url: repo("thenamelessone888/RL"))[
- Implemented TD3 from scratch (twin critics, delayed policy updates, target policy smoothing) for TrackMania 2020 with LIDAR observations and a behaviour-cloned warm start from human driving.
- Diagnosed a post-warm-up policy collapse and fixed it with TD3+BC regularisation; traced a training plateau to a recurring wall collision from evaluation logs; covered the agent with 13 offline pytest tests.
]

#section("Research")
#patent-entry

#section("Technical Skills")
*Languages:* C++ (C++17), C, Kotlin, Python, C\#, Bash, GLSL \
*Systems and tools:* Linux, Git, CMake, GCC, Android NDK, adb, fastboot \
*Libraries and frameworks:* FFmpeg (libavformat, libavcodec, libswscale), OpenCV, OpenGL, Jetpack Compose, Room/SQLite, llama.cpp, PyTorch, Unity \
*Practices:* Unit and instrumented testing (JUnit, pytest), RAII resource management, checksum verification
