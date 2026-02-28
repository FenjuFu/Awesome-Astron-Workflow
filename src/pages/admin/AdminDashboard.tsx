import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ActivityManage from './ActivityManage';
import RegistrationManage from './RegistrationManage';
import { Calendar, Users, LogOut, LayoutDashboard } from 'lucide-react';
import Navigation from '../../components/Navigation';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'activities' | 'registrations'>('activities');
  const navigate = useNavigate();

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
