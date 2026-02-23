
"use client";
import { useEffect, useRef } from 'react';

interface CarouselProps {
    children: React.ReactNode;
    speed?: number; // segundos para completar un ciclo
}

export function InfiniteCarousel({ children, speed = 40 }: CarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    return (
        <div className="flex overflow-hidden group py-10 w-full">
            <div
                ref={scrollRef}
                className="flex gap-8 px-4 w-max animate-scroll hover:[animation-play-state:paused]"
                style={{
                    animationDuration: `${speed}s`,
                }}
            >
                {children}
                {/* Duplicar children para loop seamless */}
                {children}
            </div>
        </div>
    );
}
