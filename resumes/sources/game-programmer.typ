#import "common.typ": *

#show: resume.with(
  subtitle: "Game Programmer",
  keywords: ("Unity", "C#", "Gameplay Programmer", "HLSL", "OpenGL", "Game AI"),
  secondary-github: true,
)

Relevant coursework: Computer Graphics, Data Structures and Algorithms, Machine Learning.

#section("Summary")
Gameplay and graphics programmer: Unity and C\# gameplay systems with playable WebGL builds, a URP post-processing shader in HLSL, real-time rendering in OpenGL and GLSL, and reinforcement-learning agents that play games.

#section("Projects")

#project("Doofus Diary - 3D platform-survival game", "Unity, C#, Rigidbody physics, WebGL", "Aug 2026", url: [Play: #link("https://xerfzy.github.io/HW_2026_Test/Build/", "xerfzy.github.io/HW_2026_Test/Build") | Source: #repo("xerfzy/HW_2026_Test")])[
- Built a gameplay prototype for the Hitwicket game-developer challenge: timed platforms that spawn ahead of the player, fade in and out with coroutines, and shorten their lifetime as the score grows.
- Implemented Rigidbody movement with camera-relative input, Animator-driven states and score-gated single and double jumps; wrote a spring-damper follow camera (explicit stiffness and damping integration) for smooth, momentum-based tracking.
- Structured the game into focused systems (GameManager, ScoreManager, AudioManager, PulpitSpawner) with Normal and Endless modes, world-space countdown UI, and gameplay values loaded from a JSON config.
]

#project("Slot Machine", "Unity 6, C#, URP, HLSL, ShaderLab, WebGL", "Apr - May 2026", url: [Play: #link("https://xerfzy.github.io/Slot_Machine/Build/", "xerfzy.github.io/Slot_Machine/Build") | Source: #repo("xerfzy/Slot_Machine")])[
- Built a three-reel slot machine as an assignment: outcomes chosen up front by weighted random selection over ScriptableObject symbol data, then revealed by coroutine-driven reels with staggered start and stop and pixel-snapped alignment.
- Wrote a URP full-screen post-processing shader in HLSL combining palette quantisation, 8x8 Bayer ordered dithering and Sobel edge detection; added betting UI, audio and a scripted croupier commentary system.
]

#project("SDF Ray Marcher", "C++, OpenGL, GLSL", "Jan - Apr 2026", url: repo("xerfzy/Ray_marcher_using_fragment_shader_in_opengl"))[
- Built a real-time ray marcher in a GLSL fragment shader (signed distance functions, domain repetition, central-difference normals) with an FPS-style free-fly camera and a framebuffer-object Sobel post-processing pass.
]

#project("Space Shooter DQN - game AI (coursework)", "Python, PyTorch, Pygame", "Apr 2026", url: repo("xerfzy/Space_shooter_using_DQN_vc"))[
- Built a Pygame shooter with waves of enemies on sine, straight and zigzag patterns, and trained a Dueling Double DQN that plays from four stacked 84x84 grayscale frames using a 50,000-transition replay buffer and Huber loss.
]

#project("TrackMania TD3 - driving agent research", "Python, PyTorch, TMRL", "Sep 2026", url: repo("thenamelessone888/RL"))[
- Implemented TD3 from scratch for TrackMania 2020 with LIDAR observations and a warm start cloned from recorded human driving; diagnosed a recurring wall collision from evaluation traces and added a stuck-recovery reward penalty.
]

#section("Research")
#patent-entry

#section("Technical Skills")
*Game development:* Unity 6, C\#, URP, ShaderLab, HLSL, Rigidbody physics, Animator, coroutines, ScriptableObjects, Unity UI, WebGL builds \
*Graphics:* OpenGL, GLSL fragment and compute shaders, framebuffer objects, ray marching, ray tracing \
*Game AI:* Deep Q-Networks, TD3, behaviour cloning, PyTorch, Pygame \
*Languages and tools:* C\#, C++, Python, Git, Linux
