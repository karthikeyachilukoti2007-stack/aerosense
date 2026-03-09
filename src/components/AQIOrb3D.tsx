import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';
import { ErrorBoundary } from './ErrorBoundary';

function GlowingSphere({ aqi, color }: { aqi: number; color: string }) {
    const meshRef = useRef<THREE.Mesh>(null!);
    const lightRef = useRef<THREE.PointLight>(null!);
    const severity = Math.min(aqi / 300, 1);

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        const pulse = 1 + Math.sin(t * (1.5 + severity * 2)) * (0.03 + severity * 0.04);
        if (meshRef.current) meshRef.current.scale.setScalar(pulse);
        if (lightRef.current) lightRef.current.intensity = 2 + Math.sin(t * 2) * 0.5;
    });

    return (
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
            <pointLight ref={lightRef} color={color} intensity={2} distance={10} />
            <Sphere ref={meshRef} args={[1.3, 64, 64]}>
                <MeshDistortMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={0.35}
                    distort={0.2 + severity * 0.15}
                    speed={2 + severity * 3}
                    roughness={0.15}
                    metalness={0.8}
                />
            </Sphere>
            <Html center distanceFactor={4} style={{ pointerEvents: 'none', userSelect: 'none' }}>
                <div className="text-center text-white">
                    <div className="text-5xl font-black drop-shadow-lg">{aqi}</div>
                    <div className="text-[10px] tracking-[0.25em] opacity-80 mt-0.5">US AQI</div>
                </div>
            </Html>
        </Float>
    );
}

function BackgroundParticles() {
    const ref = useRef<THREE.Points>(null!);
    const count = 150;

    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 16;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 16;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 16;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        return geo;
    }, []);

    useFrame(() => {
        if (ref.current) {
            ref.current.rotation.y += 0.0005;
            ref.current.rotation.x += 0.0003;
        }
    });

    return (
        <points ref={ref} geometry={geometry}>
            <pointsMaterial size={0.03} color="#34d399" transparent opacity={0.5} sizeAttenuation />
        </points>
    );
}

interface AQIOrb3DProps { aqi: number; color: string; status: string; }

export default function AQIOrb3D({ aqi, color, status }: AQIOrb3DProps) {
    return (
        <div className="relative w-full h-[320px] md:h-[380px]">
            <ErrorBoundary fallback={
                <div className="w-full h-full flex items-center justify-center">
                    <div className="w-48 h-48 rounded-full flex flex-col items-center justify-center shadow-2xl"
                        style={{ background: `radial-gradient(circle at 30% 30%, ${color}, #0f172a)`, boxShadow: `0 0 80px ${color}40` }}>
                        <div className="text-5xl font-black text-white">{aqi}</div>
                        <div className="text-xs tracking-widest text-white/70 mt-1">US AQI</div>
                    </div>
                </div>
            }>
                <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }}>
                    <ambientLight intensity={0.3} />
                    <GlowingSphere aqi={aqi} color={color} />
                    <BackgroundParticles />
                </Canvas>
            </ErrorBoundary>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-sm tracking-widest text-slate-400 dark:text-slate-500">
                {status}
            </div>
        </div>
    );
}
