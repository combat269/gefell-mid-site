/* ===============================
FILE: script.js (shared) -> SOME LOGIC OF THE WEBSITE
=============================== */



// Mobile nav + a11y
const toggle = document.querySelector(".nav-toggle");
const nav = document.getElementById("site-nav");
if (toggle && nav) {
  const closeNav = () => {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.focus();
  };
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) closeNav();
  });
  document.addEventListener("click", (e) => {
    if (!nav.contains(e.target) && !toggle.contains(e.target)) {
      if (nav.classList.contains("is-open")) closeNav();
    }
  });
}
// Footer year
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Transparent at top → semi-transparent solid after a small scroll
(function () {
  const header = document.querySelector(".header");
  if (!header) return;

  const THRESHOLD = 24; // px before we switch styles

  function update() {
    const atTop = window.scrollY <= THRESHOLD;
    header.classList.toggle("header--transparent", atTop);
    header.classList.toggle("header--solid", !atTop);
  }

  update(); // on load
  window.addEventListener("scroll", update, { passive: true });
})();

/* ===============================
   Language selector (toggle + a11y)
   =============================== */
(function () {
  const wrap = document.querySelector(".lang-wrap");
  const btn = document.getElementById("langBtn");
  const menu = document.getElementById("langMenu");
  if (!wrap || !btn || !menu) return;

  const flagEl = btn.querySelector(".lang__flag");
  const codeEl = btn.querySelector(".lang__code");

  function open() {
    btn.classList.add("is-open");
    btn.setAttribute("aria-expanded", "true");
    menu.hidden = false;
  }
  function close() {
    btn.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
    menu.hidden = true;
  }
  function toggle() {
    menu.hidden ? open() : close();
  }

  btn.addEventListener("click", toggle);

  // Click outside to close
  document.addEventListener("click", (e) => {
    if (!wrap.contains(e.target)) close();
  });

  // Escape closes
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  // Choose a language
  menu.addEventListener("click", (e) => {
    const li = e.target.closest('li[role="menuitem"]');
    if (!li) return;

    // Update active row
    [...menu.querySelectorAll('li[role="menuitem"]')].forEach((x) =>
      x.removeAttribute("aria-current")
    );
    li.setAttribute("aria-current", "true");

    // Update pill (flag + code)
    const lang = li.dataset.lang; // "az" | "en" | "ru"
    const code = li.textContent.trim().slice(-2).toUpperCase(); // read "AZ" etc.
    codeEl.textContent = code;
    const map = { az: "az", en: "en", ru: "ru" };
    flagEl.src = `./assets/flags/${map[lang]}.svg`;

    close();
    // TODO: hook into your i18n router here if needed
  });
})();

/* ===== Featured slider logic (robust) ===== */
(function () {
  const track = document.getElementById("featTrack");
  if (!track) return;

  const slides = Array.from(track.querySelectorAll(".featured__slide"));
  const dotsWrap = document.getElementById("featDots");
  const prevBtn = document.querySelector(".featured__ctrl.prev");
  const nextBtn = document.querySelector(".featured__ctrl.next");
  const wrap = document.querySelector(".featured__wrap");

  const AUTOPLAY_MS = 5000;
  const TRANSITION_CSS = "transform .45s ease";
  let i = 0, timer = null, animating = false, animTO = null;

  // Build dots
  slides.forEach((_, idx) => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", `Slayd ${idx + 1}`);
    b.addEventListener("click", () => { goTo(idx); restart(); });
    dotsWrap.appendChild(b);
  });

  function updateDots() {
    dotsWrap.querySelectorAll("button").forEach((d, idx) =>
      d.setAttribute("aria-current", idx === i ? "true" : "false")
    );
  }

  function render() {
    const next = `translateX(-${i * 100}%)`;
    const changed = track.style.transform !== next;

    if (changed) {
      animating = true;
      clearTimeout(animTO);
      animTO = setTimeout(() => (animating = false), 700); // fallback
    }
    track.style.transform = next;
    updateDots();
  }

  track.addEventListener("transitionend", (e) => {
    if (e.propertyName === "transform") {
      animating = false;
      clearTimeout(animTO);
    }
  });

  function goTo(idx) {
    if (animating) return;
    const target = (idx + slides.length) % slides.length;
    if (target === i) return; // no-op
    i = target;
    render();
  }
  const next = () => goTo(i + 1);
  const prev = () => goTo(i - 1);

  function start() { if (!timer) timer = setInterval(next, AUTOPLAY_MS); }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }
  function restart() { stop(); start(); }

  nextBtn?.addEventListener("click", () => { next(); restart(); });
  prevBtn?.addEventListener("click", () => { prev(); restart(); });

  wrap?.addEventListener("mouseenter", stop);
  wrap?.addEventListener("mouseleave", start);
  wrap?.addEventListener("focusin", stop);
  wrap?.addEventListener("focusout", start);
  wrap?.addEventListener("touchstart", stop, { passive: true });
  wrap?.addEventListener("touchend", start, { passive: true });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else { animating = false; start(); } // ensure we unstick after background tab
  });

  // --- IMPORTANT: initial layout WITHOUT transition, then enable it
  track.style.transition = "none";
  track.style.transform  = "translateX(0)"; // i = 0
  updateDots();

  requestAnimationFrame(() => {
    // enable smooth transitions AFTER first paint
    track.style.transition = TRANSITION_CSS;
    start();
  });
})();

/*Enable tap-to-expand on touch devices so first tap shows label,
   second tap follows the link (prevents accidental navigations). */
  (function(){
  const items = document.querySelectorAll('.contact-dock .contact-item');
  const isTouchOnly = window.matchMedia('(hover: none)').matches;
  if(!items.length || !isTouchOnly) return;

  items.forEach(el => {
    el.addEventListener('click', function (e) {
      if (!el.classList.contains('open')) {
        e.preventDefault();              // first tap just expands
        el.classList.add('open');
        clearTimeout(el._t);
        el._t = setTimeout(() => el.classList.remove('open'), 3000);
      }
    });
  });
})();


