/* eslint-disable react/no-unknown-property */
"use client";
import { useEffect, useRef, useState } from "react";
import {
  Canvas,
  extend,
  useFrame,
  type ThreeEvent,
  type ThreeElement,
} from "@react-three/fiber";
import {
  useGLTF,
  useTexture,
  Environment,
  Lightformer,
} from "@react-three/drei";
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
  type RigidBodyProps,
} from "@react-three/rapier";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import * as THREE from "three";
// --- BẮT ĐẦU ĐOẠN CẦN THÊM ---
declare module "@react-three/fiber" {
  interface ThreeElements {
    // Cú pháp mới gọn hơn, chỉ cần truyền typeof Class
    meshLineGeometry: ThreeElement<typeof MeshLineGeometry>;
    meshLineMaterial: any;
  }
}
// --- KẾT THÚC ĐOẠN CẦN THÊM ---
const cardGLB = "/lanyard/card.glb";
const lanyardTexture = "/lanyard/lanyard.png";

extend({ MeshLineGeometry, MeshLineMaterial });

interface LanyardProps {
  position?: [number, number, number];
  gravity?: [number, number, number];
  fov?: number;
  transparent?: boolean;
}

export default function Lanyard({
  position = [0, 0, 20],
  gravity = [0, -40, 0],
  fov = 20,
  transparent = true,
}: LanyardProps) {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-auto bg-transparent">
      <Canvas
        camera={{ position, fov }}
        gl={{ alpha: transparent }}
        onCreated={({ gl }) =>
          gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)
        }
      >
        <ambientLight intensity={Math.PI} />
        <Physics gravity={gravity} timeStep={1 / 60}>
          <Band />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer
            intensity={2}
            color="white"
            position={[0, -1, 5]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[-1, -1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[1, 1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={10}
            color="white"
            position={[-10, 0, 14]}
            rotation={[0, Math.PI / 2, Math.PI / 3]}
            scale={[100, 10, 1]}
          />
        </Environment>
      </Canvas>
    </div>
  );
}

interface BandProps {
  maxSpeed?: number;
  minSpeed?: number;
}

function Band({ maxSpeed = 50, minSpeed = 0 }: BandProps) {
  const band = useRef<THREE.Mesh | null>(null);
  const fixed = useRef<any | null>(null);
  const j1 = useRef<any | null>(null);
  const j2 = useRef<any | null>(null);
  const j3 = useRef<any | null>(null);
  const card = useRef<any | null>(null);

  const vec = new THREE.Vector3();
  const ang = new THREE.Vector3();
  const rot = new THREE.Vector3();
  const dir = new THREE.Vector3();

  const segmentProps: Pick<
    RigidBodyProps,
    "type" | "canSleep" | "colliders" | "angularDamping" | "linearDamping"
  > = {
    type: "dynamic" as RigidBodyProps["type"],
    canSleep: true,
    colliders: false,
    angularDamping: 4,
    linearDamping: 4,
  };

  const { nodes, materials } = useGLTF(cardGLB) as unknown as {
    nodes: Record<string, THREE.Mesh & { geometry: THREE.BufferGeometry }>;
    materials: Record<
      string,
      THREE.MeshPhysicalMaterial & { map?: THREE.Texture }
    >;
  };
  const texture = useTexture(lanyardTexture);

  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
      ])
  );
  const [dragged, drag] = useState<false | THREE.Vector3>(false);
  const [hovered, hover] = useState(false);

  const [isSmall, setIsSmall] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 1024;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = (): void => {
      setIsSmall(window.innerWidth < 1024);
    };

    window.addEventListener("resize", handleResize);
    return (): void => window.removeEventListener("resize", handleResize);
  }, []);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1.7]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1.7]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1.7]);

  // FIX: Điều chỉnh điểm neo
  // Giảm từ 1.45 xuống 1.15
  // Ý nghĩa: Điểm neo trên thẻ (Hook) sẽ gần tâm thẻ hơn -> Thẻ bị kéo lên trên -> Dây sẽ lọt vào móc.
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 1.95, 0],
  ]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? "grabbing" : "grab";
      return () => {
        document.body.style.cursor = "auto";
      };
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (dragged && typeof dragged !== "boolean") {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));

      const minX = -2;
      const targetX = vec.x - dragged.x;
      const targetY = vec.y - dragged.y;
      const targetZ = vec.z - dragged.z;
      const clampedX = Math.max(minX, targetX);

      [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp());

      card.current?.setNextKinematicTranslation({
        x: clampedX,
        y: targetY,
        z: targetZ,
      });
    }
    if (fixed.current) {
      [j1, j2].forEach((ref) => {
        if (!ref.current.lerped)
          ref.current.lerped = new THREE.Vector3().copy(
            ref.current.translation()
          );
        const clampedDistance = Math.max(
          0.1,
          Math.min(1, ref.current.lerped.distanceTo(ref.current.translation()))
        );
        ref.current.lerped.lerp(
          ref.current.translation(),
          delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed))
        );
      });

      const cardPos = card.current.translation();
      const minX = -2;

      if (cardPos.x < minX) {
        const clampedX = minX;
        card.current.setTranslation(
          { x: clampedX, y: cardPos.y, z: cardPos.z },
          true
        );
        const vel = card.current.linvel();
        card.current.setLinvel({ x: vel.x * 0.3, y: vel.y, z: vel.z }, true);
      }

      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());
      (
        band.current!.geometry as unknown as {
          setPoints: (points: THREE.Vector3[]) => void;
        }
      ).setPoints(curve.getPoints(32));
      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
    }
  });

  curve.curveType = "chordal";
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  return (
    <>
      <group position={[0, 6, 0]}>
        <RigidBody
          ref={fixed}
          {...segmentProps}
          type={"fixed" as RigidBodyProps["type"]}
        />
        <RigidBody
          position={[0.5, 0, 0]}
          ref={j1}
          {...segmentProps}
          type={"dynamic" as RigidBodyProps["type"]}
        >
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[1, 0, 0]}
          ref={j2}
          {...segmentProps}
          type={"dynamic" as RigidBodyProps["type"]}
        >
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[1.5, 0, 0]}
          ref={j3}
          {...segmentProps}
          type={"dynamic" as RigidBodyProps["type"]}
        >
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[2, 0, 0]}
          ref={card}
          {...segmentProps}
          type={
            dragged
              ? ("kinematicPosition" as RigidBodyProps["type"])
              : ("dynamic" as RigidBodyProps["type"])
          }
        >
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.7}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e: ThreeEvent<PointerEvent>) => {
              const tgt = e.target as unknown as {
                releasePointerCapture: (id: number) => void;
              };
              tgt.releasePointerCapture(e.pointerId);
              drag(false);
            }}
            onPointerDown={(e: ThreeEvent<PointerEvent>) => {
              const tgt = e.target as unknown as {
                setPointerCapture: (id: number) => void;
              };
              tgt.setPointerCapture(e.pointerId);
              drag(
                new THREE.Vector3()
                  .copy(e.point)
                  .sub(vec.copy(card.current.translation()))
              );
            }}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                map={materials.base.map}
                map-anisotropy={16}
                clearcoat={1}
                clearcoatRoughness={0.15}
                roughness={0.9}
                metalness={0.8}
              />
            </mesh>
            <mesh
              geometry={nodes.clip.geometry}
              material={materials.metal}
              material-roughness={0.3}
            />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={isSmall ? [1000, 2000] : [1000, 1000]}
          useMap={1}
          map={texture}
          repeat={[-4, 1]}
          lineWidth={1}
        />
      </mesh>
    </>
  );
}
