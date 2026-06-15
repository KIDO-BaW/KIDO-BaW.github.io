const track = document.querySelector(".process-track");
const cards = Array.from(document.querySelectorAll(".process-card"));
const prevButton = document.querySelector(".carousel-button-prev");
const nextButton = document.querySelector(".carousel-button-next");

let currentIndex = 0;

function getCardsPerView() {
  if (window.innerWidth <= 560) {
    return 1;
  }

  if (window.innerWidth <= 900) {
    return 2;
  }

  return 3;
}

function updateCarousel() {
  if (!track || cards.length === 0 || !prevButton || !nextButton) {
    return;
  }

  const cardsPerView = getCardsPerView();
  const maxIndex = Math.max(cards.length - cardsPerView, 0);

  if (currentIndex > maxIndex) {
    currentIndex = maxIndex;
  }

  if (currentIndex < 0) {
    currentIndex = 0;
  }

  const card = cards[0];
  const cardWidth = card.offsetWidth;
  const gap = 18;
  const moveAmount = currentIndex * (cardWidth + gap);

  track.style.transform = `translateX(-${moveAmount}px)`;

  prevButton.disabled = currentIndex === 0;
  nextButton.disabled = currentIndex === maxIndex;
}

prevButton?.addEventListener("click", () => {
  currentIndex -= 1;
  updateCarousel();
});

nextButton?.addEventListener("click", () => {
  currentIndex += 1;
  updateCarousel();
});

window.addEventListener("resize", updateCarousel);

updateCarousel();