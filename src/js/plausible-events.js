/* ========================================
   BitcoinVN BTM — Plausible Events
   ======================================== */

document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link) return;

    const href = link.getAttribute("href") || "";
    const props = {
      href,
      label: link.textContent.trim().replace(/\s+/g, " ").slice(0, 120),
      path: window.location.pathname,
    };

    if (link.classList.contains("directions-btn")) {
      trackPlausible("Directions Click", props);
    }

    if (link.classList.contains("location-card")) {
      trackPlausible("Location Card Click", {
        ...props,
        slug: link.dataset.slug || "",
      });
    }

    if (link.closest(".locale-switcher")) {
      trackPlausible("Locale Switch", props);
    }

    if (href.startsWith("mailto:")) {
      trackPlausible("Email Click", props);
      if (link.closest(".host-page-cta-section")) {
        trackPlausible("Host Inquiry Click", props);
      }
    }

    if (href.includes("t.me/")) {
      trackPlausible("Telegram Click", props);
    }

    if (href.includes("facebook.com/")) {
      trackPlausible("Facebook Click", props);
    }
  });
});

function trackPlausible(name, props = {}) {
  if (typeof window.plausible !== "function") return;
  window.plausible(name, { props });
}
