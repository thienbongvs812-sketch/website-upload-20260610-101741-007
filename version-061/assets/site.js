(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function setupHeader() {
        var header = document.querySelector("[data-site-header]");
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-main-nav]");
        var search = document.querySelector(".header-search");

        function refreshShadow() {
            if (!header) {
                return;
            }
            header.classList.toggle("scrolled", window.scrollY > 20);
        }

        refreshShadow();
        window.addEventListener("scroll", refreshShadow, { passive: true });

        if (toggle && nav && search) {
            toggle.addEventListener("click", function () {
                nav.classList.toggle("open");
                search.classList.toggle("open");
                toggle.textContent = nav.classList.contains("open") ? "×" : "☰";
            });
        }
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupGlobalSearch() {
        document.querySelectorAll("[data-global-search]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    window.location.href = "./library.html";
                }
            });
        });
    }

    function setupFilters() {
        var panel = document.querySelector("[data-filter-panel]");
        if (!panel) {
            return;
        }
        var search = panel.querySelector("[data-filter-search]");
        var year = panel.querySelector("[data-filter-year]");
        var region = panel.querySelector("[data-filter-region]");
        var type = panel.querySelector("[data-filter-type]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q") || "";

        if (search && q) {
            search.value = q;
        }

        function contains(card, query) {
            if (!query) {
                return true;
            }
            var text = [
                card.getAttribute("data-title") || "",
                card.getAttribute("data-tags") || "",
                card.textContent || ""
            ].join(" ").toLowerCase();
            return text.indexOf(query.toLowerCase()) !== -1;
        }

        function sameValue(card, attr, value) {
            if (!value) {
                return true;
            }
            return (card.getAttribute(attr) || "") === value;
        }

        function apply() {
            var query = search ? search.value.trim() : "";
            var selectedYear = year ? year.value : "";
            var selectedRegion = region ? region.value : "";
            var selectedType = type ? type.value : "";
            cards.forEach(function (card) {
                var visible = contains(card, query) &&
                    sameValue(card, "data-year", selectedYear) &&
                    sameValue(card, "data-region", selectedRegion) &&
                    sameValue(card, "data-type", selectedType);
                card.hidden = !visible;
            });
        }

        [search, year, region, type].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
        apply();
    }

    function setupBackTop() {
        var button = document.querySelector("[data-back-top]");
        if (!button) {
            return;
        }
        function refresh() {
            button.classList.toggle("visible", window.scrollY > 500);
        }
        button.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
        refresh();
        window.addEventListener("scroll", refresh, { passive: true });
    }

    window.StaticVideo = {
        init: function (source, videoId, overlayId, buttonId) {
            var video = document.getElementById(videoId);
            var overlay = document.getElementById(overlayId);
            var button = document.getElementById(buttonId);
            var hls = null;
            var loaded = false;

            if (!video || !source) {
                return;
            }

            function load() {
                if (loaded) {
                    return;
                }
                loaded = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                } else {
                    video.src = source;
                }
            }

            function start() {
                load();
                if (overlay) {
                    overlay.classList.add("hidden");
                }
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {
                        if (overlay) {
                            overlay.classList.remove("hidden");
                        }
                    });
                }
            }

            if (overlay) {
                overlay.addEventListener("click", start);
            }
            if (button) {
                button.addEventListener("click", start);
            }
            video.addEventListener("click", function () {
                if (!loaded || video.paused) {
                    start();
                }
            });
            video.addEventListener("play", function () {
                if (overlay) {
                    overlay.classList.add("hidden");
                }
            });
            video.addEventListener("pause", function () {
                if (overlay && video.currentTime === 0) {
                    overlay.classList.remove("hidden");
                }
            });
            video.addEventListener("error", function () {
                if (overlay) {
                    overlay.classList.remove("hidden");
                    overlay.innerHTML = "<span class=\"player-icon\">▶</span><span>播放暂时不可用</span>";
                }
                if (hls) {
                    hls.destroy();
                    hls = null;
                }
            });
        }
    };

    ready(function () {
        setupHeader();
        setupHero();
        setupGlobalSearch();
        setupFilters();
        setupBackTop();
    });
})();
