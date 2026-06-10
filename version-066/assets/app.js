(function () {
  const navToggle = document.querySelector("[data-nav-toggle]");
  const navMenu = document.querySelector("[data-nav-menu]");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      navMenu.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
    const slides = Array.from(slider.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
    let current = 0;

    function showSlide(next) {
      if (!slides.length) {
        return;
      }
      current = (next + slides.length) % slides.length;
      slides.forEach(function (slide, index) {
        slide.classList.toggle("is-active", index === current);
      });
      dots.forEach(function (dot, index) {
        dot.classList.toggle("is-active", index === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 6200);
    }
  });

  document.querySelectorAll("[data-search-scope]").forEach(function (scope) {
    const input = scope.querySelector("[data-search-input]");
    const region = scope.querySelector("[data-region-filter]");
    const type = scope.querySelector("[data-type-filter]");
    const year = scope.querySelector("[data-year-filter]");
    const cards = Array.from(scope.querySelectorAll("[data-movie-card]"));
    const empty = scope.querySelector("[data-empty-state]");

    function matches(card) {
      const text = [
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.tags,
        card.textContent
      ].join(" ").toLowerCase();
      const keyword = input ? input.value.trim().toLowerCase() : "";
      const regionValue = region ? region.value : "";
      const typeValue = type ? type.value : "";
      const yearValue = year ? year.value : "";

      if (keyword && !text.includes(keyword)) {
        return false;
      }
      if (regionValue && card.dataset.region !== regionValue) {
        return false;
      }
      if (typeValue && card.dataset.type !== typeValue) {
        return false;
      }
      if (yearValue && card.dataset.year !== yearValue) {
        return false;
      }
      return true;
    }

    function applyFilter() {
      let visible = 0;
      cards.forEach(function (card) {
        const keep = matches(card);
        card.hidden = !keep;
        if (keep) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [input, region, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });
  });
})();
