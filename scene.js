const canvas = document.querySelector("#bawlab-scene");
const hero = document.querySelector(".hero");

if (canvas && hero) {
  const context = canvas.getContext("2d");
  const palette = ["#ffffff", "#8e00ed", "#f7a80a", "#0ff379"];
  const pointer = {
    active: false,
    easedX: 0,
    easedY: 0,
    x: 0,
    y: 0,
  };
  const stars = [];
  const sparks = [];
  let width = 0;
  let height = 0;
  let centerX = 0;
  let centerY = 0;
  let pixelRatio = 1;
  let lastTime = 0;
  let lastFrameTime = 0;
  let mobileScene = false;
  let mobileScrollBoost = 0;
  let lastScrollY = window.scrollY;
  let heroVisible = true;

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function rgba(hex, alpha) {
    const value = hex.replace("#", "");
    const red = parseInt(value.slice(0, 2), 16);
    const green = parseInt(value.slice(2, 4), 16);
    const blue = parseInt(value.slice(4, 6), 16);
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  }

  function chooseColor(quiet = false) {
    const roll = Math.random();

    if (quiet) {
      if (roll < 0.84) {
        return "#ffffff";
      }

      if (roll < 0.91) {
        return "#8e00ed";
      }

      if (roll < 0.97) {
        return "#f7a80a";
      }

      return "#0ff379";
    }

    if (roll < 0.5) {
      return "#ffffff";
    }

    if (roll < 0.7) {
      return "#8e00ed";
    }

    if (roll < 0.88) {
      return "#f7a80a";
    }

    return "#0ff379";
  }

  function createStar(z, quiet = false) {
    const angle = Math.random() * Math.PI * 2;
    const arm = Math.random() < 0.62;
    const radius = arm
      ? randomBetween(0.14, 1.18) ** 0.58
      : randomBetween(0.22, 1.28);
    const twist = angle + radius * 2.7;
    const edgeBoost = Math.random() < 0.46 ? randomBetween(1.0, 1.42) : 1;

    return {
      alpha: quiet ? randomBetween(0.55, 0.96) : randomBetween(0.52, 1),
      color: chooseColor(quiet),
      depthSpeed: randomBetween(0.00016, 0.00038),
      glow: randomBetween(8, 24),
      phase: Math.random() * Math.PI * 2,
      radius: randomBetween(0.55, 1.7),
      twinkle: randomBetween(0.85, 2.2),
      x: Math.cos(twist) * radius * edgeBoost * randomBetween(0.86, 1.14),
      y: Math.sin(angle) * radius * edgeBoost * randomBetween(0.72, 1.08),
      z: z || randomBetween(0.12, 1),
    };
  }

  function resetStar(star, z) {
    Object.assign(star, mobileScene ? createMobileStar(z) : createStar(z));
  }

  function createMobileStar(z) {
    const star = createStar(z);
    const fov = Math.min(width, height) * 0.82;
    const screenX = randomBetween(-width * 0.56, width * 0.56);
    const screenY = randomBetween(-height * 0.56, height * 0.56);
    star.x = screenX * z / fov;
    star.y = screenY * z / fov;
    return star;
  }

  function resize() {
    const rect = hero.getBoundingClientRect();
    width = Math.max(rect.width, 1);
    height = Math.max(rect.height, window.innerHeight);
    const wasMobileScene = mobileScene;
    mobileScene = width < 700;
    pixelRatio = Math.min(window.devicePixelRatio || 1, mobileScene ? 1.1 : 1.35);
    centerX = width * 0.5;
    centerY = height * 0.5;
    canvas.width = Math.floor(width * pixelRatio);
    canvas.height = Math.floor(height * pixelRatio);
    canvas.style.left = `${rect.left + window.scrollX}px`;
    canvas.style.top = `${rect.top + window.scrollY}px`;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.lineCap = "round";
    context.lineJoin = "round";

    if (mobileScene) {
      pointer.active = false;
      sparks.length = 0;
    }

    createStars();

    if (wasMobileScene !== mobileScene || lastTime === 0) {
      lastTime = 0;
      lastFrameTime = 0;
      requestAnimationFrame(animate);
    }
  }

  function createStars() {
    stars.length = 0;
    const count = mobileScene ? 280 : width < 900 ? 680 : 980;

    for (let index = 0; index < count; index += 1) {
      const z = randomBetween(mobileScene ? 0.16 : 0.08, 1);
      stars.push(mobileScene ? createMobileStar(z) : createStar(z));
    }
  }

  function updatePointer(event) {
    if (mobileScene) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    pointer.active = true;
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;

    if (pointer.easedX === 0 && pointer.easedY === 0) {
      pointer.easedX = pointer.x;
      pointer.easedY = pointer.y;
    }
  }

  function addSpark(event) {
    if (mobileScene) {
      return;
    }

    updatePointer(event);

    const burstCount = width < 560 ? 10 : 16;

    for (let index = 0; index < burstCount; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = randomBetween(1.4, 3.8);

      sparks.push({
        alpha: randomBetween(0.66, 1),
        color: palette[index % palette.length],
        decay: randomBetween(0.035, 0.052),
        life: randomBetween(0.62, 0.9),
        radius: randomBetween(0.7, 1.35),
        trail: randomBetween(6, 15),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        x: pointer.x + Math.cos(angle) * randomBetween(2, 8),
        y: pointer.y + Math.sin(angle) * randomBetween(2, 8),
      });
    }

    if (sparks.length > 64) {
      sparks.splice(0, sparks.length - 64);
    }
  }

  function drawGlow(x, y, color, radius, alpha) {
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, rgba(color, 0.95));
    gradient.addColorStop(0.24, rgba(color, 0.42));
    gradient.addColorStop(1, rgba(color, 0));
    context.globalAlpha = alpha;
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  }

  function drawNebula(time) {
    const clouds = [
      ["#8e00ed", -width * 0.08, height * 0.1, width * 0.75, 0.24],
      ["#f7a80a", width * 1.04, height * 0.2, width * 0.64, 0.18],
      ["#0ff379", width * 0.02, height * 0.86, width * 0.58, 0.14],
      ["#8e00ed", width * 0.96, height * 0.9, width * 0.7, 0.18],
      ["#ffffff", centerX, centerY, width * 0.36, 0.05],
    ];

    clouds.forEach(([color, baseX, baseY, size, alpha], index) => {
      const x = baseX + Math.sin(time * 0.09 + index) * 22;
      const y = baseY + Math.cos(time * 0.11 + index) * 18;
      const gradient = context.createRadialGradient(x, y, 0, x, y, size);
      gradient.addColorStop(0, rgba(color, alpha));
      gradient.addColorStop(0.36, rgba(color, alpha * 0.35));
      gradient.addColorStop(1, rgba(color, 0));
      context.globalAlpha = 1;
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);
    });
  }

  function project(star, zOffset = 0) {
    const z = Math.max(star.z + zOffset, 0.025);
    const fov = Math.min(width, height) * 0.82;
    return {
      scale: 1 / z,
      x: centerX + star.x * fov / z,
      y: centerY + star.y * fov / z,
    };
  }

  function applyLens(position, star) {
    if (!pointer.active) {
      return position;
    }

    const dx = position.x - pointer.easedX;
    const dy = position.y - pointer.easedY;
    const distance = Math.hypot(dx, dy);
    const reach = width < 560 ? 170 : 230;

    if (distance > reach || distance < 0.01) {
      return position;
    }

    const force = (1 - distance / reach) ** 2;
    const pull = 0.32 * force;
    const bulge = Math.sin((1 - distance / reach) * Math.PI) * 0.08;
    const swirl = force * 0.12;
    const suckedX = position.x - dx * pull + dx * bulge - dy * swirl;
    const suckedY = position.y - dy * pull + dy * bulge + dx * swirl;

    return {
      lensForce: force,
      scale: position.scale * (1 + force * 0.45),
      x: suckedX,
      y: suckedY,
    };
  }

  function drawStar(star, time, delta) {
    star.z -= star.depthSpeed * delta;

    const rawCurrent = project(star);
    const rawPrevious = project(star, star.depthSpeed * delta * 5.5);
    const current = applyLens(rawCurrent, star);
    const previous = applyLens(rawPrevious, star);

    if (
      star.z <= 0.025 ||
      current.x < -220 ||
      current.x > width + 220 ||
      current.y < -220 ||
      current.y > height + 220
    ) {
      resetStar(star, randomBetween(0.82, 1));
      return;
    }

    const twinkle = 0.56 + Math.sin(time * star.twinkle + star.phase) * 0.44;
    const depth = Math.min(current.scale, 18);
    const radius = Math.min(star.radius * depth * 0.34, 4.8);
    const alpha = Math.min(star.alpha * (0.5 + twinkle * 0.72) * (0.55 + depth * 0.1), 1);
    const streakLength = Math.hypot(current.x - previous.x, current.y - previous.y);
    const maxTrail = 34 + (current.lensForce || 0) * 10;
    const drawPrevious = { x: previous.x, y: previous.y };

    if (streakLength > maxTrail) {
      const ratio = maxTrail / streakLength;
      drawPrevious.x = current.x + (previous.x - current.x) * ratio;
      drawPrevious.y = current.y + (previous.y - current.y) * ratio;
    }

    const visibleStreakLength = Math.min(streakLength, maxTrail);
    const drawStreak = visibleStreakLength > 1.6;

    if (drawStreak) {
      const gradient = context.createLinearGradient(drawPrevious.x, drawPrevious.y, current.x, current.y);
      gradient.addColorStop(0, rgba(star.color, 0));
      gradient.addColorStop(0.55, rgba(star.color, alpha * 0.78));
      gradient.addColorStop(1, "rgba(255, 255, 255, 0.95)");
      context.globalAlpha = Math.min(alpha * (0.54 + visibleStreakLength * 0.018), 0.92);
      context.strokeStyle = gradient;
      context.lineWidth = Math.min(radius * 0.62 + (current.lensForce || 0) * 0.9, 2.2);
      context.beginPath();
      context.moveTo(drawPrevious.x, drawPrevious.y);
      context.lineTo(current.x, current.y);
      context.stroke();
    }

    if (radius > 1.2 || twinkle > 0.82) {
      drawGlow(current.x, current.y, star.color, star.glow * Math.min(depth * 0.2, 2.8), alpha * 0.26);
    }

    const core = context.createRadialGradient(current.x, current.y, 0, current.x, current.y, radius * 2.4);
    core.addColorStop(0, "rgba(255, 255, 255, 1)");
    core.addColorStop(0.28, rgba(star.color, 0.82));
    core.addColorStop(1, rgba(star.color, 0));
    context.globalAlpha = alpha;
    context.fillStyle = core;
    context.beginPath();
    context.arc(current.x, current.y, Math.max(radius * 2.2, 1.2), 0, Math.PI * 2);
    context.fill();
  }

  function drawSparks() {
    for (let index = sparks.length - 1; index >= 0; index -= 1) {
      const spark = sparks[index];
      const previousX = spark.x;
      const previousY = spark.y;
      spark.x += spark.vx;
      spark.y += spark.vy;
      spark.vx *= 0.92;
      spark.vy *= 0.92;
      spark.life -= spark.decay;

      if (spark.life <= 0) {
        sparks.splice(index, 1);
        continue;
      }

      const alpha = spark.life * spark.alpha;
      const tailX = previousX - spark.vx * spark.trail;
      const tailY = previousY - spark.vy * spark.trail;
      const gradient = context.createLinearGradient(tailX, tailY, spark.x, spark.y);
      gradient.addColorStop(0, rgba(spark.color, 0));
      gradient.addColorStop(0.72, rgba(spark.color, alpha * 0.55));
      gradient.addColorStop(1, "rgba(255, 255, 255, 0.95)");

      context.globalAlpha = Math.min(alpha, 0.85);
      context.strokeStyle = gradient;
      context.lineWidth = spark.radius;
      context.beginPath();
      context.moveTo(tailX, tailY);
      context.lineTo(spark.x, spark.y);
      context.stroke();

      context.globalAlpha = Math.min(alpha, 0.75);
      context.fillStyle = rgba(spark.color, 0.82);
      context.beginPath();
      context.arc(spark.x, spark.y, spark.radius * 1.2, 0, Math.PI * 2);
      context.fill();
    }
  }

  function updateMobileScroll() {
    const nextScrollY = window.scrollY;
    const distance = Math.abs(nextScrollY - lastScrollY);
    lastScrollY = nextScrollY;

    if (mobileScene && heroVisible) {
      mobileScrollBoost = Math.min(mobileScrollBoost + distance * 0.035, 3.4);
    }
  }

  function animate(timeMs) {
    if (document.hidden) {
      lastTime = timeMs;
      requestAnimationFrame(animate);
      return;
    }

    if (!heroVisible) {
      lastTime = timeMs;
      requestAnimationFrame(animate);
      return;
    }

    const targetFps = mobileScene ? 36 : 48;

    if (timeMs - lastFrameTime < 1000 / targetFps) {
      requestAnimationFrame(animate);
      return;
    }

    const time = timeMs * 0.001;
    const delta = Math.min(timeMs - lastTime || 16, 34);
    lastFrameTime = timeMs;
    lastTime = timeMs;
    const speedMultiplier = mobileScene ? 0.76 + mobileScrollBoost : 1;

    if (mobileScene) {
      mobileScrollBoost *= 0.86;

      if (mobileScrollBoost < 0.01) {
        mobileScrollBoost = 0;
      }
    }

    pointer.easedX += (pointer.x - pointer.easedX) * 0.1;
    pointer.easedY += (pointer.y - pointer.easedY) * 0.1;

    context.clearRect(0, 0, width, height);
    context.globalCompositeOperation = "screen";
    drawNebula(time * (mobileScene ? 0.82 + mobileScrollBoost * 0.06 : 1));
    for (let index = 0; index < stars.length; index += 1) {
      drawStar(stars[index], time, delta * speedMultiplier);
    }
    drawSparks();
    context.globalCompositeOperation = "source-over";
    context.globalAlpha = 1;
    requestAnimationFrame(animate);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("scroll", updateMobileScroll, { passive: true });
  hero.addEventListener("pointermove", updatePointer);
  hero.addEventListener("pointerleave", () => {
    pointer.active = false;
  });
  hero.addEventListener("pointerdown", addSpark);

  if ("IntersectionObserver" in window) {
    const heroObserver = new IntersectionObserver((entries) => {
      heroVisible = entries[0].isIntersecting;
    });

    heroObserver.observe(hero);
  }

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      lastTime = 0;
    }
  });

  resize();
}
