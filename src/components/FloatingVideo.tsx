import React, { useState } from 'react';
import { X, Volume2, VolumeX } from 'lucide-react';

const FloatingVideo: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-8 right-8 z-50 animate-fade-in-up">
      <div className="relative group rounded-2xl overflow-hidden shadow-2xl border-4 border-white/50 w-64 md:w-80 aspect-[9/16] bg-black">
        {/* Controls Overlay */}
        <div className="absolute top-2 right-2 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <button 
            onClick={() => setIsVisible(false)}
            className="p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Video Player */}
        <video
          src="/videos/Astron Party.mp4"
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="w-full h-full object-cover"
        />

        {/* Caption/Label */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
          <p className="text-white text-sm font-bold text-center">
            🎉 Astron Party
          </p>
        </div>
      </div>
    </div>
  );
};

export default FloatingVideo;
