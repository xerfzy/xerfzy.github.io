/*
  projects.js
  Project data for the portfolio.
*/

const PROJECTS = [

  /* =========================================================
     RENDERING & GPU COMPUTE
     ========================================================= */

  {
    title: "ChaCha20 Image Encryption",
    category: "rendering",
    description:
      "ChaCha20 image encryption implemented as an OpenGL compute shader, processing image data directly on the GPU.",
    tech: ["C++", "OpenGL", "GLSL", "GPU Compute"],
    repo:
      "https://github.com/Orion2726/chacha2020ImageEncryption_using_compute_shader",
    featured: true
  },

  {
    title: "Ray Marcher",
    category: "rendering",
    description:
      "Real-time signed-distance-field ray marching implemented in GLSL and executed entirely on the GPU.",
    tech: ["C++", "OpenGL", "GLSL"],
    repo:
      "https://github.com/Orion2726/Ray_marcher_using_fragment_shader_in_opengl",
    featured: true
  },

  {
    title: "Ray Tracer",
    category: "rendering",
    description:
      "From-scratch CPU ray tracer exploring rays, intersections, reflection, refraction and shading.",
    tech: ["C++", "Ray Tracing"],
    repo:
      "https://github.com/Orion2726/Ray_tracer-learning-project-",
    featured: true
  },

  {
    title: "Ray Marcher — Compute Shader",
    category: "rendering",
    description:
      "Ray marching moved from the fragment pipeline into a dedicated GPU compute pass.",
    tech: ["C++", "OpenGL", "GLSL Compute"],
    repo:
      "https://github.com/Orion2726/Ray_marcher_implemented_in_ComputeShader-Opengl--DemoVersion-",
    featured: false
  },

  {
    title: "OpenGL Experiments",
    category: "rendering",
    description:
      "A collection of small rendering experiments built while learning the graphics pipeline.",
    tech: ["C++", "OpenGL"],
    repo:
      "https://github.com/Orion2726/questionable-opengl-code",
    featured: false
  },


  /* =========================================================
     GAMES
     ========================================================= */

  {
    title: "Doofus Diary",
    category: "games",
    description:
      "A Unity 3D platform-survival game built around modular movement, dynamic platforms, progression and physics-based camera movement.",
    tech: ["Unity", "C#", "Game Systems", "Physics"],
    repo:
      "https://github.com/Orion2726/HW_2026_Test",
    featured: true
  },

  {
    title: "Slot Machine",
    category: "games",
    description:
      "Unity slot machine with weighted RNG, modular reel systems and a custom URP post-process shader.",
    tech: ["Unity", "C#", "URP", "HLSL"],
    repo:
      "https://github.com/Orion2726/Slot_Machine",
    featured: true
  },

  {
    title: "FPS Controller & Rendering Sandbox",
    category: "games",
    description:
      "Physics-based first-person movement with acceleration, friction, air control, coyote time, jump buffering and momentum-based traversal.",
    tech: ["Unity", "C#", "Physics", "Shaders"],
    repo:
      "https://youtu.be/c5Gg8ksg7hw?si=0hDUA-PtDtQsHDjy",
    featured: true
  },


  /* =========================================================
     AI FOR GAMES
     ========================================================= */

  {
    title: "Space Shooter — Deep Q-Learning",
    category: "ai-games",
    description:
      "A space shooter paired with a Deep Q-Learning agent trained to play the game autonomously.",
    tech: ["Python", "Reinforcement Learning", "Game AI"],
    repo:
      "https://github.com/Orion2726/Space_shooter_using_DQN_vc",
    featured: false
  },


  /* =========================================================
     OTHER
     ========================================================= */

  {
    title: "Central UAV Dashboard",
    category: "other",
    description:
      "A centralized interface for monitoring simulated UAV telemetry and multiple drone units.",
    tech: ["TypeScript", "Web", "UAV"],
    repo:
      "https://github.com/Orion2726/CENTRAL-UAV-DASHBOARD-vc",
    featured: false
  }

];


function createProjectCard(project) {

  const card = document.createElement("article");

  card.className = "project-card reveal";

  card.innerHTML = `
    <div class="project-card-content">

      <h3>${project.title}</h3>

      <p class="project-desc">
        ${project.description}
      </p>

      <p class="project-tech">
        ${project.tech.join(" · ")}
      </p>

      <a
        class="project-link"
        href="${project.repo}"
        target="_blank"
        rel="noopener noreferrer"
      >
        View project
      </a>

    </div>
  `;

  return card;
}


function renderProjects(containerId, projects) {

  const container =
    document.getElementById(containerId);

  if (!container) return;

  container.innerHTML = "";

  projects.forEach(project => {

    container.appendChild(
      createProjectCard(project)
    );

  });
}
