/*
  main.js
  Shared portfolio behaviour.
*/

document.addEventListener("DOMContentLoaded", () => {

  /* Featured projects */

  const featuredContainer =
    document.getElementById("featured-projects");

  if (featuredContainer) {

    const featured =
      PROJECTS
        .filter(project => project.featured)
        .slice(0, 6);

    renderProjects(
      "featured-projects",
      featured
    );
  }


  /* Project categories */

  renderProjects(
    "rendering-projects",
    PROJECTS.filter(
      project => project.category === "rendering"
    )
  );


  renderProjects(
    "game-projects",
    PROJECTS.filter(
      project => project.category === "games"
    )
  );


  renderProjects(
    "ai-game-projects",
    PROJECTS.filter(
      project => project.category === "ai-games"
    )
  );


  renderProjects(
    "other-projects",
    PROJECTS.filter(
      project => project.category === "other"
    )
  );


  /* Footer year */

  const year =
    document.getElementById("year");

  if (year) {
    year.textContent =
      new Date().getFullYear();
  }

});
