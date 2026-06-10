(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function text(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initHeader() {
    var header = qs('#site-header');
    var button = qs('.mobile-menu-button');
    var nav = qs('#mobile-nav');

    function updateHeader() {
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    if (button && nav) {
      button.addEventListener('click', function () {
        var opened = nav.classList.toggle('open');
        button.setAttribute('aria-expanded', opened ? 'true' : 'false');
        button.textContent = opened ? '×' : '☰';
      });
    }

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
  }

  function initHero() {
    var slider = qs('.hero-slider');
    if (!slider) {
      return;
    }

    var slides = qsa('.hero-slide', slider);
    var dots = qsa('.hero-dot', slider);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-target-slide') || 0));
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initBackToTop() {
    var button = qs('.back-to-top');
    if (!button) {
      return;
    }

    function toggle() {
      button.classList.toggle('show', window.scrollY > 420);
    }

    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    toggle();
    window.addEventListener('scroll', toggle, { passive: true });
  }

  function initFilters() {
    var list = qs('.filter-list');
    if (!list) {
      return;
    }

    var cards = qsa('.filter-card', list);
    var keyword = qs('#page-filter');
    var controls = qsa('.filter-control');
    var empty = qs('.empty-state');

    function apply() {
      var query = text(keyword && keyword.value);
      var filters = {};

      controls.forEach(function (control) {
        var key = control.getAttribute('data-filter-key');
        if (key && control.value) {
          filters[key] = text(control.value);
        }
      });

      var visible = 0;
      cards.forEach(function (card) {
        var matched = true;
        if (query && text(card.getAttribute('data-search')).indexOf(query) === -1) {
          matched = false;
        }
        Object.keys(filters).forEach(function (key) {
          if (text(card.getAttribute('data-' + key)) !== filters[key]) {
            matched = false;
          }
        });
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible > 0;
      }
    }

    controls.forEach(function (control) {
      control.addEventListener('input', apply);
      control.addEventListener('change', apply);
    });
    apply();
  }

  function itemCard(item) {
    return [
      '<article class="movie-card">',
      '<a href="' + item.url + '" class="movie-link" title="' + item.title + '">',
      '<div class="movie-thumb">',
      '<img src="' + item.cover + '" alt="' + item.title + '" loading="lazy">',
      '<div class="movie-overlay"><span class="play-badge">▶</span></div>',
      '<span class="corner-pill">' + item.category + '</span>',
      '</div>',
      '<div class="movie-info">',
      '<h3>' + item.title + '</h3>',
      '<p>' + item.desc + '</p>',
      '<div class="movie-stats"><span>' + item.year + '</span><span>' + item.region + '</span></div>',
      '</div>',
      '</a>',
      '</article>'
    ].join('');
  }

  function initSearchPage() {
    var form = qs('#search-page-form');
    var input = qs('#global-search');
    var results = qs('#search-results');
    var empty = qs('#search-empty');
    var items = window.SEARCH_ITEMS || [];

    if (!form || !input || !results) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (initial) {
      input.value = initial;
    }

    function render() {
      var query = text(input.value);
      var matched = items.filter(function (item) {
        if (!query) {
          return true;
        }
        return text(item.title + ' ' + item.year + ' ' + item.region + ' ' + item.type + ' ' + item.genre + ' ' + item.category + ' ' + item.tags + ' ' + item.desc).indexOf(query) !== -1;
      }).slice(0, 120);

      results.innerHTML = matched.map(itemCard).join('');
      if (empty) {
        empty.hidden = matched.length > 0;
      }
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var url = new URL(window.location.href);
      if (input.value.trim()) {
        url.searchParams.set('q', input.value.trim());
      } else {
        url.searchParams.delete('q');
      }
      history.replaceState(null, '', url.toString());
      render();
    });

    input.addEventListener('input', render);
    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initHeader();
    initHero();
    initBackToTop();
    initFilters();
    initSearchPage();
  });
}());
