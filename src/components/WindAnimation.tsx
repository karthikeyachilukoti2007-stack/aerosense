import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface WindStreakProps {
    speed: number;
    offset: number;
}

function WindStreak({ speed, offset }: WindStreakProps) {
    const ref = useRef<THREE.Mesh>(null!);
    const normalizedSpeed = Math.max(speed / 10, 0.3);

    useFrame((state) => {
        if (!ref.current) return;
        const t = state.clock.elapsedTime * normalizedSpeed + offset;
        ref.current.position.x = ((t * 2) % 6) - 3;
        ref.current.position.y = Math.sin(t * 0.8) * 0.3 + (offset * 0.4 - 0.6);
        ref.current.rotation.z = Math.sin(t) * 0.1;
    });

    return (
        <mesh ref={ref}>
            <planeGeometry args={[1.2, 0.015]} />
            <meshBasicMaterial color="#94a3b8" transparent opacity={0.6} />
        </mesh>
    );
}

interface WindAnimationProps {
    windSpeed: number;
}

export default function WindAnimation({ windSpeed }: WindAnimationProps) {
    const streaks = useMemo(() =>
        Array.from({ length: 8 }, (_, i) => ({
            id: i,
            speed: windSpeed,
            offset: i * 0.7,
        })), [windSpeed]
    );

    return (
        <div className="w-full h-[80px] rounded-xl overflow-hidden">
            <Canvas camera={{ position: [0, 0, 3], fov: 40 }} dpr={[1, 1.5]}>
                <ambientLight intensity={0.5} />
                {streaks.map(s => (
                    <WindStreak key={s.id} speed={s.speed} offset={s.offset} />
                ))}
            </Canvas>
        </div>
    );
}
