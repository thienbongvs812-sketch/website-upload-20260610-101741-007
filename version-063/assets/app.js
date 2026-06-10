(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function submitSearch(form) {
    var input = qs("input", form);
    var value = input ? input.value.trim() : "";
    if (value) {
      window.location.href = "search.html?q=" + encodeURIComponent(value);
    }
  }

  function setupHeader() {
    var header = qs(".site-header");
    var toggle = qs(".mobile-toggle");
    var panel = qs(".mobile-panel");
    var topButton = qs(".back-top");

    function updateScroll() {
      if (header) {
        header.classList.toggle("is-scrolled", window.scrollY > 12);
      }
      if (topButton) {
        topButton.classList.toggle("show", window.scrollY > 480);
      }
    }

    window.addEventListener("scroll", updateScroll, { passive: true });
    updateScroll();

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("open");
      });
    }

    qsa(".header-search").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        submitSearch(form);
      });
    });

    if (topButton) {
      topButton.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  }

  function setupHero() {
    var hero = qs(".hero");
    if (!hero) {
      return;
    }

    var slides = qsa(".hero-slide", hero);
    var dots = qsa(".hero-dot", hero);
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle("is-active", current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle("is-active", current === index);
      });
    }

    function start() {
      if (slides.length < 2) {
        return;
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, current) {
      dot.addEventListener("click", function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(current);
        start();
      });
    });

    show(0);
    start();
  }

  function setupLocalFilter() {
    var input = qs("[data-local-filter]");
    var sort = qs("[data-local-sort]");
    var cards = qsa("[data-card]");
    var grid = qs("[data-card-grid]");

    if (!grid || cards.length === 0) {
      return;
    }

    function normalize(value) {
      return String(value || "").toLowerCase();
    }

    function apply() {
      var keyword = input ? normalize(input.value) : "";
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-keywords"));
        card.style.display = !keyword || haystack.indexOf(keyword) >= 0 ? "" : "none";
      });

      if (sort) {
        var sorted = cards.slice().sort(function (a, b) {
          if (sort.value === "year") {
            return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
          }
          return Number(b.getAttribute("data-views") || 0) - Number(a.getAttribute("data-views") || 0);
        });
        sorted.forEach(function (card) {
          grid.appendChild(card);
        });
      }
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    if (sort) {
      sort.addEventListener("change", apply);
    }
    apply();
  }

  function setupSearchPage() {
    var input = qs("[data-search-input]");
    var grid = qs("[data-search-results]");
    if (!input || !grid || !window.MovieSearchIndex) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;

    function card(item) {
      var article = document.createElement("article");
      article.className = "movie-card";
      article.innerHTML = [
        '<a href="' + item.url + '">',
        '<div class="movie-card-poster">',
        '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '" loading="lazy">',
        '<span class="movie-badge">' + item.year + '</span>',
        '</div>',
        '<div class="movie-card-body">',
        '<h3>' + item.title + '</h3>',
        '<p>' + item.description + '</p>',
        '<div class="movie-meta"><span>' + item.region + '</span><span>' + item.category + '</span></div>',
        '</div>',
        '</a>'
      ].join("");
      return article;
    }

    function render() {
      var keyword = input.value.trim().toLowerCase();
      var list = window.MovieSearchIndex.filter(function (item) {
        if (!keyword) {
          return item.hot;
        }
        return item.search.indexOf(keyword) >= 0;
      }).slice(0, 96);

      grid.innerHTML = "";
      if (list.length === 0) {
        var empty = document.createElement("div");
        empty.className = "empty-state";
        empty.textContent = "没有找到匹配内容";
        grid.appendChild(empty);
        return;
      }

      list.forEach(function (item) {
        grid.appendChild(card(item));
      });
    }

    input.addEventListener("input", render);
    render();
  }

  function initPlayer(videoId, buttonId, sourceUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);

    if (!video || !button || !sourceUrl) {
      return;
    }

    var loaded = false;

    function load() {
      if (loaded) {
        return Promise.resolve();
      }
      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        video._hls = hls;
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
      video.setAttribute("playsinline", "");
      return Promise.resolve();
    }

    function play() {
      load().then(function () {
        button.classList.add("is-hidden");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            button.classList.remove("is-hidden");
          });
        }
      });
    }

    button.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
  }

  ready(function () {
    setupHeader();
    setupHero();
    setupLocalFilter();
    setupSearchPage();
  });

  window.MovieSite = {
    initPlayer: initPlayer
  };
}());
