"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three"; // IMPORT TRỰC TIẾP ĐỂ TẬN DỤNG SERVER BUILD

// --- CẤU HÌNH ẢNH TỪ PUBLIC FOLDER ---
// Cách dùng: Nếu bạn để ảnh ở "public/card1.png", hãy điền "/card1.png"
// Khuyên dùng: Tạo thư mục "public/cards" rồi điền "/cards/image1.png"
const CARD_IMAGES = [
  "/chill/anh1.jpg",
  "/chill/anh2.jpg",
  "/chill/anh3.jpg",
  "/chill/anh5.jpg",
  "/chill/anh6.jpg",
  "/chill/anhduphong.jpg",
  "/chill/a7.jpg",
  "/chill/a8.jpg",
  "/chill/a9.jpg",
  "/chill/a10.jpg",
  "/chill/a11.jpg",
  "/chill/b1.jpg",
  "/chill/b2.jpg",
  "/chill/b3.jpg",
  "/chill/b4.jpg",
  "/chill/b5.jpg",
  // Nếu chưa có ảnh thật, nó sẽ tự fallback về Canvas gradient như logic cũ
];

const CardStream = () => {
  const cardStreamRef = useRef<any>(null);

  // --- MAIN LOGIC (PARTICLES & SCANNER & CARDS) ---
  const initCardStreamSystem = () => {
    // Không cần check window.THREE nữa vì đã import trực tiếp

    // --- LOGIC CLASS GỐC ---
    class CardStreamController {
      container: HTMLElement;
      cardLine: HTMLElement;
      position: number;
      velocity: number;
      direction: number;
      isAnimating: boolean;
      isDragging: boolean;
      lastTime: number;
      lastMouseX: number;
      mouseVelocity: number;
      friction: number;
      minVelocity: number;
      containerWidth: number;
      cardLineWidth: number;

      constructor() {
        this.container = document.getElementById("cardStream")!;
        this.cardLine = document.getElementById("cardLine")!;

        this.position = 0;
        this.velocity = 120; // Default speed
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
        if (!this.container || !this.cardLine) return;
        this.containerWidth = this.container.offsetWidth;
        const cardWidth = 400;
        const cardGap = 60;
        const cardCount = this.cardLine.children.length;
        this.cardLineWidth = (cardWidth + cardGap) * cardCount;
      }

      setupEventListeners() {
        this.cardLine.addEventListener("mousedown", (e: any) =>
          this.startDrag(e)
        );
        document.addEventListener("mousemove", (e: any) => this.onDrag(e));
        document.addEventListener("mouseup", () => this.endDrag());

        this.cardLine.addEventListener(
          "touchstart",
          (e: any) => this.startDrag(e.touches[0]),
          { passive: false }
        );
        document.addEventListener(
          "touchmove",
          (e: any) => this.onDrag(e.touches[0]),
          { passive: false }
        );
        document.addEventListener("touchend", () => this.endDrag());

        this.cardLine.addEventListener("wheel", (e: any) => this.onWheel(e));
        this.cardLine.addEventListener("selectstart", (e) =>
          e.preventDefault()
        );
        this.cardLine.addEventListener("dragstart", (e) => e.preventDefault());

        window.addEventListener("resize", () => this.calculateDimensions());
      }

      startDrag(e: any) {
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

      onDrag(e: any) {
        if (!this.isDragging) return;

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

        document.body.style.userSelect = "";
        document.body.style.cursor = "";
      }

      animate() {
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        if (this.isAnimating && !this.isDragging) {
          if (this.velocity > this.minVelocity) {
            this.velocity *= this.friction;
          } else {
            this.velocity = Math.max(this.minVelocity, this.velocity);
          }

          this.position += this.velocity * this.direction * deltaTime;
          this.updateCardPosition();
        }

        requestAnimationFrame(() => this.animate());
      }

      updateCardPosition() {
        const containerWidth = this.containerWidth;
        const cardLineWidth = this.cardLineWidth;

        if (this.position < -cardLineWidth) {
          this.position = containerWidth;
        } else if (this.position > containerWidth) {
          this.position = -cardLineWidth;
        }

        this.cardLine.style.transform = `translateX(${this.position}px)`;
        this.updateCardClipping();
      }

      onWheel(e: any) {
        const scrollSpeed = 20;
        const delta = e.deltaY > 0 ? scrollSpeed : -scrollSpeed;
        this.position += delta;
        this.updateCardPosition();
        this.updateCardClipping();
      }

      generateCode(width: number, height: number) {
        const randInt = (min: number, max: number) =>
          Math.floor(Math.random() * (max - min + 1)) + min;
        const pick = (arr: any[]) => arr[randInt(0, arr.length - 1)];

        const library = [
          "// compiled preview • scanner demo",
          "/* generated for visual effect */",
          "const SCAN_WIDTH = 8;",
          "const FADE_ZONE = 35;",
          "const MAX_PARTICLES = 2500;",
          "function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }",
          "function lerp(a, b, t) { return a + (b - a) * t; }",
          "class Particle { constructor(x, y) { this.x = x; this.y = y; } }",
          "const scanner = { x: 0, width: SCAN_WIDTH, glow: 3.5 };",
        ];

        for (let i = 0; i < 20; i++)
          library.push(`const v${i} = ${randInt(0, 999)};`);

        let flow = library.join(" ");
        flow = flow.replace(/\s+/g, " ").trim();
        const totalChars = width * height;
        while (flow.length < totalChars + width) {
          flow += " " + pick(library).replace(/\s+/g, " ").trim();
        }

        let out = "";
        let offset = 0;
        for (let row = 0; row < height; row++) {
          let line = flow.slice(offset, offset + width);
          if (line.length < width)
            line = line + " ".repeat(width - line.length);
          out += line + (row < height - 1 ? "\n" : "");
          offset += width;
        }
        return out;
      }

      calculateCodeDimensions(cardWidth: number, cardHeight: number) {
        const fontSize = 11;
        const lineHeight = 13;
        const charWidth = 6;
        const width = Math.floor(cardWidth / charWidth);
        const height = Math.floor(cardHeight / lineHeight);
        return { width, height, fontSize, lineHeight };
      }

      createCardWrapper(index: number) {
        const wrapper = document.createElement("div");
        wrapper.className = "card-wrapper";

        const normalCard = document.createElement("div");
        normalCard.className = "card card-normal";

        // --- SỬA ĐỔI: Dùng mảng ảnh từ Public Folder ---
        const cardImage = document.createElement("img");
        cardImage.className = "card-image";

        // Lấy đường dẫn từ mảng CARD_IMAGES
        cardImage.src = CARD_IMAGES[index % CARD_IMAGES.length];
        cardImage.alt = "Credit Card";

        // Fallback: Nếu ảnh không tồn tại trong public, vẽ Canvas Gradient
        cardImage.onerror = () => {
          const c = document.createElement("canvas");
          c.width = 400;
          c.height = 250;
          const ctx = c.getContext("2d");
          if (ctx) {
            const g = ctx.createLinearGradient(0, 0, 400, 250);
            g.addColorStop(0, "#667eea");
            g.addColorStop(1, "#764ba2");
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, 400, 250);
            cardImage.src = c.toDataURL();
          }
        };

        normalCard.appendChild(cardImage);

        const asciiCard = document.createElement("div");
        asciiCard.className = "card card-ascii";
        const asciiContent = document.createElement("div");
        asciiContent.className = "ascii-content";

        const { width, height, fontSize, lineHeight } =
          this.calculateCodeDimensions(400, 250);
        asciiContent.style.fontSize = fontSize + "px";
        asciiContent.style.lineHeight = lineHeight + "px";
        asciiContent.textContent = this.generateCode(width, height);

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
        let anyScanningActive = false;

        document.querySelectorAll(".card-wrapper").forEach((wrapper: any) => {
          const rect = wrapper.getBoundingClientRect();
          const cardLeft = rect.left;
          const cardRight = rect.right;
          const cardWidth = rect.width;

          const normalCard = wrapper.querySelector(".card-normal");
          const asciiCard = wrapper.querySelector(".card-ascii");

          if (cardLeft < scannerRight && cardRight > scannerLeft) {
            anyScanningActive = true;
            const scannerIntersectLeft = Math.max(scannerLeft - cardLeft, 0);
            const scannerIntersectRight = Math.min(
              scannerRight - cardLeft,
              cardWidth
            );

            const normalClipRight = (scannerIntersectLeft / cardWidth) * 100;
            const asciiClipLeft = (scannerIntersectRight / cardWidth) * 100;

            normalCard.style.setProperty("--clip-right", `${normalClipRight}%`);
            asciiCard.style.setProperty("--clip-left", `${asciiClipLeft}%`);

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
              normalCard.style.setProperty("--clip-right", "100%");
              asciiCard.style.setProperty("--clip-left", "100%");
            } else if (cardLeft > scannerRight) {
              normalCard.style.setProperty("--clip-right", "0%");
              asciiCard.style.setProperty("--clip-left", "0%");
            }
            wrapper.removeAttribute("data-scanned");
          }
        });

        if ((window as any).setScannerScanning) {
          (window as any).setScannerScanning(anyScanningActive);
        }
      }

      updateAsciiContent() {
        document.querySelectorAll(".ascii-content").forEach((content) => {
          if (Math.random() < 0.15) {
            const { width, height } = this.calculateCodeDimensions(400, 250);
            content.textContent = this.generateCode(width, height);
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
        setInterval(() => {
          this.updateAsciiContent();
        }, 200);

        const updateClipping = () => {
          this.updateCardClipping();
          requestAnimationFrame(updateClipping);
        };
        updateClipping();
      }
    }

    // --- PARTICLE SYSTEM ---
    class ParticleSystem {
      scene: THREE.Scene | null;
      camera: THREE.OrthographicCamera | null;
      renderer: THREE.WebGLRenderer | null;
      particles: THREE.Points | null;
      particleCount: number;
      canvas: HTMLElement;
      velocities: Float32Array | undefined;
      alphas: Float32Array | undefined;

      constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = null;
        this.particleCount = 400;
        this.canvas = document.getElementById("particleCanvas")!;

        this.init();
      }

      init() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(
          -window.innerWidth / 2,
          window.innerWidth / 2,
          125,
          -125,
          1,
          1000
        );
        this.camera.position.z = 100;

        // --- OPTIMIZATION: Bật High Performance cho GPU ---
        this.renderer = new THREE.WebGLRenderer({
          canvas: this.canvas,
          alpha: true,
          antialias: true,
          powerPreference: "high-performance", // Ưu tiên sức mạnh GPU tối đa
          precision: "mediump", // Cân bằng hiệu năng
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
        if (ctx) {
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
          gradient.addColorStop(0.1, `hsl(${hue}, 61%, 33%)`);
          gradient.addColorStop(0.25, `hsl(${hue}, 64%, 6%)`);
          gradient.addColorStop(1, "transparent");
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(half, half, half, 0, Math.PI * 2);
          ctx.fill();
        }

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
        geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
        this.velocities = velocities;

        const alphas = new Float32Array(this.particleCount);
        for (let i = 0; i < this.particleCount; i++) {
          alphas[i] = (Math.random() * 8 + 2) / 10;
        }
        geometry.setAttribute("alpha", new THREE.BufferAttribute(alphas, 1));
        this.alphas = alphas;

        const material = new THREE.ShaderMaterial({
          uniforms: { pointTexture: { value: texture }, size: { value: 15.0 } },
          vertexShader: `
            attribute float alpha; varying float vAlpha; varying vec3 vColor; uniform float size;
            void main() { vAlpha = alpha; vColor = color; vec4 mvPosition = modelViewMatrix * vec4(position, 1.0); gl_PointSize = size; gl_Position = projectionMatrix * mvPosition; }
          `,
          fragmentShader: `
            uniform sampler2D pointTexture; varying float vAlpha; varying vec3 vColor;
            void main() { gl_FragColor = vec4(vColor, vAlpha) * texture2D(pointTexture, gl_PointCoord); }
          `,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          vertexColors: true,
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene!.add(this.particles);
      }

      animate() {
        requestAnimationFrame(() => this.animate());
        if (this.particles && this.scene && this.camera && this.renderer) {
          const positions = this.particles.geometry.attributes.position
            .array as Float32Array;
          const alphas = this.particles.geometry.attributes.alpha
            .array as Float32Array;
          const time = Date.now() * 0.001;
          for (let i = 0; i < this.particleCount; i++) {
            if (this.velocities) positions[i * 3] += this.velocities[i] * 0.016;
            if (positions[i * 3] > window.innerWidth / 2 + 100) {
              positions[i * 3] = -window.innerWidth / 2 - 100;
              positions[i * 3 + 1] = (Math.random() - 0.5) * 250;
            }
            positions[i * 3 + 1] += Math.sin(time + i * 0.1) * 0.5;
            if (this.alphas) {
              const twinkle = Math.floor(Math.random() * 10);
              if (twinkle === 1 && alphas[i] > 0) alphas[i] -= 0.05;
              else if (twinkle === 2 && alphas[i] < 1) alphas[i] += 0.05;
              alphas[i] = Math.max(0, Math.min(1, alphas[i]));
            }
          }
          this.particles.geometry.attributes.position.needsUpdate = true;
          this.particles.geometry.attributes.alpha.needsUpdate = true;
          this.renderer.render(this.scene, this.camera);
        }
      }
      onWindowResize() {
        if (!this.camera || !this.renderer) return;
        this.camera.left = -window.innerWidth / 2;
        this.camera.right = window.innerWidth / 2;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, 250);
      }
    }

    // --- PARTICLE SCANNER ---
    class ParticleScanner {
      canvas: HTMLCanvasElement;
      ctx: CanvasRenderingContext2D;
      animationId: any;
      w: number;
      h: number;
      particles: any[];
      count: number;
      maxParticles: number;
      intensity: number;
      lightBarX: number;
      lightBarWidth: number;
      fadeZone: number;
      scanTargetIntensity: number;
      scanTargetParticles: number;
      scanTargetFadeZone: number;
      scanningActive: boolean;
      baseIntensity: number;
      baseMaxParticles: number;
      baseFadeZone: number;
      currentIntensity: number;
      currentMaxParticles: number;
      currentFadeZone: number;
      transitionSpeed: number;
      gradientCanvas: any;
      gradientCtx: any;
      currentGlowIntensity: number | undefined;

      constructor() {
        this.canvas = document.getElementById(
          "scannerCanvas"
        ) as HTMLCanvasElement;
        this.ctx = this.canvas.getContext("2d")!;
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

        this.scanTargetIntensity = 1.8;
        this.scanTargetParticles = 2500;
        this.scanTargetFadeZone = 35;
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
        gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
        gradient.addColorStop(0.3, "rgba(196, 181, 253, 0.8)");
        gradient.addColorStop(0.7, "rgba(139, 92, 246, 0.4)");
        gradient.addColorStop(1, "transparent");
        this.gradientCtx.fillStyle = gradient;
        this.gradientCtx.beginPath();
        this.gradientCtx.arc(half, half, half, 0, Math.PI * 2);
        this.gradientCtx.fill();
      }
      randomFloat(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      createParticle() {
        const intensityRatio = this.intensity / this.baseIntensity;
        const speedMultiplier = 1 + (intensityRatio - 1) * 1.2;
        const sizeMultiplier = 1 + (intensityRatio - 1) * 0.7;
        return {
          x:
            this.lightBarX +
            this.randomFloat(-this.lightBarWidth / 2, this.lightBarWidth / 2),
          y: this.randomFloat(0, this.h),
          vx: this.randomFloat(0.2, 1.0) * speedMultiplier,
          vy: this.randomFloat(-0.15, 0.15) * speedMultiplier,
          radius: this.randomFloat(0.4, 1) * sizeMultiplier,
          alpha: this.randomFloat(0.6, 1),
          decay: this.randomFloat(0.005, 0.025) * (2 - intensityRatio * 0.5),
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
          const particle = this.createParticle();
          particle.originalAlpha = particle.alpha;
          particle.startX = particle.x;
          this.count++;
          this.particles[this.count] = particle;
        }
      }
      updateParticle(particle: any) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.time++;
        particle.alpha =
          particle.originalAlpha * particle.life +
          Math.sin(particle.time * particle.twinkleSpeed) *
            particle.twinkleAmount;
        particle.life -= particle.decay;
        if (particle.x > this.w + 10 || particle.life <= 0)
          this.resetParticle(particle);
      }
      resetParticle(particle: any) {
        particle.x =
          this.lightBarX +
          this.randomFloat(-this.lightBarWidth / 2, this.lightBarWidth / 2);
        particle.y = this.randomFloat(0, this.h);
        particle.vx = this.randomFloat(0.2, 1.0);
        particle.vy = this.randomFloat(-0.15, 0.15);
        particle.alpha = this.randomFloat(0.6, 1);
        particle.originalAlpha = particle.alpha;
        particle.life = 1.0;
        particle.time = 0;
        particle.startX = particle.x;
      }
      drawParticle(particle: any) {
        if (particle.life <= 0) return;
        let fadeAlpha = 1;
        if (particle.y < this.fadeZone) fadeAlpha = particle.y / this.fadeZone;
        else if (particle.y > this.h - this.fadeZone)
          fadeAlpha = (this.h - particle.y) / this.fadeZone;
        fadeAlpha = Math.max(0, Math.min(1, fadeAlpha));
        this.ctx.globalAlpha = particle.alpha * fadeAlpha;
        this.ctx.drawImage(
          this.gradientCanvas,
          particle.x - particle.radius,
          particle.y - particle.radius,
          particle.radius * 2,
          particle.radius * 2
        );
      }
      drawLightBar() {
        const verticalGradient = this.ctx.createLinearGradient(0, 0, 0, this.h);
        verticalGradient.addColorStop(0, "rgba(255, 255, 255, 0)");
        verticalGradient.addColorStop(
          this.fadeZone / this.h,
          "rgba(255, 255, 255, 1)"
        );
        verticalGradient.addColorStop(
          1 - this.fadeZone / this.h,
          "rgba(255, 255, 255, 1)"
        );
        verticalGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
        this.ctx.globalCompositeOperation = "lighter";
        const targetGlowIntensity = this.scanningActive ? 3.5 : 1;
        if (!this.currentGlowIntensity) this.currentGlowIntensity = 1;
        this.currentGlowIntensity +=
          (targetGlowIntensity - this.currentGlowIntensity) *
          this.transitionSpeed;
        const glowIntensity = this.currentGlowIntensity;

        const coreGradient = this.ctx.createLinearGradient(
          this.lightBarX - 1.5,
          0,
          this.lightBarX + 1.5,
          0
        );
        coreGradient.addColorStop(
          0.5,
          `rgba(255, 255, 255, ${1 * glowIntensity})`
        );
        this.ctx.globalAlpha = 1;
        this.ctx.fillStyle = coreGradient;
        this.ctx.beginPath();
        this.ctx.fillRect(this.lightBarX - 1.5, 0, 3, this.h);

        const glow1Gradient = this.ctx.createLinearGradient(
          this.lightBarX - 6,
          0,
          this.lightBarX + 6,
          0
        );
        glow1Gradient.addColorStop(
          0.5,
          `rgba(196, 181, 253, ${0.8 * glowIntensity})`
        );
        this.ctx.globalAlpha = this.scanningActive ? 1.0 : 0.8;
        this.ctx.fillStyle = glow1Gradient;
        this.ctx.fillRect(this.lightBarX - 6, 0, 12, this.h);

        this.ctx.globalCompositeOperation = "destination-in";
        this.ctx.globalAlpha = 1;
        this.ctx.fillStyle = verticalGradient;
        this.ctx.fillRect(0, 0, this.w, this.h);
      }
      render() {
        const targetIntensity = this.scanningActive
          ? this.scanTargetIntensity
          : this.baseIntensity;
        const targetMaxParticles = this.scanningActive
          ? this.scanTargetParticles
          : this.baseMaxParticles;
        const targetFadeZone = this.scanningActive
          ? this.scanTargetFadeZone
          : this.baseFadeZone;
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
        if (Math.random() < this.intensity && this.count < this.maxParticles) {
          const p = this.createParticle();
          p.originalAlpha = p.alpha;
          p.startX = p.x;
          this.count++;
          this.particles[this.count] = p;
        }
        const intensityRatio = this.intensity / this.baseIntensity;
        if (
          intensityRatio > 1.1 &&
          Math.random() < (intensityRatio - 1.0) * 1.2
        ) {
          const p = this.createParticle();
          p.originalAlpha = p.alpha;
          p.startX = p.x;
          this.count++;
          this.particles[this.count] = p;
        }

        if (this.count > this.currentMaxParticles + 200) {
          const excess = Math.min(15, this.count - this.currentMaxParticles);
          for (let k = 0; k < excess; k++)
            delete this.particles[this.count - k];
          this.count -= excess;
        }
      }
      animate() {
        this.render();
        this.animationId = requestAnimationFrame(() => this.animate());
      }
      setScanningActive(active: boolean) {
        this.scanningActive = active;
      }
    }

    // --- INITIALIZE ALL CLASSES ---
    const cardStream = new CardStreamController();
    cardStreamRef.current = cardStream;
    const particleSystem = new ParticleSystem();
    const particleScanner = new ParticleScanner();

    (window as any).setScannerScanning = (active: boolean) => {
      if (particleScanner) particleScanner.setScanningActive(active);
    };
  };

  useEffect(() => {
    // Chạy ngay lập tức khi Component Render
    initCardStreamSystem();
  }, []);

  return (
    <>
      <div className="absolute inset-0 z-10 w-full h-full pointer-events-none">
        <div className="container pointer-events-auto" id="cardStream">
          <canvas id="particleCanvas"></canvas>
          <canvas id="scannerCanvas"></canvas>

          <div className="scanner"></div>

          <div className="card-stream">
            <div className="card-line" id="cardLine"></div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;700&display=swap");

        /* Container chính */
        .container {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: flex-end; /* Căn xuống đáy */
          justify-content: center;
        }

        /* Card Stream Container */
        .card-stream {
          position: absolute;
          bottom: 80px; /* Cách đáy 80px */
          width: 100vw;
          height: 250px;
          display: flex;
          align-items: center;
          overflow: visible;
        }

        .card-line {
          display: flex;
          align-items: center;
          gap: 60px;
          white-space: nowrap;
          cursor: grab;
          user-select: none;
          will-change: transform;
        }
        .card-line:active {
          cursor: grabbing;
        }
        .card-line.dragging {
          cursor: grabbing;
        }

        .card-wrapper {
          position: relative;
          width: 400px;
          height: 250px;
          flex-shrink: 0;
          will-change: transform; /* Tối ưu GPU */
        }
        .card {
          position: absolute;
          top: 0;
          left: 0;
          width: 400px;
          height: 250px;
          border-radius: 15px;
          overflow: hidden;
        }
        .card-normal {
          background: transparent;
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 0;
          color: white;
          z-index: 2;
          position: relative;
          overflow: hidden;
          clip-path: inset(0 0 0 var(--clip-right, 0%));
          will-change: clip-path; /* Tối ưu GPU */
        }
        .card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 15px;
          transition: all 0.3s ease;
          filter: brightness(1.1) contrast(1.1);
          box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.1);
        }
        .card-ascii {
          background: transparent;
          z-index: 1;
          position: absolute;
          top: 0;
          left: 0;
          width: 400px;
          height: 250px;
          border-radius: 15px;
          overflow: hidden;
          clip-path: inset(0 calc(100% - var(--clip-left, 0%)) 0 0);
          will-change: clip-path; /* Tối ưu GPU */
        }

        .ascii-content {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          color: rgba(220, 210, 255, 0.6);
          font-family: "Courier New", monospace;
          font-size: 11px;
          line-height: 13px;
          overflow: hidden;
          white-space: pre;
          animation: glitch 0.1s infinite linear alternate-reverse;
          -webkit-mask-image: linear-gradient(
            to right,
            rgba(0, 0, 0, 1) 0%,
            rgba(0, 0, 0, 0.8) 30%,
            rgba(0, 0, 0, 0.6) 50%,
            rgba(0, 0, 0, 0.4) 80%,
            rgba(0, 0, 0, 0.2) 100%
          );
          mask-image: linear-gradient(
            to right,
            rgba(0, 0, 0, 1) 0%,
            rgba(0, 0, 0, 0.8) 30%,
            rgba(0, 0, 0, 0.6) 50%,
            rgba(0, 0, 0, 0.4) 80%,
            rgba(0, 0, 0, 0.2) 100%
          );
        }
        @keyframes glitch {
          0% {
            opacity: 1;
          }
          15% {
            opacity: 0.9;
          }
          50% {
            opacity: 1;
          }
          99% {
            opacity: 0.9;
          }
        }

        .scan-effect {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(0, 255, 255, 0.4),
            transparent
          );
          animation: scanEffect 0.6s ease-out;
          pointer-events: none;
          z-index: 5;
        }
        @keyframes scanEffect {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateX(100%);
            opacity: 0;
          }
        }

        /* Particles: Căn theo đáy để khớp với cards */
        #particleCanvas {
          position: absolute;
          top: auto;
          bottom: 80px; /* Khớp với .card-stream */
          left: 0;
          width: 100vw;
          height: 250px;
          z-index: 0;
          pointer-events: none;
        }

        /* Scanner: Căn theo đáy để khớp với cards */
        #scannerCanvas {
          position: absolute;
          top: auto;
          bottom: 55px;
          left: -3px;
          width: 100vw;
          height: 300px;
          z-index: 15;
          pointer-events: none;
        }
      `}</style>
    </>
  );
};

export default CardStream;
