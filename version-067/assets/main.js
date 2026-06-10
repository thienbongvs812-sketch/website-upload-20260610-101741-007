(function() {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function() {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var active = 0;

    function showSlide(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    dots.forEach(function(dot, index) {
      dot.addEventListener('click', function() {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function() {
        showSlide(active + 1);
      }, 5200);
    }
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterYear = document.querySelector('[data-filter-year]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    var query = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var year = filterYear ? filterYear.value : '';

    cards.forEach(function(card) {
      var text = card.getAttribute('data-search') || '';
      var cardYear = card.getAttribute('data-year') || '';
      var matchedQuery = !query || text.indexOf(query) !== -1;
      var matchedYear = !year || cardYear === year;
      card.classList.toggle('is-hidden', !(matchedQuery && matchedYear));
    });
  }

  var params = new URLSearchParams(window.location.search);
  var q = params.get('q');

  if (q && filterInput) {
    filterInput.value = q;
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyFilters);
  }

  if (filterYear) {
    filterYear.addEventListener('change', applyFilters);
  }

  applyFilters();
})();
