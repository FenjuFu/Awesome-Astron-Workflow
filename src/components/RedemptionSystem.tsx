import React, { useState, useEffect } from 'react';
import { Gift, History, CheckCircle2, Clock, XCircle, Send, Loader2, ZoomIn, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Redemption {
  id: string;
  prize_id: string;
  prize_name: string;
  points_spent: number;
  phone: string;
  email: string;
  status: 'pending' | 'issued' | 'rejected';
  created_at: string;
}

interface Prize {
  id: string;
  nameKey: string;
  descKey: string;
  points: number;
  icon: React.ReactNode;
  imageUrl?: string;
}

const PRIZES: Prize[] = [
  {
    id: 'astronclaw_membership',
    nameKey: 'redeem.prize.astronclaw',
    descKey: 'redeem.prize.astronclaw.desc',
    points: 15,
    icon: <Gift className="h-6 w-6 text-indigo-600" />,
  },
  {
    id: 'bladeless_fan',
    nameKey: 'redeem.prize.fan',
    descKey: 'redeem.prize.fan.desc',
    points: 15,
    icon: <img src="/images/prizes/bladeless-fan.jpg" alt="Bladeless Fan" className="h-10 w-10 object-cover rounded-md" />,
    imageUrl: "/images/prizes/bladeless-fan.jpg",
  },
];

interface RedemptionSystemProps {
  totalContributions: number;
}

const RedemptionSystem: React.FC<RedemptionSystemProps> = ({ totalContributions }) => {
  const { t } = useLanguage();
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({ phone: '', email: '', name: '', address: '' });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const spentPoints = redemptions
    .filter((r) => r.status !== 'rejected')
    .reduce((sum, r) => sum + r.points_spent, 0);
  
  const availablePoints = totalContributions - spentPoints;

  useEffect(() => {
    fetchRedemptions();
  }, []);

  const fetchRedemptions = async () => {
    try {
      const res = await fetch('/api/redemptions');
      if (res.ok) {
        const data = await res.json();
        setRedemptions(data);
      }
    } catch (err) {
      console.error('Failed to fetch redemptions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPrize) return;
    if (availablePoints < selectedPrize.points) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/redemptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prizeId: selectedPrize.id,
          prizeName: t(selectedPrize.nameKey),
          pointsSpent: selectedPrize.points,
          ...formData,
        }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: t('redeem.success') });
        setSelectedPrize(null);
        setFormData({ phone: '', email: '', name: '', address: '' });
        fetchRedemptions();
      } else {
        setMessage({ type: 'error', text: t('redeem.error') });
      }
    } catch (err) {
      setMessage({ type: 'error', text: t('redeem.error') });
    } finally {
      setSubmitting(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Points Summary */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium opacity-90">{t('redeem.title')}</h3>
            <div className="text-4xl font-bold mt-1">{availablePoints} <span className="text-xl font-normal opacity-80">{t('redeem.points')}</span></div>
          </div>
          <div className="text-right text-sm opacity-90">
            <div>{t('contribute.github.totalContributions')}: {totalContributions}</div>
            <div>{t('redeem.spent')}: {spentPoints}</div>
          </div>
        </div>
      </div>

      {/* Prize List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Gift className="h-5 w-5 text-indigo-600" />
            {t('redeem.prizes')}
          </h4>
          <div className="grid gap-4">
            {PRIZES.map((prize) => (
              <div 
                key={prize.id}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedPrize?.id === prize.id 
                    ? 'border-indigo-600 bg-indigo-50 shadow-md' 
                    : 'border-gray-100 bg-white hover:border-indigo-200'
                }`}
                onClick={() => setSelectedPrize(prize)}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-indigo-100 rounded-lg relative group">
                    {prize.icon}
                    {prize.imageUrl && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewImage(prize.imageUrl!);
                        }}
                        className="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow-md border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-50"
                        title="View large image"
                      >
                        <ZoomIn className="h-3.5 w-3.5 text-indigo-600" />
                      </button>
                    )}
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <h5 className="font-bold text-gray-900">{t(prize.nameKey)}</h5>
                      <span className="text-indigo-600 font-bold">{prize.points} pts</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{t(prize.descKey)}</p>
                    {availablePoints < prize.points && (
                      <p className="text-xs text-red-500 mt-2">{t('redeem.points.insufficient')}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Redemption Form */}
        <div className="space-y-4">
          <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Send className="h-5 w-5 text-indigo-600" />
            {t('redeem.submit')}
          </h4>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            {!selectedPrize ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 py-8">
                <Gift className="h-12 w-12 opacity-20 mb-2" />
                <p>Please select a reward to redeem</p>
              </div>
            ) : (
              <form onSubmit={handleRedeem} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('redeem.form.phone')}</label>
                  <input 
                    type="tel" 
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('redeem.form.email')}</label>
                  <input 
                    type="email" 
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('redeem.form.name')}</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('redeem.form.address')}</label>
                  <textarea 
                    required
                    rows={2}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting || availablePoints < selectedPrize.points}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : t('redeem.form.confirm')}
                </button>
                {message && (
                  <p className={`text-sm text-center ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {message.text}
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>

      {/* History */}
      {redemptions.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <History className="h-5 w-5 text-indigo-600" />
            {t('redeem.history')}
          </h4>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">Reward</th>
                  <th className="px-6 py-3 text-left font-medium">Points</th>
                  <th className="px-6 py-3 text-left font-medium">Date</th>
                  <th className="px-6 py-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {redemptions.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{r.prize_name}</td>
                    <td className="px-6 py-4 text-gray-600">-{r.points_spent}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        r.status === 'issued' ? 'bg-green-100 text-green-800' :
                        r.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {r.status === 'issued' ? <CheckCircle2 className="h-3 w-3" /> :
                         r.status === 'rejected' ? <XCircle className="h-3 w-3" /> :
                         <Clock className="h-3 w-3" />}
                        {t(`redeem.status.${r.status}`)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-md rounded-full text-gray-800 hover:bg-white transition-colors z-10 shadow-lg"
            >
              <X className="h-5 w-5" />
            </button>
            <img 
              src={previewImage} 
              alt="Prize Preview" 
              className="w-full h-auto max-h-[85vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RedemptionSystem;
