import { H as Hls } from './hls-vendor-dru42stk.js';

const ready = (callback) => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
};

ready(() => {
  initMobileMenu();
  initHeroCarousel();
  initFilters();
  initPlayers();
  initSearchForms();
});

function initMobileMenu() {
  const button = document.querySelector('[data-mobile-menu-button]');
  const menu = document.querySelector('[data-mobile-menu]');

  if (!button || !menu) {
    return;
  }

  button.addEventListener('click', () => {
    menu.classList.toggle('is-open');
  });
}

function initHeroCarousel() {
  const hero = document.querySelector('[data-hero]');

  if (!hero) {
    return;
  }

  const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
  const next = hero.querySelector('[data-hero-next]');
  const prev = hero.querySelector('[data-hero-prev]');
  let current = 0;
  let timer = null;

  const show = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === current);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  };

  const start = () => {
    stop();
    timer = window.setInterval(() => show(current + 1), 5000);
  };

  const stop = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  next?.addEventListener('click', () => {
    show(current + 1);
    start();
  });

  prev?.addEventListener('click', () => {
    show(current - 1);
    start();
  });

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      show(index);
      start();
    });
  });

  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', start);
  start();
}

function initFilters() {
  const panel = document.querySelector('[data-filter-panel]');
  const grid = document.querySelector('[data-card-grid]');

  if (!panel || !grid) {
    return;
  }

  const cards = Array.from(grid.querySelectorAll('.movie-card'));
  const searchInput = panel.querySelector('[data-page-search]');
  const selects = Array.from(panel.querySelectorAll('[data-filter]'));
  const reset = panel.querySelector('[data-reset-filters]');
  const count = panel.querySelector('[data-result-count]');
  const params = new URLSearchParams(window.location.search);
  const query = params.get('q');

  if (query && searchInput) {
    searchInput.value = query;
  }

  const apply = () => {
    const keyword = (searchInput?.value || '').trim().toLowerCase();
    const filters = selects.map((select) => ({
      key: select.dataset.filter,
      value: select.value.trim().toLowerCase()
    }));
    let visible = 0;

    cards.forEach((card) => {
      const haystack = (card.dataset.search || '').toLowerCase();
      const matchesKeyword = !keyword || haystack.includes(keyword);
      const matchesFilters = filters.every(({ key, value }) => {
        if (!value || !key) {
          return true;
        }
        return (card.dataset[key] || '').toLowerCase() === value;
      });
      const shouldShow = matchesKeyword && matchesFilters;
      card.classList.toggle('is-hidden', !shouldShow);

      if (shouldShow) {
        visible += 1;
      }
    });

    if (count) {
      count.textContent = String(visible);
    }
  };

  searchInput?.addEventListener('input', apply);
  selects.forEach((select) => select.addEventListener('change', apply));
  reset?.addEventListener('click', () => {
    if (searchInput) {
      searchInput.value = '';
    }
    selects.forEach((select) => {
      select.value = '';
    });
    apply();
  });

  apply();
}

function initPlayers() {
  const players = Array.from(document.querySelectorAll('[data-player]'));

  players.forEach((box) => {
    const video = box.querySelector('video');
    const button = box.querySelector('[data-play]');
    const message = box.querySelector('[data-player-message]');
    const source = box.dataset.src;

    if (!video || !button || !source) {
      return;
    }

    const setMessage = (text) => {
      if (message) {
        message.textContent = text;
      }
    };

    const loadAndPlay = () => {
      if (video.dataset.loaded === 'true') {
        video.play().catch(() => setMessage('浏览器阻止了自动播放，请再次点击播放按钮。'));
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.dataset.loaded = 'true';
        box.classList.add('is-playing');
        video.play().catch(() => setMessage('浏览器阻止了自动播放，请再次点击播放按钮。'));
        return;
      }

      if (Hls && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.dataset.loaded = 'true';
          box.classList.add('is-playing');
          video.play().catch(() => setMessage('浏览器阻止了自动播放，请再次点击播放按钮。'));
        });
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data?.fatal) {
            setMessage('播放源暂时无法加载，请刷新页面后重试。');
          }
        });
        box._hls = hls;
        return;
      }

      setMessage('当前浏览器不支持 HLS 播放。');
    };

    button.addEventListener('click', loadAndPlay);
    video.addEventListener('play', () => box.classList.add('is-playing'));
  });
}

function initSearchForms() {
  const forms = Array.from(document.querySelectorAll('.site-search-form'));

  forms.forEach((form) => {
    form.addEventListener('submit', (event) => {
      const input = form.querySelector('input[name="q"]');
      const keyword = input?.value.trim();

      if (!keyword) {
        event.preventDefault();
      }
    });
  });
}
