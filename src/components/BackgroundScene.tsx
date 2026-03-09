import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext';

function StarField({ isDark }: { isDark: boolean }) {
    const ref = useRef<THREE.Points>(null!);
    const count = 500;

    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 50;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 50;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 50;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        return geo;
    }, []);

    useFrame(() => {
        if (ref.current) {
            ref.current.rotation.y += 0.0005;
            ref.current.rotation.x += 0.0002;
        }
    });

    return (
        <points ref={ref} geometry={geometry}>
            <pointsMaterial
                size={0.06}
                color={isDark ? '#ffffff' : '#93c5fd'}
                transparent
                opacity={isDark ? 0.4 : 0.1}
                sizeAttenuation
            />
        </points>
    );
}

export default function BackgroundScene() {
    const { isDark } = useTheme();

    return (
        <div className="fixed inset-0 -z-10 pointer-events-none">
            <Canvas camera={{ position: [0, 0, 15], fov: 60 }} dpr={[1, 1.5]}>
                <StarField isDark={isDark} />
            </Canvas>
        </div>
    );
}
