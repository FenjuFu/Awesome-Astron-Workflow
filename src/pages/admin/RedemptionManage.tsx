import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink,
  Loader2,
  RefreshCcw,
  User,
  Mail,
  Phone,
  Gift
} from 'lucide-react';
import Navigation from '../../components/Navigation';

interface Redemption {
  id: string;
  github_login: string;
  prize_id: string;
  prize_name: string;
  points_spent: number;
  phone: string;
  email: string;
  status: 'pending' | 'issued' | 'rejected';
  created_at: string;
}

const RedemptionManage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = sessionStorage.getItem('stats_admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
      fetchRedemptions();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'astron-workflow-admin';
    
    if (password === adminPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem('stats_admin_auth', 'true');
      setError('');
      fetchRedemptions();
    } else {
      setError('密码错误');
    }
  };

  const fetchRedemptions = async () => {
    try {
      setLoading(true);
      const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'astron-workflow-admin';
      const res = await fetch('/api/redemptions', {
        headers: {
          'x-admin-password': adminPassword
        }
      });
      if (res.ok) {
        const data = await res.json();
        setRedemptions(data);
      } else {
        setError('获取数据失败');
      }
    } catch (err) {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: 'issued' | 'rejected') => {
    try {
      setUpdatingId(id);
      const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'astron-workflow-admin';
      const res = await fetch('/api/redemptions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword
        },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        setRedemptions(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      } else {
        alert('更新失败');
      }
    } catch (err) {
      alert('网络错误');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredRedemptions = redemptions.filter(r => 
    r.github_login.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.phone.includes(searchTerm) ||
    r.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <div className="flex justify-center mb-6">
            <div className="bg-indigo-100 p-3 rounded-full">
              <Lock className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">积分兑换管理登录</h2>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">访问密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="请输入管理员密码"
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate('/stats')}
                className="text-gray-600 hover:text-gray-800 text-sm"
              >
                返回统计页
              </button>
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                进入后台
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      
      <main className="flex-grow pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">积分兑换审核</h1>
              <p className="text-gray-600 mt-1">管理用户积分兑换申请，审核并核销奖品。</p>
            </div>
            <button 
              onClick={fetchRedemptions}
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              刷新数据
            </button>
          </div>

          {/* Filters & Search */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-center">
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text"
                placeholder="搜索 GitHub 账号 / 手机号 / 邮箱..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="text-sm text-gray-500">
              共找到 <span className="font-bold text-indigo-600">{filteredRedemptions.length}</span> 条记录
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">申请人</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">联系方式</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">兑换内容</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">消耗积分</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">状态</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
                        <p className="text-gray-400 mt-2">加载数据中...</p>
                      </td>
                    </tr>
                  ) : filteredRedemptions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <p className="text-gray-400">暂无兑换记录</p>
                      </td>
                    </tr>
                  ) : (
                    filteredRedemptions.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                              <User className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-bold text-gray-900">{r.github_login}</div>
                              <div className="text-[10px] text-gray-400">
                                {new Date(r.created_at).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center text-xs text-gray-600 gap-1.5">
                              <Phone className="w-3 h-3 text-gray-400" />
                              {r.phone}
                            </div>
                            <div className="flex items-center text-xs text-gray-600 gap-1.5">
                              <Mail className="w-3 h-3 text-gray-400" />
                              {r.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Gift className="w-4 h-4 text-indigo-600" />
                            <span className="text-sm font-medium text-gray-900">{r.prize_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-red-600">-{r.points_spent}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            r.status === 'issued' ? 'bg-green-100 text-green-800' :
                            r.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {r.status === 'issued' ? <CheckCircle2 className="w-3 h-3" /> :
                             r.status === 'rejected' ? <XCircle className="w-3 h-3" /> :
                             <Clock className="w-3 h-3" />}
                            {r.status === 'issued' ? '已发放' : r.status === 'rejected' ? '已拒绝' : '审核中'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {r.status === 'pending' ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateStatus(r.id, 'issued')}
                                disabled={updatingId === r.id}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="确认发放"
                              >
                                {updatingId === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                              </button>
                              <button
                                onClick={() => updateStatus(r.id, 'rejected')}
                                disabled={updatingId === r.id}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="拒绝申请"
                              >
                                {updatingId === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-5 h-5" />}
                              </button>
                            </div>
                          ) : (
                            <div className="text-xs text-gray-400 italic">已处理</div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RedemptionManage;
