(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function setupNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-site-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero-carousel]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("is-active", position === current);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("is-active", position === current);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }
    dots.forEach(function (dot, position) {
      dot.addEventListener("click", function () {
        show(position);
        restart();
      });
    });
    restart();
  }

  function uniqueSorted(values) {
    var seen = {};
    return values.filter(function (value) {
      if (!value || seen[value]) {
        return false;
      }
      seen[value] = true;
      return true;
    }).sort(function (a, b) {
      var numberA = parseInt(a, 10);
      var numberB = parseInt(b, 10);
      if (!Number.isNaN(numberA) && !Number.isNaN(numberB)) {
        return numberB - numberA;
      }
      return a.localeCompare(b, "zh-CN");
    });
  }

  function addOptions(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function setupFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    if (!panel || !cards.length) {
      return;
    }

    var input = panel.querySelector("[data-filter-input]");
    var yearSelect = panel.querySelector("[data-filter-year]");
    var typeSelect = panel.querySelector("[data-filter-type]");
    var reset = panel.querySelector("[data-filter-reset]");
    var count = panel.querySelector("[data-filter-count]");
    var url = new URL(window.location.href);
    var query = url.searchParams.get("q") || "";

    addOptions(yearSelect, uniqueSorted(cards.map(function (card) {
      return card.getAttribute("data-year") || "";
    })));
    addOptions(typeSelect, uniqueSorted(cards.map(function (card) {
      return card.getAttribute("data-type") || "";
    })));

    if (input && query) {
      input.value = query;
    }

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var year = yearSelect ? yearSelect.value : "";
      var type = typeSelect ? typeSelect.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var text = card.getAttribute("data-search") || "";
        var cardYear = card.getAttribute("data-year") || "";
        var cardType = card.getAttribute("data-type") || "";
        var matched = true;

        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }
        if (year && cardYear !== year) {
          matched = false;
        }
        if (type && cardType !== type) {
          matched = false;
        }

        card.classList.toggle("is-hidden", !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = "当前显示 " + visible + " 部影片 / 共 " + cards.length + " 部";
      }
    }

    [input, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    if (reset) {
      reset.addEventListener("click", function () {
        if (input) {
          input.value = "";
        }
        if (yearSelect) {
          yearSelect.value = "";
        }
        if (typeSelect) {
          typeSelect.value = "";
        }
        apply();
      });
    }

    apply();
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".js-player"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector(".play-overlay");
      var message = player.querySelector("[data-player-message]");
      var source = player.getAttribute("data-src");
      var initialized = false;
      var hlsInstance = null;

      function setMessage(text) {
        if (message) {
          message.textContent = text || "";
        }
      }

      function playVideo() {
        if (!video || !source) {
          setMessage("视频源暂不可用");
          return;
        }

        if (!initialized) {
          initialized = true;
          if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
              setMessage("");
              video.play().catch(function () {
                setMessage("请再次点击播放按钮开始播放");
              });
            });
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
              if (!data || !data.fatal) {
                return;
              }
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                setMessage("网络加载异常，正在尝试恢复");
                hlsInstance.startLoad();
                return;
              }
              if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                setMessage("媒体解码异常，正在尝试恢复");
                hlsInstance.recoverMediaError();
                return;
              }
              setMessage("当前浏览器无法播放该视频源");
            });
          } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            video.addEventListener("loadedmetadata", function () {
              setMessage("");
              video.play().catch(function () {
                setMessage("请再次点击播放按钮开始播放");
              });
            }, { once: true });
          } else {
            setMessage("当前浏览器不支持 HLS 播放");
            return;
          }
        } else {
          video.play().catch(function () {
            setMessage("请再次点击播放按钮开始播放");
          });
        }
      }

      if (button) {
        button.addEventListener("click", function () {
          player.classList.add("is-playing");
          playVideo();
        });
      }

      if (video) {
        video.addEventListener("play", function () {
          player.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
          if (!video.ended) {
            return;
          }
          player.classList.remove("is-playing");
        });
      }

      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
