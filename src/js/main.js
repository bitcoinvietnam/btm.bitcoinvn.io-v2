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
});

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
function initMap() {
  const mapEl = document.getElementById("btm-map");
  if (!mapEl || typeof L === "undefined" || !window.BTM_LOCATIONS) return;

  const data = window.BTM_LOCATIONS;
  const centerLat = parseFloat(mapEl.dataset.centerLat) || 10.78;
  const centerLng = parseFloat(mapEl.dataset.centerLng) || 106.7;
  const zoom = parseInt(mapEl.dataset.zoom) || 12;

  const map = L.map("btm-map", {
    center: [centerLat, centerLng],
    zoom: zoom,
    zoomControl: true,
    scrollWheelZoom: false,
  });

  // Dark tile layer
  L.tileLayer(data.map.tileStyle, {
    attribution: data.map.attribution,
    maxZoom: 18,
  }).addTo(map);

  // Custom marker icon
  const markerIcon = L.divIcon({
    className: "btm-marker",
    html: `<div style="
      width: 32px;
      height: 32px;
      background: #FFE26E;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(255, 226, 110, 0.4);
      border: 2px solid rgba(255,255,255,0.3);
    ">
      <span style="
        transform: rotate(45deg);
        font-size: 14px;
        font-weight: bold;
        color: #0f2234;
      ">&#8383;</span>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -34],
  });

  // Add markers for all locations
  const markers = [];
  data.regions.forEach((region) => {
    region.machines.forEach((machine) => {
      const marker = L.marker([machine.lat, machine.lng], { icon: markerIcon })
        .addTo(map)
        .bindPopup(
          `<strong>${machine.name}</strong><br><small>${machine.district}, ${region.name}</small>`
        );
      markers.push(marker);
    });
  });

  // Fit bounds to show all markers
  if (markers.length > 0) {
    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.15));
  }

  // Enable scroll zoom after first click
  map.on("click", () => {
    map.scrollWheelZoom.enable();
  });

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

  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18,
  }).addTo(map);

  const markerIcon = L.divIcon({
    className: "btm-marker",
    html: `<div style="
      width: 32px;
      height: 32px;
      background: #FFE26E;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(255, 226, 110, 0.4);
      border: 2px solid rgba(255,255,255,0.3);
    ">
      <span style="
        transform: rotate(45deg);
        font-size: 14px;
        font-weight: bold;
        color: #0f2234;
      ">&#8383;</span>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -34],
  });

  L.marker([lat, lng], { icon: markerIcon })
    .addTo(map)
    .bindPopup(`<strong>${name}</strong><br><small>${district}</small>`)
    .openPopup();

  map.on("click", () => {
    map.scrollWheelZoom.enable();
  });
}

/* ======== Wireframe Tilt ======== */
function initWireframeTilt() {
  const btm = document.querySelector(".wireframe-btm");
  if (!btm || window.innerWidth < 768) return;

  let mouseX = 0;
  let mouseY = 0;
  let currentX = 0;
  let currentY = 0;

  // Subtle random drift
  let driftX = 0;
  let driftY = 0;
  let driftTargetX = 0;
  let driftTargetY = 0;
  let driftTimer = 0;

  const MAX_TILT = 12;
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
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function update(timestamp) {
    if (timestamp - driftTimer > DRIFT_INTERVAL) {
      pickNewDrift();
      driftTimer = timestamp;
    }

    driftX += (driftTargetX - driftX) * DRIFT_EASE;
    driftY += (driftTargetY - driftY) * DRIFT_EASE;

    const targetX = -mouseY * MAX_TILT + driftY;
    const targetY = mouseX * MAX_TILT + driftX;

    currentX += (targetX - currentX) * EASE;
    currentY += (targetY - currentY) * EASE;

    btm.style.transform =
      `rotateX(${currentX}deg) rotateY(${currentY}deg) scale(1.53)`;

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

  // Mouse tracking with dead zone
  document.addEventListener("mousemove", (e) => {
    const ratio = e.clientX / window.innerWidth;
    if (ratio > 0.55) targetDir = -1;
    else if (ratio < 0.45) targetDir = 1;
  });

  // BTC envelope: t=0 is far left (visible), t=1 is near machine (fade out)
  function btcEnvelope(t) {
    if (t < 0.4) return 1;
    return Math.max(0, (1 - t) / 0.6);
  }

  // Cash envelope: t=0 is near machine (fade out), t=1 is far right (visible)
  function cashEnvelope(t) {
    if (t > 0.6) return 1;
    return Math.max(0, t / 0.6);
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
      const spread = 0.15 + dist * 2.85;
      const y = p.y * spread;
      const scale = 0.4 + dist;
      const rot = p.t * 200;

      p.el.style.transform =
        `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${scale})`;
      p.el.style.opacity = env * 0.5;
    });

    // Update Cash particles (right side, t: 0→1 = near machine → far right)
    cashState.forEach((p) => {
      p.t += p.speed * currentDir * dt;
      if (p.t > 1) p.t -= 1;
      if (p.t < 0) p.t += 1;

      const x = CASH_MIN + p.t * (CASH_MAX - CASH_MIN);
      const env = cashEnvelope(p.t);
      const dist = p.t; // 0 at machine, 1 at far edge
      const spread = 0.15 + dist * 2.85;
      const y = p.y * spread;
      const scale = 0.4 + dist * 0.8;
      const rot = (p.t - 0.5) * -16;

      p.el.style.transform =
        `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${scale})`;
      p.el.style.opacity = env * 0.5;
    });

    requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}
