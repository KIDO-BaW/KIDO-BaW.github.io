function getProcessCardsPerView() {
  if (window.innerWidth <= 560) {
    return 1;
  }

  if (window.innerWidth <= 900) {
    return 2;
  }

  return 3;
}

function createCarousel(options) {
  const track = document.querySelector(options.trackSelector);
  const prevButton = document.querySelector(options.prevSelector);
  const nextButton = document.querySelector(options.nextSelector);

  if (!track || !prevButton || !nextButton) {
    return null;
  }

  const cards = Array.from(track.querySelectorAll(options.cardSelector));
  let currentIndex = 0;

  function update() {
    if (cards.length === 0) {
      return;
    }

    const cardsPerView = options.getCardsPerView();
    const maxIndex = Math.max(cards.length - cardsPerView, 0);

    if (currentIndex > maxIndex) {
      currentIndex = maxIndex;
    }

    if (currentIndex < 0) {
      currentIndex = 0;
    }

    const cardWidth = cards[0].offsetWidth;
    const trackStyle = window.getComputedStyle(track);
    const gap = parseFloat(trackStyle.columnGap || trackStyle.gap) || 18;
    const moveAmount = currentIndex * (cardWidth + gap);

    track.style.transform = `translateX(-${moveAmount}px)`;

    prevButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex === maxIndex;
  }

  prevButton.addEventListener("click", () => {
    currentIndex -= 1;
    update();
  });

  nextButton.addEventListener("click", () => {
    currentIndex += 1;
    update();
  });

  update();
  return { update };
}

const carousels = [
  createCarousel({
    trackSelector: ".process-track",
    cardSelector: ".process-card",
    prevSelector: ".carousel-button-prev",
    nextSelector: ".carousel-button-next",
    getCardsPerView: getProcessCardsPerView,
  }),
  createCarousel({
    trackSelector: ".collection-track",
    cardSelector: ".collection-card",
    prevSelector: ".collection-button-prev",
    nextSelector: ".collection-button-next",
    getCardsPerView: () => 1,
  }),
  createCarousel({
    trackSelector: ".custom-track",
    cardSelector: ".custom-card",
    prevSelector: ".custom-button-prev",
    nextSelector: ".custom-button-next",
    getCardsPerView: () => 1,
  }),
].filter(Boolean);

window.addEventListener("resize", () => {
  carousels.forEach((carousel) => carousel.update());
});
