
"use client";
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Play } from 'lucide-react';

interface VideoModalProps {
    thumbnailUrl: string;
    videoId: string; // YouTube video ID
    title: string;
}

export function VideoModal({ thumbnailUrl, videoId, title }: VideoModalProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div
                className="relative aspect-video bg-slate-900 rounded-[2.5rem] shadow-2xl border-8 border-white overflow-hidden cursor-pointer group"
                onClick={() => setIsOpen(true)}
                role="button"
                aria-label={`Ver video: ${title}`}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setIsOpen(true)}
            >
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:scale-105 transition-transform duration-700"
                    style={{ backgroundImage: `url('${thumbnailUrl}')` }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                        <Play className="w-8 h-8 text-[#1B3C73] ml-1" fill="currentColor" />
                    </div>
                </div>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-4xl p-0 bg-black sm:max-w-4xl border-none">
                    <div className="aspect-video w-full h-full">
                        <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                            title={title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full rounded-lg"
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
