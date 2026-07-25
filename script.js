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

function setupSectionReveals() {
  function restartAccent(target) {
    target.classList.remove("is-accented");
    target.offsetWidth;
    target.classList.add("is-accented");
  }

  function stopAccent(target) {
    window.clearTimeout(target.revealAccentTimer);
    target.revealAccentTimer = null;
  }

  function startAccent(target) {
    stopAccent(target);

    const delayStep = Number(target.dataset.revealDelay || 0);
    target.revealAccentTimer = window.setTimeout(() => {
      restartAccent(target);
    }, 420 + delayStep * 110);
  }

  const revealSelector = [
    ".section-label",
    "h2",
    ".section-inner > p:not(.section-label)",
    ".about-copy > p:not(.section-label)",
    ".about-mark",
    ".process-carousel",
    ".collection-carousel",
    ".custom-carousel",
    ".section-contact .button",
    ".process-card",
    ".collection-card",
    ".custom-card",
  ].join(", ");
  const revealSections = Array.from(document.querySelectorAll(".section:not(.hero)"));
  const revealTargets = revealSections.flatMap((section) =>
    Array.from(section.querySelectorAll(revealSelector)),
  );

  if (revealTargets.length === 0 || !("IntersectionObserver" in window)) {
    revealTargets.forEach((target) => target.classList.add("is-revealed"));
    return;
  }

  revealSections.forEach((section) => {
    const sectionTargets = Array.from(section.querySelectorAll(revealSelector));

    sectionTargets.forEach((target, index) => {
      target.classList.add("reveal-item");
      target.dataset.revealDelay = String(Math.min(index, 3));

      if (
        target.classList.contains("process-card") ||
        target.classList.contains("collection-card") ||
        target.classList.contains("custom-card")
      ) {
        target.dataset.revealKind = "showcase";
      }
    });
  });

  window.requestAnimationFrame(() => {
    document.body.classList.add("reveal-ready");
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const sectionTargets = Array.from(
          entry.target.querySelectorAll(revealSelector),
        );

        sectionTargets.forEach((target) => {
          if (!entry.isIntersecting) {
            stopAccent(target);
            target.classList.remove("is-revealed", "is-accented");
            return;
          }

          target.classList.add("is-revealed");
          startAccent(target);
        });
      });
    },
    {
      rootMargin: "0px 0px -6% 0px",
      threshold: 0.01,
    },
  );

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      revealSections.forEach((section) => revealObserver.observe(section));
    });
  });
}

setupSectionReveals();

const globalPurchaseButton = document.querySelector("#global-purchase-button");
const globalPurchaseMessage =
  "Global purchase is being prepared. Please contact us on Instagram @bawlab.studio for now.";
let globalPurchaseMessageTimer;

if (globalPurchaseButton) {
  globalPurchaseButton.addEventListener("click", (event) => {
    event.preventDefault();

    let notice = document.querySelector(".global-purchase-notice");

    if (!notice) {
      notice = document.createElement("div");
      notice.className = "global-purchase-notice";
      notice.setAttribute("role", "status");
      notice.setAttribute("aria-live", "polite");
      document.body.appendChild(notice);
    }

    notice.textContent = globalPurchaseMessage;
    notice.classList.add("is-visible");
    window.clearTimeout(globalPurchaseMessageTimer);
    globalPurchaseMessageTimer = window.setTimeout(() => {
      notice.classList.remove("is-visible");
    }, 4200);
  });
}
