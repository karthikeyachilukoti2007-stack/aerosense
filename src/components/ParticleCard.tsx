import { motion } from 'framer-motion';

interface ParticleCardProps {
    color: string;
    isUnhealthy: boolean;
}

export default function ParticleCard({ color, isUnhealthy }: ParticleCardProps) {
    const speed = isUnhealthy ? 2 : 4;

    return (
        <div className="w-full h-[50px] rounded-b-xl overflow-hidden opacity-60 relative">
            {Array.from({ length: 15 }).map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                        backgroundColor: color,
                        width: Math.random() * 4 + 2 + 'px',
                        height: Math.random() * 4 + 2 + 'px',
                        left: Math.random() * 100 + '%',
                        bottom: '-10px',
                    }}
                    animate={{
                        y: [0, -60],
                        x: [0, (Math.random() - 0.5) * 20],
                        opacity: [0, 0.8, 0],
                    }}
                    transition={{
                        duration: Math.random() * 2 + speed,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                        ease: "linear",
                    }}
                />
            ))}
        </div>
    );
}
