"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls.js";
import SimplexNoise from "simplex-noise";
import gsap from "gsap";

/* --- LOGIC THREE.JS (GIỮ NGUYÊN) --- */
class Grass {
  pos: THREE.Vector3;
  scale: number;
  one: THREE.Vector3 | null = null;
  two: THREE.Vector3 | null = null;
  constructor(sampler: MeshSurfaceSampler) {
    const p = new THREE.Vector3();
    sampler.sample(p);
    this.pos = p.clone();
    this.scale = Math.random() * 0.01 + 0.001;
  }
  update(a: number, beatA: number, simplex: SimplexNoise) {
    const noise =
      simplex.noise4D(
        this.pos.x * 1.5,
        this.pos.y * 1.5,
        this.pos.z * 1.5,
        a * 0.0005
      ) + 1;
    this.one = this.pos.clone().multiplyScalar(1.01 + noise * 0.15 * beatA);
    this.two = this.one.clone().add(this.one.clone().setLength(this.scale));
  }
}

export default function HeartCanvas() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;

    // Setup Scene
    const scene = new THREE.Scene();
    // Camera settings tuned for mobile/desktop
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 1.2; // Zoom out xíu cho dễ nhìn

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio để đỡ nóng máy
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const controls = new TrackballControls(camera, renderer.domElement);
    controls.noPan = true;
    controls.noZoom = true; // Disable zoom để giữ layout
    controls.rotateSpeed = 2.0;

    const group = new THREE.Group();
    scene.add(group);

    // ... (Giữ nguyên logic Geometry/Loader/GSAP của bạn ở đây để đảm bảo hiệu ứng gai) ...
    // --- BẮT ĐẦU ĐOẠN CODE CŨ ---
    let heart: THREE.Mesh | null = null;
    let sampler: MeshSurfaceSampler | null = null;
    let originHeart: number[] | null = null;
    const geometryLines = new THREE.BufferGeometry();
    const materialLines = new THREE.LineBasicMaterial({
      color: 0xff5555,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    }); // Màu hồng đậm hơn chút
    const lines = new THREE.LineSegments(geometryLines, materialLines);
    group.add(lines);
    const simplex = new SimplexNoise();
    const spikes: Grass[] = [];
    let positions: number[] = [];
    function initSpikes() {
      positions = [];
      spikes.length = 0;
      for (let i = 0; i < 10000; i++) {
        // Giảm xuống 10k particle cho mượt
        if (sampler) spikes.push(new Grass(sampler));
      }
    }
    const beat = { a: 0 };
    let rafId: number | null = null;

    function render(a: number) {
      positions = [];
      spikes.forEach((g) => {
        g.update(a, beat.a, simplex);
        if (g.one && g.two) {
          positions.push(g.one.x, g.one.y, g.one.z);
          positions.push(g.two.x, g.two.y, g.two.z);
        }
      });
      geometryLines.setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(positions), 3)
      );
      controls.update();
      group.rotation.y += 0.005; // Tự quay nhẹ
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(render);
    }

    const loader = new OBJLoader();
    const primaryUrl = "https://assets.codepen.io/127738/heart_2.obj";

    loader.load(primaryUrl, (obj) => {
      const mesh = obj.children[0] as THREE.Mesh;
      heart = mesh;
      heart.geometry.rotateX(-Math.PI * 0.5);
      heart.geometry.scale(0.04, 0.04, 0.04);
      heart.geometry.translate(0, -0.4, 0);
      sampler = new MeshSurfaceSampler(heart).build();
      initSpikes();
      gsap
        .timeline({ repeat: -1, repeatDelay: 0.3 })
        .to(beat, { a: 1.5, duration: 0.6, ease: "power2.in" }) // Nhịp tim mạnh hơn
        .to(beat, { a: 0.0, duration: 0.6, ease: "power3.out" });
      rafId = requestAnimationFrame(render);
    });
    // --- KẾT THÚC ĐOẠN CODE CŨ ---

    // Handle Resize thông minh
    const onWindowResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onWindowResize);

    return () => {
      window.removeEventListener("resize", onWindowResize);
      if (rafId) cancelAnimationFrame(rafId);
      renderer.dispose();
      if (container.contains(renderer.domElement))
        container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        zIndex: 10,
      }}
      className="heart-canvas-container"
    >
      {/* Glow effect phía sau trái tim */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "60%",
          height: "60%",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,85,85,0.4) 0%, rgba(0,0,0,0) 70%)",
          filter: "blur(30px)",
          zIndex: -1,
        }}
      ></div>
    </div>
  );
}
