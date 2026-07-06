/* ════════════════════════════════════════════════════════════════
   ClearCycle RCM — "Clarity" interaction engine
   GSAP (ScrollTrigger + SplitText) progressive enhancement. All
   content is visible without JS/GSAP; all motion respects
   prefers-reduced-motion.
   ════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
  const canHover = window.matchMedia("(hover:hover) and (pointer:fine)").matches;
  const hasGSAP = typeof window.gsap !== "undefined";
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

  if (hasGSAP && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ── Nav scrolled state ───────────────────────── */
  const nav = $("#nav");
  const onScroll = () => { if (nav) nav.classList.toggle("scrolled", window.scrollY > 16); };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ── Mobile menu ──────────────────────────────── */
  const burger = $("#burger"), menu = $("#mobileMenu");
  if (burger && menu) {
    const setOpen = (open) => {
      menu.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    };
    burger.addEventListener("click", () => setOpen(!menu.classList.contains("open")));
    $$("a", menu).forEach((a) => a.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
  }

  /* ── Animated counters (IO — independent of GSAP) ─ */
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.decimals || "0", 10);
    const fmt = (v) => v.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
    if (reduced) { el.textContent = fmt(target); return; }
    const dur = 1800, start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = fmt(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { animateCount(e.target); countIO.unobserve(e.target); } });
  }, { threshold: 0.6 });
  $$("[data-count]").forEach((el) => countIO.observe(el));

  /* ── Meter fills (IO) ─────────────────────────── */
  const meterIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      $$(".meter-bar", e.target).forEach((b, i) => {
        const w = b.dataset.fill + "%";
        if (reduced) { b.style.width = w; }
        else setTimeout(() => { b.style.width = w; }, i * 120);
      });
      meterIO.unobserve(e.target);
    });
  }, { threshold: 0.4 });
  $$(".panel").forEach((p) => meterIO.observe(p));

  /* ── FAQ accordion ────────────────────────────── */
  $$(".faq-item").forEach((item) => {
    const btn = $(".faq-q", item), panel = $(".faq-a", item), inner = $(".faq-a-inner", item);
    if (!btn || !panel) return;
    btn.addEventListener("click", () => {
      const open = item.classList.contains("open");
      $$(".faq-item.open").forEach((o) => {
        if (o !== item) { o.classList.remove("open"); $(".faq-q", o).setAttribute("aria-expanded", "false"); $(".faq-a", o).style.height = "0px"; }
      });
      item.classList.toggle("open", !open);
      btn.setAttribute("aria-expanded", String(!open));
      panel.style.height = open ? "0px" : inner.offsetHeight + "px";
    });
  });

  /* ── Year ─────────────────────────────────────── */
  $$("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* ════════ GSAP-enhanced motion ════════ */
  if (hasGSAP && !reduced) {
    /* Reveal on scroll */
    $$(".reveal").forEach((el) => {
      gsap.from(el, {
        opacity: 0, y: 40, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 86%" }
      });
    });

    /* Hero entrance timeline */
    const tl = gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.1 });
    const headline = $("[data-split]");
    if (headline && window.SplitText) {
      const split = new SplitText(headline, { type: "words" });
      tl.from(split.words, { yPercent: 110, opacity: 0, stagger: 0.06, duration: 0.7, ease: "power4.out" }, 0);
    } else if (headline) {
      tl.from(headline, { opacity: 0, y: 28, duration: 0.8 }, 0);
    }
    ['[data-hero="1"]', '[data-hero="2"]', '[data-hero="3"]', '[data-hero="4"]', '[data-hero="5"]'].forEach((sel, i) => {
      tl.from(sel, { opacity: 0, y: 20, duration: 0.55 }, 0.1 + i * 0.1);
    });
    tl.from('[data-hero="6"]', { opacity: 0, y: 40, scale: 0.97, duration: 0.9, ease: "power3.out" }, 0.3);
    tl.from(".float-chip", { opacity: 0, scale: 0.85, y: 24, stagger: 0.15, duration: 0.7, ease: "back.out(1.6)" }, 0.7);

    /* Idle float on hero chips */
    $$(".float-chip").forEach((chip, i) => {
      gsap.to(chip, { y: "+=12", duration: 2.6 + i * 0.4, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 1 });
    });

    /* Infinite marquee */
    const track = $("#marquee");
    if (track) {
      track.innerHTML += track.innerHTML; // duplicate for seamless loop
      gsap.to(track, { xPercent: -50, duration: 28, ease: "none", repeat: -1 });
    }

    /* Process — pinned horizontal scroll (desktop only) */
    const ptrack = $("#processTrack");
    const ppin = ptrack && ptrack.closest(".process-pin");
    if (ptrack && ppin && window.matchMedia("(min-width:760px)").matches) {
      ppin.style.overflow = "hidden";
      const getLen = () => Math.max(0, ptrack.scrollWidth - ppin.offsetWidth + window.innerWidth * 0.06);
      gsap.to(ptrack, {
        x: () => -getLen(), ease: "none",
        scrollTrigger: {
          trigger: ppin, start: "center center", end: () => "+=" + getLen(),
          scrub: 1, pin: true, anticipatePin: 1, invalidateOnRefresh: true
        }
      });
    }

    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  }

  /* ── Category filters (specialties / blog) ────── */
  $$(".filter-row").forEach((row) => {
    const buttons = $$(".filter-btn", row);
    const scope = row.closest("section") || document;
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const filter = btn.dataset.filter;
        $$("[data-category]", scope).forEach((card) => {
          card.classList.toggle("hidden", filter !== "all" && card.dataset.category !== filter);
        });
        if (hasGSAP && window.ScrollTrigger) ScrollTrigger.refresh();
      });
    });
  });

  /* ── Multi-step form (contact) ─────────────────── */
  $$("[data-multistep]").forEach((mf) => {
    const steps = $$(".form-step", mf);
    const show = (key) => steps.forEach((s) => s.classList.toggle("active", s.dataset.step === String(key)));
    $$(".form-next", mf).forEach((btn) => btn.addEventListener("click", () => {
      const cur = btn.closest(".form-step");
      const invalid = $$("input[required],select[required]", cur).find((i) => !i.reportValidity());
      if (!invalid) show(parseInt(cur.dataset.step, 10) + 1);
    }));
    $$(".form-back", mf).forEach((btn) => btn.addEventListener("click", () => {
      show(parseInt(btn.closest(".form-step").dataset.step, 10) - 1);
    }));
    $$(".form-submit", mf).forEach((btn) => btn.addEventListener("click", (e) => {
      e.preventDefault();
      show("success");
    }));
  });

  /* ── Denial risk predictor ─────────────────────── */
  const dpTool = $("[data-denial-predictor]");
  if (dpTool) {
    const denialDB = {
      cardiology: [{ name: "Medical necessity not met", base: 18 }, { name: "Missing auth / prior auth", base: 22 }, { name: "Incorrect coding (CPT/ICD mismatch)", base: 15 }, { name: "Duplicate claim", base: 8 }, { name: "Timely filing exceeded", base: 6 }],
      ortho: [{ name: "Missing prior auth (surgery)", base: 26 }, { name: "Medical necessity not met", base: 20 }, { name: "Bundling / unbundling error", base: 16 }, { name: "Wrong modifier", base: 12 }, { name: "Coordination of benefits", base: 7 }],
      behavioral: [{ name: "No prior auth / session limit exceeded", base: 28 }, { name: "Place of service mismatch", base: 14 }, { name: "Medical necessity", base: 18 }, { name: "NPI / credentialing issue", base: 11 }, { name: "Duplicate date of service", base: 7 }],
      urgent: [{ name: "Out-of-network denial", base: 20 }, { name: "Missing modifier (ER vs. urgent)", base: 16 }, { name: "Duplicate billing", base: 12 }, { name: "Patient eligibility issue", base: 18 }, { name: "Timely filing", base: 9 }],
      default: [{ name: "Eligibility / coverage issue", base: 18 }, { name: "Missing or invalid prior auth", base: 20 }, { name: "Medical necessity not documented", base: 16 }, { name: "Incorrect or mismatched codes", base: 14 }, { name: "Timely filing exceeded", base: 8 }]
    };
    const renderRisks = () => {
      const specialty = $("#dp-specialty", dpTool)?.value || "default";
      const ehr = $("#dp-ehr", dpTool)?.value;
      const list = denialDB[specialty] || denialDB.default;
      const adjusted = list
        .map((item) => ({ ...item, pct: Math.min(35, item.base + (ehr === "paper" ? 5 : ehr === "old" ? 3 : 0)) }))
        .sort((a, b) => b.pct - a.pct);
      const container = $(".dp-risk-list", dpTool);
      if (!container) return;
      container.innerHTML = adjusted.map((r) => {
        const lvl = r.pct >= 22 ? "risk-high" : r.pct >= 14 ? "risk-med" : "risk-low";
        const label = r.pct >= 22 ? "High" : r.pct >= 14 ? "Med" : "Low";
        return `<div class="denial-risk-bar"><span class="risk-level ${lvl}">${label}</span><div style="flex:1"><div class="risk-name">${r.name}</div><div class="risk-pct">Approx. ${r.pct}% of your denials</div><div class="risk-bar-track"><div class="risk-bar-fill" style="width:${r.pct * 2.8}%"></div></div></div></div>`;
      }).join("");
    };
    $$("select", dpTool).forEach((s) => s.addEventListener("change", renderRisks));
    renderRisks();
  }

  /* ════════ Magnetic buttons (pointer-fine only) ════════ */
  if (canHover && !reduced) {
    $$(".magnetic").forEach((el) => {
      const strength = 0.3;
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const mx = e.clientX - (r.left + r.width / 2);
        const my = e.clientY - (r.top + r.height / 2);
        if (hasGSAP) gsap.to(el, { x: mx * strength, y: my * strength, duration: 0.4, ease: "power3.out" });
        else el.style.transform = `translate(${mx * strength}px,${my * strength}px)`;
      });
      el.addEventListener("mouseleave", () => {
        if (hasGSAP) gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1,0.4)" });
        else el.style.transform = "";
      });
    });
  }
})();
