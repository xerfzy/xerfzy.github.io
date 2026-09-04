/*
  reveal.js
  Generic scroll-reveal: any element with class="reveal" fades
  and rises into place the first time it enters the viewport.
  Staggering is handled purely in CSS via :nth-child.

  Runs on DOMContentLoaded, registered after any script that
  injects content (e.g. main.js rendering project cards), so it
  always sees the final set of .reveal elements on the page.
*/

document.addEventListener("DOMContentLoaded", () => {

  const items = document.querySelectorAll(".reveal");

  if (!items.length) return;

  const reduceMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion || !("IntersectionObserver" in window)) {

    items.forEach(el => el.classList.add("is-visible"));

    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {

      entries.forEach(entry => {

        if (entry.isIntersecting) {

          entry.target.classList.add("is-visible");

          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  items.forEach(el => observer.observe(el));

});
