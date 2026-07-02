/* =========================================================
   main.js
   Shared page behavior.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  // Home page: render the first 3 featured projects, if present.
  if (document.getElementById("featured-projects")) {
    const featured = PROJECTS.filter((p) => p.featured).slice(0, 3);
    renderProjects("featured-projects", featured);
  }

  // Projects page: render the full list, in defined order.
  if (document.getElementById("all-projects")) {
    renderProjects("all-projects", PROJECTS);
  }
});
