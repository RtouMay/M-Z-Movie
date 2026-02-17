const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

const MOVIES = [
  {
    id: "inception",
    title: "Inception",
    year: 2010,
    genres: "Sci-Fi, Thriller",
    desc: "یک سرقت ذهنی چندلایه با تیمی حرفه‌ای و موسیقی فوق‌العاده.",
    images: [
      "https://image.tmdb.org/t/p/w780/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
      "https://upload.wikimedia.org/wikipedia/en/7/7f/Inception_ver3.jpg"
    ],
    trailerId: "YoHD9XEInc0",
    links: {
      youtube: "https://www.youtube.com/watch?v=YoHD9XEInc0",
      imdb: "https://www.imdb.com/title/tt1375666/",
      netflixSearch: "https://www.netflix.com/search?q=Inception"
    }
  },
  {
    id: "interstellar",
    title: "Interstellar",
    year: 2014,
    genres: "Sci-Fi, Drama",
    desc: "سفری عمیق در فضا، زمان و عشق.",
    images: [
      "https://image.tmdb.org/t/p/w780/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
      "https://upload.wikimedia.org/wikipedia/en/b/bc/Interstellar_film_poster.jpg"
    ],
    trailerId: "zSWdZVtXT7E",
    links: {
      youtube: "https://www.youtube.com/watch?v=zSWdZVtXT7E",
      imdb: "https://www.imdb.com/title/tt0816692/",
      netflixSearch: "https://www.netflix.com/search?q=Interstellar"
    }
  },
  {
    id: "lalaland",
    title: "La La Land",
    year: 2016,
    genres: "Romance, Musical",
    desc: "داستان عاشقانه با موزیک، نور و رنگ.",
    images: [
      "https://image.tmdb.org/t/p/w780/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg",
      "https://upload.wikimedia.org/wikipedia/en/a/ab/La_La_Land_%28film%29.png"
    ],
    trailerId: "0pdqf4P9MB8",
    links: {
      youtube: "https://www.youtube.com/watch?v=0pdqf4P9MB8",
      imdb: "https://www.imdb.com/title/tt3783958/",
      netflixSearch: "https://www.netflix.com/search?q=La%20La%20Land"
    }
  },
  {
    id: "dune",
    title: "Dune",
    year: 2021,
    genres: "Sci-Fi, Adventure",
    desc: "حماسی، عظیم و تصویری؛ عالی برای تجربه دونفره.",
    images: [
      "https://image.tmdb.org/t/p/w780/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
      "https://upload.wikimedia.org/wikipedia/en/8/8e/Dune_%282021_film%29.jpg"
    ],
    trailerId: "8g18jFHCLXk",
    links: {
      youtube: "https://www.youtube.com/watch?v=8g18jFHCLXk",
      imdb: "https://www.imdb.com/title/tt1160419/",
      netflixSearch: "https://www.netflix.com/search?q=Dune"
    }
  },
  {
    id: "parasite",
    title: "Parasite",
    year: 2019,
    genres: "Drama, Thriller",
    desc: "روایت چندلایه و غافلگیرکننده با کارگردانی بی‌نقص.",
    images: [
      "https://image.tmdb.org/t/p/w780/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
      "https://upload.wikimedia.org/wikipedia/en/5/53/Parasite_%282019_film%29.png"
    ],
    trailerId: "SEUXfv87Wpk",
    links: {
      youtube: "https://www.youtube.com/watch?v=SEUXfv87Wpk",
      imdb: "https://www.imdb.com/title/tt6751668/",
      netflixSearch: "https://www.netflix.com/search?q=Parasite"
    }
  },
  {
    id: "darkknight",
    title: "The Dark Knight",
    year: 2008,
    genres: "Action, Crime",
    desc: "جوکر، بتمن و یکی از بهترین فیلم‌های ابرقهرمانی تاریخ.",
    images: [
      "https://image.tmdb.org/t/p/w780/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
      "https://upload.wikimedia.org/wikipedia/en/8/8a/Dark_Knight.jpg"
    ],
    trailerId: "EXeTwQWrcwY",
    links: {
      youtube: "https://www.youtube.com/watch?v=EXeTwQWrcwY",
      imdb: "https://www.imdb.com/title/tt0468569/",
      netflixSearch: "https://www.netflix.com/search?q=The%20Dark%20Knight"
    }
  }
];

const state = { currentMovie: MOVIES[0], muted: false };

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

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

function movieCard(movie) {
  return `<article class="card" data-id="${movie.id}">
    <img data-poster="${movie.id}" alt="${escapeHtml(movie.title)}" loading="lazy" />
    <div class="card-body">
      <h4>${escapeHtml(movie.title)} (${movie.year})</h4>
      <p>${escapeHtml(movie.genres)}</p>
    </div>
  </article>`;
}

function renderGrid(list = MOVIES) {
  $("#movieGrid").innerHTML = list.length ? list.map(movieCard).join("") : `<div class="card"><div class="card-body"><h4>نتیجه‌ای پیدا نشد</h4></div></div>`;
  $("#resultCount").textContent = `${list.length} فیلم`;

  list.forEach((m) => {
    const img = document.querySelector(`img[data-poster="${m.id}"]`);
    if (img) resolveImage(m, img);
  });
}

function syncHero(movie) {
  state.currentMovie = movie;
  $("#heroTitle").textContent = `${movie.title} (${movie.year})`;
  $("#heroMeta").textContent = `${movie.genres} • ${movie.desc}`;
  resolveImage(movie, $("#heroImage"));
  renderLinks(movie);
}

function playerSrc(movie, muted = false) {
  const muteVal = muted ? 1 : 0;
  return `https://www.youtube.com/embed/${movie.trailerId}?autoplay=1&rel=0&modestbranding=1&mute=${muteVal}`;
}

function playInside(movie) {
  const src = playerSrc(movie, state.muted);
  $("#videoPlayer").src = src;
  $("#playerTitle").textContent = `در حال پخش: ${movie.title} (Trailer)`;
  $("#ytOpenBtn").href = movie.links.youtube;
}

function stopPlayer() {
  $("#videoPlayer").src = "";
  $("#playerTitle").textContent = "پخش متوقف شد";
}

function renderLinks(movie) {
  $("#linkPanel").innerHTML = `
    <a class="link-btn" href="${movie.links.youtube}" target="_blank" rel="noreferrer">YouTube Trailer</a>
    <a class="link-btn" href="${movie.links.imdb}" target="_blank" rel="noreferrer">IMDb</a>
    <a class="link-btn" href="${movie.links.netflixSearch}" target="_blank" rel="noreferrer">Netflix Search</a>
    <a class="link-btn" href="https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + ' full movie scenes')}" target="_blank" rel="noreferrer">YouTube Scenes</a>
    <a class="link-btn" href="https://digimoviez.com/?s=${encodeURIComponent(movie.title)}" target="_blank" rel="noreferrer">DigiMoviez Search</a>
    <a class="link-btn" href="https://www.google.com/search?q=${encodeURIComponent(movie.title + ' where to watch')}" target="_blank" rel="noreferrer">Where to Watch</a>
  `;
}

function openModal(title, body) {
  $("#modalTitle").textContent = title;
  $("#modalBody").innerHTML = body;
  $("#modal").classList.remove("hidden");
}

function wire() {
  $("#themeToggle").addEventListener("click", () => {
    document.body.dataset.theme = document.body.dataset.theme === "dark" ? "light" : "dark";
  });

  $("#searchInput").addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = MOVIES.filter((m) => (`${m.title} ${m.genres} ${m.desc}`).toLowerCase().includes(q));
    renderGrid(filtered);
  });

  $("#clearSearch").addEventListener("click", () => {
    $("#searchInput").value = "";
    renderGrid();
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

async function validateImageSources() {
  const checks = MOVIES.slice(0, 3).map(async (m) => {
    for (const src of m.images) {
      try {
        const r = await fetch(src, { method: "HEAD" });
        if (r.ok) return true;
      } catch {}
    }
    return false;
  });
  await Promise.all(checks);
}

async function boot() {
  await sleep(650);
  $("#splash").classList.add("hidden");
  $("#app").classList.remove("hidden");
  renderGrid();
  syncHero(MOVIES[0]);
  renderLinks(MOVIES[0]);
  wire();
  await validateImageSources();
}

boot();
