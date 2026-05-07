import React, { useState, useEffect } from 'react';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import { useLanguage } from '../../contexts/LanguageContext';
import { Gift, Trophy, History, Info, Loader2, Coins, Calendar, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';

interface Prize {
  id: number;
  name: string;
  icon: string;
  color: string;
  quantity: number;
}

interface LuckyDrawConfig {
  id: string;
  title: string;
  description: string;
  prizes: Prize[];
  draw_time: string;
  is_active: boolean;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  'Gift': <Gift className="h-8 w-8" />,
  'Trophy': <Trophy className="h-8 w-8" />,
  'Coins': <Coins className="h-8 w-8" />,
  'Info': <Info className="h-8 w-8" />,
};

// Grid order for the animation: 0 -> 1 -> 2 -> 4 -> 7 -> 6 -> 5 -> 3 -> 0
const GRID_ORDER = [0, 1, 2, 4, 7, 6, 5, 3];

const LuckyDraw: React.FC = () => {
  const { language, t } = useLanguage();
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [result, setResult] = useState<Prize | null>(null);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<LuckyDrawConfig | null>(null);
  const [history, setHistory] = useState<{ prize: string, date: string }[]>([]);
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    fetchActiveDraw();
    const savedHistory = localStorage.getItem('lucky_draw_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    if (config?.draw_time) {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const target = new Date(config.draw_time).getTime();
        const diff = target - now;

        if (diff <= 0) {
          setTimeLeft('');
          clearInterval(timer);
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const secs = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeLeft(`${days}d ${hours}h ${mins}m ${secs}s`);
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [config]);

  const fetchActiveDraw = async () => {
    try {
      const { data, error } = await supabase
        .from('lucky_draws')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      setConfig(data);
    } catch (err) {
      console.error('Failed to fetch active draw:', err);
    } finally {
      setLoading(false);
    }
  };

  const startDraw = () => {
    if (isDrawing || !config || timeLeft) return;

    setIsDrawing(true);
    setResult(null);

    let speed = 100;
    let laps = 0;
    let currentPos = 0;
    const totalLaps = 5 + Math.floor(Math.random() * 3);
    const targetPos = Math.floor(Math.random() * 8);

    const animate = () => {
      setCurrentIndex(GRID_ORDER[currentPos]);
      currentPos++;

      if (currentPos >= 8) {
        currentPos = 0;
        laps++;
      }

      if (laps >= totalLaps && currentPos === targetPos) {
        const winPrize = config.prizes[GRID_ORDER[targetPos]];
        setResult(winPrize);
        setIsDrawing(false);
        
        // Save to history
        const newHistory = [{
          prize: winPrize.name,
          date: new Date().toLocaleString()
        }, ...history].slice(0, 10);
        setHistory(newHistory);
        localStorage.setItem('lucky_draw_history', JSON.stringify(newHistory));
        return;
      }

      // Adjust speed
      if (laps < 2) speed = Math.max(50, speed - 10);
      else if (laps >= totalLaps - 1) speed += 30;

      setTimeout(animate, speed);
    };

    animate();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navigation />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 pt-32 pb-12 text-center">
          <div className="bg-white p-12 rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center">
            <div className="p-4 bg-gray-50 rounded-full mb-6">
              <Gift className="h-12 w-12 text-gray-300" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">No Active Lucky Draw</h1>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              There are currently no active lucky draw events. Please check back later or explore other activities.
            </p>
            <a 
              href="/activities"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
              Explore Activities
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            {config.title}
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            {config.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Status & Rules */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="h-6 w-6 text-indigo-600" />
                <h2 className="text-lg font-bold text-gray-900">Draw Status</h2>
              </div>
              {timeLeft ? (
                <div className="space-y-3">
                  <div className="text-sm text-gray-500 uppercase font-bold tracking-wider">Starts in</div>
                  <div className="text-2xl font-black text-indigo-600 font-mono bg-indigo-50 p-4 rounded-xl text-center">
                    {timeLeft}
                  </div>
                  <div className="text-xs text-gray-400 text-center">
                    Draw opens at {format(new Date(config.draw_time), 'yyyy-MM-dd HH:mm')}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-green-600 bg-green-50 p-4 rounded-xl">
                  <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse" />
                  <span className="font-bold">Event Live Now!</span>
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <Info className="h-6 w-6 text-indigo-600" />
                <h2 className="text-lg font-bold text-gray-900">{t('lucky.rules')}</h2>
              </div>
              <div className="text-sm text-gray-600 space-y-2 whitespace-pre-line">
                {language === 'zh-CN' 
                  ? '1. 抽奖在指定时间开启。\n2. 奖品将在 24 小时内发放。\n3. 祝你好运！' 
                  : '1. Draw opens at the specified time.\n2. Prizes will be issued within 24 hours.\n3. Good luck!'}
              </div>
            </div>
          </div>

          {/* Lucky Draw Grid */}
          <div className="md:col-span-2">
            <div className="bg-white p-4 rounded-3xl shadow-xl border-8 border-indigo-600 aspect-square max-w-md mx-auto relative overflow-hidden">
              <div className="grid grid-cols-3 grid-rows-3 gap-2 h-full">
                {config.prizes.slice(0, 3).map((prize, i) => (
                  <PrizeCard key={i} prize={prize} active={currentIndex === i} />
                ))}
                
                <PrizeCard prize={config.prizes[3]} active={currentIndex === 3} />
                <button
                  onClick={startDraw}
                  disabled={isDrawing || !!timeLeft}
                  className={`flex flex-col items-center justify-center rounded-xl font-bold text-white transition-all shadow-lg active:scale-95 ${
                    isDrawing || !!timeLeft 
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : 'bg-gradient-to-br from-indigo-600 to-purple-600 hover:shadow-indigo-200 hover:shadow-2xl'
                  }`}
                >
                  <span className="text-lg">{isDrawing ? t('lucky.drawing') : t('lucky.start')}</span>
                  {timeLeft && <span className="text-[10px] opacity-80 mt-1 uppercase">Wait</span>}
                </button>
                <PrizeCard prize={config.prizes[4]} active={currentIndex === 4} />

                {config.prizes.slice(5, 8).map((prize, i) => (
                  <PrizeCard key={i+5} prize={prize} active={currentIndex === i+5} />
                ))}
              </div>

              {/* Result Overlay */}
              {result && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300 z-10">
                  <div className="bg-white rounded-2xl p-8 text-center shadow-2xl max-w-xs w-full">
                    <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${result.color}`}>
                      {ICON_MAP[result.icon]}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {result.name === 'Thanks for participating' || result.name === '谢谢参与' 
                        ? t('lucky.result.lose') 
                        : t('lucky.result.win').replace('{prize}', result.name)}
                    </h3>
                    <button
                      onClick={() => setResult(null)}
                      className="mt-6 w-full py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                    >
                      OK
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* History */}
        <div className="mt-12">
          <div className="flex items-center gap-3 mb-6">
            <History className="h-6 w-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">{t('lucky.history')}</h2>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {history.length > 0 ? (
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
                  <tr>
                    <th className="px-6 py-4 font-medium">Prize</th>
                    <th className="px-6 py-4 font-medium text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {history.map((h, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{h.prize}</td>
                      <td className="px-6 py-4 text-gray-500 text-right text-sm">{h.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center text-gray-400 italic">
                No draw history yet.
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

const PrizeCard: React.FC<{ prize: Prize, active: boolean }> = ({ prize, active }) => {
  return (
    <div className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-100 border-2 ${
      active 
        ? 'border-yellow-400 bg-yellow-50 shadow-inner scale-95 z-0' 
        : 'border-transparent bg-gray-50'
    }`}>
      <div className={`p-2 rounded-lg mb-1 ${prize.color}`}>
        {ICON_MAP[prize.icon] || <Gift className="h-8 w-8" />}
      </div>
      <span className="text-[10px] font-bold text-gray-600 text-center leading-tight">
        {prize.name}
      </span>
      {prize.quantity > 0 && (
        <span className="text-[8px] text-gray-400 mt-0.5">Qty: {prize.quantity}</span>
      )}
    </div>
  );
};

export default LuckyDraw;
