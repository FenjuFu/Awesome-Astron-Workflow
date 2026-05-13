import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import { useLanguage } from '../../contexts/LanguageContext';
import { Gift, Trophy, Info, Loader2, ArrowRight, Camera, Hash, CheckCircle2, Coins } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';

interface PrizeConfig {
  id: number;
  name: string;
  quantity: number;
  icon: string;
  color: string;
}

interface LuckyDrawConfig {
  id: string;
  title: string;
  description: string;
  prizes: PrizeConfig[];
  draw_time: string;
  is_active: boolean;
}

interface Winner {
  id: string;
  number: number;
  prize_name: string;
  created_at: string;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  'Gift': <Gift className="h-8 w-8" />,
  'Trophy': <Trophy className="h-8 w-8" />,
  'Coins': <Coins className="h-8 w-8" />,
  'Info': <Info className="h-8 w-8" />,
};

const LuckyDraw: React.FC = () => {
  const { language, t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<LuckyDrawConfig | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');
  
  const [myNumber, setMyNumber] = useState<number | null>(null);
  const [gettingNumber, setGettingNumber] = useState(false);
  const [participantsCount, setParticipantsCount] = useState(0);
  
  const [winners, setWinners] = useState<Winner[]>([]);
  const hasTriggeredAutoDraw = useRef(false);

  const fetchStats = useCallback(async (drawId: string, drawTime: string) => {
    try {
      const { count, error: countError } = await supabase
        .from('lucky_draw_participants')
        .select('*', { count: 'exact', head: true })
        .eq('draw_id', drawId)
        .eq('draw_time', drawTime);
      
      if (!countError && count !== null) {
        setParticipantsCount(count);
      }

      const { data: winnersData, error: winnersError } = await supabase
        .from('lucky_draw_winners')
        .select('*')
        .eq('draw_id', drawId)
        .eq('draw_time', drawTime)
        .order('created_at', { ascending: false });
        
      if (!winnersError && winnersData) {
        setWinners(winnersData);
      }
    } catch (err) {
      console.error('Error fetching stats', err);
    }
  }, []);

  const fetchActiveDraw = useCallback(async () => {
    try {
      // Process any overdue draws first so results can appear even without a platform cron.
      await fetch('/api/lucky-draw/process-due').catch((error) => {
        console.error('Failed to process due lucky draws:', error);
      });

      const { data: drawData, error: drawError } = await supabase
        .from('lucky_draws')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (drawError && drawError.code !== 'PGRST116') throw drawError;
      
      if (drawData) {
        setConfig(drawData);
        
        const storageKey = `lucky_draw_number_${drawData.id}_${drawData.draw_time}`;
        const savedNum = localStorage.getItem(storageKey);
        if (savedNum) {
          setMyNumber(parseInt(savedNum, 10));
        } else {
          setMyNumber(null);
        }

        fetchStats(drawData.id, drawData.draw_time);
        
        const channel = supabase
          .channel('winners_channel')
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'lucky_draw_winners', filter: `draw_id=eq.${drawData.id}` },
            (payload) => {
              if (new Date(payload.new.draw_time).getTime() === new Date(drawData.draw_time).getTime()) {
                setWinners(prev => {
                  if (prev.some(w => w.id === payload.new.id)) return prev;
                  return [payload.new as Winner, ...prev];
                });
              }
            }
          )
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'lucky_draw_participants', filter: `draw_id=eq.${drawData.id}` },
            (payload) => {
              if (new Date(payload.new.draw_time).getTime() === new Date(drawData.draw_time).getTime()) {
                setParticipantsCount(prev => prev + 1);
              }
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
    } catch (err) {
      console.error('Failed to fetch active draw:', err);
    } finally {
      setLoading(false);
    }

    return undefined;
  }, [fetchStats]);

  useEffect(() => {
    const cleanupPromise = fetchActiveDraw();

    return () => {
      cleanupPromise.then((cleanup) => cleanup?.());
    };
  }, [fetchActiveDraw]);

  useEffect(() => {
    hasTriggeredAutoDraw.current = false;
  }, [config?.id, config?.draw_time]);

  useEffect(() => {
    if (config?.draw_time) {
      const attemptAutoDraw = async () => {
        try {
          await fetch('/api/lucky-draw/auto-draw', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ draw_id: config.id })
          });
        } catch (error) {
          console.error('Failed to trigger auto draw:', error);
        } finally {
          fetchStats(config.id, config.draw_time);
        }
      };

      const timer = setInterval(() => {
        const now = new Date().getTime();
        const target = new Date(config.draw_time).getTime();
        const diff = target - now;

        if (diff <= 0) {
          setTimeLeft('');
          clearInterval(timer);
          
          if (!hasTriggeredAutoDraw.current) {
            hasTriggeredAutoDraw.current = true;
            attemptAutoDraw();
            
            // Retry once to cover delayed serverless cold starts or network hiccups.
            setTimeout(() => {
              attemptAutoDraw();
            }, 5000);
          }
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
  }, [config, fetchStats]);

  const handleGetNumber = async () => {
    if (!config || gettingNumber) return;
    setGettingNumber(true);
    try {
      const response = await fetch('/api/lucky-draw/participate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ draw_id: config.id }),
      });

      const result: { error?: string; number?: number } = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get number');
      }
      
      if (result.number) {
        setMyNumber(result.number);
        localStorage.setItem(`lucky_draw_number_${config.id}_${config.draw_time}`, result.number.toString());
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to get a number. Please try again.';
      console.error('Failed to get number:', err);
      alert(message);
    } finally {
      setGettingNumber(false);
    }
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
        <div className="text-center mb-12 relative">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            {config.title}
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            {config.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* User Number Section */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-xl border-2 border-indigo-100 flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
              
              <Hash className="h-12 w-12 text-indigo-200 mb-4" />
              
              {myNumber === null ? (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Get Your Raffle Number</h2>
                  <p className="text-gray-500 mb-8">
                    {language === 'zh-CN' ? '仅限现场领取。点击下方按钮获取您的专属号码牌参与抽奖！' : 'Limited to on-site redemption. Click below to get your exclusive number for the draw!'}
                  </p>
                  <button
                    onClick={handleGetNumber}
                    disabled={gettingNumber}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100"
                  >
                    {gettingNumber ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : (language === 'zh-CN' ? '立即取号' : 'Get Number')}
                  </button>
                </>
              ) : (
                <div className="w-full animate-in zoom-in duration-500">
                  <h2 className="text-lg font-bold text-gray-500 mb-2 uppercase tracking-wider">
                    {language === 'zh-CN' ? '您的专属号码' : 'Your Number'}
                  </h2>
                  <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-purple-600 my-6 font-mono drop-shadow-sm">
                    {myNumber.toString().padStart(3, '0')}
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3 text-left">
                    <Camera className="h-6 w-6 text-yellow-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-yellow-800 text-sm">
                        {language === 'zh-CN' ? '请截图保存！' : 'Please screenshot and save!'}
                      </h4>
                      <p className="text-yellow-700 text-xs mt-1">
                        {language === 'zh-CN' ? '请出示此截图作为现场领奖的唯一凭证。' : 'Please present this screenshot as the only proof for on-site prize redemption.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <Gift className="h-6 w-6 text-indigo-600" />
                <h2 className="text-lg font-bold text-gray-900">{language === 'zh-CN' ? '奖项设置' : 'Prizes'}</h2>
              </div>
              <div className="space-y-3">
                {config.prizes?.map((prize, idx) => {
                  const Icon = ICON_MAP[prize.icon] || <Gift className="h-5 w-5" />;
                  return (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${prize.color || 'bg-gray-100 text-gray-600'}`}>
                          {React.cloneElement(Icon as React.ReactElement, { className: 'h-5 w-5' })}
                        </div>
                        <span className="font-bold text-gray-900">{prize.name}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
                        {prize.quantity} {language === 'zh-CN' ? '名' : 'Winners'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <Info className="h-6 w-6 text-indigo-600" />
                <h2 className="text-lg font-bold text-gray-900">{t('lucky.rules')}</h2>
              </div>
              <div className="text-sm text-gray-600 space-y-2 whitespace-pre-line">
                {language === 'zh-CN' 
                  ? '1. 仅限现场活动参与者领取号码。\n2. 每人限领一号。\n3. 请务必截图保存您的号码牌。\n4. 中奖后凭截图至工作人员处兑换奖品。' 
                  : '1. Limited to on-site event participants.\n2. One number per person.\n3. Please screenshot and save your number.\n4. Present the screenshot to staff to claim your prize if you win.'}
              </div>
            </div>
          </div>

          {/* Live Draw Section */}
          <div className="space-y-6">
            <div className="bg-gray-900 p-8 rounded-3xl shadow-xl text-center relative overflow-hidden text-white">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
              
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="font-bold text-red-400 uppercase tracking-wider text-sm">Live Draw</span>
                </div>
                <div className="text-sm text-gray-400">
                  {participantsCount} Participants
                </div>
              </div>

              {timeLeft ? (
                <div className="py-8 relative z-10">
                  <div className="text-sm text-gray-400 uppercase font-bold tracking-wider mb-4">Starts in</div>
                  <div className="text-4xl font-black text-white font-mono tracking-widest">
                    {timeLeft}
                  </div>
                </div>
              ) : (
                <div className="py-6 relative z-10">
                  <div className="text-sm text-green-400 uppercase font-bold tracking-wider mb-4">Draw Completed</div>
                  <div className="text-2xl font-black text-white mb-2">
                    {winners.length > 0 ? 'Results are out!' : (participantsCount > 0 ? 'Drawing...' : 'No participants')}
                  </div>
                  <p className="text-gray-400 text-sm">
                    {winners.length > 0 || participantsCount === 0 ? 'Check the recent winners list below to see if you won.' : 'Please wait while we allocate the prizes.'}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <h3 className="font-bold text-gray-900">Recent Winners</h3>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {winners.length > 0 ? (
                  <ul className="divide-y divide-gray-100">
                    {winners.map((winner, idx) => (
                      <li key={winner.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors animate-in fade-in slide-in-from-left-2">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-gray-400 w-6">#{idx + 1}</span>
                          <span className="text-xl font-black text-indigo-600 font-mono">
                            {winner.number.toString().padStart(3, '0')}
                          </span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-bold text-gray-900 bg-yellow-100 px-2 py-0.5 rounded text-yellow-800 mb-1">
                            {winner.prize_name}
                          </span>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            {format(new Date(winner.created_at), 'HH:mm:ss')}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-8 text-center text-gray-400 italic text-sm">
                    No winners drawn yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LuckyDraw;
