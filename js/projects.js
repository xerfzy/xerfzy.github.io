/* =========================================================
   projects.js
   Single source of truth for project data.
   ========================================================= */

const PROJECTS = [
  {
    title: "ChaCha20 Image Encryption on the GPU",
    description:
      "GPU-accelerated image encryption using the ChaCha20 stream cipher, implemented as an OpenGL compute shader that encrypts image data directly on the GPU.",
    tech: ["C++", "OpenGL", "GLSL", "Cryptography"],
    repo: "https://github.com/Orion2726/chacha2020ImageEncryption_using_compute_shader",
    image: "",
    featured: true,
  },
  {
    title: "Ray Marcher — Fragment Shader",
    description:
      "A real-time ray marching renderer written in GLSL fragment shaders. Scenes are defined as signed distance fields and rendered entirely on the GPU, pixel by pixel.",
    tech: ["C++", "OpenGL", "GLSL"],
    repo: "https://github.com/Orion2726/Ray_marcher_using_fragment_shader_in_opengl",
    image: "",
    featured: true,
  },
  {
    title: "UAV Dashboard - Patent published",
    description:
      "A simulated centralized dashboard for visualizing UAV telemetry data and monitoring multiple drone units through a web interface",
    tech: ["Full-Stack", "WebDev", "UAV"],
    repo: "https://github.com/Orion2726/CENTRAL-UAV-DASHBOARD-vc",
    image: "",
    featured: true,
  },
  {
    title: "Ray Marcher — Compute Shader",
    description:
      "A compute-shader take on ray marching. Distance-field evaluation is moved off the fragment pipeline and into parallel GPU compute, dispatched directly to an output image.",
    tech: ["C++", "OpenGL", "GLSL Compute Shaders"],
    repo: "https://github.com/Orion2726/Ray_marcher_implemented_in_ComputeShader-Opengl--DemoVersion-",
    image: "",
    featured: false,
  },

  {
    title: "Ray Tracer",
    description:
      "A from-scratch CPU ray tracer built to work through the fundamentals of light transport, reflection, refraction, and shading models.",
    tech: ["C++"],
    repo: "https://github.com/Orion2726/Ray_tracer-learning-project-",
    image: "",
    featured: true,
  },
  {
    title: "OpenGL Experiments",
    description:
      "A running collection of OpenGL experiments and rendering techniques, written while learning the graphics pipeline from the ground up.",
    tech: ["C++", "OpenGL"],
    repo: "https://github.com/Orion2726/questionable-opengl-code",
    image: "",
    featured: false,
  },
  {
    title: "ESP32 Visual SLAM",
    description:
      "A visual SLAM pipeline that streams a live camera feed from an ESP32 into ORB-SLAM for real-time localization and mapping.",
    tech: ["Python", "C", "ESP32", "ORB-SLAM"],
    repo: "https://github.com/Orion2726/ESP32-PYTHON-ORB-SLAM-VC",
    image: "",
    featured: false,
  },
  {
    title: "Space Shooter — Deep Q-Learning",
    description:
      "A classic arcade-style space shooter paired with an agent trained via Deep Q-Learning to play the game autonomously.",
    tech: ["Python", "Reinforcement Learning"],
    repo: "https://github.com/Orion2726/Space_shooter_using_DQN_vc",
    image: "",
    featured: false,
  },
  {
    title: "DSA_H",
    description:
      "A single-header C library implementing common data structures and algorithms from first principles, with no external dependencies.",
    tech: ["C"],
    repo: "https://github.com/Orion2726/DSA_H",
    image: "",
    featured: false,
  },
];

/**
 * Build the DOM markup for a single project card.
 * @param {Object} project
 * @returns {HTMLElement}
 */
function createProjectCard(project) {
  const card = document.createElement("article");
  card.className = "project-card";

  let imageHtml = "";
  if (project.image) {
    imageHtml = `<img src="${project.image}" alt="${project.title} screenshot" loading="lazy">`;
  }

  card.innerHTML = `
    ${imageHtml}
    <h3>${project.title}</h3>
    <p class="project-desc">${project.description}</p>
    <p class="project-tech">${project.tech.join(" · ")}</p>
    <a class="btn" href="${project.repo}" target="_blank" rel="noopener noreferrer">View on GitHub</a>
  `;

  return card;
}

/**
 * Render a list of projects into a container element by id.
 * @param {string} containerId
 * @param {Object[]} projects
 */
function renderProjects(containerId, projects) {
  const container = document.getElementById(containerId);
  if (!container) return;

  projects.forEach((project) => {
    container.appendChild(createProjectCard(project));
  });
}
