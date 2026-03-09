import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ErrorBoundary } from './ErrorBoundary';

function WindParticles({ speed }: { speed: number }) {
    const ref = useRef<THREE.Points>(null!);
    const count = 300;

    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 8;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 4;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        return geo;
    }, []);

    useFrame(() => {
        if (!ref.current) return;
        ref.current.rotation.y += 0.002 * Math.max(speed / 5, 0.5);
        const arr = ref.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < count; i++) {
            arr[i * 3] += 0.008 * (speed / 5);
            if (arr[i * 3] > 4) arr[i * 3] = -4;
        }
        ref.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <points ref={ref} geometry={geometry}>
            <pointsMaterial size={0.04} color="#06b6d4" transparent opacity={0.7} sizeAttenuation />
        </points>
    );
}

function Vortex({ speed }: { speed: number }) {
    const ref = useRef<THREE.Mesh>(null!);
    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.x = state.clock.elapsedTime * (speed / 12);
            ref.current.rotation.y = state.clock.elapsedTime * (speed / 18);
        }
    });
    return (
        <mesh ref={ref}>
            <torusGeometry args={[1.8, 0.15, 16, 80]} />
            <meshStandardMaterial color="#06b6d4" transparent opacity={0.2} wireframe />
        </mesh>
    );
}

export default function WindViz3D({ windSpeed }: { windSpeed: number }) {
    return (
        <div className="w-full h-[250px]">
            <ErrorBoundary fallback={
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <p>Wind: {windSpeed} m/s</p>
                </div>
            }>
                <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                    <ambientLight intensity={0.4} />
                    <pointLight position={[5, 5, 5]} intensity={0.8} color="#06b6d4" />
                    <WindParticles speed={windSpeed} />
                    <Vortex speed={windSpeed} />
                </Canvas>
            </ErrorBoundary>
        </div>
    );
}
