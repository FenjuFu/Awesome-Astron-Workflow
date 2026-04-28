import React, { useState, useEffect } from 'react';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import { useLanguage } from '../../contexts/LanguageContext';
import { Gift, Trophy, History, Info, Loader2, Coins } from 'lucide-react';

interface Prize {
  id: number;
  nameKey: string;
  icon: React.ReactNode;
  color: string;
}

const PRIZES: Prize[] = [
  { id: 0, nameKey: 'lucky.prize.points', icon: <Coins className="h-8 w-8" />, color: 'bg-yellow-100 text-yellow-600' },
  { id: 1, nameKey: 'lucky.prize.swag', icon: <Gift className="h-8 w-8" />, color: 'bg-blue-100 text-blue-600' },
  { id: 2, nameKey: 'lucky.prize.membership', icon: <Trophy className="h-8 w-8" />, color: 'bg-purple-100 text-purple-600' },
  { id: 3, nameKey: 'lucky.prize.thanks', icon: <Info className="h-8 w-8" />, color: 'bg-gray-100 text-gray-600' },
  { id: 4, nameKey: 'lucky.prize.points', icon: <Coins className="h-8 w-8" />, color: 'bg-yellow-100 text-yellow-600' },
  { id: 5, nameKey: 'lucky.prize.swag', icon: <Gift className="h-8 w-8" />, color: 'bg-blue-100 text-blue-600' },
  { id: 6, nameKey: 'lucky.prize.membership', icon: <Trophy className="h-8 w-8" />, color: 'bg-purple-100 text-purple-600' },
  { id: 7, nameKey: 'lucky.prize.thanks', icon: <Info className="h-8 w-8" />, color: 'bg-gray-100 text-gray-600' },
];

// Grid order for the animation: 0 -> 1 -> 2 -> 4 -> 7 -> 6 -> 5 -> 3 -> 0
const GRID_ORDER = [0, 1, 2, 4, 7, 6, 5, 3];

const LuckyDraw: React.FC = () => {
  const { t } = useLanguage();
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [result, setResult] = useState<Prize | null>(null);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<{ prize: string, date: string }[]>([]);

  useEffect(() => {
    fetchPoints();
    const savedHistory = localStorage.getItem('lucky_draw_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const fetchPoints = async () => {
    try {
      const res = await fetch('/api/github/contributions');
      const contentType = res.headers.get('content-type');
      
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.contribution_dates) {
          const total = Object.values(data.contribution_dates as Record<string, Record<string, string[]>>).reduce((acc, repo) => {
            return acc + Object.values(repo).reduce((sum, dates) => sum + dates.length, 0);
          }, 0);
          
          // Fetch spent points from redemptions
          const redemptionsRes = await fetch('/api/redemptions');
          let spent = 0;
          if (redemptionsRes.ok) {
            const redemptionsData = await redemptionsRes.json();
            if (Array.isArray(redemptionsData)) {
              spent = redemptionsData
                .filter((r: any) => r.status !== 'rejected')
                .reduce((sum: number, r: any) => sum + r.points_spent, 0);
            }
          }
          
          setPoints(total - spent);
        }
      } else {
        // Fallback for local dev or not logged in
        console.warn('Using fallback points for development');
        setPoints(100); 
      }
    } catch (err) {
      console.error('Failed to fetch points:', err);
      setPoints(100); // Fallback
    } finally {
      setLoading(false);
    }
  };

  const startDraw = () => {
    if (isDrawing || points < 10) return;

    setIsDrawing(true);
    setResult(null);
    setPoints(prev => prev - 10);

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
        const winPrize = PRIZES[GRID_ORDER[targetPos]];
        setResult(winPrize);
        setIsDrawing(false);
        
        // Save to history
        const newHistory = [{
          prize: t(winPrize.nameKey),
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            {t('lucky.title')}
          </h1>
          <p className="text-xl text-gray-500">
            {t('lucky.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Points & Rules */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <Coins className="h-6 w-6 text-yellow-500" />
                <h2 className="text-lg font-bold text-gray-900">{t('redeem.points')}</h2>
              </div>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
              ) : (
                <div className="text-3xl font-bold text-indigo-600">
                  {points} <span className="text-sm font-normal text-gray-500">pts</span>
                </div>
              )}
              <p className="text-xs text-gray-400 mt-2">10 pts / draw</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <Info className="h-6 w-6 text-indigo-600" />
                <h2 className="text-lg font-bold text-gray-900">{t('lucky.rules')}</h2>
              </div>
              <div className="text-sm text-gray-600 space-y-2 whitespace-pre-line">
                {t('lucky.rules.content')}
              </div>
            </div>
          </div>

          {/* Lucky Draw Grid */}
          <div className="md:col-span-2">
            <div className="bg-white p-4 rounded-3xl shadow-xl border-8 border-indigo-600 aspect-square max-w-md mx-auto relative overflow-hidden">
              <div className="grid grid-cols-3 grid-rows-3 gap-2 h-full">
                {/* 0 1 2 */}
                <PrizeCard prize={PRIZES[0]} active={currentIndex === 0} />
                <PrizeCard prize={PRIZES[1]} active={currentIndex === 1} />
                <PrizeCard prize={PRIZES[2]} active={currentIndex === 2} />
                
                {/* 3 Draw 4 */}
                <PrizeCard prize={PRIZES[3]} active={currentIndex === 3} />
                <button
                  onClick={startDraw}
                  disabled={isDrawing || points < 10}
                  className={`flex flex-col items-center justify-center rounded-xl font-bold text-white transition-all shadow-lg active:scale-95 ${
                    isDrawing || points < 10 
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : 'bg-gradient-to-br from-indigo-600 to-purple-600 hover:shadow-indigo-200 hover:shadow-2xl'
                  }`}
                >
                  <span className="text-lg">{isDrawing ? t('lucky.drawing') : t('lucky.start')}</span>
                  {!isDrawing && <span className="text-xs opacity-80 mt-1">10 PTS</span>}
                </button>
                <PrizeCard prize={PRIZES[4]} active={currentIndex === 4} />

                {/* 5 6 7 */}
                <PrizeCard prize={PRIZES[5]} active={currentIndex === 5} />
                <PrizeCard prize={PRIZES[6]} active={currentIndex === 6} />
                <PrizeCard prize={PRIZES[7]} active={currentIndex === 7} />
              </div>

              {/* Result Overlay */}
              {result && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300 z-10">
                  <div className="bg-white rounded-2xl p-8 text-center shadow-2xl max-w-xs w-full">
                    <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${result.color}`}>
                      {result.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {result.id === 3 || result.id === 7 ? t('lucky.result.lose') : t('lucky.result.win').replace('{prize}', t(result.nameKey))}
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
  const { t } = useLanguage();
  return (
    <div className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-100 border-2 ${
      active 
        ? 'border-yellow-400 bg-yellow-50 shadow-inner scale-95 z-0' 
        : 'border-transparent bg-gray-50'
    }`}>
      <div className={`p-2 rounded-lg mb-1 ${prize.color}`}>
        {prize.icon}
      </div>
      <span className="text-[10px] font-bold text-gray-600 text-center leading-tight">
        {t(prize.nameKey)}
      </span>
    </div>
  );
};

export default LuckyDraw;
