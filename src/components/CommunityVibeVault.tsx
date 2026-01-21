import React from 'react';
import { Music, Image as ImageIcon, Play, Pause, Download, Gift, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const CommunityVibeVault: React.FC = () => {
  const { t } = useLanguage();
  const [playing, setPlaying] = React.useState<string | null>(null);
  const [currentSwagIndex, setCurrentSwagIndex] = React.useState(0);

  // Auto-play for Swag Carousel
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSwagIndex((prev) => (prev + 1) % 5);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSwagIndex((prev) => (prev + 1) % 5);
  };

  const prevSlide = () => {
    setCurrentSwagIndex((prev) => (prev - 1 + 5) % 5);
  };

  const memes = [
    { id: 1, src: "/memes/CHILL.png", alt: "CHILL" },
    { id: 2, src: "/memes/OMG.png", alt: "OMG" },
    { id: 3, src: "/memes/STRONG.png", alt: "STRONG" },
    { id: 4, src: "/memes/不.png", alt: "No" },
    { id: 5, src: "/memes/不知道.png", alt: "Don't know" },
    { id: 6, src: "/memes/伤心.png", alt: "Sad" },
    { id: 7, src: "/memes/出发.png", alt: "Let's go" },
    { id: 8, src: "/memes/咖啡时间到.png", alt: "Coffee Time" },
    { id: 9, src: "/memes/哈哈哈.png", alt: "Hahaha" },
    { id: 10, src: "/memes/嗨~.png", alt: "Hi" },
    { id: 11, src: "/memes/嗨起来！.png", alt: "Party" },
    { id: 12, src: "/memes/怒.png", alt: "Angry" },
    { id: 13, src: "/memes/我OK.png", alt: "I'm OK" },
    { id: 14, src: "/memes/我！.png", alt: "Me!" },
    { id: 15, src: "/memes/晚安.png", alt: "Good Night" },
    { id: 16, src: "/memes/比心.png", alt: "Love" },
    { id: 17, src: "/memes/累.png", alt: "Tired" },
    { id: 18, src: "/memes/美味.png", alt: "Delicious" },
    { id: 19, src: "/memes/赞.png", alt: "Like" },
    { id: 20, src: "/memes/酷.png", alt: "Cool" },
  ];

  const tracks = [
    { id: '1', title: 'Gilded Midnight Stomp', duration: '2:30', artist: 'Astron AI', src: '/music/Gilded Midnight Stomp.mp3' },
    { id: '2', title: 'Midnight Teacup Tumble', duration: '3:15', artist: 'Astron AI', src: '/music/Midnight Teacup Tumble.mp3' },
    { id: '3', title: 'Playful Teacups in Afternoon Sun', duration: '2:45', artist: 'Astron AI', src: '/music/Playful Teacups in Afternoon Sun.mp3' },
    { id: '4', title: 'Breaking Bulletin', duration: '3:00', artist: 'Astron AI', src: '/music/Breaking Bulletin.mp3' },
    { id: '5', title: 'Cathedrals of Tomorrow', duration: '3:00', artist: 'Astron AI', src: '/music/Cathedrals of Tomorrow.mp3' },
    { id: '6', title: 'Celeste Over Kowloon', duration: '3:00', artist: 'Astron AI', src: '/music/Celeste Over Kowloon.mp3' },
    { id: '7', title: 'Girasol', duration: '3:00', artist: 'Astron AI', src: '/music/Girasol.mp3' },
    { id: '8', title: 'GLITTER BULLET', duration: '3:00', artist: 'Astron AI', src: '/music/GLITTER BULLET.mp3' },
    { id: '9', title: 'Glitter on the Floor', duration: '3:00', artist: 'Astron AI', src: '/music/Glitter on the Floor.mp3' },
    { id: '10', title: 'Midnight On Maple Street', duration: '3:00', artist: 'Astron AI', src: '/music/Midnight On Maple Street.mp3' },
    { id: '11', title: 'Midnight Tea For Two', duration: '3:00', artist: 'Astron AI', src: '/music/Midnight Tea For Two.mp3' },
    { id: '12', title: 'Red Walk Beneath The Tower', duration: '3:00', artist: 'Astron AI', src: '/music/Red Walk Beneath The Tower.mp3' },
    { id: '13', title: 'Retro Holiday Glow', duration: '3:00', artist: 'Astron AI', src: '/music/Retro Holiday Glow.mp3' },
    { id: '14', title: 'Verano Sobre Asfalto', duration: '3:00', artist: 'Astron AI', src: '/music/Verano Sobre Asfalto.mp3' },
    { id: '15', title: 'Walnut Room Prelude', duration: '3:00', artist: 'Astron AI', src: '/music/Walnut Room Prelude.mp3' },
  ];

  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  React.useEffect(() => {
    if (audioRef.current) {
      if (playing) {
        const track = tracks.find(t => t.id === playing);
        if (track) {
          // Only change source if it's different to prevent reloading
          const currentSrc = audioRef.current.getAttribute('src');
          if (currentSrc !== track.src) {
            audioRef.current.src = track.src;
            audioRef.current.play().catch(e => console.error("Playback failed", e));
          } else {
             audioRef.current.play().catch(e => console.error("Playback failed", e));
          }
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [playing]);

  const redPackets = [
    { id: 1, src: '/red_packets/天马行空事事顺.jpeg', alt: '天马行空事事顺' },
    { id: 2, src: '/red_packets/好事将至.jpeg', alt: '好事将至' },
    { id: 3, src: '/red_packets/码到成功.jpeg', alt: '码到成功' },
    { id: 4, src: '/red_packets/禄马扶持.jpeg', alt: '禄马扶持' },
    { id: 5, src: '/red_packets/马上轻松发财.jpeg', alt: '马上轻松发财' },
  ];

  return (
    <section id="community" className="py-20 bg-gradient-to-b from-purple-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            {t('community.title')}
          </h2>
          <p className="mt-4 text-xl text-gray-500">
            {t('community.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Memes Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <ImageIcon className="h-8 w-8 text-indigo-600 mr-3" />
                <h3 className="text-2xl font-bold text-gray-900">{t('community.memes')}</h3>
              </div>
              <a 
                href="https://github.com/FenjuFu/Awesome-Astron-Workflow/tree/master/Colorful%20Astron%20Life" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
              >
                <Download className="h-4 w-4 mr-1" />
                Download All
              </a>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {memes.map((meme) => (
                <div key={meme.id} className="relative group overflow-hidden rounded-lg aspect-square">
                  <img 
                    src={meme.src} 
                    alt={meme.alt}
                    className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <a href={meme.src} download className="p-2 bg-white/90 rounded-full text-indigo-600 hover:text-indigo-800">
                          <Download className="h-4 w-4" />
                      </a>
                  </div>
                </div>
              ))}
            </div>
          </div>


          {/* Music Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center mb-6">
              <Music className="h-8 w-8 text-indigo-600 mr-3" />
              <h3 className="text-2xl font-bold text-gray-900">{t('community.music')}</h3>
            </div>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {tracks.map((track) => (
                <div 
                  key={track.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-indigo-50 transition-colors duration-200"
                >
                  <div className="flex items-center">
                    <button
                      onClick={() => setPlaying(playing === track.id ? null : track.id)}
                      className="p-3 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                    >
                      {playing === track.id ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5 ml-1" />
                      )}
                    </button>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-gray-900">{track.title}</h4>
                      <p className="text-sm text-gray-500">{track.artist}</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-500">{track.duration}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
              <p className="text-sm text-indigo-700 text-center">
                🎵 Music player visualization placeholder - Click play to toggle state
              </p>
            </div>
            <audio ref={audioRef} onEnded={() => setPlaying(null)} />
          </div>

          {/* Swag Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 lg:col-span-2">
            <div className="flex items-center mb-6">
              <Gift className="h-8 w-8 text-indigo-600 mr-3" />
              <h3 className="text-2xl font-bold text-gray-900">{t('community.swag')}</h3>
            </div>
            <div className="mb-6">
               <h4 className="text-lg font-medium text-gray-900 mb-4">{t('swag.redPackets')}</h4>
               
               <div className="relative w-full h-[600px] overflow-hidden flex items-center justify-center">
                 {redPackets.map((packet, index) => {
                   // Calculate relative position (0 to 4)
                   // 0: Center
                   // 1: Right 1
                   // 2: Right 2
                   // 3: Left 2
                   // 4: Left 1
                   const position = (index - currentSwagIndex + 5) % 5;
                   
                   let styles = "";
                   let zIndex = 0;
                   let isCenter = false;

                   switch(position) {
                     case 0: // Center
                       styles = "left-1/2 -translate-x-1/2 scale-100 opacity-100 z-30 shadow-2xl";
                       zIndex = 30;
                       isCenter = true;
                       break;
                     case 1: // Right 1
                       styles = "left-[calc(50%+160px)] md:left-[calc(50%+200px)] -translate-x-1/2 scale-75 opacity-70 z-20 cursor-pointer shadow-xl";
                       zIndex = 20;
                       break;
                     case 2: // Right 2
                       styles = "left-[calc(50%+280px)] md:left-[calc(50%+350px)] -translate-x-1/2 scale-50 opacity-40 z-10 cursor-pointer shadow-lg";
                       zIndex = 10;
                       break;
                     case 3: // Left 2
                       styles = "left-[calc(50%-280px)] md:left-[calc(50%-350px)] -translate-x-1/2 scale-50 opacity-40 z-10 cursor-pointer shadow-lg";
                       zIndex = 10;
                       break;
                     case 4: // Left 1
                       styles = "left-[calc(50%-160px)] md:left-[calc(50%-200px)] -translate-x-1/2 scale-75 opacity-70 z-20 cursor-pointer shadow-xl";
                       zIndex = 20;
                       break;
                   }

                   return (
                     <div 
                       key={packet.id}
                       className={`absolute top-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out w-64 md:w-80 bg-transparent rounded-lg overflow-hidden flex items-center justify-center ${styles}`}
                       onClick={() => {
                         if (!isCenter) {
                           setCurrentSwagIndex(index);
                         }
                       }}
                     >
                       <img 
                         src={packet.src} 
                         alt={packet.alt}
                         className="w-full h-auto object-cover rounded-lg"
                       />
                       
                       {/* Download Button - Only for Center */}
                       {isCenter && (
                         <a 
                           href={packet.src} 
                           download 
                           className="absolute bottom-4 right-4 p-3 bg-white/90 hover:bg-white rounded-full text-indigo-600 hover:text-indigo-700 shadow-lg transition-all duration-300 z-10"
                           title={t('swag.download')}
                           onClick={(e) => e.stopPropagation()}
                         >
                           <Download className="h-6 w-6" />
                         </a>
                       )}
                     </div>
                   );
                 })}

                 {/* Navigation Controls */}
                 <button 
                   onClick={prevSlide}
                   className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/80 hover:bg-white text-indigo-600 shadow-lg transition-all z-40"
                   aria-label="Previous slide"
                 >
                   <ChevronLeft className="h-6 w-6" />
                 </button>
                 
                 <button 
                   onClick={nextSlide}
                   className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/80 hover:bg-white text-indigo-600 shadow-lg transition-all z-40"
                   aria-label="Next slide"
                 >
                   <ChevronRight className="h-6 w-6" />
                 </button>

                 {/* Indicators */}
                 <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-40">
                   {redPackets.map((_, idx) => (
                     <button
                       key={idx}
                       onClick={() => setCurrentSwagIndex(idx)}
                       className={`w-2 h-2 rounded-full transition-all duration-300 ${
                         idx === currentSwagIndex ? 'bg-indigo-600 w-6' : 'bg-gray-300 hover:bg-gray-400'
                       }`}
                       aria-label={`Go to slide ${idx + 1}`}
                     />
                   ))}
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunityVibeVault;
