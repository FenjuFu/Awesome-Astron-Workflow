import React from 'react';
import { Music, Image as ImageIcon, Play, Pause, Download, Gift } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const CommunityVibeVault: React.FC = () => {
  const { t } = useLanguage();
  const [playing, setPlaying] = React.useState<string | null>(null);

  const memes = [
    {
      id: 1,
      src: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=A%20funny%20robot%20trying%20to%20automate%20coffee%20making%20and%20spilling%20it%2C%20cartoon%20style&image_size=square",
      alt: "Automation fail"
    },
    {
      id: 2,
      src: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=A%20futuristic%20cat%20coding%20on%20a%20holographic%20keyboard%2C%20cyberpunk%20style&image_size=square",
      alt: "Coding Cat"
    },
    {
      id: 3,
      src: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=A%20group%20of%20robots%20having%20a%20party%20with%20disco%20lights%2C%20digital%20art&image_size=square",
      alt: "Robot Party"
    },
    {
      id: 4,
      src: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=An%20astronaut%20floating%20in%20space%20using%20a%20laptop%20with%20workflow%20diagrams%2C%20realistic&image_size=square",
      alt: "Space Workflow"
    }
  ];

  const tracks = [
    { id: '1', title: 'Astron Flow', duration: '2:30', artist: 'AI Beats' },
    { id: '2', title: 'Neural Networks', duration: '3:15', artist: 'Cyber Synth' },
    { id: '3', title: 'Automate Everything', duration: '2:45', artist: 'Robo Rhythms' },
  ];

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
            <div className="flex items-center mb-6">
              <ImageIcon className="h-8 w-8 text-indigo-600 mr-3" />
              <h3 className="text-2xl font-bold text-gray-900">{t('community.memes')}</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {memes.map((meme) => (
                <div key={meme.id} className="relative group overflow-hidden rounded-lg">
                  <img 
                    src={meme.src} 
                    alt={meme.alt}
                    className="w-full h-48 object-cover transform transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300" />
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
            <div className="space-y-4">
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
          </div>

          {/* Swag Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 lg:col-span-2">
            <div className="flex items-center mb-6">
              <Gift className="h-8 w-8 text-indigo-600 mr-3" />
              <h3 className="text-2xl font-bold text-gray-900">{t('community.swag')}</h3>
            </div>
            <div className="mb-6">
               <h4 className="text-lg font-medium text-gray-900 mb-4">{t('swag.redPackets')}</h4>
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {redPackets.map((packet) => (
                  <div key={packet.id} className="relative group overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                    <img 
                      src={packet.src} 
                      alt={packet.alt}
                      className="w-full aspect-[3/4] object-cover transform transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <a 
                        href={packet.src} 
                        download 
                        className="p-3 bg-white rounded-full text-indigo-600 hover:text-indigo-700 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                        title={t('swag.download')}
                      >
                        <Download className="h-6 w-6" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunityVibeVault;
