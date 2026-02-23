import React from 'react';

export const Logo = ({ className = "", size = 60 }: { className?: string, size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M25 30L50 15L75 30V70L50 85L25 70V30Z" fill="#1B3C73" />
        <path d="M50 15L75 30L50 45L25 30L50 15Z" fill="#2A59A8" />
        <path d="M50 45V85L75 70V30L50 45Z" fill="#C87533" />
        <path d="M42 48H58V52H42V48Z" fill="white" />
    </svg>
);
