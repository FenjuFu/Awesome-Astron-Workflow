import React, { useState, useEffect } from 'react';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import { useLanguage } from '../../contexts/LanguageContext';
import { Gift, Trophy, Info, Loader2, Calendar, ArrowRight, Camera, Hash, Lock, CheckCircle2, Coins } from 'lucide-react';
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
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDrawNumber, setCurrentDrawNumber] = useState<number | null>(null);
  const [selectedPrizeTier, setSelectedPrizeTier] = useState<number>(0);

  useEffect(() => {
    fetchActiveDraw();
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
        
        // Load user's number from local storage
        const savedNum = localStorage.getItem(`lucky_draw_number_${drawData.id}`);
        if (savedNum) {
          setMyNumber(parseInt(savedNum, 10));
        }

        fetchStats(drawData.id);
        
        // Subscribe to winners
        const channel = supabase
          .channel('winners_channel')
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'lucky_draw_winners', filter: `draw_id=eq.${drawData.id}` },
            (payload) => {
              setWinners(prev => [payload.new as Winner, ...prev]);
            }
          )
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'lucky_draw_participants', filter: `draw_id=eq.${drawData.id}` },
            (payload) => {
              setParticipantsCount(prev => prev + 1);
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
  };

  const fetchStats = async (drawId: string) => {
    try {
      // Get participants count
      const { count, error: countError } = await supabase
        .from('lucky_draw_participants')
        .select('*', { count: 'exact', head: true })
        .eq('draw_id', drawId);
      
      if (!countError && count !== null) {
        setParticipantsCount(count);
      }

      // Get winners
      const { data: winnersData, error: winnersError } = await supabase
        .from('lucky_draw_winners')
        .select('*')
        .eq('draw_id', drawId)
        .order('created_at', { ascending: false });
        
      if (!winnersError && winnersData) {
        setWinners(winnersData);
      }
    } catch (err) {
      console.error('Error fetching stats', err);
    }
  };

  const handleGetNumber = async () => {
    if (!config || gettingNumber) return;
    setGettingNumber(true);
    try {
      const { data, error } = await supabase
        .from('lucky_draw_participants')
        .insert([{ draw_id: config.id }])
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        setMyNumber(data.number);
        localStorage.setItem(`lucky_draw_number_${config.id}`, data.number.toString());
      }
    } catch (err) {
      console.error('Failed to get number:', err);
      alert('Failed to get a number. Please try again.');
    } finally {
      setGettingNumber(false);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const envPassword = import.meta.env.VITE_ADMIN_PASSWORD;
    if (adminPassword === envPassword) {
      setIsAdmin(true);
      setShowAdminLogin(false);
    } else {
      alert('Invalid password');
    }
  };

  const handleDrawWinner = async () => {
    if (!config || isDrawing || participantsCount === 0 || !config.prizes || config.prizes.length === 0) return;
    
    // Fetch all participants
    const { data: participants, error: pError } = await supabase
      .from('lucky_draw_participants')
      .select('id, number')
      .eq('draw_id', config.id);
      
    if (pError || !participants || participants.length === 0) return;

    // Filter out existing winners
    const winnerNumbers = new Set(winners.map(w => w.number));
    const eligibleParticipants = participants.filter(p => !winnerNumbers.has(p.number));
    
    if (eligibleParticipants.length === 0) {
      alert('Everyone has won already!');
      return;
    }

    setIsDrawing(true);
    
    // Animation
    let duration = 3000; // 3 seconds
    let interval = 50;
    let elapsed = 0;
    
    const animate = setInterval(() => {
      elapsed += interval;
      const randomP = eligibleParticipants[Math.floor(Math.random() * eligibleParticipants.length)];
      setCurrentDrawNumber(randomP.number);
      
      if (elapsed >= duration) {
        clearInterval(animate);
        // Pick final winner
        const finalWinner = eligibleParticipants[Math.floor(Math.random() * eligibleParticipants.length)];
        setCurrentDrawNumber(finalWinner.number);
        const currentPrize = config.prizes[selectedPrizeTier];
        saveWinner(finalWinner.id, finalWinner.number, currentPrize.name);
      }
    }, interval);
  };

  const saveWinner = async (participantId: string, number: number, prizeName: string) => {
    try {
      const { error } = await supabase
        .from('lucky_draw_winners')
        .insert([{
          draw_id: config?.id,
          participant_id: participantId,
          number: number,
          prize_name: prizeName
        }]);
        
      if (error) throw error;
      
      setTimeout(() => {
        setIsDrawing(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to save winner', err);
      setIsDrawing(false);
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
          <button 
            onClick={() => setShowAdminLogin(true)}
            className="absolute top-0 right-0 p-2 text-gray-300 hover:text-indigo-600 transition-colors"
          >
            <Lock className="h-5 w-5" />
          </button>
        </div>

        {/* Admin Login Modal */}
        {showAdminLogin && !isAdmin && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Admin Access</h3>
              <form onSubmit={handleAdminLogin}>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg mb-4 focus:ring-2 focus:ring-indigo-500 outline-none"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowAdminLogin(false)} className="px-4 py-2 text-gray-600 font-medium">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium">Login</button>
                </div>
              </form>
            </div>
          </div>
        )}

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
                  <div className="text-sm text-gray-400 uppercase font-bold tracking-wider mb-2">Winning Number</div>
                  <div className={`text-8xl font-black font-mono transition-all duration-75 ${isDrawing ? 'text-yellow-400 blur-[1px]' : 'text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]'}`}>
                    {currentDrawNumber !== null ? currentDrawNumber.toString().padStart(3, '0') : '---'}
                  </div>
                  
                  {isAdmin && config.prizes && config.prizes.length > 0 && (
                    <div className="mt-8 bg-gray-800 p-4 rounded-xl text-left">
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Select Prize to Draw</label>
                      <select 
                        value={selectedPrizeTier}
                        onChange={(e) => setSelectedPrizeTier(Number(e.target.value))}
                        disabled={isDrawing}
                        className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none mb-4"
                      >
                        {config.prizes.map((prize, idx) => (
                          <option key={idx} value={idx}>
                            {prize.name} ({prize.quantity} total)
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleDrawWinner}
                        disabled={isDrawing || participantsCount === 0}
                        className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full shadow-[0_0_20px_rgba(234,179,8,0.3)]"
                      >
                        {isDrawing ? 'Drawing...' : `Draw ${config.prizes[selectedPrizeTier]?.name || 'Winner'}`}
                      </button>
                    </div>
                  )}
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