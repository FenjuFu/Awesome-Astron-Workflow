import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ActivityManage from './ActivityManage';
import RegistrationManage from './RegistrationManage';
import { Calendar, Users, LogOut, LayoutDashboard, Lock } from 'lucide-react';
import Navigation from '../../components/Navigation';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'activities' | 'registrations'>('activities');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const auth = sessionStorage.getItem('admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;
    
    if (password === adminPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_auth', 'true');
      setError('');
    } else {
      setError('密码错误');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-100 p-3 rounded-full">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">管理员登录</h2>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                访问密码
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入管理员密码"
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-800 text-sm"
              >
                返回首页
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
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
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <div className="pt-16 flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md min-h-[calc(100vh-64px)] hidden md:block">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold flex items-center">
              <LayoutDashboard className="w-5 h-5 mr-2 text-blue-600" />
              管理后台
            </h2>
          </div>
          <nav className="p-4 space-y-2">
            <button
              onClick={() => setActiveTab('activities')}
              className={`w-full flex items-center px-4 py-2 rounded-md transition-colors ${
                activeTab === 'activities' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Calendar className="w-5 h-5 mr-3" />
              活动管理
            </button>
            <button
              onClick={() => setActiveTab('registrations')}
              className={`w-full flex items-center px-4 py-2 rounded-md transition-colors ${
                activeTab === 'registrations' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Users className="w-5 h-5 mr-3" />
              报名管理
            </button>
          </nav>
          <div className="absolute bottom-4 left-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-gray-500 hover:text-red-600 px-4 py-2"
            >
              <LogOut className="w-5 h-5 mr-3" />
              返回首页
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          {/* Mobile Tabs */}
          <div className="md:hidden bg-white shadow-sm flex border-b">
            <button
              onClick={() => setActiveTab('activities')}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'activities' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'
              }`}
            >
              活动管理
            </button>
            <button
              onClick={() => setActiveTab('registrations')}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'registrations' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'
              }`}
            >
              报名管理
            </button>
          </div>

          <div className="max-w-7xl mx-auto">
            {activeTab === 'activities' ? <ActivityManage /> : <RegistrationManage />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
