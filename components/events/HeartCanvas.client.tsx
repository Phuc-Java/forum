"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls.js";
import SimplexNoise from "simplex-noise";
import gsap from "gsap";

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

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.01,
      1000
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.appendChild(renderer.domElement);

    camera.position.z = 1;

    const controls = new TrackballControls(camera, renderer.domElement);
    controls.noPan = true;
    controls.maxDistance = 3;
    controls.minDistance = 0.7;

    const group = new THREE.Group();
    scene.add(group);

    let heart: THREE.Mesh | null = null;
    let sampler: MeshSurfaceSampler | null = null;
    let originHeart: number[] | null = null;

    const geometryLines = new THREE.BufferGeometry();
    const materialLines = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
    });
    const lines = new THREE.LineSegments(geometryLines, materialLines);
    group.add(lines);

    const simplex = new SimplexNoise();

    const spikes: Grass[] = [];
    let positions: number[] = [];

    function initSpikes() {
      positions = [];
      spikes.length = 0;
      for (let i = 0; i < 12000; i++) {
        if (sampler) spikes.push(new Grass(sampler));
      }
    }

    const beat = { a: 0 };

    let rafId: number | null = null;

    function onWindowResize() {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / Math.max(h, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      controls.handleResize?.();
    }

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

      if (heart && originHeart) {
        const vs = (heart.geometry as THREE.BufferGeometry).attributes.position
          .array as Float32Array;
        for (let i = 0; i < vs.length; i += 3) {
          const v = new THREE.Vector3(
            originHeart[i],
            originHeart[i + 1],
            originHeart[i + 2]
          );
          const noise =
            simplex.noise4D(
              originHeart[i] * 1.5,
              originHeart[i + 1] * 1.5,
              originHeart[i + 2] * 1.5,
              a * 0.0005
            ) + 1;
          v.multiplyScalar(1 + noise * 0.15 * beat.a);
          vs[i] = v.x;
          vs[i + 1] = v.y;
          vs[i + 2] = v.z;
        }
        (
          heart.geometry as THREE.BufferGeometry
        ).attributes.position.needsUpdate = true;
      }

      controls.update();
      renderer.render(scene, camera);
      rafId = renderer.domElement ? requestAnimationFrame(render) : null;
    }

    // load obj and start
    const loader = new OBJLoader();
    loader.load("https://assets.codepen.io/127738/heart_2.obj", (obj) => {
      heart = obj.children[0] as THREE.Mesh;
      heart.geometry.rotateX(-Math.PI * 0.5);
      heart.geometry.scale(0.04, 0.04, 0.04);
      heart.geometry.translate(0, -0.4, 0);
      heart.material = new THREE.MeshBasicMaterial({ color: 0xff5555 });
      group.add(heart);

      originHeart = Array.from(
        (heart.geometry as THREE.BufferGeometry).attributes.position
          .array as ArrayLike<number>
      );
      sampler = new MeshSurfaceSampler(heart).build();
      initSpikes();

      gsap
        .timeline({ repeat: -1, repeatDelay: 0.3 })
        .to(beat, { a: 1.2, duration: 0.6, ease: "power2.in" })
        .to(beat, { a: 0.0, duration: 0.6, ease: "power3.out" });

      gsap.to(group.rotation, {
        y: Math.PI * 2,
        duration: 12,
        ease: "none",
        repeat: -1,
      });

      // start render loop
      rafId = requestAnimationFrame(render);
    });

    window.addEventListener("resize", onWindowResize);

    // initial resize
    onWindowResize();

    return () => {
      window.removeEventListener("resize", onWindowResize);
      if (rafId) cancelAnimationFrame(rafId);
      controls.dispose?.();
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode)
        renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      ref={mountRef}
    />
  );
}
