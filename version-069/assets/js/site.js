(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-main-nav]");

        if (menuButton && menu) {
            menuButton.addEventListener("click", function () {
                menu.classList.toggle("is-open");
            });
        }

        var carousel = document.querySelector("[data-hero-carousel]");

        if (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
            var activeIndex = 0;

            function showSlide(index) {
                if (!slides.length) {
                    return;
                }

                activeIndex = (index + slides.length) % slides.length;

                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("active", slideIndex === activeIndex);
                });

                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("active", dotIndex === activeIndex);
                });
            }

            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener("click", function () {
                    showSlide(dotIndex);
                });
            });

            window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        }

        var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";

        function applySearch(value) {
            var query = value.trim().toLowerCase();

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute("data-title") || "",
                    card.getAttribute("data-year") || "",
                    card.getAttribute("data-tags") || "",
                    card.textContent || ""
                ].join(" ").toLowerCase();

                card.classList.toggle("is-hidden", query !== "" && haystack.indexOf(query) === -1);
            });
        }

        searchInputs.forEach(function (input) {
            if (initialQuery) {
                input.value = initialQuery;
            }

            input.addEventListener("input", function () {
                applySearch(input.value);
            });
        });

        if (initialQuery && searchInputs.length) {
            applySearch(initialQuery);
        }

        var players = Array.prototype.slice.call(document.querySelectorAll(".movie-player-shell"));

        players.forEach(function (shell) {
            var video = shell.querySelector("video");
            var cover = shell.querySelector(".player-cover");
            var started = false;
            var hlsInstance = null;

            if (!video) {
                return;
            }

            function attachStream() {
                var url = video.getAttribute("data-stream");

                if (!url) {
                    return;
                }

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = url;
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        maxBufferLength: 30,
                        enableWorker: true
                    });
                    hlsInstance.loadSource(url);
                    hlsInstance.attachMedia(video);
                    return;
                }

                video.src = url;
            }

            function startPlayer() {
                if (!started) {
                    started = true;
                    attachStream();
                }

                shell.classList.add("is-playing");

                var playPromise = video.play();

                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {});
                }
            }

            if (cover) {
                cover.addEventListener("click", startPlayer);
            }

            video.addEventListener("click", function () {
                if (!started) {
                    startPlayer();
                }
            });

            window.addEventListener("pagehide", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        });
    });
})();
