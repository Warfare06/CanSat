import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';

function CanSatModel() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3;
    }
  });

  const cylinderGeometry = useMemo(() => new THREE.CylinderGeometry(0.45, 0.45, 1.2, 24, 1, true), []);
  const capGeometry = useMemo(() => new THREE.SphereGeometry(0.45, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), []);

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <group ref={groupRef}>
        {/* Main cylinder body - wireframe */}
        <mesh geometry={cylinderGeometry}>
          <meshBasicMaterial color="#00d4ff" wireframe transparent opacity={0.4} />
        </mesh>

        {/* Solid inner shell */}
        <mesh>
          <cylinderGeometry args={[0.43, 0.43, 1.18, 24]} />
          <meshBasicMaterial color="#00d4ff" transparent opacity={0.03} />
        </mesh>

        {/* Top cap */}
        <mesh geometry={capGeometry} position={[0, 0.6, 0]}>
          <meshBasicMaterial color="#00d4ff" wireframe transparent opacity={0.3} />
        </mesh>

        {/* Bottom cap */}
        <mesh geometry={capGeometry} position={[0, -0.6, 0]} rotation={[Math.PI, 0, 0]}>
          <meshBasicMaterial color="#00d4ff" wireframe transparent opacity={0.3} />
        </mesh>

        {/* Ring details */}
        {[-0.3, 0, 0.3].map((y, i) => (
          <mesh key={i} position={[0, y, 0]}>
            <torusGeometry args={[0.46, 0.008, 8, 32]} />
            <meshBasicMaterial color="#00d4ff" transparent opacity={0.25} />
          </mesh>
        ))}

        {/* Antenna */}
        <mesh position={[0, 0.95, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.5, 8]} />
          <meshBasicMaterial color="#ff8c00" />
        </mesh>
        <mesh position={[0, 1.22, 0]}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshBasicMaterial color="#ff8c00" />
        </mesh>

        {/* Solar panel left */}
        <mesh position={[-0.75, 0, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.4, 0.6, 0.02]} />
          <meshBasicMaterial color="#00d4ff" transparent opacity={0.15} />
        </mesh>
        <mesh position={[-0.75, 0, 0]}>
          <boxGeometry args={[0.4, 0.6, 0.02]} />
          <meshBasicMaterial color="#00d4ff" wireframe transparent opacity={0.4} />
        </mesh>

        {/* Solar panel right */}
        <mesh position={[0.75, 0, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.4, 0.6, 0.02]} />
          <meshBasicMaterial color="#00d4ff" transparent opacity={0.15} />
        </mesh>
        <mesh position={[0.75, 0, 0]}>
          <boxGeometry args={[0.4, 0.6, 0.02]} />
          <meshBasicMaterial color="#00d4ff" wireframe transparent opacity={0.4} />
        </mesh>

        {/* Panel arms */}
        <mesh position={[-0.55, 0, 0]}>
          <boxGeometry args={[0.2, 0.03, 0.02]} />
          <meshBasicMaterial color="#00d4ff" transparent opacity={0.3} />
        </mesh>
        <mesh position={[0.55, 0, 0]}>
          <boxGeometry args={[0.2, 0.03, 0.02]} />
          <meshBasicMaterial color="#00d4ff" transparent opacity={0.3} />
        </mesh>

        {/* Glowing core */}
        <pointLight color="#00d4ff" intensity={0.5} distance={3} />
        <pointLight color="#ff8c00" intensity={0.2} distance={2} position={[0, 1, 0]} />
      </group>
    </Float>
  );
}

function LabelPoint({ position, label }: { position: [number, number, number]; label: string }) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color="#ff8c00" />
      </mesh>
    </group>
  );
}

export default function CanSat3D() {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: 280 }}>
      <Canvas
        camera={{ position: [2.5, 1.5, 2.5], fov: 40 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.1} />
        <CanSatModel />
        <LabelPoint position={[0.5, 0.2, 0.5]} label="Pressure" />
        <LabelPoint position={[0.3, 0.8, 0.3]} label="Temp" />
        <LabelPoint position={[-0.3, -0.4, 0.5]} label="GPS" />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI * 0.75}
          minPolarAngle={Math.PI * 0.25}
        />
      </Canvas>
    </div>
  );
}
