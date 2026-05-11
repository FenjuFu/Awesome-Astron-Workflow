import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Gift, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  Lock,
  Loader2,
  Trophy,
  Coins,
  Info
} from 'lucide-react';
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

const ICON_OPTIONS = [
  { name: 'Gift', icon: <Gift className="h-4 w-4" /> },
  { name: 'Trophy', icon: <Trophy className="h-4 w-4" /> },
  { name: 'Coins', icon: <Coins className="h-4 w-4" /> },
  { name: 'Info', icon: <Info className="h-4 w-4" /> },
];

const COLOR_OPTIONS = [
  { name: 'Yellow', class: 'bg-yellow-100 text-yellow-600' },
  { name: 'Blue', class: 'bg-blue-100 text-blue-600' },
  { name: 'Purple', class: 'bg-purple-100 text-purple-600' },
  { name: 'Gray', class: 'bg-gray-100 text-gray-600' },
  { name: 'Green', class: 'bg-green-100 text-green-600' },
  { name: 'Red', class: 'bg-red-100 text-red-600' },
];

const LuckyDrawAdmin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [luckyDraws, setLuckyDraws] = useState<LuckyDrawConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentDraw, setCurrentDraw] = useState<Partial<LuckyDrawConfig>>({
    title: '',
    description: '',
    prizes: [],
    draw_time: new Date().toISOString().slice(0, 16),
    is_active: true
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchLuckyDraws();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;
    if (adminPassword && password === adminPassword) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid password');
    }
  };

  const fetchLuckyDraws = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('lucky_draws')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLuckyDraws(data || []);
    } catch (err) {
      console.error('Error fetching lucky draws:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setCurrentDraw({
      title: '',
      description: '',
      prizes: [
        { id: 0, name: '', quantity: 0, icon: 'Gift', color: 'bg-blue-100 text-blue-600' },
        { id: 1, name: '', quantity: 0, icon: 'Trophy', color: 'bg-purple-100 text-purple-600' },
        { id: 2, name: '', quantity: 0, icon: 'Coins', color: 'bg-yellow-100 text-yellow-600' },
        { id: 3, name: '', quantity: 0, icon: 'Info', color: 'bg-gray-100 text-gray-600' },
        { id: 4, name: '', quantity: 0, icon: 'Gift', color: 'bg-blue-100 text-blue-600' },
        { id: 5, name: '', quantity: 0, icon: 'Trophy', color: 'bg-purple-100 text-purple-600' },
        { id: 6, name: '', quantity: 0, icon: 'Coins', color: 'bg-yellow-100 text-yellow-600' },
        { id: 7, name: '', quantity: 0, icon: 'Info', color: 'bg-gray-100 text-gray-600' },
      ],
      draw_time: new Date().toISOString().slice(0, 16),
      is_active: true
    });
    setIsEditing(true);
  };

  const handleEdit = (draw: LuckyDrawConfig) => {
    setCurrentDraw({ ...draw });
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this lucky draw?')) return;
    try {
      const { error } = await supabase
        .from('lucky_draws')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchLuckyDraws();
    } catch (err) {
      console.error('Error deleting lucky draw:', err);
      alert('Failed to delete');
    }
  };

  const handleSave = async () => {
    if (!currentDraw.title || currentDraw.prizes?.length !== 8) {
      alert('Title is required and exactly 8 prizes must be set');
      return;
    }

    setSaving(true);
    try {
      const drawData = {
        title: currentDraw.title,
        description: currentDraw.description,
        prizes: currentDraw.prizes,
        draw_time: currentDraw.draw_time,
        is_active: currentDraw.is_active,
        updated_at: new Date().toISOString()
      };

      let error;
      if (currentDraw.id) {
        ({ error } = await supabase
          .from('lucky_draws')
          .update(drawData)
          .eq('id', currentDraw.id));
      } else {
        ({ error } = await supabase
          .from('lucky_draws')
          .insert([drawData]));
      }

      if (error) throw error;
      setIsEditing(false);
      fetchLuckyDraws();
    } catch (err) {
      console.error('Error saving lucky draw:', err);
      alert('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const updatePrize = (index: number, field: keyof PrizeConfig, value: any) => {
    const newPrizes = [...(currentDraw.prizes || [])];
    newPrizes[index] = { ...newPrizes[index], [field]: value };
    setCurrentDraw({ ...currentDraw, prizes: newPrizes });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navigation />
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 w-full max-w-md">
            <div className="flex flex-col items-center mb-6">
              <div className="p-3 bg-indigo-50 rounded-full mb-4">
                <Lock className="h-8 w-8 text-indigo-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Lucky Draw Admin</h1>
              <p className="text-gray-500">Enter password to continue</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                />
              </div>
              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
              >
                Login
              </button>
            </form>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lucky Draw Management</h1>
            <p className="text-gray-500">Create and manage lucky draw events</p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            <Plus className="h-5 w-5" />
            New Lucky Draw
          </button>
        </div>

        {isEditing ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">
                {currentDraw.id ? 'Edit Lucky Draw' : 'Create Lucky Draw'}
              </h2>
              <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={currentDraw.title}
                      onChange={(e) => setCurrentDraw({ ...currentDraw, title: e.target.value })}
                      placeholder="e.g., Annual Festival Lucky Draw"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                    <textarea
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none h-24"
                      value={currentDraw.description}
                      onChange={(e) => setCurrentDraw({ ...currentDraw, description: e.target.value })}
                      placeholder="Enter event description..."
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Draw Time</label>
                    <input
                      type="datetime-local"
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={currentDraw.draw_time?.slice(0, 16)}
                      onChange={(e) => setCurrentDraw({ ...currentDraw, draw_time: new Date(e.target.value).toISOString() })}
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-4">
                    <button
                      onClick={() => setCurrentDraw({ ...currentDraw, is_active: !currentDraw.is_active })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        currentDraw.is_active ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          currentDraw.is_active ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className="text-sm font-semibold text-gray-700">Active Status</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Gift className="h-5 w-5 text-indigo-600" />
                  Prizes (Exactly 8)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentDraw.prizes?.map((prize, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-indigo-600 uppercase">Position {index + 1}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Name</label>
                          <input
                            type="text"
                            className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200"
                            value={prize.name}
                            onChange={(e) => updatePrize(index, 'name', e.target.value)}
                            placeholder="Prize name"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Quantity</label>
                          <input
                            type="number"
                            className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200"
                            value={prize.quantity}
                            onChange={(e) => updatePrize(index, 'quantity', parseInt(e.target.value))}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Icon</label>
                          <select
                            className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200"
                            value={prize.icon}
                            onChange={(e) => updatePrize(index, 'icon', e.target.value)}
                          >
                            {ICON_OPTIONS.map(opt => (
                              <option key={opt.name} value={opt.name}>{opt.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Color</label>
                          <select
                            className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200"
                            value={prize.color}
                            onChange={(e) => updatePrize(index, 'color', e.target.value)}
                          >
                            {COLOR_OPTIONS.map(opt => (
                              <option key={opt.class} value={opt.class}>{opt.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="p-20 flex flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
                <p className="text-gray-500">Loading lucky draws...</p>
              </div>
            ) : luckyDraws.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Lucky Draw</th>
                      <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Draw Time</th>
                      <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase text-center">Prizes</th>
                      <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase text-center">Status</th>
                      <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {luckyDraws.map((draw) => (
                      <tr key={draw.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{draw.title}</div>
                          <div className="text-xs text-gray-500 truncate max-w-xs">{draw.description}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {format(new Date(draw.draw_time), 'yyyy-MM-dd HH:mm')}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full border border-indigo-100">
                            {draw.prizes?.length} prizes
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                            draw.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {draw.is_active ? <CheckCircle2 className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            {draw.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(draw)}
                              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                              title="Edit"
                            >
                              <Edit2 className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(draw.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-20 text-center flex flex-col items-center">
                <div className="p-4 bg-gray-50 rounded-full mb-4">
                  <Gift className="h-12 w-12 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Lucky Draws Yet</h3>
                <p className="text-gray-500 mb-8 max-w-sm">
                  Get started by creating your first lucky draw event for the community.
                </p>
                <button
                  onClick={handleCreate}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                >
                  <Plus className="h-5 w-5" />
                  Create First Event
                </button>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default LuckyDrawAdmin;
