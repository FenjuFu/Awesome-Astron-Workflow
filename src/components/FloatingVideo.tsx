import React, { useState } from 'react';
import { X, Volume2, VolumeX } from 'lucide-react';

const FloatingVideo: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 animate-fade-in-up">
      <div className="relative group rounded-2xl overflow-hidden shadow-2xl border-4 border-white/50 w-60 md:w-80 aspect-video bg-black transition-all duration-300">
        {/* Controls Overlay */}
        <div className="absolute top-2 right-2 z-20 flex gap-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsMuted(!isMuted);
            }}
            className="p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(false);
            }}
            className="p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Click to unmute overlay */}
        {isMuted && (
          <div 
            className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer bg-black/10 hover:bg-black/20 transition-colors"
            onClick={() => setIsMuted(false)}
          >
            <div className="bg-black/50 p-3 rounded-full backdrop-blur-sm transform transition-transform hover:scale-110">
               <VolumeX className="text-white h-6 w-6" />
            </div>
          </div>
        )}

        {/* Video Player */}
        <video
          src="/videos/Astron Party.mp4"
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="w-full h-full object-cover"
          onClick={() => setIsMuted(!isMuted)}
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
