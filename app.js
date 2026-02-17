// ---------- Helpers ----------
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function formatFaDate(d = new Date()) {
  try {
    return new Intl.DateTimeFormat("fa-IR", { dateStyle: "full" }).format(d);
  } catch {
    return d.toDateString();
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function setActivePage(name) {
  $$(".page").forEach((p) => p.classList.remove("page--active"));
  $(`#page-${name}`).classList.add("page--active");

  $$(".tab").forEach((t) => t.classList.remove("tab--active"));
  $(`.tab[data-page="${name}"]`).classList.add("tab--active");
}

function openModal(title, html) {
  $("#modalTitle").textContent = title;
  $("#modalBody").innerHTML = html;
  $("#modal").classList.remove("hidden");
}
function closeModal() {
  $("#modal").classList.add("hidden");
}

// ---------- Mock data (فعلاً برای پر شدن UI) ----------
const MOCK_TODAY = [
  { id: "s1", title: "Severance", sub: "S02E05 • New Episode", poster: "https://picsum.photos/seed/sev/400/600", watchUrl: "https://www.youtube.com/results?search_query=Severance" },
  { id: "s2", title: "The Bear", sub: "S03E01 • New Season", poster: "https://picsum.photos/seed/bear/400/600", watchUrl: "https://www.youtube.com/results?search_query=The+Bear" },
  { id: "s3", title: "Dark", sub: "Rewatch pick", poster: "https://picsum.photos/seed/dark/400/600", watchUrl: "https://www.youtube.com/results?search_query=Dark+series" },
  { id: "s4", title: "Arcane", sub: "Best animation", poster: "https://picsum.photos/seed/arc/400/600", watchUrl: "https://www.youtube.com/results?search_query=Arcane+trailer" },
  { id: "s5", title: "Mr. Robot", sub: "Tonight vibe", poster: "https://picsum.photos/seed/mr/400/600", watchUrl: "https://www.youtube.com/results?search_query=Mr+Robot" },
];

function getWatchlist() {
  try { return JSON.parse(localStorage.getItem("watchlist") || "[]"); }
  catch { return []; }
}
function setWatchlist(list) {
  localStorage.setItem("watchlist", JSON.stringify(list));
}

// ---------- Render ----------
function cardHTML(item, type = "show") {
  const safeTitle = escapeHtml(item.title);
  const safeSub = escapeHtml(item.sub || "");
  const poster = item.poster || "https://picsum.photos/seed/empty/400/600";
  return `
    <div class="card" data-type="${type}" data-id="${escapeHtml(item.id)}">
      <img class="poster" src="${poster}" alt="${safeTitle}" loading="lazy" />
      <div class="card__body">
        <div class="card__title">${safeTitle}</div>
        <div class="card__sub">${safeSub}</div>
      </div>
    </div>
  `;
}

function renderToday() {
  // Hero
  const pick = MOCK_TODAY[0];
  $("#heroTitle").textContent = pick.title;
  $("#heroMeta").textContent = pick.sub;

  $("#heroWatchBtn").onclick = () => window.open(pick.watchUrl, "_blank");
  $("#heroTrailerBtn").onclick = async () => {
    $("#trailerQuery").value = `${pick.title} trailer`;
    await searchTrailers();
  };

  // List
  $("#todayList").innerHTML = MOCK_TODAY.map((x) => cardHTML(x, "show")).join("");
}

function renderWatchlist() {
  const list = getWatchlist();
  if (!list.length) {
    $("#watchlistList").innerHTML = `
      <div class="card card--plain">
        <p>هیچی تو Watchlist نیست. از Today یا Trailers چیزی رو اضافه کن ✨</p>
      </div>
    `;
    return;
  }
  $("#watchlistList").innerHTML = list.map((x) => cardHTML(x, "show")).join("");
}

// ---------- YouTube search via Vercel API ----------
async function searchTrailers() {
  const q = $("#trailerQuery").value.trim();
  if (!q) return;

  $("#trailerList").innerHTML = `<div class="card card--plain"><p>در حال جستجو…</p></div>`;

  try {
    const res = await fetch(`/api/youtube-search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "YouTube error");

    const items = (data.items || []).map((it) => {
      const id = it.id?.videoId;
      const title = it.snippet?.title || "Video";
      const thumb = it.snippet?.thumbnails?.high?.url || it.snippet?.thumbnails?.default?.url;
      return {
        id: `yt_${id}`,
        title,
        sub: "YouTube",
        poster: thumb,
        watchUrl: `https://www.youtube.com/watch?v=${id}`,
      };
    });

    if (!items.length) {
      $("#trailerList").innerHTML = `<div class="card card--plain"><p>نتیجه‌ای پیدا نشد.</p></div>`;
      return;
    }

    $("#trailerList").innerHTML = items.map((x) => cardHTML(x, "video")).join("");
  } catch (e) {
    $("#trailerList").innerHTML = `<div class="card card--plain"><p>خطا در جستجو. دوباره امتحان کن.</p></div>`;
  }
}

// ---------- Events ----------
function wireNav() {
  $$(".tab").forEach((btn) => {
    btn.addEventListener("click", () => setActivePage(btn.dataset.page));
  });
}

function wireModal() {
  document.body.addEventListener("click", (e) => {
    const t = e.target;

    // close modal
    if (t?.dataset?.action === "closeModal") closeModal();

    // card click
    const card = t.closest?.(".card");
    if (card) {
      const id = card.dataset.id;
      const type = card.dataset.type;

      // find item in mock/watchlist doesn't matter, build actions
      const all = [...MOCK_TODAY, ...getWatchlist()];
      const found = all.find((x) => x.id === id) || { id, title: "Item", sub: "", poster: "", watchUrl: "" };

      const inWL = getWatchlist().some((x) => x.id === found.id);

      openModal(
        found.title,
        `
          <div style="display:flex; gap:12px; align-items:flex-start;">
            <img src="${found.poster}" style="width:92px; aspect-ratio:2/3; border-radius:14px; border:1px solid rgba(255,255,255,0.10);" />
            <div style="flex:1">
              <div style="color:rgba(255,255,255,0.85); font-weight:900;">${escapeHtml(found.sub || "")}</div>
              <div style="margin-top:8px;">اکشن‌ها:</div>
              <div style="display:flex; gap:10px; margin-top:10px; flex-wrap:wrap;">
                <button class="btn" data-action="watchNow" data-id="${escapeHtml(found.id)}">Watch</button>
                <button class="btn btn--ghost" data-action="toggleWL" data-id="${escapeHtml(found.id)}">
                  ${inWL ? "Remove Watchlist" : "Add Watchlist"}
                </button>
              </div>
            </div>
          </div>
        `
      );
    }

    // modal actions
    if (t?.dataset?.action === "watchNow") {
      const id = t.dataset.id;
      const all = [...MOCK_TODAY, ...getWatchlist()];
      const found = all.find((x) => x.id === id);
      if (found?.watchUrl) window.open(found.watchUrl, "_blank");
    }

    if (t?.dataset?.action === "toggleWL") {
      const id = t.dataset.id;
      const list = getWatchlist();
      const all = [...MOCK_TODAY];
      const found = all.find((x) => x.id === id) || list.find((x) => x.id === id);

      if (!found) return;

      const exists = list.some((x) => x.id === id);
      const next = exists ? list.filter((x) => x.id !== id) : [found, ...list];
      setWatchlist(next);
      renderWatchlist();
      closeModal();
    }
  });
}

function wireActions() {
  $("#todayDate").textContent = formatFaDate(new Date());
  $("#refreshBtn").addEventListener("click", () => {
    // فعلاً فقط رندر مجدد + یه حس سینمایی
    $("#app").style.animation = "none";
    // force reflow
    void $("#app").offsetHeight;
    $("#app").style.animation = "";
    renderToday();
    renderWatchlist();
  });

  $("#trailerSearchBtn").addEventListener("click", searchTrailers);
  $("#trailerQuery").addEventListener("keydown", (e) => {
    if (e.key === "Enter") searchTrailers();
  });
}

// ---------- Security helper ----------
function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ---------- Boot ----------
async function boot() {
  // splash for 900ms
  await sleep(900);
  $("#splash").classList.add("hidden");
  $("#app").classList.remove("hidden");

  wireNav();
  wireModal();
  wireActions();

  renderToday();
  renderWatchlist();
}
boot();
