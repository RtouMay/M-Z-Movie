const $ = (s) => document.querySelector(s);

const BASE_MOVIES = [
  { id: "inception", title: "Inception", year: 2010, genres: "Sci-Fi, Thriller", desc: "سرقت ذهنی چندلایه با موسیقی بی‌نظیر.", images: ["https://image.tmdb.org/t/p/w780/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg", "https://upload.wikimedia.org/wikipedia/en/7/7f/Inception_ver3.jpg"], trailerId: "YoHD9XEInc0", links: { youtube: "https://www.youtube.com/watch?v=YoHD9XEInc0", imdb: "https://www.imdb.com/title/tt1375666/", netflixSearch: "https://www.netflix.com/search?q=Inception" } },
  { id: "interstellar", title: "Interstellar", year: 2014, genres: "Sci-Fi, Drama", desc: "سفر در فضا و زمان با حس عمیق انسانی.", images: ["https://image.tmdb.org/t/p/w780/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", "https://upload.wikimedia.org/wikipedia/en/b/bc/Interstellar_film_poster.jpg"], trailerId: "zSWdZVtXT7E", links: { youtube: "https://www.youtube.com/watch?v=zSWdZVtXT7E", imdb: "https://www.imdb.com/title/tt0816692/", netflixSearch: "https://www.netflix.com/search?q=Interstellar" } },
  { id: "lalaland", title: "La La Land", year: 2016, genres: "Romance, Musical", desc: "رمانتیک و موزیکال برای یه شب دونفره.", images: ["https://image.tmdb.org/t/p/w780/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg", "https://upload.wikimedia.org/wikipedia/en/a/ab/La_La_Land_%28film%29.png"], trailerId: "0pdqf4P9MB8", links: { youtube: "https://www.youtube.com/watch?v=0pdqf4P9MB8", imdb: "https://www.imdb.com/title/tt3783958/", netflixSearch: "https://www.netflix.com/search?q=La%20La%20Land" } },
  { id: "dune", title: "Dune", year: 2021, genres: "Sci-Fi, Adventure", desc: "حماسی، عظیم و کاملاً سینمایی.", images: ["https://image.tmdb.org/t/p/w780/d5NXSklXo0qyIYkgV94XAgMIckC.jpg", "https://upload.wikimedia.org/wikipedia/en/8/8e/Dune_%282021_film%29.jpg"], trailerId: "8g18jFHCLXk", links: { youtube: "https://www.youtube.com/watch?v=8g18jFHCLXk", imdb: "https://www.imdb.com/title/tt1160419/", netflixSearch: "https://www.netflix.com/search?q=Dune" } },
  { id: "parasite", title: "Parasite", year: 2019, genres: "Drama, Thriller", desc: "درام چندلایه با تعلیق قوی.", images: ["https://image.tmdb.org/t/p/w780/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg", "https://upload.wikimedia.org/wikipedia/en/5/53/Parasite_%282019_film%29.png"], trailerId: "SEUXfv87Wpk", links: { youtube: "https://www.youtube.com/watch?v=SEUXfv87Wpk", imdb: "https://www.imdb.com/title/tt6751668/", netflixSearch: "https://www.netflix.com/search?q=Parasite" } },
  { id: "darkknight", title: "The Dark Knight", year: 2008, genres: "Action, Crime", desc: "جوکر و بتمن در اوج هیجان.", images: ["https://image.tmdb.org/t/p/w780/qJ2tW6WMUDux911r6m7haRef0WH.jpg", "https://upload.wikimedia.org/wikipedia/en/8/8a/Dark_Knight.jpg"], trailerId: "EXeTwQWrcwY", links: { youtube: "https://www.youtube.com/watch?v=EXeTwQWrcwY", imdb: "https://www.imdb.com/title/tt0468569/", netflixSearch: "https://www.netflix.com/search?q=The%20Dark%20Knight" } },
];

const BATCH_SIZE = 10;
const LOOP_MULTIPLIER = 120;
const MOVIES = Array.from({ length: LOOP_MULTIPLIER }, (_, i) => {
  const base = BASE_MOVIES[i % BASE_MOVIES.length];
  return { ...base, id: `${base.id}-${i}` };
});

const state = { currentMovie: MOVIES[0], muted: false, filtered: MOVIES, rendered: 0 };

function escapeHtml(v) {
  return String(v).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function resolveImage(movie, imgEl) {
  let idx = 0;
  const tryNext = () => {
    if (idx >= movie.images.length) {
      imgEl.src = "https://picsum.photos/seed/movie-fallback/900/1200";
      return;
    }
    imgEl.src = movie.images[idx++];
  };
  imgEl.onerror = tryNext;
  tryNext();
}

function cardHtml(movie) {
  return `<article class="card" data-id="${movie.id}">
    <img data-poster="${movie.id}" alt="${escapeHtml(movie.title)}" loading="lazy" />
    <div class="card-body"><h4>${escapeHtml(movie.title)} (${movie.year})</h4><p>${escapeHtml(movie.genres)}</p></div>
  </article>`;
}

function renderNextBatch(reset = false) {
  if (reset) {
    state.rendered = 0;
    $("#movieGrid").innerHTML = "";
  }

  const end = Math.min(state.rendered + BATCH_SIZE, state.filtered.length);
  const chunk = state.filtered.slice(state.rendered, end);
  if (!chunk.length && state.rendered === 0) {
    $("#movieGrid").innerHTML = `<div class="card"><div class="card-body"><h4>نتیجه‌ای پیدا نشد</h4></div></div>`;
    $("#resultCount").textContent = "0 فیلم";
    $("#listSentinel").textContent = "موردی برای بارگذاری نیست";
    return;
  }

  $("#movieGrid").insertAdjacentHTML("beforeend", chunk.map(cardHtml).join(""));
  chunk.forEach((m) => {
    const img = document.querySelector(`img[data-poster="${m.id}"]`);
    if (img) resolveImage(m, img);
  });

  state.rendered = end;
  $("#resultCount").textContent = `${state.filtered.length} فیلم`;
  $("#listSentinel").textContent = end >= state.filtered.length ? "به انتهای لیست رسیدی" : "اسکرول کن برای 10 تای بعدی";
}

function playerSrc(movie, muted = false) {
  return `https://www.youtube.com/embed/${movie.trailerId}?autoplay=1&rel=0&modestbranding=1&mute=${muted ? 1 : 0}`;
}

function renderLinks(movie) {
  $("#linkPanel").innerHTML = `
    <a class="link-btn" href="${movie.links.youtube}" target="_blank" rel="noreferrer">YouTube Trailer</a>
    <a class="link-btn" href="${movie.links.imdb}" target="_blank" rel="noreferrer">IMDb</a>
    <a class="link-btn" href="${movie.links.netflixSearch}" target="_blank" rel="noreferrer">Netflix Search</a>
    <a class="link-btn" href="https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + ' scenes')}" target="_blank" rel="noreferrer">YouTube Scenes</a>
    <a class="link-btn" href="https://digimoviez.com/?s=${encodeURIComponent(movie.title)}" target="_blank" rel="noreferrer">DigiMoviez Search</a>
    <a class="link-btn" href="https://www.google.com/search?q=${encodeURIComponent(movie.title + ' where to watch')}" target="_blank" rel="noreferrer">Where to Watch</a>
  `;
  $("#digimoviezSearchLink").href = `https://digimoviez.com/?s=${encodeURIComponent(movie.title)}`;
}

function syncHero(movie) {
  state.currentMovie = movie;
  $("#heroTitle").textContent = `${movie.title} (${movie.year})`;
  $("#heroMeta").textContent = `${movie.genres} • ${movie.desc}`;
  resolveImage(movie, $("#heroImage"));
  renderLinks(movie);
}

function playInside(movie) {
  $("#videoPlayer").src = playerSrc(movie, state.muted);
  $("#playerTitle").textContent = `در حال پخش: ${movie.title}`;
  $("#ytOpenBtn").href = movie.links.youtube;
}

function stopPlayer() {
  $("#videoPlayer").src = "";
  $("#playerTitle").textContent = "پخش متوقف شد";
}

function openModal(title, body) {
  $("#modalTitle").textContent = title;
  $("#modalBody").innerHTML = body;
  $("#modal").classList.remove("hidden");
}

function wireInfiniteScroll() {
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) renderNextBatch();
  }, { rootMargin: "300px 0px" });
  io.observe($("#listSentinel"));
}

function wireEvents() {
  $("#themeToggle").addEventListener("click", () => {
    document.body.dataset.theme = document.body.dataset.theme === "dark" ? "light" : "dark";
  });

  $("#searchInput").addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase();
    state.filtered = MOVIES.filter((m) => `${m.title} ${m.genres} ${m.desc}`.toLowerCase().includes(q));
    renderNextBatch(true);
  });

  $("#clearSearch").addEventListener("click", () => {
    $("#searchInput").value = "";
    state.filtered = MOVIES;
    renderNextBatch(true);
  });

  $("#heroPlay").addEventListener("click", () => playInside(state.currentMovie));
  $("#heroInfo").addEventListener("click", () => {
    const m = state.currentMovie;
    openModal(m.title, `<p>${escapeHtml(m.desc)}</p><p>${escapeHtml(m.genres)} • ${m.year}</p>`);
  });
  $("#muteBtn").addEventListener("click", () => {
    state.muted = !state.muted;
    if ($("#videoPlayer").src) playInside(state.currentMovie);
  });
  $("#stopBtn").addEventListener("click", stopPlayer);

  document.body.addEventListener("click", (e) => {
    if (e.target?.dataset?.close) $("#modal").classList.add("hidden");
    const card = e.target.closest?.(".card");
    if (!card) return;
    const movie = MOVIES.find((m) => m.id === card.dataset.id);
    if (!movie) return;
    syncHero(movie);
    playInside(movie);
  });
}

async function boot() {
  await new Promise((r) => setTimeout(r, 550));
  $("#splash").classList.add("hidden");
  $("#app").classList.remove("hidden");
  syncHero(MOVIES[0]);
  state.filtered = MOVIES;
  renderNextBatch(true);
  wireEvents();
  wireInfiniteScroll();
}

boot();
