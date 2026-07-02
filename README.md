# Portfolio

Minimal personal site. Plain HTML, CSS, and vanilla JavaScript — no build step,
no dependencies. Open `index.html` directly, or host the folder as-is on
GitHub Pages.

## Structure

```
index.html      Home
projects.html   Projects
about.html      About
resume.html     Resume
blog.html       Blog (empty — "No posts yet.")

css/style.css        Base styles, colors, typography, layout
css/responsive.css   Tablet / phone breakpoints

js/projects.js  Project data + card rendering (single source of truth)
js/main.js      Wires project data into the home and projects pages

assets/resume.pdf     Placeholder — replace with your real resume PDF
assets/images/         Drop project screenshots here if you want them
```

## Adding a project

Open `js/projects.js` and duplicate one object in the `PROJECTS` array:

```js
{
  title: "Project Name",
  description: "One or two sentences on what it does and why.",
  tech: ["C++", "OpenGL"],
  repo: "https://github.com/you/project",
  image: "",              // e.g. "assets/images/project.png", or leave empty
  featured: false          // true = eligible to show on the home page
}
```

Order in the array is display order — GPU/graphics work is listed first on
purpose. The first three entries with `featured: true` appear on the home
page automatically.

## Customizing

- **Colors / fonts**: CSS custom properties at the top of `css/style.css`.
- **Links** (GitHub, LinkedIn, email): edit the `.link-row` list in
  `index.html`.
- **Resume**: replace `assets/resume.pdf` with your own file, same filename.
- **About text**: edit directly in `about.html`.
- **Blog posts**: `blog.html` has a `#posts` container ready for cards once
  you have content — see the comment inside for the pattern to follow.
