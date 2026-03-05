// Smooth scrolling for any element with data-scroll-target (e.g. "See how it works")
document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-scroll-target]");
  if (!target) return;
  const selector = target.getAttribute("data-scroll-target");
  const el = document.querySelector(selector);
  if (!el) return;
  event.preventDefault();
  const offset = 72; // approximate header height
  const rect = el.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  window.scrollTo({
    top: rect.top + scrollTop - offset,
    behavior: "smooth",
  });
});

// Inject current year into footer
const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// Waitlist form: POST to /api/waitlist
const waitlistForm = document.querySelector(".waitlist-form");
if (waitlistForm) {
  const messageEl = waitlistForm.querySelector(".form-message");
  waitlistForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const emailInput = document.querySelector("#email");
    const nameInput = document.querySelector("#name-input");
    const segmentSelect = document.querySelector("#profile");

    const email = emailInput ? emailInput.value.trim() : "";
    const name = nameInput ? nameInput.value.trim() : "";
    const segment = segmentSelect ? segmentSelect.value : "";

    const params = new URLSearchParams(window.location.search);
    const source = params.get("utm_source") || null;

    if (!email) {
      if (messageEl) {
        messageEl.textContent = "Please enter an email.";
        messageEl.style.color = "#fca5a5";
      }
      return;
    }

    if (messageEl) messageEl.textContent = "";
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: name || undefined,
          segment: segment || undefined,
          source,
        }),
      });
      const data = res.ok ? await res.json().catch(() => ({})) : null;
      if (res.ok && data && data.success) {
        if (messageEl) {
          messageEl.textContent = "You're on the list. We'll be in touch.";
          messageEl.style.color = "#a7f3d0";
        }
        waitlistForm.reset();
      } else {
        const err =
          (data && data.error) ||
          (data && data.details) ||
          "Something went wrong. Please try again.";
        if (messageEl) {
          messageEl.textContent = err;
          messageEl.style.color = "#fca5a5";
        }
      }
    } catch (err) {
      if (messageEl) {
        messageEl.textContent =
          "Network error. Please check your connection and try again.";
        messageEl.style.color = "#fca5a5";
      }
    }
  });
}
