const yearNode = document.getElementById("year");
if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

const revealNodes = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
  );

  revealNodes.forEach((node) => revealObserver.observe(node));
} else {
  revealNodes.forEach((node) => node.classList.add("is-visible"));
}

const navLinks = Array.from(document.querySelectorAll(".top-nav a"));
const sectionById = navLinks
  .map((link) => {
    const id = link.getAttribute("href")?.replace("#", "");
    return id ? document.getElementById(id) : null;
  })
  .filter(Boolean);

if (navLinks.length > 0 && sectionById.length > 0 && "IntersectionObserver" in window) {
  const activeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const id = entry.target.getAttribute("id");
        navLinks.forEach((link) => {
          const linkId = link.getAttribute("href")?.replace("#", "");
          link.classList.toggle("active", linkId === id);
        });
      });
    },
    {
      threshold: 0.35,
      rootMargin: "-20% 0px -55% 0px",
    },
  );

  sectionById.forEach((section) => activeObserver.observe(section));
}
