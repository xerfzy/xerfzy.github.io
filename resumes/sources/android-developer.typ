#import "common.typ": *

#show: resume.with(
  subtitle: "Android Developer",
  keywords: ("Android", "Kotlin", "Jetpack Compose", "Room", "JNI", "Flutter"),
)

Relevant coursework: Data Structures and Algorithms, Machine Learning, Computer Vision.

#section("Summary")
Android developer building offline-first apps: a Kotlin and Jetpack Compose LLM assistant with on-device inference through JNI and a Room/SQLite memory layer, contributions to a Flutter team app with a Bluetooth LE relay, and Linux tooling for Android OS installation.

#section("Projects")

#project("XrivenixAI - offline LLM assistant for Android", "Kotlin, Jetpack Compose, Room, JNI", "Sep 2026", url: repo("xerfzy/XrivenixAI"))[
- Built an Android app (minSdk 24, arm64-v8a) that runs GGUF language models on the device CPU through llama.cpp, with no account, backend or cloud inference; the network is used only for explicit model downloads.
- Wrote the C++ JNI bridge (NDK and CMake) for streaming generation, grammar-constrained extraction, embeddings and KV-cache reuse, and serialised all native calls on a single-thread coroutine dispatcher so only one model is ever loaded.
- Designed the persistence layer in Room with schema migrations 1 to 4 and FTS5 full-text tables; retrieval merges embedding similarity, full-text and entity matches, and validation code de-duplicates and versions extracted facts by topic.
- Implemented resumable model downloads with WorkManager and a foreground notification (HTTP Range requests, SHA-256 check, atomic rename) and device-aware model suitability from RAM, storage and CPU features.
- Built Compose (Material 3) screens with ViewModel and StateFlow: streaming chat with stop, Markdown and LaTeX rendering, model manager, memory browser with search and editing, settings.
- Wrote 30 JVM unit tests (JUnit 4) and 29 instrumented tests and benchmarks; measured about 5-6 tokens/s generation and about 1.8 s to first token with KV reuse for a 3B model on a Snapdragon 782G phone.
]

#project("AgriEdge - offline farming assistant (3-person team)", "Flutter, Dart, Bluetooth LE, Node.js", "Oct 2026", url: repo("xerfzy/AgriEdge"))[
- Fixed the Android build and made the team's Bluetooth LE alert mesh work end to end on Android phones: wrote the BLE framing layer, handled advertising-set limits and acknowledged packets only after storing them, with P2P regression tests.
- Added live Agmarknet market prices through the data.gov.in API, photo sharing over BLE, a farm-supplies buy and sell flow, and a UI redesign.
- Built the password-protected Express control panel and deployed the server to Render so connected phones relay official advisories to offline ones.
]

#project("eos-oneplus-nord - Android OS installation tooling", "Bash, Linux, adb, fastboot", "Oct 2026", url: repo("xerfzy/eos-oneplus-nord"))[
- Wrote scripts that check device identity, Android version, build signing, battery, OEM-unlock and account state over adb, verify the /e/OS image and installer by SHA-256, and gate flashing on fastboot product and unlock state.
- Used the tooling to install /e/OS (Android 16) on a OnePlus Nord and documented Magisk rooting.
]

#section("Research")
#patent-entry

#section("Technical Skills")
*Android:* Kotlin, Jetpack Compose (Material 3), ViewModel, StateFlow, Coroutines, Room (migrations, FTS5), WorkManager, foreground services, Gradle (Kotlin DSL) \
*Native:* C++, JNI, Android NDK, CMake, llama.cpp \
*Cross-platform:* Flutter, Dart, Riverpod, Drift/SQLite, Bluetooth LE \
*Testing and tools:* JUnit 4, instrumented tests, Git, adb, fastboot, Linux \
*Other languages:* Python, C\#, Bash
