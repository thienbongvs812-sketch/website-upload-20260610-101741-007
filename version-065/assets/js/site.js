(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  window.handleImageError = function handleImageError(image) {
    var frame = image.closest('.image-frame');
    if (frame) {
      frame.classList.add('is-missing');
    }
    image.remove();
  };

  function setupMobileMenu() {
    var button = qs('[data-menu-toggle]');
    var menu = qs('[data-mobile-nav]');
    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
      document.body.classList.toggle('no-scroll', menu.classList.contains('is-open'));
    });
  }

  function setupHeroCarousel() {
    var carousel = qs('[data-hero-carousel]');
    if (!carousel) {
      return;
    }

    var slides = qsa('[data-hero-slide]', carousel);
    var dots = qsa('[data-hero-dot]', carousel);
    var prev = qs('[data-hero-prev]', carousel);
    var next = qs('[data-hero-next]', carousel);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
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
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.dataset.heroDot || 0));
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    var panels = qsa('[data-filter-panel]');
    panels.forEach(function (panel) {
      var container = panel.closest('.content-section') || document;
      var items = qsa('.filter-item', container);
      var keywordInput = qs('[data-filter-keyword]', panel);
      var categorySelect = qs('[data-filter-category]', panel);
      var typeSelect = qs('[data-filter-type]', panel);
      var yearSelect = qs('[data-filter-year]', panel);
      var genreSelect = qs('[data-filter-genre]', panel);
      var countNode = qs('[data-filter-count]', panel);

      if (panel.hasAttribute('data-read-query')) {
        var params = new URLSearchParams(window.location.search);
        if (keywordInput && params.get('q')) {
          keywordInput.value = params.get('q');
        }
        if (genreSelect && params.get('genre')) {
          genreSelect.value = params.get('genre');
        }
      }

      function normalize(value) {
        return String(value || '').trim().toLowerCase();
      }

      function applyFilter() {
        var keyword = normalize(keywordInput && keywordInput.value);
        var category = normalize(categorySelect && categorySelect.value);
        var type = normalize(typeSelect && typeSelect.value);
        var year = normalize(yearSelect && yearSelect.value);
        var genre = normalize(genreSelect && genreSelect.value);
        var visible = 0;

        items.forEach(function (item) {
          var haystack = normalize([
            item.dataset.title,
            item.dataset.category,
            item.dataset.type,
            item.dataset.year,
            item.dataset.tags,
            item.textContent
          ].join(' '));
          var ok = true;

          if (keyword && haystack.indexOf(keyword) === -1) {
            ok = false;
          }
          if (category && normalize(item.dataset.category) !== category) {
            ok = false;
          }
          if (type && normalize(item.dataset.type) !== type) {
            ok = false;
          }
          if (year && normalize(item.dataset.year) !== year) {
            ok = false;
          }
          if (genre && haystack.indexOf(genre) === -1) {
            ok = false;
          }

          item.classList.toggle('is-hidden', !ok);
          if (ok) {
            visible += 1;
          }
        });

        if (countNode) {
          countNode.textContent = String(visible);
        }
      }

      [keywordInput, categorySelect, typeSelect, yearSelect, genreSelect].forEach(function (control) {
        if (!control) {
          return;
        }
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      });

      applyFilter();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupFilters();
  });
})();
