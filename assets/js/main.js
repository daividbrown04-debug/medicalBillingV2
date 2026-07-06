/* ClearCycle RCM — Premium Interactions v2 */
(function () {
  "use strict";

  /* Honor the user's motion preference everywhere below */
  const prefersReduced = window.matchMedia("(prefers-reduced-motion:reduce)").matches;

  /* ── Scroll progress bar ──────────────────────── */
  const progressBar = document.querySelector(".scroll-progress");
  const updateProgress = () => {
    if (!progressBar) return;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.transform = `scaleX(${scrollable > 0 ? window.scrollY / scrollable : 0})`;
  };

  /* ── Sticky header ────────────────────────────── */
  const header = document.querySelector(".site-header");
  const onScroll = () => {
    if (header) header.classList.toggle("scrolled", window.scrollY > 24);
    updateProgress();

    /* Back to top */
    const bt = document.querySelector(".back-top");
    if (bt) bt.classList.toggle("visible", window.scrollY > 500);

    /* Mobile sticky CTA */
    const mCta = document.querySelector(".mobile-cta-bar");
    if (mCta) mCta.classList.toggle("visible", window.scrollY > 400);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ── Custom cursor ────────────────────────────── */
  const cursorDot = document.querySelector(".cursor-dot");
  const cursorRing = document.querySelector(".cursor-ring");
  if (cursorDot && cursorRing && !prefersReduced && window.matchMedia("(hover:hover)").matches) {
    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX; mouseY = e.clientY;
      cursorDot.style.left = mouseX + "px";
      cursorDot.style.top = mouseY + "px";
    });
    const animateCursor = () => {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      cursorRing.style.left = ringX + "px";
      cursorRing.style.top = ringY + "px";
      requestAnimationFrame(animateCursor);
    };
    animateCursor();
    document.querySelectorAll("a,button,.btn,.bento-card,.spec-card,.blog-card,.testi-card,.career-card,.team-card").forEach((el) => {
      el.addEventListener("mouseenter", () => { cursorDot.classList.add("hovering"); cursorRing.classList.add("hovering"); });
      el.addEventListener("mouseleave", () => { cursorDot.classList.remove("hovering"); cursorRing.classList.remove("hovering"); });
    });
    document.addEventListener("mouseleave", () => { cursorDot.style.opacity = "0"; cursorRing.style.opacity = "0"; });
    document.addEventListener("mouseenter", () => { cursorDot.style.opacity = "1"; cursorRing.style.opacity = "1"; });
  }

  /* ── Mobile nav ───────────────────────────────── */
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open);
      document.body.style.overflow = open ? "hidden" : "";
    });
    links.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        links.classList.remove("open");
        toggle.classList.remove("open");
        document.body.style.overflow = "";
      })
    );
  }

  /* ── Announcement bar close ───────────────────── */
  document.querySelectorAll(".ab-close").forEach((btn) => {
    btn.addEventListener("click", () => {
      const bar = btn.closest(".announcement-bar");
      if (bar) { bar.style.height = bar.offsetHeight + "px"; bar.style.overflow = "hidden"; requestAnimationFrame(() => { bar.style.height = "0"; bar.style.padding = "0"; bar.style.transition = "height .3s,padding .3s"; }); }
    });
  });

  /* ── Scroll reveal (IntersectionObserver) ─────── */
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in-view"); io.unobserve(e.target); } }),
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  document.querySelectorAll(".reveal,.reveal-left,.reveal-right,.reveal-scale,.dash,.compare-col,.tl-h-item,.proc-step,.spec-filter-wrap,.payer-item,.team-card,.career-card,.testi-featured").forEach((el) => io.observe(el));

  /* ── Animated counters ────────────────────────── */
  const counterIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        counterIO.unobserve(e.target);
        const el = e.target;
        const target = parseFloat(el.dataset.count);
        const decimals = parseInt(el.dataset.decimals || "0", 10);
        const dur = 2000;
        const start = performance.now();
        const fmt = (v) => v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
        if (prefersReduced) { el.textContent = fmt(target); return; }
        const step = (now) => {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = fmt(target * eased);
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    },
    { threshold: 0.5 }
  );
  document.querySelectorAll("[data-count]").forEach((el) => counterIO.observe(el));

  /* ── Meter fills ──────────────────────────────── */
  const meterIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.querySelectorAll(".meter-fill").forEach((f) => { f.style.width = f.dataset.fill + "%"; });
        meterIO.unobserve(e.target);
      });
    },
    { threshold: 0.35 }
  );
  document.querySelectorAll(".compare-col,.meter-group").forEach((el) => meterIO.observe(el));

  /* ── Circular stat ring ───────────────────────── */
  const ringIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.querySelectorAll(".ring-fill").forEach((r) => {
          const pct = parseFloat(r.dataset.pct || "0");
          const offset = 283 - (283 * pct / 100);
          r.style.strokeDashoffset = offset;
        });
        ringIO.unobserve(e.target);
      });
    },
    { threshold: 0.4 }
  );
  document.querySelectorAll(".stat-ring-grid,.stat-ring").forEach((el) => ringIO.observe(el));

  /* ── Accordion ────────────────────────────────── */
  document.querySelectorAll(".acc-item").forEach((item) => {
    const btn = item.querySelector(".acc-q");
    const panel = item.querySelector(".acc-a");
    if (!btn || !panel) return;
    btn.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      const group = item.closest(".accordion");
      if (group) group.querySelectorAll(".acc-item.open").forEach((o) => {
        o.classList.remove("open");
        o.querySelector(".acc-a").style.maxHeight = null;
        o.querySelector(".acc-q").setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.classList.add("open");
        panel.style.maxHeight = panel.scrollHeight + "px";
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ── Tabs ─────────────────────────────────────── */
  document.querySelectorAll(".tabs").forEach((tabs) => {
    const btns = tabs.querySelectorAll(".tab-btn");
    const panels = tabs.querySelectorAll(".tab-panel");
    btns.forEach((btn) =>
      btn.addEventListener("click", () => {
        btns.forEach((b) => b.classList.remove("active"));
        panels.forEach((p) => p.classList.remove("active"));
        btn.classList.add("active");
        const target = tabs.querySelector("#" + btn.dataset.tab);
        if (target) target.classList.add("active");
      })
    );
  });

  /* ── Revenue Recovery Calculator ─────────────── */
  const calc = document.querySelector("[data-calculator]");
  if (calc) {
    const monthly = calc.querySelector("#calc-monthly");
    const denial = calc.querySelector("#calc-denial");
    const providers = calc.querySelector("#calc-providers");
    const outMonthly = calc.querySelector("#out-monthly");
    const outDenial = calc.querySelector("#out-denial");
    const outProviders = calc.querySelector("#out-providers");
    const money = (v) => "$" + Math.round(v).toLocaleString("en-US");
    const update = () => {
      const m = parseFloat(monthly.value);
      const d = parseFloat(denial.value);
      const p = parseInt(providers.value, 10);
      if (outMonthly) outMonthly.textContent = money(m);
      if (outDenial) outDenial.textContent = d + "%";
      if (outProviders) outProviders.textContent = p;
      const denialGap = Math.max(d - 4, 0) / 100;
      const recoveredDenials = m * denialGap * 0.65;
      const collectionLift = m * 0.06;
      const annual = (recoveredDenials + collectionLift) * 12;
      const recoverEl = calc.querySelector("#calc-recovered");
      const deniedEl = calc.querySelector("#calc-denied-now");
      const liftEl = calc.querySelector("#calc-lift");
      const daysEl = calc.querySelector("#calc-days");
      if (recoverEl) recoverEl.textContent = money(annual).replace("$","");
      if (deniedEl) deniedEl.textContent = money(m * (d / 100) * 12);
      if (liftEl) liftEl.textContent = money(collectionLift * 12);
      if (daysEl) daysEl.textContent = Math.max(18, 42 - Math.round(denialGap * 90)) + " days";
    };
    [monthly, denial, providers].filter(Boolean).forEach((i) => i.addEventListener("input", update));
    update();
  }

  /* ── Practice Health Score ────────────────────── */
  const hsTool = document.querySelector("[data-health-score]");
  if (hsTool) {
    const inputs = hsTool.querySelectorAll("select,input[type=range]");
    const scoreEl = hsTool.querySelector(".hs-score-number");
    const gradeEl = hsTool.querySelector(".hs-grade");
    const insightsList = hsTool.querySelector(".hs-insights");
    const ringFill = hsTool.querySelector(".hs-ring-fill");
    const specialtyBenchmarks = { "family":43,"cardiology":38,"ortho":35,"behavioral":48,"urgent":40,"default":43 };
    const calcScore = () => {
      const denial = parseFloat(hsTool.querySelector("#hs-denial")?.value || 12);
      const days = parseFloat(hsTool.querySelector("#hs-days")?.value || 45);
      const collection = parseFloat(hsTool.querySelector("#hs-collection")?.value || 88);
      const specialty = hsTool.querySelector("#hs-specialty")?.value || "default";
      const daysTarget = specialtyBenchmarks[specialty] || 43;
      let score = 100;
      /* Denial rate: ideal ≤ 4%, -5 pts per % above 4 */
      score -= Math.max(0, (denial - 4) * 5);
      /* Days in A/R: ideal ≤ target, -2 pts per day above */
      score -= Math.max(0, (days - daysTarget) * 2);
      /* Net collection: ideal ≥ 96%, -3 pts per % below */
      score -= Math.max(0, (96 - collection) * 3);
      score = Math.max(5, Math.min(100, Math.round(score)));
      const grade = score >= 85 ? { label:"Excellent", color:"#19b896" } : score >= 70 ? { label:"Good", color:"#c89b3c" } : score >= 50 ? { label:"Needs Work", color:"#e2654a" } : { label:"Critical", color:"#c94f35" };
      if (scoreEl) scoreEl.textContent = score;
      if (gradeEl) { gradeEl.textContent = grade.label; gradeEl.style.color = grade.color; }
      if (ringFill) {
        const offset = 283 - (283 * score / 100);
        ringFill.style.strokeDashoffset = offset;
        ringFill.style.stroke = grade.color;
      }
      if (insightsList) {
        const insights = [];
        if (denial > 10) insights.push({ level:"critical", text:`Denial rate ${denial}% is ${(denial-4).toFixed(0)}pp above benchmark — losing $${Math.round(denial/100 * 5000 * 12).toLocaleString()}/yr estimated.` });
        else if (denial > 6) insights.push({ level:"improve", text:`Denial rate ${denial}% has room to improve. Target: below 4%.` });
        else insights.push({ level:"good", text:`Denial rate ${denial}% is strong. Keep submitting clean claims.` });
        if (days > daysTarget + 10) insights.push({ level:"critical", text:`Days in A/R (${days}) is ${days - daysTarget} days above specialty average — cash is trapped.` });
        else if (days > daysTarget + 3) insights.push({ level:"improve", text:`Days in A/R (${days}) slightly elevated. Target for ${specialty}: ${daysTarget} days.` });
        else insights.push({ level:"good", text:`Days in A/R (${days}) is at or near best-practice for your specialty.` });
        if (collection < 93) insights.push({ level:"critical", text:`Net collection rate ${collection}% — you're leaving money behind on every claim.` });
        else if (collection < 96) insights.push({ level:"improve", text:`Net collection rate ${collection}% is close. Top practices hit 97%+.` });
        else insights.push({ level:"good", text:`Net collection rate ${collection}% is excellent.` });
        insightsList.innerHTML = insights.map(i => `<div class="hs-insight-item"><span class="hs-badge ${i.level}">${i.level === "critical" ? "Critical" : i.level === "improve" ? "Improve" : "Good"}</span><span>${i.text}</span></div>`).join("");
      }
      /* Output labels for ranges */
      hsTool.querySelectorAll("input[type=range]").forEach((inp) => {
        const out = hsTool.querySelector(`#hs-out-${inp.id.replace("hs-","")}`);
        if (out) {
          if (inp.id === "hs-denial") out.textContent = inp.value + "%";
          else if (inp.id === "hs-days") out.textContent = inp.value + " days";
          else if (inp.id === "hs-collection") out.textContent = inp.value + "%";
        }
      });
    };
    inputs.forEach((i) => i.addEventListener("input", calcScore));
    calcScore();
  }

  /* ── Denial Risk Predictor ────────────────────── */
  const dpTool = document.querySelector("[data-denial-predictor]");
  if (dpTool) {
    const denialDB = {
      "cardiology":[ { name:"Medical necessity not met", base:18 }, { name:"Missing auth / prior auth", base:22 }, { name:"Incorrect coding (CPT/ICD mismatch)", base:15 }, { name:"Duplicate claim", base:8 }, { name:"Timely filing exceeded", base:6 } ],
      "ortho":[ { name:"Missing prior auth (surgery)", base:26 }, { name:"Medical necessity not met", base:20 }, { name:"Bundling / unbundling error", base:16 }, { name:"Wrong modifier", base:12 }, { name:"Coordination of benefits", base:7 } ],
      "behavioral":[ { name:"No prior auth / session limit exceeded", base:28 }, { name:"Place of service mismatch", base:14 }, { name:"Medical necessity", base:18 }, { name:"NPI / credentialing issue", base:11 }, { name:"Duplicate date of service", base:7 } ],
      "urgent":[ { name:"Out-of-network denial", base:20 }, { name:"Missing modifier (ER vs. urgent)", base:16 }, { name:"Duplicate billing", base:12 }, { name:"Patient eligibility issue", base:18 }, { name:"Timely filing", base:9 } ],
      "default":[ { name:"Eligibility / coverage issue", base:18 }, { name:"Missing or invalid prior auth", base:20 }, { name:"Medical necessity not documented", base:16 }, { name:"Incorrect or mismatched codes", base:14 }, { name:"Timely filing exceeded", base:8 } ]
    };
    const renderRisks = () => {
      const specialty = dpTool.querySelector("#dp-specialty")?.value || "default";
      const ehr = dpTool.querySelector("#dp-ehr")?.value;
      const list = denialDB[specialty] || denialDB["default"];
      /* Adjust for EHR issues */
      const adjusted = list.map((item, i) => ({
        ...item,
        pct: Math.min(35, item.base + (ehr === "paper" ? 5 : ehr === "old" ? 3 : 0) + (i === 0 ? 0 : 0))
      })).sort((a,b) => b.pct - a.pct);
      const container = dpTool.querySelector(".dp-risk-list");
      if (!container) return;
      container.innerHTML = adjusted.map(r => {
        const lvl = r.pct >= 22 ? "risk-high" : r.pct >= 14 ? "risk-med" : "risk-low";
        const label = r.pct >= 22 ? "High" : r.pct >= 14 ? "Med" : "Low";
        return `<div class="denial-risk-bar"><span class="risk-level ${lvl}">${label}</span><div style="flex:1"><div class="risk-name">${r.name}</div><div class="risk-pct">Approx. ${r.pct}% of your denials</div><div class="risk-bar-track"><div class="risk-bar-fill" style="width:${r.pct * 2.8}%"></div></div></div></div>`;
      }).join("");
    };
    dpTool.querySelectorAll("select").forEach((s) => s.addEventListener("change", renderRisks));
    renderRisks();
  }

  /* ── Specialty filter ─────────────────────────── */
  document.querySelectorAll(".spec-filter-wrap").forEach((wrap) => {
    const buttons = wrap.querySelectorAll(".spec-filter-btn");
    const parent = wrap.closest("section") || wrap.closest(".container") || document;
    const cards = parent.querySelectorAll(".spec-card[data-category]");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const filter = btn.dataset.filter;
        cards.forEach((card) => {
          const match = filter === "all" || card.dataset.category === filter;
          card.classList.toggle("hidden", !match);
        });
      });
    });
  });

  /* ── Forms ────────────────────────────────────── */
  document.querySelectorAll("form[data-demo-form]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      const success = form.parentElement.querySelector(".form-success");
      form.style.display = "none";
      if (success) success.classList.add("show");
    });
  });

  /* ── Multi-step form ──────────────────────────── */
  document.querySelectorAll("[data-multistep]").forEach((mf) => {
    const steps = mf.querySelectorAll("[data-step]");
    const dots = mf.querySelectorAll(".step-item");
    const nextBtns = mf.querySelectorAll("[data-next]");
    const prevBtns = mf.querySelectorAll("[data-prev]");
    let current = 0;
    const show = (idx) => {
      steps.forEach((s, i) => s.style.display = i === idx ? "block" : "none");
      dots.forEach((d, i) => {
        d.classList.toggle("active", i === idx);
        d.classList.toggle("done", i < idx);
      });
      current = idx;
    };
    show(0);
    nextBtns.forEach((btn) => btn.addEventListener("click", () => { if (current < steps.length - 1) show(current + 1); }));
    prevBtns.forEach((btn) => btn.addEventListener("click", () => { if (current > 0) show(current - 1); }));
  });

  /* ── Typewriter effect ────────────────────────── */
  document.querySelectorAll("[data-typewriter]").forEach((el) => {
    const phrases = (el.dataset.typewriter || "").split("|");
    if (phrases.length < 2) return;
    let pi = 0, ci = 0, deleting = false;
    const cursor = document.createElement("span");
    cursor.className = "type-cursor";
    el.appendChild(cursor);
    const tick = () => {
      const phrase = phrases[pi];
      if (!deleting && ci < phrase.length) {
        el.textContent = phrase.slice(0, ci + 1);
        el.appendChild(cursor);
        ci++;
        setTimeout(tick, 72 + Math.random() * 40);
      } else if (!deleting) {
        deleting = true;
        setTimeout(tick, 1800);
      } else if (deleting && ci > 0) {
        el.textContent = phrase.slice(0, ci - 1);
        el.appendChild(cursor);
        ci--;
        setTimeout(tick, 38);
      } else {
        deleting = false;
        pi = (pi + 1) % phrases.length;
        setTimeout(tick, 400);
      }
    };
    tick();
  });

  /* ── FAQ accordion ───────────────────────────── */
  document.querySelectorAll(".faq-q").forEach((btn) => {
    btn.addEventListener("click", () => {
      const expanded = btn.getAttribute("aria-expanded") === "true";
      // Collapse all in same group
      const group = btn.closest(".faq-group") || btn.closest(".faq-content");
      if (group) group.querySelectorAll(".faq-q").forEach((b) => {
        b.setAttribute("aria-expanded", "false");
        const a = b.nextElementSibling;
        if (a) a.classList.remove("open");
      });
      if (!expanded) {
        btn.setAttribute("aria-expanded", "true");
        const answer = btn.nextElementSibling;
        if (answer) answer.classList.add("open");
      }
    });
  });

  /* ── Blog/specialties filter on same page ─────── */
  document.querySelectorAll(".spec-filter-btn[data-filter]").forEach((btn) => {
    if (btn.closest(".spec-filter-wrap")) return; // handled separately
    btn.addEventListener("click", () => {
      const wrap = btn.closest("[class]");
      const allBtns = wrap ? wrap.querySelectorAll(".spec-filter-btn") : [];
      allBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.dataset.filter;
      const section = btn.closest("section") || document;
      section.querySelectorAll("[data-category]").forEach((card) => {
        const match = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("hidden", !match);
      });
    });
  });

  /* ── Footer year ──────────────────────────────── */
  document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* ── Back to top ──────────────────────────────── */
  const backTop = document.querySelector(".back-top");
  if (backTop) backTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ── Hero parallax (subtle) ───────────────────── */
  const heroBg = document.querySelector(".hero-bg");
  if (heroBg) {
    document.addEventListener("mousemove", (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 12;
      const y = (e.clientY / window.innerHeight - 0.5) * 8;
      heroBg.style.transform = `translate(${x}px,${y}px)`;
    }, { passive: true });
  }

})();
