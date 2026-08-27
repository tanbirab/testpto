/* ============================================================
   TUTORIA — shared site logic
   ============================================================ */

/* ---------- 1. EDIT THESE ---------- */
const TUTORIA_CONFIG = {
  // Replace with the real WhatsApp business number, country code first, no + or spaces.
  whatsappNumber: "919999999999",
  whatsappDefaultMessage: "Hi Tutoria, I'd like to book a free demo class.",
  adminPassword: "tutoria2026" // change this before you go live — see note in the panel.
};

const DEFAULT_TESTIMONIALS = [
  {
    name: "Sohini Banerjee",
    meta: "Parent of Class 9 (ICSE), Salt Lake",
    quote: "Our tutor understood exactly where my son was struggling in Maths. Three months in, his confidence before exams has completely changed."
  },
  {
    name: "Aritra Chowdhury",
    meta: "Student, Class 12 (WBCHSE), Jadavpur",
    quote: "My Physics and Maths tutor through Tutoria actually explains concepts instead of rushing through the syllabus. I finally look forward to boards prep instead of dreading it."
  },
  {
    name: "Debolina Ghosh",
    meta: "Tutor, Maths & Science, Behala",
    quote: "I signed up expecting a slow trickle of leads, but Tutoria matched me with students that genuinely fit my subjects and area within days — and the payments have always been on time."
  }
];

/* ---------- 2. storage helpers (works inside the Claude preview;
   falls back to this browser only once the site is hosted elsewhere) ---------- */
const TESTIMONIAL_KEY = "tutoria:testimonials";
const PENDING_KEY = "tutoria:pending";

async function loadTestimonials() {
  try {
    if (window.storage) {
      const res = await window.storage.get(TESTIMONIAL_KEY, true);
      if (res && res.value) return JSON.parse(res.value);
      return DEFAULT_TESTIMONIALS;
    }
  } catch (e) { /* key not set yet */ }
  try {
    const local = localStorage.getItem(TESTIMONIAL_KEY);
    if (local) return JSON.parse(local);
  } catch (e) {}
  return DEFAULT_TESTIMONIALS;
}

async function saveTestimonials(list) {
  try {
    if (window.storage) {
      await window.storage.set(TESTIMONIAL_KEY, JSON.stringify(list), true);
      return true;
    }
  } catch (e) { console.error(e); }
  try {
    localStorage.setItem(TESTIMONIAL_KEY, JSON.stringify(list));
    return true;
  } catch (e) { return false; }
}

async function loadPending() {
  try {
    if (window.storage) {
      const res = await window.storage.get(PENDING_KEY, true);
      if (res && res.value) return JSON.parse(res.value);
      return [];
    }
  } catch (e) {}
  try {
    const local = localStorage.getItem(PENDING_KEY);
    if (local) return JSON.parse(local);
  } catch (e) {}
  return [];
}

async function savePending(list) {
  try {
    if (window.storage) { await window.storage.set(PENDING_KEY, JSON.stringify(list), true); return true; }
  } catch (e) {}
  try { localStorage.setItem(PENDING_KEY, JSON.stringify(list)); return true; } catch (e) { return false; }
}

/* ---------- 3. render testimonials on the page ---------- */
function initials(name){
  return name.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase();
}

/* Reusable inline-SVG bits for the testimonial card (mirrors the
   uploaded testimonial_sections.svg: quote badge + 5-star rating). */
const TESTI_STAR_PATH = "M6 0l1.8 3.7 4.1.6-3 2.9.7 4.1L6 9.3 2.4 11.3l.7-4.1-3-2.9 4.1-.6z";
function testiStars(ratingStr){
  const filled = ratingStr ? Math.max(0, Math.min(5, parseInt(ratingStr, 10) || 5)) : 5;
  let out = "";
  for (let i = 0; i < 5; i++){
    out += `<svg class="testi-star${i < filled ? " is-filled" : ""}" viewBox="0 0 12 12" aria-hidden="true"><path d="${TESTI_STAR_PATH}"/></svg>`;
  }
  return out;
}
const TESTI_QUOTE_ICON = `
  <svg class="testi-quote-icon" viewBox="0 0 40 40" aria-hidden="true">
    <circle cx="20" cy="20" r="20" fill="#FBF4E6"/>
    <path d="M14 24h3.5l2-4V14h-5.5v6H16l-2 4zm7 0h3.5l2-4V14h-5.5v6H23l-2 4z" fill="#F2994A"/>
  </svg>`;

async function renderTestimonials() {
  const track = document.getElementById("testiTrack");
  if (!track) return;
  const list = await loadTestimonials();
  if (!list.length) {
    track.innerHTML = '<p class="testi-empty">No testimonials yet.</p>';
    return;
  }
  track.innerHTML = list.map((t, i) => `
    <div class="testi-card">
      <div class="testi-card-top">
        ${TESTI_QUOTE_ICON}
        <div class="testi-stars">${testiStars(t.rating)}</div>
      </div>
      <p class="testi-quote">${t.quote}</p>
      <div class="testi-foot">
        <div class="testi-avatar testi-avatar--${(i % 3) + 1}">${initials(t.name)}</div>
        <div>
          <div class="testi-name">${t.name}</div>
          <div class="testi-meta">${t.meta}</div>
        </div>
      </div>
    </div>
  `).join("");
}

/* ---------- 4. admin panel ---------- */
function setupAdmin() {
  const fab = document.getElementById("adminFab");
  const overlay = document.getElementById("adminOverlay");
  if (!fab || !overlay) return;

  const closeBtn = document.getElementById("adminClose");
  const loginView = document.getElementById("adminLogin");
  const panelView = document.getElementById("adminPanelBody");
  const pwInput = document.getElementById("adminPw");
  const pwSubmit = document.getElementById("adminPwSubmit");
  const pwError = document.getElementById("adminPwError");
  const list = document.getElementById("adminList");
  const status = document.getElementById("adminStatus");
  const pendingList = document.getElementById("adminPendingList");

  const nameInput = document.getElementById("tName");
  const metaInput = document.getElementById("tMeta");
  const quoteInput = document.getElementById("tQuote");
  const addBtn = document.getElementById("tAdd");

  fab.addEventListener("click", () => {
    overlay.classList.add("open");
    loginView.style.display = "block";
    panelView.style.display = "none";
  });
  closeBtn.addEventListener("click", () => overlay.classList.remove("open"));
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.classList.remove("open"); });

  async function renderAdminList() {
    const items = await loadTestimonials();
    list.innerHTML = items.map((t, i) => `
      <div class="admin-list-item">
        <div class="txt"><b>${t.name}</b> — ${t.meta}<br>${t.quote}</div>
        <button data-i="${i}">Remove</button>
      </div>
    `).join("") || '<p class="testi-empty">No testimonials yet — add one below.</p>';

    list.querySelectorAll("button[data-i]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const items = await loadTestimonials();
        items.splice(Number(btn.dataset.i), 1);
        await saveTestimonials(items);
        await renderAdminList();
        await renderTestimonials();
        status.textContent = "Removed. Live on the site now.";
      });
    });
  }

  async function renderPendingList() {
    if (!pendingList) return;
    const items = await loadPending();
    pendingList.innerHTML = items.map((t, i) => `
      <div class="admin-list-item">
        <div class="txt"><b>${t.name}</b> — ${t.meta}<br>${t.quote}</div>
        <div style="display:flex; flex-direction:column; gap:6px;">
          <button data-approve="${i}" style="color:var(--green-700);">Approve</button>
          <button data-reject="${i}">Reject</button>
        </div>
      </div>
    `).join("") || '<p class="testi-empty">No pending reviews.</p>';

    pendingList.querySelectorAll("[data-approve]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const pend = await loadPending();
        const [item] = pend.splice(Number(btn.dataset.approve), 1);
        await savePending(pend);
        const live = await loadTestimonials();
        live.unshift(item);
        await saveTestimonials(live);
        await renderPendingList();
        await renderAdminList();
        await renderTestimonials();
        status.textContent = "Approved. Now live on the site.";
      });
    });
    pendingList.querySelectorAll("[data-reject]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const pend = await loadPending();
        pend.splice(Number(btn.dataset.reject), 1);
        await savePending(pend);
        await renderPendingList();
        status.textContent = "Rejected.";
      });
    });
  }

  pwSubmit.addEventListener("click", async () => {
    if (pwInput.value === TUTORIA_CONFIG.adminPassword) {
      pwError.style.display = "none";
      loginView.style.display = "none";
      panelView.style.display = "block";
      await renderAdminList();
      await renderPendingList();
    } else {
      pwError.style.display = "block";
    }
  });

  addBtn.addEventListener("click", async () => {
    if (!nameInput.value || !quoteInput.value) return;
    const items = await loadTestimonials();
    items.unshift({ name: nameInput.value, meta: metaInput.value || "", quote: quoteInput.value });
    await saveTestimonials(items);
    nameInput.value = ""; metaInput.value = ""; quoteInput.value = "";
    await renderAdminList();
    await renderTestimonials();
    status.textContent = "Added. Live on the site now.";
  });
}

/* ---------- 5. nav toggle, FAQ accordion, whatsapp links, year ---------- */
function setupNav() {
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("mainNav");
  if (!toggle || !nav) return;
  function setOpen(isOpen) {
    nav.classList.toggle("open", isOpen);
    toggle.classList.toggle("open", isOpen);
    document.body.classList.toggle("nav-open", isOpen);
  }
  toggle.addEventListener("click", () => setOpen(!nav.classList.contains("open")));
  nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setOpen(false)));
}

/* ---------- scroll reveal: fade + blur elements up as they enter view ---------- */
function setupReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!els.length) return;
  if (!("IntersectionObserver" in window)) {
    els.forEach(el => el.classList.add("in-view"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
  els.forEach(el => io.observe(el));
}

function setupHeaderScroll() {
  const header = document.querySelector(".site-header");
  const nav = document.getElementById("mainNav");
  if (!header) return;

  let lastY = window.scrollY;
  let ticking = false;
  const threshold = 6;     // ignore tiny scroll jitters
  const revealZone = 80;   // always show header near the very top

  function onScroll() {
    const currentY = window.scrollY;
    const diff = currentY - lastY;

    // don't hide the header while the mobile menu is open
    const menuOpen = nav && nav.classList.contains("open");

    if (currentY <= revealZone || menuOpen) {
      header.classList.remove("header-hidden");
    } else if (diff > threshold) {
      // scrolling down
      header.classList.add("header-hidden");
    } else if (diff < -threshold) {
      // scrolling up
      header.classList.remove("header-hidden");
    }

    lastY = currentY;
    ticking = false;
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
}

function setupFaq() {
  document.querySelectorAll(".faq-item").forEach(item => {
    const q = item.querySelector(".faq-q");
    const a = item.querySelector(".faq-a");
    q.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item").forEach(i => { i.classList.remove("open"); i.querySelector(".faq-a").style.maxHeight = null; });
      if (!isOpen) { item.classList.add("open"); a.style.maxHeight = a.scrollHeight + "px"; }
    });
  });
}

function buildWaLink(message) {
  const msg = encodeURIComponent(message || TUTORIA_CONFIG.whatsappDefaultMessage);
  return `https://wa.me/${TUTORIA_CONFIG.whatsappNumber}?text=${msg}`;
}

function setupWhatsapp() {
  document.querySelectorAll("[data-wa]").forEach(el => {
    const msg = el.getAttribute("data-wa-msg");
    el.setAttribute("href", buildWaLink(msg));
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener");
  });
}

function setupYear() {
  document.querySelectorAll(".js-year").forEach(el => el.textContent = new Date().getFullYear());
}

/* ---------- 6. tutor application form -> WhatsApp ---------- */
function setupTutorForm() {
  const form = document.getElementById("tutorForm");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form).entries());
    const msg =
`New tutor application — Tutoria
Name: ${d.name}
Phone: ${d.phone}
Area: ${d.area}
Subjects: ${d.subjects}
Grades: ${d.grades}
Qualification: ${d.qualification}
Experience: ${d.experience} years
Notes: ${d.notes || "-"}`;
    window.open(buildWaLink(msg), "_blank");
  });
}

/* ---------- 7. review/feedback form -> pending queue for admin approval ---------- */
function setupReviewForm() {
  const form = document.getElementById("reviewForm");
  if (!form) return;
  const confirmBox = document.getElementById("reviewConfirm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form).entries());
    const meta = `${d.role || "Parent"}${d.class ? ", " + d.class : ""}${d.area ? ", " + d.area : ""}`;
    const pending = await loadPending();
    pending.unshift({ name: d.name, meta, quote: d.feedback, rating: d.rating || "" });
    await savePending(pending);
    form.style.display = "none";
    confirmBox.style.display = "block";
  });
}

/* ---------- 7b. terms & conditions popup (apply page) ---------- */
function setupTermsModal() {
  const openBtn = document.getElementById("openTerms");
  const overlay = document.getElementById("termsOverlay");
  if (!openBtn || !overlay) return;
  const closeBtn = document.getElementById("closeTerms");

  function open() { overlay.classList.add("open"); }
  function close() { overlay.classList.remove("open"); }

  openBtn.addEventListener("click", open);
  closeBtn.addEventListener("click", close);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("open")) close();
  });
}

/* ---------- 8. contact form -> WhatsApp ---------- */
function setupContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form).entries());
    const msg =
`New enquiry — Tutoria
Name: ${d.name}
Phone: ${d.phone}
I'm a: ${d.subject}
Message: ${d.message || "-"}`;
    window.open(buildWaLink(msg), "_blank");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupNav();
  setupHeaderScroll();
  setupFaq();
  setupWhatsapp();
  setupYear();
  setupAdmin();
  setupTutorForm();
  setupTermsModal();
  setupReviewForm();
  setupContactForm();
  setupReveal();
  renderTestimonials();
});
