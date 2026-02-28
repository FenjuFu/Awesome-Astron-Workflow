import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import { CheckCircle } from 'lucide-react';

const RegistrationSuccess: React.FC = () => {
  const location = useLocation();
  const { activityTitle } = (location.state as { activityTitle?: string }) || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center">
        <div className="bg-white shadow sm:rounded-lg overflow-hidden max-w-lg w-full p-8 text-center">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">报名成功!</h1>
          <p className="text-lg text-gray-600 mb-8">
            您已成功报名参加活动：<br />
            <span className="font-semibold text-gray-900">{activityTitle || '活动'}</span>
          </p>
          <div className="space-y-4">
            <Link
              to="/activities"
              className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              浏览更多活动
            </Link>
            <Link
              to="/"
              className="w-full inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              返回首页
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RegistrationSuccess;
