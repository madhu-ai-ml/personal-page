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

const reviewCarousels = Array.from(document.querySelectorAll("[data-review-carousel]"));
const hasMatchMedia = typeof window.matchMedia === "function";
const reducedMotionQuery = hasMatchMedia
  ? window.matchMedia("(prefers-reduced-motion: reduce)")
  : { matches: false };
const hoverPauseQuery = hasMatchMedia
  ? window.matchMedia("(hover: hover) and (pointer: fine)")
  : { matches: false };
reviewCarousels.forEach((carousel) => {
  const viewport = carousel.querySelector("[data-review-viewport]");
  const track = carousel.querySelector("[data-review-track]");
  const slides = track ? Array.from(track.querySelectorAll("[data-review-slide]")) : [];

  if (!viewport || !track || slides.length < 2) {
    return;
  }

  slides.forEach((slide) => {
    const clone = slide.cloneNode(true);
    clone.setAttribute("data-review-clone", "true");
    clone.setAttribute("aria-hidden", "true");
    track.appendChild(clone);
  });

  const baseSpeed = Math.max(14, Number.parseFloat(carousel.dataset.scrollSpeed || "36"));
  let cycleWidth = 0;
  let offset = 0;
  let lastTimestamp = 0;
  let hoverOrFocusPause = false;
  let visibilityPause = document.hidden;
  let isDragging = false;
  let activePointerId = null;
  let dragStartX = 0;
  let dragStartOffset = 0;

  const normalizeOffset = () => {
    if (cycleWidth <= 0) {
      return;
    }
    offset %= cycleWidth;
    if (offset < 0) {
      offset += cycleWidth;
    }
  };

  const render = () => {
    track.style.transform = `translate3d(${-offset}px, 0, 0)`;
  };

  const recalculate = () => {
    cycleWidth = track.scrollWidth / 2;
    normalizeOffset();
    render();
  };

  const shouldPause = () => hoverOrFocusPause || visibilityPause || isDragging;

  const animate = (timestamp) => {
    if (!lastTimestamp) {
      lastTimestamp = timestamp;
      window.requestAnimationFrame(animate);
      return;
    }

    const elapsedSeconds = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    if (!shouldPause()) {
      const motionFactor = reducedMotionQuery.matches ? 0.35 : 1;
      offset += baseSpeed * motionFactor * elapsedSeconds;
      normalizeOffset();
      render();
    }

    window.requestAnimationFrame(animate);
  };

  const releaseDrag = (event) => {
    if (!isDragging || event.pointerId !== activePointerId) {
      return;
    }

    isDragging = false;
    viewport.classList.remove("is-dragging");
    if (viewport.hasPointerCapture(event.pointerId)) {
      viewport.releasePointerCapture(event.pointerId);
    }
    activePointerId = null;
  };

  if (hoverPauseQuery.matches) {
    carousel.addEventListener("mousemove", () => {
      hoverOrFocusPause = true;
    });

    carousel.addEventListener("mouseleave", () => {
      hoverOrFocusPause = false;
    });
  }

  viewport.addEventListener("pointerdown", (event) => {
    isDragging = true;
    activePointerId = event.pointerId;
    dragStartX = event.clientX;
    dragStartOffset = offset;
    viewport.classList.add("is-dragging");
    viewport.setPointerCapture(event.pointerId);
  });

  viewport.addEventListener("pointermove", (event) => {
    if (!isDragging || event.pointerId !== activePointerId) {
      return;
    }
    const deltaX = event.clientX - dragStartX;
    offset = dragStartOffset - deltaX;
    normalizeOffset();
    render();
  });

  viewport.addEventListener("pointerup", releaseDrag);
  viewport.addEventListener("pointercancel", releaseDrag);
  viewport.addEventListener("lostpointercapture", () => {
    isDragging = false;
    activePointerId = null;
    viewport.classList.remove("is-dragging");
  });

  document.addEventListener("visibilitychange", () => {
    visibilityPause = document.hidden;
  });

  window.addEventListener("resize", () => {
    window.requestAnimationFrame(recalculate);
  });

  recalculate();
  window.requestAnimationFrame(animate);
});
