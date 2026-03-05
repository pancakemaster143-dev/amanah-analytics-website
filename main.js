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

// Supabase config for waitlist (safe on frontend with RLS)
const SUPABASE_URL = "https://kiqrpcojtgosnjjkkrps.supabase.co";
// Use legacy anon key (JWT) for PostgREST
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpcXJwY29qdGdvc25qamtrcnBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1ODc3MjQsImV4cCI6MjA4ODE2MzcyNH0.wE6hROrf5eL-pX6LLF1WMYrn5js10wR-5zQwK7z8xlk";

// Waitlist form: POST directly to Supabase REST
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

    if (messageEl) {
      messageEl.textContent = "";
      messageEl.style.color = "#a7f3d0";
    }

    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/waitlist_signups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
          Prefer: "return=representation",
        },
        body: JSON.stringify([
          {
            email,
            name: name || null,
            segment: segment || null,
            source,
          },
        ]),
      });

      const text = await res.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {};
      }

      if (res.ok) {
        if (messageEl) {
          messageEl.textContent =
            "You're on the list. We'll be in touch inshaAllah.";
          messageEl.style.color = "#a7f3d0";
        }
        waitlistForm.reset();
        return;
      }

      const raw = typeof data === "string" ? data : JSON.stringify(data);
      if (
        raw.includes("23505") ||
        raw.toLowerCase().includes("duplicate") ||
        (Array.isArray(data) &&
          data[0] &&
          typeof data[0].message === "string" &&
          data[0].message.toLowerCase().includes("duplicate"))
      ) {
        if (messageEl) {
          messageEl.textContent = "You're already on the waitlist.";
          messageEl.style.color = "#a7f3d0";
        }
        return;
      }

      if (messageEl) {
        messageEl.textContent =
          "Something went wrong submitting the form. Please try again.";
        messageEl.style.color = "#fca5a5";
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
