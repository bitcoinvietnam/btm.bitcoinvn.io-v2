/* ========================================
   BitcoinVN BTM — Main JavaScript
   ======================================== */

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initScrollAnimations();
  initFAQ();
  initProcessTabs();
  initMap();
  initLocationDetailMap();
  initWireframeTilt();
  initCurrencyFlow();
  initLocationStatus();
  initGalleryLightbox();
  initLocaleSwitcher();
  initHostCarousel();
  initFunctionKeys();
  initCoinRotator();
});

/* ======== Hero coin name rotator (pixelate transition) ======== */
function initCoinRotator() {
  const el = document.querySelector(".coin-rotator");
  if (!el) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const svgMarkup =
    '<svg width="0" height="0" aria-hidden="true" style="position:absolute;left:0;top:0;pointer-events:none">' +
    '<defs>' +
    [2, 4, 7]
      .map(
        (n) =>
          `<filter id="pix-${n}" x="0" y="0" width="100%" height="100%">` +
          `<feFlood x="${n}" y="${n}" width="${n}" height="${n}"/>` +
          `<feComposite width="${n * 2}" height="${n * 2}"/>` +
          `<feTile result="a"/>` +
          `<feComposite in="SourceGraphic" in2="a" operator="in"/>` +
          `<feMorphology operator="dilate" radius="${n}"/>` +
          `</filter>`,
      )
      .join("") +
    "</defs></svg>";
  document.body.insertAdjacentHTML("afterbegin", svgMarkup);

  const primary = el.textContent;
  const cycle = [primary, "USDT", "USDC"];

  const measure = document.createElement("span");
  measure.style.cssText =
    "position:absolute;visibility:hidden;white-space:nowrap;pointer-events:none";
  measure.className = el.className.replace("coin-rotator", "").trim();
  el.parentElement.appendChild(measure);
  let maxWidth = 0;
  for (const c of cycle) {
    measure.textContent = c;
    maxWidth = Math.max(maxWidth, measure.getBoundingClientRect().width);
  }
  measure.remove();
  el.style.minWidth = `${Math.ceil(maxWidth)}px`;

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  let i = 0;

  async function cycleOnce() {
    el.classList.add("pix-2");
    await wait(70);
    el.classList.replace("pix-2", "pix-4");
    await wait(70);
    el.classList.replace("pix-4", "pix-7");
    await wait(110);
    i = (i + 1) % cycle.length;
    el.textContent = cycle[i];
    await wait(130);
    el.classList.replace("pix-7", "pix-4");
    await wait(70);
    el.classList.replace("pix-4", "pix-2");
    await wait(70);
    el.classList.remove("pix-2");
  }

  let timer = setInterval(cycleOnce, 3200);
  document.addEventListener("visibilitychange", () => {
    clearInterval(timer);
    if (!document.hidden) timer = setInterval(cycleOnce, 3200);
  });
}

/* ======== F-key shortcuts ======== */
function initFunctionKeys() {
  const map = {};
  document.querySelectorAll("[data-key]").forEach((el) => {
    const key = el.dataset.key;
    if (key && !map[key]) map[key] = el;
  });
  if (!Object.keys(map).length) return;

  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const target = map[e.key];
    if (!target) return;
    e.preventDefault();
    target.classList.add("key-flash");
    setTimeout(() => target.classList.remove("key-flash"), 180);
    target.click();
  });
}

/* ======== Navigation ======== */
function initNav() {
  const nav = document.getElementById("nav");
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");

  // Scroll effect
  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 50);
  });

  // Mobile toggle
  toggle.addEventListener("click", () => {
    toggle.classList.toggle("active");
    links.classList.toggle("open");
  });

  // Close on link click
  links.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      toggle.classList.remove("active");
      links.classList.remove("open");
    });
  });
}

/* ======== Scroll Animations ======== */
function initScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger the animation for siblings
          const parent = entry.target.parentElement;
          const siblings = parent.querySelectorAll("[data-animate]");
          const index = Array.from(siblings).indexOf(entry.target);
          const delay = index * 80;

          setTimeout(() => {
            entry.target.classList.add("visible");
          }, delay);

          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  );

  document.querySelectorAll("[data-animate]").forEach((el) => {
    observer.observe(el);
  });
}

/* ======== FAQ Accordion ======== */
function initFAQ() {
  document.querySelectorAll(".faq-question").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.parentElement;
      const isActive = item.classList.contains("active");

      // Close all
      document.querySelectorAll(".faq-item.active").forEach((active) => {
        active.classList.remove("active");
      });

      // Toggle current
      if (!isActive) {
        item.classList.add("active");
      }
    });
  });
}

/* ======== Process Tabs ======== */
function initProcessTabs() {
  document.querySelectorAll(".process-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;

      // Update tabs
      document.querySelectorAll(".process-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      // Update content
      document.querySelectorAll(".process-content").forEach((c) => c.classList.remove("active"));
      document.getElementById(target).classList.add("active");

      // Re-animate steps
      const steps = document.querySelectorAll(`#${target} .step`);
      steps.forEach((step, i) => {
        step.classList.remove("visible");
        setTimeout(() => step.classList.add("visible"), i * 100);
      });
    });
  });
}

/* ======== Leaflet Map ======== */
function makeBtmMarkerIcon(isOpen) {
  return L.divIcon({
    className: isOpen ? "btm-marker is-open" : "btm-marker is-closed",
    html: `<div class="btm-marker-inner"><span class="btm-marker-glyph">₿</span></div>`,
    iconSize: [24, 30],
    iconAnchor: [12, 28],
    popupAnchor: [0, -28],
  });
}

function initMap() {
  if (typeof L === "undefined" || !window.BTM_LOCATIONS) return;

  const data = window.BTM_LOCATIONS;

  const mapEl = document.getElementById("btm-map-all");
  if (!mapEl) return;

  const allMarkerRefs = [];
  const markerBySlug = new Map();
  const cardBySlug = new Map();
  document.querySelectorAll(".location-card[data-slug]").forEach((card) => {
    cardBySlug.set(card.dataset.slug, card);
  });

  const map = L.map(mapEl, {
    zoomControl: true,
    scrollWheelZoom: false,
  });

  L.tileLayer(data.map.tileStyle, {
    attribution: data.map.attribution,
    maxZoom: 18,
  }).addTo(map);

  const allMarkers = [];
  data.regions.forEach((region) => {
    region.machines.forEach((machine) => {
      const h = machine.hours;
      const daysStr = h.days.join(",");
      const isOpen = checkIfOpen(daysStr, h.open, h.close, h.timezone);
      const openLabel = window.BTM_UI?.open ?? "Open now";
      const closedLabel = window.BTM_UI?.closed ?? "Closed";
      const statusLabel = isOpen ? openLabel : closedLabel;

      const marker = L.marker([machine.lat, machine.lng], {
        icon: makeBtmMarkerIcon(isOpen),
      })
        .addTo(map)
        .bindPopup(
          `<strong>${machine.name}</strong><br><small>${machine.district}, ${region.name}</small><br><small>${statusLabel} · ${window.BTM_HOURS_I18N?.[machine.slug] ?? h.display}</small>`
        );

      marker.on("click", () => {
        const card = cardBySlug.get(machine.slug);
        if (!card) return;
        document.querySelectorAll(".location-card.active").forEach((c) => c.classList.remove("active"));
        card.classList.add("active");
        card.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => card.classList.remove("active"), 2400);
      });

      allMarkers.push(marker);
      allMarkerRefs.push({ marker, hours: h, daysStr, lastOpen: isOpen });
      markerBySlug.set(machine.slug, marker);
    });
  });

  let homeBounds = null;
  if (allMarkers.length > 0) {
    homeBounds = L.featureGroup(allMarkers).getBounds().pad(0.15);
    if (allMarkers.length === 1) {
      map.setView(allMarkers[0].getLatLng(), 14);
    } else {
      map.fitBounds(homeBounds);
    }
  }

  map.on("click", () => {
    map.scrollWheelZoom.enable();
  });

  let hoverTimer = null;
  let leaveTimer = null;
  const flyToMarker = (marker) => {
    map.flyTo(marker.getLatLng(), 13, { duration: 0.8, easeLinearity: 0.25 });
  };
  const flyHome = () => {
    if (homeBounds) map.flyToBounds(homeBounds, { duration: 0.8, easeLinearity: 0.25 });
  };

  cardBySlug.forEach((card, slug) => {
    const marker = markerBySlug.get(slug);
    if (!marker) return;
    card.addEventListener("mouseenter", () => {
      clearTimeout(leaveTimer);
      clearTimeout(hoverTimer);
      const el = marker.getElement();
      if (el) {
        el.classList.add("is-highlighted");
        marker.setZIndexOffset(1000);
      }
      hoverTimer = setTimeout(() => flyToMarker(marker), 140);
    });
    card.addEventListener("mouseleave", () => {
      clearTimeout(hoverTimer);
      const el = marker.getElement();
      if (el) {
        el.classList.remove("is-highlighted");
        marker.setZIndexOffset(0);
      }
    });
  });

  const listEl = document.querySelector(".locations-list");
  if (listEl) {
    listEl.addEventListener("mouseleave", () => {
      clearTimeout(hoverTimer);
      leaveTimer = setTimeout(flyHome, 240);
    });
    listEl.addEventListener("mouseenter", () => {
      clearTimeout(leaveTimer);
    });
  }

  setInterval(() => {
    allMarkerRefs.forEach((ref) => {
      const { marker, hours: h, daysStr } = ref;
      const isOpen = checkIfOpen(daysStr, h.open, h.close, h.timezone);
      if (isOpen === ref.lastOpen) return;
      ref.lastOpen = isOpen;
      marker.setIcon(makeBtmMarkerIcon(isOpen));
    });
  }, 60 * 1000);
}

/* ======== Location Detail Map ======== */
function initLocationDetailMap() {
  const mapEl = document.getElementById("location-detail-map");
  if (!mapEl || typeof L === "undefined") return;

  const lat = parseFloat(mapEl.dataset.lat);
  const lng = parseFloat(mapEl.dataset.lng);
  const name = mapEl.dataset.name || "";
  const district = mapEl.dataset.district || "";

  if (!lat || !lng) return;

  const map = L.map("location-detail-map", {
    center: [lat, lng],
    zoom: 16,
    zoomControl: true,
    scrollWheelZoom: false,
  });

  L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18,
  }).addTo(map);

  L.marker([lat, lng], { icon: makeBtmMarkerIcon(true) })
    .addTo(map)
    .bindPopup(`<strong>${name}</strong><br><small>${district}</small>`)
    .openPopup();

  map.on("click", () => {
    map.scrollWheelZoom.enable();
  });
}

/* ======== Wireframe Tilt ======== */
let _btmRect = null;
function getBtmRect() {
  if (_btmRect) return _btmRect;
  const btm = document.querySelector(".wireframe-btm");
  if (!btm) return null;
  _btmRect = btm.getBoundingClientRect();
  return _btmRect;
}
window.addEventListener("resize", () => { _btmRect = null; }, { passive: true });
window.addEventListener("scroll", () => { _btmRect = null; }, { passive: true });

function initWireframeTilt() {
  const btm = document.querySelector(".wireframe-btm");
  if (!btm || window.innerWidth < 768) return;

  let mouseX = 0;
  let mouseY = 0;
  let currentX = 0;
  let currentY = 0;

  let driftX = 0;
  let driftY = 0;
  let driftTargetX = 0;
  let driftTargetY = 0;
  let driftTimer = 0;

  const MAX_TILT = 14;
  const BASE_TILT_X = 0;
  const BASE_TILT_Y = 0;
  const EASE = 0.06;
  const DRIFT_RANGE = 3;
  const DRIFT_EASE = 0.01;
  const DRIFT_INTERVAL = 3000;

  function pickNewDrift() {
    driftTargetX = (Math.random() - 0.5) * 2 * DRIFT_RANGE;
    driftTargetY = (Math.random() - 0.5) * 2 * DRIFT_RANGE;
  }

  pickNewDrift();

  document.addEventListener("mousemove", (e) => {
    const rect = getBtmRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const range = Math.max(rect.width, 320);
    mouseX = Math.max(-1, Math.min(1, (e.clientX - cx) / range));
    mouseY = Math.max(-1, Math.min(1, (e.clientY - cy) / range));
  });

  function update(timestamp) {
    if (timestamp - driftTimer > DRIFT_INTERVAL) {
      pickNewDrift();
      driftTimer = timestamp;
    }

    driftX += (driftTargetX - driftX) * DRIFT_EASE;
    driftY += (driftTargetY - driftY) * DRIFT_EASE;

    const targetX = BASE_TILT_X + (-mouseY * MAX_TILT) + driftY;
    const targetY = BASE_TILT_Y + (mouseX * MAX_TILT) + driftX;

    currentX += (targetX - currentX) * EASE;
    currentY += (targetY - currentY) * EASE;

    btm.style.transform =
      `rotateX(${currentX}deg) rotateY(${currentY}deg) scale(1.05)`;

    requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

/* ======== Currency Flow (JS-driven) ======== */
function initCurrencyFlow() {
  const scene = document.querySelector(".wireframe-scene");
  if (!scene || window.innerWidth < 768) return;

  const btcEls = scene.querySelectorAll(".wf-stream-btc .wf-particle");
  const cashEls = scene.querySelectorAll(".wf-stream-cash .wf-particle");
  if (!btcEls.length || !cashEls.length) return;

  // Direction: 1 = buy (BTC in from left, cash out to right)
  //           -1 = sell (cash in from right, BTC out to left)
  let targetDir = 1;
  let currentDir = 1;
  const DIR_EASE = 0.025;

  // Ranges: edge-to-edge based on viewport width
  const half = window.innerWidth / 2 + 40;
  const BTC_MIN = -half, BTC_MAX = -30;
  const CASH_MIN = 30, CASH_MAX = half;

  const Y_OFFSETS = [-35, -10, 16, -22, 6];
  const SPEEDS = [0.19, 0.24, 0.17, 0.21, 0.15];

  function makeState(els) {
    return Array.from(els).map((el, i) => ({
      el,
      t: i / els.length,
      y: Y_OFFSETS[i],
      speed: SPEEDS[i],
    }));
  }

  const btcState = makeState(btcEls);
  const cashState = makeState(cashEls);

  document.addEventListener("mousemove", (e) => {
    const rect = getBtmRect();
    if (!rect) return;
    const centerX = rect.left + rect.width / 2;
    const dead = rect.width * 0.1;
    if (e.clientX > centerX + dead) targetDir = -1;
    else if (e.clientX < centerX - dead) targetDir = 1;
  });

  // BTC envelope: t=0 is far left (screen edge), t=1 is near machine
  // Fade at both ends so wrapping is invisible
  function btcEnvelope(t) {
    const fadeIn = Math.min(1, t / 0.15);       // fade in from screen edge
    const fadeOut = Math.min(1, (1 - t) / 0.3); // fade out near machine
    return fadeIn * fadeOut;
  }

  // Cash envelope: t=0 is near machine, t=1 is far right (screen edge)
  // Fade at both ends so wrapping is invisible
  function cashEnvelope(t) {
    const fadeIn = Math.min(1, t / 0.3);        // fade in from machine
    const fadeOut = Math.min(1, (1 - t) / 0.15); // fade out at screen edge
    return fadeIn * fadeOut;
  }

  let lastTime = 0;

  function update(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
    lastTime = timestamp;

    // Smoothly ease direction
    currentDir += (targetDir - currentDir) * DIR_EASE;

    // Update BTC particles (left side, t: 0→1 = far left → near machine)
    btcState.forEach((p) => {
      p.t += p.speed * currentDir * dt;
      if (p.t > 1) p.t -= 1;
      if (p.t < 0) p.t += 1;

      const x = BTC_MIN + p.t * (BTC_MAX - BTC_MIN);
      const env = btcEnvelope(p.t);
      const dist = 1 - p.t; // 1 at far edge, 0 at machine
      const spread = 0.15 + dist * 5;
      const y = p.y * spread;
      const scale = 1 + dist * 1.2;
      const rot = p.t * 200;

      p.el.style.transform =
        `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${scale})`;
      p.el.style.opacity = env * 0.3;
    });

    // Update Cash particles (right side, t: 0→1 = near machine → far right)
    cashState.forEach((p) => {
      p.t += p.speed * currentDir * dt;
      if (p.t > 1) p.t -= 1;
      if (p.t < 0) p.t += 1;

      const x = CASH_MIN + p.t * (CASH_MAX - CASH_MIN);
      const env = cashEnvelope(p.t);
      const dist = p.t; // 0 at machine, 1 at far edge
      const spread = 0.15 + dist * 5;
      const y = p.y * spread;
      const scale = 1 + dist * 1.2;
      const rot = (p.t - 0.5) * -16;

      p.el.style.transform =
        `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${scale})`;
      p.el.style.opacity = env * 0.3;
    });

    requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

/* ======== Open/Closed Helper ======== */
const DAY_MAP = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function checkIfOpen(daysStr, openStr, closeStr, tz) {
  const now = new Date();

  const dayName = now.toLocaleString("en-US", {
    timeZone: tz,
    weekday: "short",
  });
  const openDays = daysStr.split(",");
  const todayOpen = openDays.includes(dayName);

  const localeTime = now.toLocaleString("en-US", {
    timeZone: tz,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });
  const [h, m] = localeTime.split(":").map(Number);
  const nowMinutes = h * 60 + m;

  const [openH, openM] = openStr.split(":").map(Number);
  const [closeH, closeM] = closeStr.split(":").map(Number);
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  if (closeMinutes <= openMinutes) {
    if (nowMinutes >= openMinutes && todayOpen) return true;
    if (nowMinutes < closeMinutes) {
      const jsDay = DAY_MAP[dayName];
      const yesterdayJs = (jsDay + 6) % 7;
      const yesterdayName = Object.keys(DAY_MAP).find(
        (k) => DAY_MAP[k] === yesterdayJs
      );
      return openDays.includes(yesterdayName);
    }
    return false;
  }

  return todayOpen && nowMinutes >= openMinutes && nowMinutes < closeMinutes;
}

/* ======== Location Open/Closed Status (cards) ======== */
function initLocationStatus() {
  const cards = document.querySelectorAll("[data-hours-open]");
  if (!cards.length) return;

  function updateStatuses() {
    cards.forEach((card) => {
      const days = card.dataset.hoursDays;
      const open = card.dataset.hoursOpen;
      const close = card.dataset.hoursClose;
      const tz = card.dataset.hoursTz;
      if (!days || !open || !close || !tz) return;

      const dot = card.querySelector(".location-status-dot");
      const text = card.querySelector(".location-status-text");
      if (!dot || !text) return;

      const isOpen = checkIfOpen(days, open, close, tz);
      dot.classList.toggle("open", isOpen);
      dot.classList.toggle("closed", !isOpen);
      text.classList.toggle("is-open", isOpen);
      text.classList.toggle("is-closed", !isOpen);
      const openLabel = window.BTM_UI?.open ?? "Open now";
      const closedLabel = window.BTM_UI?.closed ?? "Closed";
      text.textContent = isOpen ? openLabel : closedLabel;
    });
  }

  updateStatuses();
  setInterval(updateStatuses, 60 * 1000);
}

/* ======== Locale Switcher Dropdown ======== */
function initLocaleSwitcher() {
  const switcher = document.getElementById("localeSwitcher");
  if (!switcher) return;
  const btn = switcher.querySelector(".locale-switcher-btn");
  const menu = switcher.querySelector(".locale-switcher-menu");

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", String(!open));
    menu.hidden = open;
  });

  document.addEventListener("click", () => {
    btn.setAttribute("aria-expanded", "false");
    menu.hidden = true;
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      btn.setAttribute("aria-expanded", "false");
      menu.hidden = true;
    }
  });
}

/* ======== Gallery Lightbox ======== */
function initGalleryLightbox() {
  const cards = document.querySelectorAll(".location-gallery-card img");
  if (!cards.length) return;

  let overlay = null;

  function open(src, alt) {
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "gallery-lightbox";
      overlay.addEventListener("click", close);
      document.body.appendChild(overlay);
    }
    overlay.innerHTML = `<img src="${src}" alt="${alt || ""}">`;
    // Force reflow so the opacity transition plays
    overlay.offsetHeight;
    overlay.classList.add("active");
  }

  function close() {
    if (overlay) overlay.classList.remove("active");
  }

  cards.forEach((img) => {
    img.addEventListener("click", () => open(img.src, img.alt));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

/* ======== Host Page Carousel ======== */
function initHostCarousel() {
  const carousel = document.getElementById("hostCarousel");
  if (!carousel) return;

  // Respect prefers-reduced-motion
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const track = carousel.querySelector(".host-page-carousel-track");
    if (track) track.style.animation = "none";
  }

  // Lazy-load duplicate slide images when carousel enters viewport
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          carousel.querySelectorAll("img[data-src]").forEach((img) => {
            img.src = img.dataset.src;
            img.removeAttribute("data-src");
          });
          observer.disconnect();
        }
      });
    },
    { rootMargin: "200px" }
  );

  observer.observe(carousel);
}
