/* =========================================================
   Andrei Buhosu — Portfolio interactions
   ========================================================= */
(function () {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Theme ---------- */
  const root = document.documentElement;
  const themeToggle = $("[data-theme-toggle]");
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const stored = localStorage.getItem("theme");
  if (stored) {
    root.setAttribute("data-theme", stored);
  } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
    root.setAttribute("data-theme", "light");
  }
  const syncThemeMeta = () => {
    if (themeMeta)
      themeMeta.setAttribute(
        "content",
        root.getAttribute("data-theme") === "light" ? "#f5f6fb" : "#08080c"
      );
  };
  syncThemeMeta();
  themeToggle?.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    syncThemeMeta();
  });

  /* ---------- Mobile menu ---------- */
  const menuToggle = $("[data-menu-toggle]");
  const navList = $("[data-nav]");
  const setMenu = (open) => {
    navList?.classList.toggle("is-open", open);
    menuToggle?.classList.toggle("is-open", open);
    menuToggle?.setAttribute("aria-expanded", String(open));
  };
  menuToggle?.addEventListener("click", () =>
    setMenu(!navList.classList.contains("is-open"))
  );
  $$(".nav-link", navList).forEach((l) =>
    l.addEventListener("click", () => setMenu(false))
  );

  /* ---------- Sticky header + to-top ---------- */
  const header = $("[data-header]");
  const toTop = $("[data-to-top]");
  const onScroll = () => {
    const y = window.scrollY;
    header?.classList.toggle("is-stuck", y > 12);
    toTop?.classList.toggle("is-shown", y > 600);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Scroll-spy active nav ---------- */
  const sections = $$("main section[id]");
  const navLinks = $$(".nav-link");
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const id = e.target.id;
          navLinks.forEach((l) =>
            l.classList.toggle("is-active", l.getAttribute("href") === "#" + id)
          );
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => spy.observe(s));

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$("[data-reveal]");
  if (reduceMotion) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    const revealer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => revealer.observe(el));
  }

  /* ---------- Typed role rotation ---------- */
  const typed = $("[data-typed]");
  if (typed) {
    const words = (typed.dataset.words || "").split(";").filter(Boolean);
    if (reduceMotion) {
      typed.textContent = words[0] || "";
    } else {
      let wi = 0,
        ci = 0,
        deleting = false;
      const tick = () => {
        const word = words[wi];
        typed.textContent = word.slice(0, ci);
        if (!deleting && ci < word.length) {
          ci++;
          setTimeout(tick, 70);
        } else if (!deleting && ci === word.length) {
          deleting = true;
          setTimeout(tick, 1600);
        } else if (deleting && ci > 0) {
          ci--;
          setTimeout(tick, 35);
        } else {
          deleting = false;
          wi = (wi + 1) % words.length;
          setTimeout(tick, 280);
        }
      };
      tick();
    }
  }

  /* ---------- Stat counters ---------- */
  const counters = $$(".stat-num");
  const runCount = (el) => {
    const target = parseFloat(el.dataset.count || "0");
    const suffix = el.dataset.suffix || "";
    if (reduceMotion) {
      el.textContent = target + suffix;
      return;
    }
    const dur = 1500;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (counters.length) {
    const countObs = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            runCount(e.target);
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((c) => countObs.observe(c));
  }

  /* ---------- Project filter ---------- */
  const filters = $$(".filter");
  const projects = $$("[data-projects] .project");
  filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      filters.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const f = btn.dataset.filter;
      projects.forEach((p) => {
        const show = f === "all" || p.dataset.category === f;
        p.classList.toggle("is-hidden", !show);
      });
    });
  });

  /* ---------- Contact form ---------- */
  const form = $("[data-form]");
  const note = $("[data-form-note]");
  const FORMSPREE_CONFIGURED =
    form && !form.getAttribute("action").includes("your-id");

  form?.addEventListener("submit", async (e) => {
    const data = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      message: form.message.value.trim(),
    };

    if (!FORMSPREE_CONFIGURED) {
      // Fallback: open the user's email client with a pre-filled message
      e.preventDefault();
      const subject = encodeURIComponent(`Portfolio enquiry from ${data.name}`);
      const body = encodeURIComponent(
        `${data.message}\n\n— ${data.name}\n${data.email}`
      );
      window.location.href = `mailto:andrei.buhosu@outlook.com?subject=${subject}&body=${body}`;
      if (note) {
        note.textContent = "Opening your email app…";
        note.className = "form-note ok";
      }
      return;
    }

    // Formspree AJAX submission
    e.preventDefault();
    if (note) {
      note.textContent = "Sending…";
      note.className = "form-note";
    }
    try {
      const res = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        form.reset();
        note.textContent = "Thanks! Your message has been sent. ✅";
        note.className = "form-note ok";
      } else {
        throw new Error("Request failed");
      }
    } catch (err) {
      note.textContent = "Something went wrong — please email me directly.";
      note.className = "form-note err";
    }
  });

  /* ---------- Cursor glow ---------- */
  const glow = $(".cursor-glow");
  if (glow && !reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener(
      "pointermove",
      (e) => {
        glow.style.setProperty("--x", e.clientX + "px");
        glow.style.setProperty("--y", e.clientY + "px");
      },
      { passive: true }
    );
  } else if (glow) {
    glow.style.display = "none";
  }

  /* ---------- Résumé link self-heal ----------
     If the CV PDF hasn't been added yet, fall back to LinkedIn so the
     button is never broken. Once assets/Andrei_Buhosu_CV.pdf exists,
     the link works automatically with no code change. */
  const resumeLinks = $$('a[href$="Andrei_Buhosu_CV.pdf"]');
  if (resumeLinks.length) {
    fetch(resumeLinks[0].getAttribute("href"), { method: "HEAD" })
      .then((res) => {
        if (res && !res.ok) {
          resumeLinks.forEach((a) =>
            a.setAttribute("href", "https://www.linkedin.com/in/abuhosu")
          );
        }
      })
      .catch(() => {
        /* offline or file:// — leave the link as-is */
      });
  }

  /* ---------- Footer year ---------- */
  const yr = $("[data-year]");
  if (yr) yr.textContent = new Date().getFullYear();
})();
