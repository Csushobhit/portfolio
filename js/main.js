// ======================= main.js =======================
(() => {
  // ---------- tiny ready() helper ----------
  const ready = (fn) =>
    document.readyState === "loading"
      ? document.addEventListener("DOMContentLoaded", fn, { once: true })
      : fn();

  // ---------- Projects data (5 real + 1 loading) ----------
  const projects = [
    {
      title: "MY PORTFOLIO",
      description:
        "A responsive personal portfolio built from scratch using HTML, CSS, and vanilla JavaScript. Features a dynamic theme switcher and is populated by a JavaScript data structure.",
      imageUrl: "images/image1.jpg",
      liveUrl: "#",
      codeUrl: "#"
    },
    {
      title: "NUMBER GUESSER",
      description:
        "A GUI where user draws a single-digit number and the app guesses it. Uses a trained Keras CNN on the MNIST dataset.",
      imageUrl: "images/image2.jpg",
      liveUrl: "#",
      codeUrl: "#"
    },
    {
      title: "IMAGE CREATER",
      description:
        "A GAN project that takes various inputs from the user and generates an image. Built with CelebA dataset using PyTorch.",
      imageUrl: "images/image3.jpg",
      liveUrl: "#",
      codeUrl: "#"
    },
    {
      title: "STUDENT ADMISSION CHATBOT AND SCHOLARSHIP SYSTEM",
      description:
        "Takes marksheet and Aadhaar from student, verifies credentials, matches criteria, and emails the decision regarding admission.",
      imageUrl: "images/image4.jpg",
      liveUrl: "#",
      codeUrl: "#"
    },
    {
      title: "HOTEL RECOMMENDER SYSTEM",
      description:
        "Users search hotels using an LLM. Location and other criteria are parsed and a final score is computed from 5 factors and shown as output.",
      imageUrl: "images/image5.jpg",
      liveUrl: "#",
      codeUrl: "#"
    },
    { loading: true } // skeleton card
  ];

  // ---------- Skeleton styles (once) ----------
  function ensureSkeletonStyles() {
    if (document.getElementById("skeletonStyles")) return;
    const style = document.createElement("style");
    style.id = "skeletonStyles";
    style.textContent = `
      .project-card.loading .skeleton-block,
      .project-card.loading .skeleton-line,
      .project-card.loading .skeleton-btn{
        display:block;
        border-radius: 8px;
        background: linear-gradient(90deg,
          rgba(255,255,255,0.06) 0%,
          rgba(255,255,255,0.14) 20%,
          rgba(255,255,255,0.06) 40%);
        background-size: 200% 100%;
        animation: shimmer 1.1s linear infinite;
      }
      /* Let CSS decide card height; skeleton fills container height */
      .project-card.loading .skeleton-block{ width:100%; height:100%; }
      .project-card.loading .skeleton-line{ height:14px; margin:10px 0; }
      .project-card.loading .skeleton-btn{
        height:38px; width:120px; display:inline-block; margin:10px 12px 0 0;
      }
      @keyframes shimmer { 0%{background-position:200% 0;} 100%{background-position:-200% 0;} }
    `;
    document.head.appendChild(style);
  }

  // ---------- Render projects ----------
  function renderProjects() {
    const container = document.querySelector(".projects-container");
    if (!container) {
      console.warn("[renderProjects] .projects-container not found.");
      return;
    }
    ensureSkeletonStyles();

    const STAGGER = 120;
    const html = projects
      .map((p, i) => {
        const delay = i * STAGGER;
        if (p.loading) {
          return `
            <div class="project-card loading reveal-up" style="--reveal-delay:${delay}ms">
              <div class="project-image-container"><div class="skeleton-block"></div></div>
              <div class="project-info">
                <div class="skeleton-line" style="width:60%"></div>
                <div class="skeleton-line" style="width:90%"></div>
                <div class="skeleton-line" style="width:75%"></div>
                <div class="project-links">
                  <span class="skeleton-btn"></span><span class="skeleton-btn"></span>
                </div>
              </div>
            </div>`;
        }
        return `
          <div class="project-card reveal-up" style="--reveal-delay:${delay}ms">
            <div class="project-image-container">
              <img src="${p.imageUrl}" alt="Screenshot of the ${p.title} project" class="project-image" loading="lazy">
            </div>
            <div class="project-info">
              <h3>${p.title}</h3>
              <p>${p.description}</p>
              <div class="project-links">
                <a href="${p.liveUrl}" class="btn" target="_blank" rel="noopener noreferrer">Live Demo</a>
                <a href="${p.codeUrl}" class="btn btn-secondary" target="_blank" rel="noopener noreferrer">View Code</a>
              </div>
            </div>
          </div>`;
      })
      .join("");

    container.innerHTML = html;
  }

  // ---------- Theme toggle ----------
  function initThemeToggle() {
    const themeToggle = document.querySelector("#theme-toggle");
    const html = document.documentElement;

    const saved = localStorage.getItem("theme");
    if (saved) {
      html.setAttribute("data-theme", saved);
      if (themeToggle && saved === "dark") themeToggle.checked = true;
    }

    if (themeToggle) {
      themeToggle.addEventListener("click", () => {
        const next = themeToggle.checked ? "dark" : "light";
        html.setAttribute("data-theme", next);
        localStorage.setItem("theme", next);
      });
    }
  }

  // ---------- Contact form ----------
  function initContactForm() {
    const form = document.querySelector("#contact-form");
    const status = document.querySelector("#form-status");
    if (!form || !status) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const btn = form.querySelector('button[type="submit"]');

      status.innerHTML = "Sending...";
      status.className = "info";
      status.style.display = "block";
      if (btn) btn.disabled = true;

      fetch(form.action || "#", {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" }
      })
        .then((res) => {
          if (res.ok) {
            status.innerHTML = "Thank you! Your message has been sent.";
            status.className = "success";
            form.reset();
          } else {
            return res.json().then((data) => {
              status.innerHTML =
                (data && Array.isArray(data.errors) && data.errors.map((e) => e.message).join(", ")) ||
                "Oops! Something went wrong. Please try again later.";
              status.className = "error";
            });
          }
        })
        .catch(() => {
          status.innerHTML = "Oops! A network error occurred. Please try again.";
          status.className = "error";
        })
        .finally(() => {
          if (btn) btn.disabled = false;
        });
    });
  }

  // ---------- Scroll reveal (repeatable) ----------
  function initReveal() {
    document.documentElement.classList.add("js");

    const GROUP_SELECTOR = ".reveal-group";
    const DEFAULT_STAGGER = 140;

    document.querySelectorAll(GROUP_SELECTOR).forEach((group) => {
      Array.from(group.children).forEach((el) => {
        if (!el.classList.contains("reveal-up")) el.classList.add("reveal-up");
      });
      const stagger = parseInt(group.getAttribute("data-stagger") || DEFAULT_STAGGER, 10);
      const kids = group.querySelectorAll(":scope > .reveal-up");
      kids.forEach((el, i) => el.style.setProperty("--reveal-delay", `${i * stagger}ms`));
    });

    const targets = document.querySelectorAll(".reveal-up");
    if (!("IntersectionObserver" in window) || targets.length === 0) {
      targets.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target;
          const once = el.hasAttribute("data-reveal-once");
          if (entry.isIntersecting) {
            setTimeout(() => el.classList.add("is-visible"), 20);
            if (once) io.unobserve(el);
          } else if (!once) {
            el.classList.remove("is-visible");
          }
        });
      },
      { root: null, rootMargin: "0px 0px -20% 0px", threshold: 0.2 }
    );

    requestAnimationFrame(() => targets.forEach((el) => io.observe(el)));
  }

  // ---------- About tabs ----------
  function initAboutTabs() {
    const tablist = document.querySelector(".about-tabs");
    const panelsContainer = document.querySelector(".about-tabpanels");
    if (!tablist || !panelsContainer) return;

    const tabs = Array.from(tablist.querySelectorAll(".tab"));
    const panels = Array.from(panelsContainer.querySelectorAll(".tabpanel"));

    const activate = (newTab) => {
      tabs.forEach((tab) => {
        const selected = tab === newTab;
        tab.setAttribute("aria-selected", selected ? "true" : "false");
        tab.tabIndex = selected ? 0 : -1;
      });
      const id = newTab.getAttribute("aria-controls");
      panels.forEach((p) => p.classList.remove("is-active"));
      const panel = panels.find((p) => p.id === id);
      if (panel) {
        panel.classList.add("is-active");
        panel.focus({ preventScroll: true });
      }
    };

    tabs.forEach((tab) => tab.addEventListener("click", () => activate(tab)));
    tablist.addEventListener("keydown", (e) => {
      const current = document.activeElement;
      if (!tabs.includes(current)) return;
      let i = tabs.indexOf(current);
      if (e.key === "ArrowRight") { i = (i + 1) % tabs.length; e.preventDefault(); }
      if (e.key === "ArrowLeft")  { i = (i - 1 + tabs.length) % tabs.length; e.preventDefault(); }
      if (e.key === "Home")       { i = 0; e.preventDefault(); }
      if (e.key === "End")        { i = tabs.length - 1; e.preventDefault(); }
      const next = tabs[i];
      if (next) { next.focus(); activate(next); }
    });

    activate(tabs[0]);
  }

  // ---------- Hero typewriter ----------
  function initTypewriter() {
    const els = document.querySelectorAll("#hero .typewriter");
    if (!els.length) return;

    const reduced =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const lines = Array.from(els).map((el) => el.getAttribute("data-text") || "");
    els.forEach((el) => (el.textContent = ""));
    if (reduced) {
      els.forEach((el, i) => (el.textContent = lines[i] || ""));
      return;
    }

    const baseDelay = 28,
      jitter = 50;
    const typeLine = (el, text) =>
      new Promise((resolve) => {
        let i = 0;
        const tick = () => {
          if (i <= text.length) {
            el.textContent = text.slice(0, i++);
            setTimeout(tick, baseDelay + Math.random() * jitter);
          } else resolve();
        };
        tick();
      });

    (async () => {
      for (let i = 0; i < els.length; i++) {
        await typeLine(els[i], lines[i] || "");
        await new Promise((r) => setTimeout(r, 400));
      }
    })();
  }

  // ---------- MediaQuery helper (no deprecated addListener) ----------
  function bindMediaQueryChange(mq, handler) {
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", handler);
    } else if ("onchange" in mq) {
      mq.onchange = handler;
    } else {
      window.addEventListener("resize", () => handler(mq)); // very old fallback
    }
    handler(mq); // fire once
  }

  // ---------- Mobile menu (hamburger) ----------
  function initMobileMenu() {
    const btn = document.querySelector(".menu-toggle");
    const nav = document.querySelector("header nav");
    if (!btn || !nav) return;

    btn.setAttribute("aria-expanded", "false");

    btn.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // close when a link is clicked
    nav.addEventListener("click", (e) => {
      if (e.target.closest("a")) {
        nav.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
      }
    });

    // keep state sane when crossing the breakpoint
    const mq = window.matchMedia("(min-width: 769px)");
    const handle = (e) => {
      const matches = typeof e.matches === "boolean" ? e.matches : mq.matches;
      if (matches) {
        nav.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
      }
    };
    bindMediaQueryChange(mq, handle);
  }

  // ---------- Init everything when DOM is ready ----------
  ready(() => {
    renderProjects();
    initThemeToggle();
    initContactForm();
    initReveal();
    initAboutTabs();
    initTypewriter();
    initMobileMenu();
  });
})();
