import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

function Particles({ count = 120, isDark }: { count?: number; isDark: boolean }) {
    const mesh = useRef<THREE.InstancedMesh>(null)

    const { positions, velocities, colors } = useMemo(() => {
        const positions = new Float32Array(count * 3)
        const velocities: Array<[number, number, number]> = []
        const colors = new Float32Array(count * 3)
        const colorPalette = isDark
            ? ['#10b981', '#06b6d4', '#6366f1', '#ffffff', '#34d399']
            : ['#bfdbfe', '#a5f3fc', '#ddd6fe', '#e0f2fe']

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 30
            positions[i * 3 + 1] = (Math.random() - 0.5) * 20
            positions[i * 3 + 2] = (Math.random() - 0.5) * 10
            velocities.push([
                (Math.random() - 0.5) * 0.01,
                (Math.random() - 0.5) * 0.008,
                (Math.random() - 0.5) * 0.005
            ])
            const c = new THREE.Color(colorPalette[Math.floor(Math.random() * colorPalette.length)])
            colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b
        }
        return { positions, velocities, colors }
    }, [count, isDark])

    const dummy = useMemo(() => new THREE.Object3D(), [])

    useFrame(() => {
        if (!mesh.current) return
        for (let i = 0; i < count; i++) {
            positions[i * 3] += velocities[i][0]
            positions[i * 3 + 1] += velocities[i][1]
            positions[i * 3 + 2] += velocities[i][2]
            // wrap around
            if (positions[i * 3] > 15) positions[i * 3] = -15
            if (positions[i * 3] < -15) positions[i * 3] = 15
            if (positions[i * 3 + 1] > 10) positions[i * 3 + 1] = -10
            if (positions[i * 3 + 1] < -10) positions[i * 3 + 1] = 10
            dummy.position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2])
            dummy.updateMatrix()
            mesh.current.setMatrixAt(i, dummy.matrix)
        }
        mesh.current.instanceMatrix.needsUpdate = true
    })

    return (
        <instancedMesh ref={mesh} args={[null as any, null as any, count]}>
            <sphereGeometry args={[0.06, 6, 6]}>
                <instancedBufferAttribute attach="attributes-color" args={[colors, 3]} />
            </sphereGeometry>
            <meshBasicMaterial
                vertexColors
                transparent
                opacity={isDark ? 0.35 : 0.15}
            />
        </instancedMesh>
    )
}

export function FloatingParticles({ isDark }: { isDark: boolean }) {
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
            <Canvas camera={{ position: [0, 0, 15], fov: 60 }} frameloop="always">
                <Particles isDark={isDark} />
            </Canvas>
        </div>
    )
}
