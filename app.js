const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

const MOCK_TODAY = [
  { id: "s1", title: "Severance", sub: "یه قسمت جدید برای دو نفره شبانه", poster: "https://picsum.photos/seed/sev/400/600", watchUrl: "https://www.youtube.com/results?search_query=Severance" },
  { id: "s2", title: "The Bear", sub: "تند و پرهیجان", poster: "https://picsum.photos/seed/bear/400/600", watchUrl: "https://www.youtube.com/results?search_query=The+Bear" },
  { id: "s3", title: "Interstellar", sub: "فضایی ولی عاشقونه", poster: "https://picsum.photos/seed/inter/400/600", watchUrl: "https://www.youtube.com/results?search_query=Interstellar" },
  { id: "s4", title: "Arcane", sub: "انیمیشن خفن", poster: "https://picsum.photos/seed/arc/400/600", watchUrl: "https://www.youtube.com/results?search_query=Arcane+trailer" },
  { id: "s5", title: "Mr. Robot", sub: "حس شبانه خاص", poster: "https://picsum.photos/seed/mr/400/600", watchUrl: "https://www.youtube.com/results?search_query=Mr+Robot" },
  { id: "s6", title: "La La Land", sub: "موزیکال برای مود خوب", poster: "https://picsum.photos/seed/lala/400/600", watchUrl: "https://www.youtube.com/results?search_query=La+La+Land" },
];

const STORAGE = {
  watchlist: "watchlist",
  watched: "watched-list",
  theme: "movie-date-theme",
};

function getLocal(key, fallback = []) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch { return fallback; }
}
function setLocal(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

function formatFaDate(d = new Date()) {
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "full" }).format(d);
}
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function setActivePage(name) {
  $$(".page").forEach((p) => p.classList.remove("page--active"));
  $(`#page-${name}`).classList.add("page--active");
  $$(".tab").forEach((p) => p.classList.remove("tab--active"));
  $(`.tab[data-page="${name}"]`).classList.add("tab--active");
}

function cardHTML(item, type = "show") {
  return `<div class="card" data-type="${type}" data-id="${escapeHtml(item.id)}">
    <img class="poster" src="${item.poster}" alt="${escapeHtml(item.title)}" loading="lazy" />
    <div class="card__body">
      <div class="card__title">${escapeHtml(item.title)}</div>
      <div class="card__sub">${escapeHtml(item.sub || "")}</div>
    </div>
  </div>`;
}

function renderToday(list = MOCK_TODAY) {
  const pick = list[0] || MOCK_TODAY[0];
  $("#heroTitle").textContent = pick.title;
  $("#heroMeta").textContent = pick.sub;
  $("#heroWatchBtn").onclick = () => window.open(pick.watchUrl, "_blank");
  $("#heroTrailerBtn").onclick = async () => {
    $("#trailerQuery").value = `${pick.title} trailer`;
    await searchTrailers();
    setActivePage("trailers");
  };

  $("#todayList").innerHTML = list.length
    ? list.map((x) => cardHTML(x, "show")).join("")
    : `<div class="card card--plain"><p>نتیجه‌ای برای این سرچ پیدا نشد 😅</p></div>`;
}

function renderWatchlist() {
  const list = getLocal(STORAGE.watchlist);
  $("#watchlistList").innerHTML = list.length
    ? list.map((x) => cardHTML(x, "watchlist")).join("")
    : `<div class="card card--plain"><p>فعلا چیزی اضافه نکردین، بزن بریم یه عنوان انتخاب کنیم ✨</p></div>`;
}

function renderWatched() {
  const list = getLocal(STORAGE.watched);
  $("#watchedList").innerHTML = list.length
    ? list.map((x) => cardHTML({ ...x, sub: `دیده شده در ${x.watchedAt}` }, "watched")).join("")
    : `<div class="card card--plain"><p>هنوز چیزی به دیده‌شده‌ها اضافه نشده 💘</p></div>`;
}

async function searchTrailers() {
  const q = $("#trailerQuery").value.trim();
  if (!q) return;
  $("#trailerList").innerHTML = `<div class="card card--plain"><p>در حال جستجو…</p></div>`;

  try {
    const res = await fetch(`/api/youtube-search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "YouTube error");

    const items = (data.items || []).map((it) => ({
      id: `yt_${it.id?.videoId}`,
      title: it.snippet?.title || "Video",
      sub: "YouTube Trailer",
      poster: it.snippet?.thumbnails?.high?.url || it.snippet?.thumbnails?.default?.url,
      watchUrl: `https://www.youtube.com/watch?v=${it.id?.videoId}`,
    }));

    $("#trailerList").innerHTML = items.length
      ? items.map((x) => cardHTML(x, "video")).join("")
      : `<div class="card card--plain"><p>چیزی پیدا نشد 🥲</p></div>`;
  } catch {
    $("#trailerList").innerHTML = `<div class="card card--plain"><p>مشکلی پیش اومد، دوباره تست کن.</p></div>`;
  }
}

function openModal(title, html) {
  $("#modalTitle").textContent = title;
  $("#modalBody").innerHTML = html;
  $("#modal").classList.remove("hidden");
}
function closeModal() { $("#modal").classList.add("hidden"); }

function wireEvents() {
  $$(".tab").forEach((btn) => btn.addEventListener("click", () => setActivePage(btn.dataset.page)));

  $("#todayDate").textContent = formatFaDate();
  $("#refreshBtn").addEventListener("click", () => {
    renderToday();
    renderWatchlist();
    renderWatched();
  });

  $("#trailerSearchBtn").addEventListener("click", searchTrailers);
  $("#trailerQuery").addEventListener("keydown", (e) => e.key === "Enter" && searchTrailers());

  $("#globalSearch").addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = MOCK_TODAY.filter((x) => `${x.title} ${x.sub}`.toLowerCase().includes(q));
    renderToday(filtered);
  });

  $("#clearSearchBtn").addEventListener("click", () => {
    $("#globalSearch").value = "";
    renderToday();
  });

  $("#themeToggle").addEventListener("click", () => {
    const next = document.body.dataset.theme === "night" ? "day" : "night";
    document.body.dataset.theme = next;
    localStorage.setItem(STORAGE.theme, next);
  });

  document.body.addEventListener("click", (e) => {
    const t = e.target;
    if (t?.dataset?.action === "closeModal") closeModal();

    const card = t.closest?.(".card");
    if (!card) return;

    const id = card.dataset.id;
    const all = [...MOCK_TODAY, ...getLocal(STORAGE.watchlist), ...getLocal(STORAGE.watched)];
    const found = all.find((x) => x.id === id);
    if (!found) return;

    const inWatchlist = getLocal(STORAGE.watchlist).some((x) => x.id === id);
    openModal(found.title, `
      <div style="display:flex; gap:10px; align-items:flex-start;">
        <img src="${found.poster}" style="width:100px;border-radius:12px;aspect-ratio:2/3;object-fit:cover" />
        <div>
          <div style="color:var(--muted)">${escapeHtml(found.sub || "")}</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">
            <button class="btn" data-action="watchNow" data-id="${escapeHtml(id)}">پخش</button>
            <button class="btn btn--ghost" data-action="toggleWatchlist" data-id="${escapeHtml(id)}">${inWatchlist ? "حذف از لیست" : "افزودن به لیست"}</button>
            <button class="btn btn--ghost" data-action="markWatched" data-id="${escapeHtml(id)}">ثبت به عنوان دیده‌شده</button>
          </div>
        </div>
      </div>
    `);
  });

  document.body.addEventListener("click", (e) => {
    const action = e.target?.dataset?.action;
    const id = e.target?.dataset?.id;
    if (!action || !id) return;

    const source = [...MOCK_TODAY, ...getLocal(STORAGE.watchlist), ...getLocal(STORAGE.watched)];
    const item = source.find((x) => x.id === id);
    if (!item) return;

    if (action === "watchNow") window.open(item.watchUrl, "_blank");

    if (action === "toggleWatchlist") {
      const list = getLocal(STORAGE.watchlist);
      const exists = list.some((x) => x.id === id);
      const next = exists ? list.filter((x) => x.id !== id) : [item, ...list];
      setLocal(STORAGE.watchlist, next);
      renderWatchlist();
      closeModal();
    }

    if (action === "markWatched") {
      const watched = getLocal(STORAGE.watched);
      const exists = watched.some((x) => x.id === id);
      if (!exists) {
        watched.unshift({ ...item, watchedAt: formatFaDate(new Date()) });
        setLocal(STORAGE.watched, watched);
      }
      renderWatched();
      closeModal();
      setActivePage("watched");
    }
  });
}

function escapeHtml(s) {
  return String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

async function boot() {
  const savedTheme = localStorage.getItem(STORAGE.theme);
  if (savedTheme) document.body.dataset.theme = savedTheme;
  await sleep(800);
  $("#splash").classList.add("hidden");
  $("#app").classList.remove("hidden");
  wireEvents();
  renderToday();
  renderWatchlist();
  renderWatched();
}

boot();
