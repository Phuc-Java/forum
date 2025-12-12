"use client";

import { useEffect } from "react";

export default function FilmScanner() {
  useEffect(() => {
    // inject styles
    const css = `
  @import url("https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;700&display=swap");

  /* Scope resets to the scanner root only so we don't affect global layout (navbar, etc.) */
  .film-scanner-root, .film-scanner-root * { box-sizing: border-box; }
  .film-scanner-root { font-family: Arial, sans-serif; position: relative; width:100vw; max-width:none; margin-left:calc(50% - 50vw); margin-right:calc(50% - 50vw); margin-top:0; margin-bottom:0; }
  .film-scanner-root .container { position: relative; width:100%; height:320px; display:flex; align-items:center; justify-content:center; overflow:hidden; }
  .film-scanner-root #particleCanvas { position:absolute; top:50%; left:0; transform: translateY(-50%); width:100%; height:250px; z-index:0; pointer-events:none; }
  .film-scanner-root #scannerCanvas { position:absolute; top:50%; left:0; transform: translateY(-50%); width:100%; height:300px; z-index:15; pointer-events:none; }
  .film-scanner-root .card-stream { position:absolute; width:100%; height:180px; display:flex; align-items:center; overflow:visible; z-index:5; }
  .film-scanner-root .card-line { display:flex; align-items:center; gap:60px; white-space:nowrap; cursor:grab; user-select:none; will-change: transform; }
  .film-scanner-root .card-wrapper { position:relative; width:400px; height:250px; flex-shrink:0; }
  .film-scanner-root .card { position:absolute; top:0; left:0; width:400px; height:250px; border-radius:15px; overflow:hidden; }
  .film-scanner-root .card-normal { background:transparent; box-shadow:0 15px 40px rgba(0,0,0,0.4); display:flex; flex-direction:column; justify-content:space-between; padding:0; color:white; z-index:2; position:relative; overflow:hidden; }
  .film-scanner-root .card-image { width:100%; height:100%; object-fit:cover; border-radius:15px; transition: all 0.3s ease; filter: brightness(1.1) contrast(1.1); }
  .film-scanner-root .card-ascii { background:transparent; z-index:1; position:absolute; top:0; left:0; width:400px; height:250px; border-radius:15px; overflow:hidden; }
  .film-scanner-root .ascii-content { position:absolute; top:0; left:0; width:100%; height:100%; color: rgba(220,210,255,0.6); font-family: 'Courier New', monospace; font-size:11px; line-height:13px; overflow:hidden; white-space:pre; text-align:left; }
  .film-scanner-root .scanner { display:none; position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); width:4px; height:300px; border-radius:30px; background: linear-gradient(to bottom, transparent, rgba(0,255,255,0.8), rgba(0,255,255,1), rgba(0,255,255,0.8), transparent); box-shadow:0 0 20px rgba(0,255,255,0.8), 0 0 40px rgba(0,255,255,0.4); animation: scanPulse 2s ease-in-out infinite alternate; z-index:10; }
  `;
    const styleEl = document.createElement("style");
    styleEl.id = "film-scanner-styles";
    styleEl.innerText = css;
    document.head.appendChild(styleEl);

    // load three.js if not present
    function loadThree(): Promise<void> {
      // @ts-ignore
      if (window.THREE) return Promise.resolve();
      return new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src =
          "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
        s.onload = () => resolve();
        s.onerror = (e) => reject(e);
        document.head.appendChild(s);
      });
    }

    let cardStream;
    let particleSystem;
    let particleScanner;

    loadThree()
      .then(() => {
        // Insert the original logic adapted to run here.
        // For brevity we scope select definitions necessary to initialize behavior.

        // Paste adapted simplified classes: CardStreamController, ParticleSystem, ParticleScanner
        // We'll reuse the original code structure but scoped here.

        // --- CardStreamController (simplified adaptation) ---
        class CardStreamController {
          constructor() {
            // @ts-ignore
            this.container = document.getElementById("cardStream");
            // @ts-ignore
            this.cardLine = document.getElementById("cardLine");
            // @ts-ignore
            this.speedIndicator = document.getElementById("speedValue");

            this.position = 0;
            this.velocity = 120;
            this.direction = -1;
            this.isAnimating = true;
            this.isDragging = false;

            this.lastTime = 0;
            this.lastMouseX = 0;
            this.mouseVelocity = 0;
            this.friction = 0.95;
            this.minVelocity = 30;

            this.containerWidth = 0;
            this.cardLineWidth = 0;

            this.init();
          }

          init() {
            this.populateCardLine();
            this.calculateDimensions();
            this.setupEventListeners();
            this.updateCardPosition();
            this.animate();
            this.startPeriodicUpdates();
          }

          calculateDimensions() {
            this.containerWidth = this.container.offsetWidth;
            const cardWidth = 400;
            const cardGap = 60;
            const cardCount = this.cardLine.children.length;
            this.cardLineWidth = (cardWidth + cardGap) * cardCount;
          }

          setupEventListeners() {
            this.cardLine.addEventListener("mousedown", (e) =>
              this.startDrag(e)
            );
            document.addEventListener("mousemove", (e) => this.onDrag(e));
            document.addEventListener("mouseup", () => this.endDrag());
            this.cardLine.addEventListener("wheel", (e) => this.onWheel(e));
            window.addEventListener("resize", () => this.calculateDimensions());
          }

          startDrag(e) {
            e.preventDefault();
            this.isDragging = true;
            this.isAnimating = false;
            this.lastMouseX = e.clientX;
            this.mouseVelocity = 0;
            const transform = window.getComputedStyle(this.cardLine).transform;
            if (transform !== "none") {
              const matrix = new DOMMatrix(transform);
              this.position = matrix.m41;
            }
            this.cardLine.style.animation = "none";
            this.cardLine.classList.add("dragging");
            document.body.style.userSelect = "none";
            document.body.style.cursor = "grabbing";
          }

          onDrag(e) {
            if (!this.isDragging) return;
            e.preventDefault();
            const deltaX = e.clientX - this.lastMouseX;
            this.position += deltaX;
            this.mouseVelocity = deltaX * 60;
            this.lastMouseX = e.clientX;
            this.cardLine.style.transform = `translateX(${this.position}px)`;
            this.updateCardClipping();
          }

          endDrag() {
            if (!this.isDragging) return;
            this.isDragging = false;
            this.cardLine.classList.remove("dragging");
            if (Math.abs(this.mouseVelocity) > this.minVelocity) {
              this.velocity = Math.abs(this.mouseVelocity);
              this.direction = this.mouseVelocity > 0 ? 1 : -1;
            } else {
              this.velocity = 120;
            }
            this.isAnimating = true;
            this.updateSpeedIndicator();
            document.body.style.userSelect = "";
            document.body.style.cursor = "";
          }

          animate() {
            const currentTime = performance.now();
            const deltaTime = (currentTime - this.lastTime) / 1000 || 0.016;
            this.lastTime = currentTime;
            if (this.isAnimating && !this.isDragging) {
              if (this.velocity > this.minVelocity)
                this.velocity *= this.friction;
              else this.velocity = Math.max(this.minVelocity, this.velocity);
              this.position += this.velocity * this.direction * deltaTime;
              this.updateCardPosition();
              this.updateSpeedIndicator();
            }
            requestAnimationFrame(() => this.animate());
          }

          updateCardPosition() {
            const containerWidth = this.containerWidth;
            const cardLineWidth = this.cardLineWidth;
            if (this.position < -cardLineWidth) this.position = containerWidth;
            else if (this.position > containerWidth)
              this.position = -cardLineWidth;
            this.cardLine.style.transform = `translateX(${this.position}px)`;
            this.updateCardClipping();
          }

          updateSpeedIndicator() {
            if (this.speedIndicator)
              this.speedIndicator.textContent = Math.round(
                this.velocity
              ).toString();
          }

          toggleAnimation() {
            this.isAnimating = !this.isAnimating;
          }

          resetPosition() {
            this.position = this.containerWidth;
            this.velocity = 120;
            this.direction = -1;
            this.isAnimating = true;
            this.cardLine.style.animation = "none";
            this.cardLine.style.transform = `translateX(${this.position}px)`;
          }

          changeDirection() {
            this.direction *= -1;
          }

          onWheel(e) {
            e.preventDefault();
            const scrollSpeed = 20;
            const delta = e.deltaY > 0 ? scrollSpeed : -scrollSpeed;
            this.position += delta;
            this.updateCardPosition();
            this.updateCardClipping();
          }

          generateCode(width, height) {
            const chars =
              "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789(){}[]<>;:,._-+=!@#$%^&*|\\/\"'`~?";
            let out = "";
            for (let r = 0; r < height; r++) {
              let line = "";
              for (let c = 0; c < width; c++)
                line += chars.charAt(Math.floor(Math.random() * chars.length));
              out += line + (r < height - 1 ? "\n" : "");
            }
            return out;
          }

          calculateCodeDimensions(cardWidth, cardHeight) {
            const fontSize = 11;
            const lineHeight = 13;
            const charWidth = 6;
            const width = Math.floor(cardWidth / charWidth);
            const height = Math.floor(cardHeight / lineHeight);
            return { width, height, fontSize, lineHeight };
          }

          createCardWrapper(index) {
            const wrapper = document.createElement("div");
            wrapper.className = "card-wrapper";
            const normalCard = document.createElement("div");
            normalCard.className = "card card-normal";
            const cardImages = [
              "/film scroll/unnamed (1).jpg",
              "/film scroll/unnamed (2).jpg",
              "/film scroll/unnamed (3).jpg",
              "/film scroll/unnamed (4).jpg",
              "/film scroll/unnamed (5).jpg",
              "/film scroll/unnamed (6).jpg",
              "/film scroll/unnamed (7).jpg",
              "/film scroll/unnamed (8).jpg",
              "/film scroll/unnamed (9).jpg",
              "/film scroll/unnamed (10).jpg",
              "/film scroll/unnamed (11).jpg",
              "/film scroll/unnamed (12).jpg",
              "/film scroll/unnamed (13).jpg",
              "/film scroll/unnamed.jpg",
              "/film scroll/download.jfif",
            ];
            const cardImage = document.createElement("img");
            cardImage.className = "card-image";
            cardImage.src = cardImages[index % cardImages.length];
            cardImage.alt = "Credit Card";
            normalCard.appendChild(cardImage);
            const asciiCard = document.createElement("div");
            asciiCard.className = "card card-ascii";
            const asciiContent = document.createElement("div");
            asciiContent.className = "ascii-content";
            // remove heavy ASCII rendering to improve performance
            asciiContent.textContent = "";
            asciiCard.appendChild(asciiContent);
            wrapper.appendChild(normalCard);
            wrapper.appendChild(asciiCard);
            return wrapper;
          }

          updateCardClipping() {
            const scannerX = window.innerWidth / 2;
            const scannerWidth = 8;
            const scannerLeft = scannerX - scannerWidth / 2;
            const scannerRight = scannerX + scannerWidth / 2;
            document.querySelectorAll(".card-wrapper").forEach((wrapper) => {
              const rect = wrapper.getBoundingClientRect();
              const cardLeft = rect.left;
              const cardRight = rect.right;
              const cardWidth = rect.width;
              const normalCard = wrapper.querySelector(".card-normal");
              const asciiCard = wrapper.querySelector(".card-ascii");
              if (cardLeft < scannerRight && cardRight > scannerLeft) {
                const scannerIntersectLeft = Math.max(
                  scannerLeft - cardLeft,
                  0
                );
                const scannerIntersectRight = Math.min(
                  scannerRight - cardLeft,
                  cardWidth
                );
                const normalClipRight =
                  (scannerIntersectLeft / cardWidth) * 100;
                const asciiClipLeft = (scannerIntersectRight / cardWidth) * 100;
                (normalCard as HTMLElement).style.setProperty(
                  "--clip-right",
                  `${normalClipRight}%`
                );
                (asciiCard as HTMLElement).style.setProperty(
                  "--clip-left",
                  `${asciiClipLeft}%`
                );
                if (
                  !wrapper.hasAttribute("data-scanned") &&
                  scannerIntersectLeft > 0
                ) {
                  wrapper.setAttribute("data-scanned", "true");
                  const scanEffect = document.createElement("div");
                  scanEffect.className = "scan-effect";
                  wrapper.appendChild(scanEffect);
                  setTimeout(() => {
                    if (scanEffect.parentNode)
                      scanEffect.parentNode.removeChild(scanEffect);
                  }, 600);
                }
              } else {
                if (cardRight < scannerLeft) {
                  (normalCard as HTMLElement).style.setProperty(
                    "--clip-right",
                    "100%"
                  );
                  (asciiCard as HTMLElement).style.setProperty(
                    "--clip-left",
                    "100%"
                  );
                } else if (cardLeft > scannerRight) {
                  (normalCard as HTMLElement).style.setProperty(
                    "--clip-right",
                    "0%"
                  );
                  (asciiCard as HTMLElement).style.setProperty(
                    "--clip-left",
                    "0%"
                  );
                }
                wrapper.removeAttribute("data-scanned");
              }
            });
          }

          updateAsciiContent() {
            document.querySelectorAll(".ascii-content").forEach((content) => {
              if (Math.random() < 0.15) {
                const dims = this.calculateCodeDimensions(400, 250);
                content.textContent = this.generateCode(
                  dims.width,
                  dims.height
                );
              }
            });
          }

          populateCardLine() {
            this.cardLine.innerHTML = "";
            const cardsCount = 30;
            for (let i = 0; i < cardsCount; i++) {
              const cardWrapper = this.createCardWrapper(i);
              this.cardLine.appendChild(cardWrapper);
            }
          }

          startPeriodicUpdates() {
            // Disabled frequent ASCII updates to prevent UI lag.
            const updateClipping = () => {
              this.updateCardClipping();
              requestAnimationFrame(updateClipping);
            };
            updateClipping();
          }
        }

        // --- ParticleSystem (uses THREE) ---
        class ParticleSystem {
          constructor() {
            // @ts-ignore
            this.canvas = document.getElementById("particleCanvas");
            this.particleCount = 400;
            this.particles = null;
            this.velocities = null;
            this.alphas = null;
            this.init();
          }
          init() {
            // @ts-ignore
            this.scene = new THREE.Scene();
            // @ts-ignore
            this.camera = new THREE.OrthographicCamera(
              -window.innerWidth / 2,
              window.innerWidth / 2,
              125,
              -125,
              1,
              1000
            );
            this.camera.position.z = 100;
            // @ts-ignore
            this.renderer = new THREE.WebGLRenderer({
              canvas: this.canvas,
              alpha: true,
              antialias: true,
            });
            this.renderer.setSize(window.innerWidth, 250);
            this.renderer.setClearColor(0x000000, 0);
            this.createParticles();
            this.animate();
            window.addEventListener("resize", () => this.onWindowResize());
          }
          createParticles() {
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(this.particleCount * 3);
            const colors = new Float32Array(this.particleCount * 3);
            const sizes = new Float32Array(this.particleCount);
            const velocities = new Float32Array(this.particleCount);
            const canvas = document.createElement("canvas");
            canvas.width = 100;
            canvas.height = 100;
            const ctx = canvas.getContext("2d");
            const half = canvas.width / 2;
            const hue = 217;
            const gradient = ctx.createRadialGradient(
              half,
              half,
              0,
              half,
              half,
              half
            );
            gradient.addColorStop(0.025, "#fff");
            gradient.addColorStop(0.1, `hsl(${hue},61%,33%)`);
            gradient.addColorStop(0.25, `hsl(${hue},64%,6%)`);
            gradient.addColorStop(1, "transparent");
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(half, half, half, 0, Math.PI * 2);
            ctx.fill();
            const texture = new THREE.CanvasTexture(canvas);
            for (let i = 0; i < this.particleCount; i++) {
              positions[i * 3] = (Math.random() - 0.5) * window.innerWidth * 2;
              positions[i * 3 + 1] = (Math.random() - 0.5) * 250;
              positions[i * 3 + 2] = 0;
              colors[i * 3] = 1;
              colors[i * 3 + 1] = 1;
              colors[i * 3 + 2] = 1;
              const orbitRadius = Math.random() * 200 + 100;
              sizes[i] = (Math.random() * (orbitRadius - 60) + 60) / 8;
              velocities[i] = Math.random() * 60 + 30;
            }
            geometry.setAttribute(
              "position",
              new THREE.BufferAttribute(positions, 3)
            );
            geometry.setAttribute(
              "color",
              new THREE.BufferAttribute(colors, 3)
            );
            geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
            this.velocities = velocities;
            const alphas = new Float32Array(this.particleCount);
            for (let i = 0; i < this.particleCount; i++)
              alphas[i] = (Math.random() * 8 + 2) / 10;
            geometry.setAttribute(
              "alpha",
              new THREE.BufferAttribute(alphas, 1)
            );
            this.alphas = alphas;
            const material = new THREE.ShaderMaterial({
              uniforms: {
                pointTexture: { value: texture },
                size: { value: 15.0 },
              },
              vertexShader: `attribute float alpha; varying float vAlpha; varying vec3 vColor; uniform float size; void main(){ vAlpha=alpha; vColor=color; vec4 mvPosition = modelViewMatrix * vec4(position,1.0); gl_PointSize = size; gl_Position = projectionMatrix * mvPosition; }`,
              fragmentShader: `uniform sampler2D pointTexture; varying float vAlpha; varying vec3 vColor; void main(){ gl_FragColor = vec4(vColor, vAlpha) * texture2D(pointTexture, gl_PointCoord); }`,
              transparent: true,
              blending: THREE.AdditiveBlending,
              depthWrite: false,
              vertexColors: true,
            });
            this.particles = new THREE.Points(geometry, material);
            this.scene.add(this.particles);
          }
          animate() {
            requestAnimationFrame(() => this.animate());
            if (this.particles) {
              const positions =
                this.particles.geometry.attributes.position.array;
              const alphas = this.particles.geometry.attributes.alpha.array;
              const time = Date.now() * 0.001;
              for (let i = 0; i < this.particleCount; i++) {
                positions[i * 3] += this.velocities[i] * 0.016;
                if (positions[i * 3] > window.innerWidth / 2 + 100) {
                  positions[i * 3] = -window.innerWidth / 2 - 100;
                  positions[i * 3 + 1] = (Math.random() - 0.5) * 250;
                }
                positions[i * 3 + 1] += Math.sin(time + i * 0.1) * 0.5;
                const twinkle = Math.floor(Math.random() * 10);
                if (twinkle === 1 && alphas[i] > 0) alphas[i] -= 0.05;
                else if (twinkle === 2 && alphas[i] < 1) alphas[i] += 0.05;
                alphas[i] = Math.max(0, Math.min(1, alphas[i]));
              }
              this.particles.geometry.attributes.position.needsUpdate = true;
              this.particles.geometry.attributes.alpha.needsUpdate = true;
            }
            this.renderer.render(this.scene, this.camera);
          }
          onWindowResize() {
            this.camera.left = -window.innerWidth / 2;
            this.camera.right = window.innerWidth / 2;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, 250);
          }
          destroy() {
            if (this.renderer) this.renderer.dispose();
            if (this.particles) {
              this.scene.remove(this.particles);
              this.particles.geometry.dispose();
              this.particles.material.dispose();
            }
          }
        }

        // --- ParticleScanner (2D canvas) ---
        class ParticleScanner {
          constructor() {
            // @ts-ignore
            this.canvas = document.getElementById("scannerCanvas");
            this.ctx = this.canvas.getContext("2d");
            this.animationId = null;
            this.w = window.innerWidth;
            this.h = 300;
            this.particles = [];
            this.count = 0;
            this.maxParticles = 800;
            this.intensity = 0.8;
            this.lightBarX = this.w / 2;
            this.lightBarWidth = 3;
            this.fadeZone = 60;
            this.scanningActive = false;
            this.baseIntensity = this.intensity;
            this.baseMaxParticles = this.maxParticles;
            this.baseFadeZone = this.fadeZone;
            this.currentIntensity = this.intensity;
            this.currentMaxParticles = this.maxParticles;
            this.currentFadeZone = this.fadeZone;
            this.transitionSpeed = 0.05;
            this.setupCanvas();
            this.createGradientCache();
            this.initParticles();
            this.animate();
            window.addEventListener("resize", () => this.onResize());
          }
          setupCanvas() {
            this.canvas.width = this.w;
            this.canvas.height = this.h;
            this.canvas.style.width = this.w + "px";
            this.canvas.style.height = this.h + "px";
            this.ctx.clearRect(0, 0, this.w, this.h);
          }
          onResize() {
            this.w = window.innerWidth;
            this.lightBarX = this.w / 2;
            this.setupCanvas();
          }
          createGradientCache() {
            this.gradientCanvas = document.createElement("canvas");
            this.gradientCtx = this.gradientCanvas.getContext("2d");
            this.gradientCanvas.width = 16;
            this.gradientCanvas.height = 16;
            const half = this.gradientCanvas.width / 2;
            const gradient = this.gradientCtx.createRadialGradient(
              half,
              half,
              0,
              half,
              half,
              half
            );
            gradient.addColorStop(0, "rgba(255,255,255,1)");
            gradient.addColorStop(0.3, "rgba(196,181,253,0.8)");
            gradient.addColorStop(0.7, "rgba(139,92,246,0.4)");
            gradient.addColorStop(1, "transparent");
            this.gradientCtx.fillStyle = gradient;
            this.gradientCtx.beginPath();
            this.gradientCtx.arc(half, half, half, 0, Math.PI * 2);
            this.gradientCtx.fill();
          }
          random(min, max) {
            if (arguments.length < 2) {
              max = min;
              min = 0;
            }
            return Math.floor(Math.random() * (max - min + 1)) + min;
          }
          randomFloat(min, max) {
            return Math.random() * (max - min) + min;
          }
          createParticle() {
            const intensityRatio = this.intensity / this.baseIntensity;
            const speedMultiplier = 1 + (intensityRatio - 1) * 1.2;
            const sizeMultiplier = 1 + (intensityRatio - 1) * 0.7;
            return {
              x:
                this.lightBarX +
                this.randomFloat(
                  -this.lightBarWidth / 2,
                  this.lightBarWidth / 2
                ),
              y: this.randomFloat(0, this.h),
              vx: this.randomFloat(0.2, 1.0) * speedMultiplier,
              vy: this.randomFloat(-0.15, 0.15) * speedMultiplier,
              radius: this.randomFloat(0.4, 1) * sizeMultiplier,
              alpha: this.randomFloat(0.6, 1),
              decay:
                this.randomFloat(0.005, 0.025) * (2 - intensityRatio * 0.5),
              originalAlpha: 0,
              life: 1.0,
              time: 0,
              startX: 0,
              twinkleSpeed: this.randomFloat(0.02, 0.08) * speedMultiplier,
              twinkleAmount: this.randomFloat(0.1, 0.25),
            };
          }
          initParticles() {
            for (let i = 0; i < this.maxParticles; i++) {
              const p = this.createParticle();
              p.originalAlpha = p.alpha;
              p.startX = p.x;
              this.count++;
              this.particles[this.count] = p;
            }
          }
          updateParticle(p) {
            p.x += p.vx;
            p.y += p.vy;
            p.time++;
            p.alpha =
              p.originalAlpha * p.life +
              Math.sin(p.time * p.twinkleSpeed) * p.twinkleAmount;
            p.life -= p.decay;
            if (p.x > this.w + 10 || p.life <= 0) this.resetParticle(p);
          }
          resetParticle(p) {
            p.x =
              this.lightBarX +
              this.randomFloat(-this.lightBarWidth / 2, this.lightBarWidth / 2);
            p.y = this.randomFloat(0, this.h);
            p.vx = this.randomFloat(0.2, 1.0);
            p.vy = this.randomFloat(-0.15, 0.15);
            p.alpha = this.randomFloat(0.6, 1);
            p.originalAlpha = p.alpha;
            p.life = 1.0;
            p.time = 0;
            p.startX = p.x;
          }
          drawParticle(p) {
            if (p.life <= 0) return;
            let fadeAlpha = 1;
            if (p.y < this.fadeZone) fadeAlpha = p.y / this.fadeZone;
            else if (p.y > this.h - this.fadeZone)
              fadeAlpha = (this.h - p.y) / this.fadeZone;
            fadeAlpha = Math.max(0, Math.min(1, fadeAlpha));
            this.ctx.globalAlpha = p.alpha * fadeAlpha;
            this.ctx.drawImage(
              this.gradientCanvas,
              p.x - p.radius,
              p.y - p.radius,
              p.radius * 2,
              p.radius * 2
            );
          }
          drawLightBar() {
            const verticalGradient = this.ctx.createLinearGradient(
              0,
              0,
              0,
              this.h
            );
            verticalGradient.addColorStop(0, "rgba(255,255,255,0)");
            verticalGradient.addColorStop(
              this.fadeZone / this.h,
              "rgba(255,255,255,1)"
            );
            verticalGradient.addColorStop(
              1 - this.fadeZone / this.h,
              "rgba(255,255,255,1)"
            );
            verticalGradient.addColorStop(1, "rgba(255,255,255,0)");
            this.ctx.globalCompositeOperation = "lighter";
            const targetGlowIntensity = this.scanningActive ? 3.5 : 1;
            if (!this.currentGlowIntensity) this.currentGlowIntensity = 1;
            this.currentGlowIntensity +=
              (targetGlowIntensity - this.currentGlowIntensity) *
              this.transitionSpeed;
            const glowIntensity = this.currentGlowIntensity;
            const lineWidth = this.lightBarWidth;
            const coreGradient = this.ctx.createLinearGradient(
              this.lightBarX - lineWidth / 2,
              0,
              this.lightBarX + lineWidth / 2,
              0
            );
            coreGradient.addColorStop(0, "rgba(255,255,255,0)");
            coreGradient.addColorStop(
              0.3,
              `rgba(255,255,255,${0.9 * glowIntensity})`
            );
            coreGradient.addColorStop(
              0.5,
              `rgba(255,255,255,${1 * glowIntensity})`
            );
            coreGradient.addColorStop(
              0.7,
              `rgba(255,255,255,${0.9 * glowIntensity})`
            );
            coreGradient.addColorStop(1, "rgba(255,255,255,0)");
            this.ctx.globalAlpha = 1;
            this.ctx.fillStyle = coreGradient;
            const radius = 15;
            this.ctx.beginPath();
            if (this.ctx.roundRect)
              this.ctx.roundRect(
                this.lightBarX - lineWidth / 2,
                0,
                lineWidth,
                this.h,
                radius
              );
            else
              this.ctx.fillRect(
                this.lightBarX - lineWidth / 2,
                0,
                lineWidth,
                this.h
              );
            this.ctx.fill();
            this.ctx.globalCompositeOperation = "destination-in";
            this.ctx.globalAlpha = 1;
            this.ctx.fillStyle = verticalGradient;
            this.ctx.fillRect(0, 0, this.w, this.h);
          }
          render() {
            const targetIntensity = this.scanningActive
              ? 1.8
              : this.baseIntensity;
            const targetMaxParticles = this.scanningActive
              ? 2500
              : this.baseMaxParticles;
            const targetFadeZone = this.scanningActive ? 35 : this.baseFadeZone;
            this.currentIntensity +=
              (targetIntensity - this.currentIntensity) * this.transitionSpeed;
            this.currentMaxParticles +=
              (targetMaxParticles - this.currentMaxParticles) *
              this.transitionSpeed;
            this.currentFadeZone +=
              (targetFadeZone - this.currentFadeZone) * this.transitionSpeed;
            this.intensity = this.currentIntensity;
            this.maxParticles = Math.floor(this.currentMaxParticles);
            this.fadeZone = this.currentFadeZone;
            this.ctx.globalCompositeOperation = "source-over";
            this.ctx.clearRect(0, 0, this.w, this.h);
            this.drawLightBar();
            this.ctx.globalCompositeOperation = "lighter";
            for (let i = 1; i <= this.count; i++) {
              if (this.particles[i]) {
                this.updateParticle(this.particles[i]);
                this.drawParticle(this.particles[i]);
              }
            }
            const currentIntensity = this.intensity;
            const currentMaxParticles = this.maxParticles;
            if (
              Math.random() < currentIntensity &&
              this.count < currentMaxParticles
            ) {
              const p = this.createParticle();
              p.originalAlpha = p.alpha;
              p.startX = p.x;
              this.count++;
              this.particles[this.count] = p;
            }
            if (this.count > currentMaxParticles + 200) {
              const excessCount = Math.min(
                15,
                this.count - currentMaxParticles
              );
              for (let i = 0; i < excessCount; i++) {
                delete this.particles[this.count - i];
              }
              this.count -= excessCount;
            }
          }
          animate() {
            this.render();
            this.animationId = requestAnimationFrame(() => this.animate());
          }
          setScanningActive(active) {
            this.scanningActive = active;
          }
          getStats() {
            return {
              intensity: this.intensity,
              maxParticles: this.maxParticles,
              currentParticles: this.count,
              canvasWidth: this.w,
              canvasHeight: this.h,
            };
          }
          destroy() {
            if (this.animationId) cancelAnimationFrame(this.animationId);
            this.particles = [];
            this.count = 0;
          }
        }

        // initialize
        cardStream = new CardStreamController();
        // @ts-ignore
        particleSystem = new ParticleSystem();
        particleScanner = new ParticleScanner();

        // expose small API
        // @ts-ignore
        window.setScannerScanning = (active) => {
          if (particleScanner) particleScanner.setScanningActive(active);
        };
        // @ts-ignore
        window.getScannerStats = () =>
          particleScanner ? particleScanner.getStats() : null;
      })
      .catch((err) => {
        console.error("Failed to load three.js", err);
      });

    return () => {
      // cleanup
      try {
        const el = document.getElementById("film-scanner-styles");
        if (el) el.remove();
      } catch {}
      try {
        // @ts-ignore
        if (cardStream && typeof cardStream.destroy === "function")
          cardStream.destroy();
        if (particleSystem && typeof particleSystem.destroy === "function")
          particleSystem.destroy();
        if (particleScanner && typeof particleScanner.destroy === "function")
          particleScanner.destroy();
      } catch {}
    };
  }, []);

  return (
    <div className="film-scanner-root">
      <div className="container">
        <canvas id="particleCanvas"></canvas>
        <canvas id="scannerCanvas"></canvas>

        <div className="scanner" />

        <div className="card-stream" id="cardStream">
          <div className="card-line" id="cardLine" />
        </div>
      </div>
    </div>
  );
}
