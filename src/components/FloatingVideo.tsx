import React, { useState, useRef, useEffect } from 'react';
import { X, Volume2, VolumeX } from 'lucide-react';

const FloatingVideo: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      // Try to play with sound first
      videoRef.current.play().catch(error => {
        console.log("Autoplay with sound blocked, falling back to muted", error);
        // If blocked, mute and try again
        setIsMuted(true);
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play().catch(e => console.error("Muted autoplay also failed", e));
        }
      });
    }
  }, []);

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
            className="absolute inset-0 z-10 flex flex-col items-center justify-center cursor-pointer bg-black/30 hover:bg-black/40 transition-colors group/overlay"
            onClick={() => setIsMuted(false)}
          >
            <div className="bg-black/60 p-3 rounded-full backdrop-blur-sm transform transition-all duration-300 group-hover/overlay:scale-110 mb-2">
               <VolumeX className="text-white h-6 w-6" />
            </div>
            <span className="text-white text-xs font-medium bg-black/60 px-2 py-1 rounded-md backdrop-blur-sm opacity-0 group-hover/overlay:opacity-100 transition-opacity duration-300">
              Click to Unmute
            </span>
          </div>
        )}

        {/* Video Player */}
        <video
          ref={videoRef}
          src="/videos/Astron Party.mp4"
          loop
          muted={isMuted}
          playsInline
          className="w-full h-full object-contain bg-black"
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
