#import "common.typ": *

#show: resume.with(
  subtitle: "C++ / Systems / Graphics",
  keywords: ("C++", "Linux", "OpenGL", "GLSL", "GPU", "FFmpeg", "Graphics Programmer"),
)

Relevant coursework: Computer Graphics, Data Structures and Algorithms, Computer Vision.

#section("Summary")
C++ developer focused on native and GPU code: FFmpeg C API video processing, OpenGL fragment and compute shaders, ray marching and ray tracing, and JNI native code on Android. Learning Vulkan.

#section("Projects")

#project("censface-cpp - video processing tool", "C++17, FFmpeg, OpenCV, CMake, Linux", "Oct 2026", url: repo("xerfzy/censface-cpp"))[
- Implemented a single-pass pipeline on the FFmpeg C API: libavformat demux, libavcodec send/receive decode and encode with end-of-stream draining, libswscale YUV-to-BGR conversion with explicit colour matrix and range, and interleaved MP4 muxing.
- Kept variable-frame-rate timing by encoding in the input stream's time base with per-frame timestamps and rescaling packets to the muxer's time base; stream-copied audio after checking MP4 codec support.
- Wrapped every FFmpeg object in RAII unique_ptr deleters with atomic temp-file output and SIGINT handling; verified identical frame timestamps, byte-identical audio and flat peak memory (486 vs 490 MB for 6 s vs 29 s of 720p HEVC).
]

#project("ChaCha20 GPU Image Encryption", "C++17, OpenGL 4.3, GLSL compute, SSBO", "Mar - May 2026", url: repo("xerfzy/chacha2020ImageEncryption_using_compute_shader"))[
- Implemented the ChaCha20 quarter-round and 20-round block function in a GLSL compute shader (local size 256); each invocation produces two 64-byte keystream blocks from its counter and XORs them into the SSBO in place.
- Packed decoded images into one 128-byte-aligned buffer per batch with per-image offsets, planning batches from stb_image header scans against a VRAM budget, then ran upload, dispatch, shader-storage barrier and mapped readback.
]

#project("SDF Ray Marcher", "C++, OpenGL, GLSL, GLFW, GLM", "Jan - Apr 2026", url: repo("xerfzy/Ray_marcher_using_fragment_shader_in_opengl"))[
- Built a real-time sphere-tracing renderer in a fragment shader over signed distance functions (sphere, box, plane) with domain repetition, union and central-difference normals, driven by a free-fly camera passed as uniforms.
- Added a two-pass pipeline that renders into a framebuffer object and applies a Sobel edge-detection pass; also wrote a compute-shader version that writes an RGBA32F image through imageStore.
]

#project("CPU Ray Tracer", "C++14, CMake", "Nov - Dec 2025", url: repo("xerfzy/Ray_tracer-learning-project-"))[
- Implemented a ray tracer following Ray Tracing in One Weekend: Lambertian, fuzzy metal and dielectric materials (Snell refraction, Schlick reflectance), jittered multi-sample anti-aliasing, recursive bounces and defocus blur from a thin lens camera model.
]

#project("XrivenixAI - native inference on Android", "C++, JNI, Android NDK, CMake, Kotlin", "Sep 2026", url: repo("xerfzy/XrivenixAI"))[
- Wrote the JNI bridge to llama.cpp (built from source with the NDK for arm64-v8a): model loading, batched decoding, streaming generation, grammar-constrained completion and KV-cache prefix reuse across turns.
]

#project("eos-oneplus-nord", "Bash, Linux, adb, fastboot", "Oct 2026", url: repo("xerfzy/eos-oneplus-nord"))[
- Wrote Linux tooling that SHA-256-verifies resumable downloads, checks device state over adb and fastboot, and audits a vendor installer against pinned hashes before allowing a guarded flash.
]

#section("Research")
#patent-entry

#section("Technical Skills")
*Languages:* C++ (C++17), C, GLSL, HLSL, Bash, Python, Kotlin \
*Graphics and GPU:* OpenGL 4.3, fragment and compute shaders, SSBO, framebuffer objects, image load/store, ray marching, ray tracing; Vulkan (learning: Vulkan-Hpp, swapchain, Slang/SPIR-V) \
*Libraries:* FFmpeg (libavformat, libavcodec, libswscale), OpenCV, GLFW, GLM, Dear ImGui, OpenSSL, stb_image, llama.cpp \
*Tools:* Linux, GCC, CMake, pkg-config, Git, Android NDK, Visual Studio
