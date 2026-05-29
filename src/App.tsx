import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
  matchPath,
  useLocation,
} from 'react-router-dom';
import Home from './pages/Home';
import ContributionStats from './pages/ContributionStats';
import { LanguageProvider } from './contexts/LanguageContext';
import ActivityList from './pages/activities/ActivityList';
import ActivityDetail from './pages/activities/ActivityDetail';
import LuckyDraw from './pages/activities/LuckyDraw';
import LuckyDrawAdmin from './pages/activities/LuckyDrawAdmin';
import RegistrationForm from './pages/activities/RegistrationForm';
import RegistrationSuccess from './pages/activities/RegistrationSuccess';
import AdminDashboard from './pages/admin/AdminDashboard';
import RedemptionManage from './pages/admin/RedemptionManage';
import AIChat from './pages/AIChat';
import Privacy from './pages/Privacy';
import AstronLandscape from './pages/AstronLandscape';

const routePatterns = [
  '/',
  '/chat',
  '/privacy',
  '/landscape',
  '/astron-landscape',
  '/stats',
  '/stats/admin',
  '/activities',
  '/activities/lucky_draw',
  '/activities/lucky_draw/admin',
  '/activities/admin',
  '/activities/:activityKey',
  '/register/:activityKey',
  '/success',
  '/admin',
];

const trailingGarbagePattern = /[)\]}>）】》」』]+$/;

const matchesKnownRoute = (pathname: string) =>
  routePatterns.some((pattern) => matchPath({ path: pattern, end: true }, pathname));

const getSanitizedPathname = (pathname: string) => {
  let candidate = pathname;

  while (candidate.length > 1 && trailingGarbagePattern.test(candidate)) {
    candidate = candidate.replace(trailingGarbagePattern, '');
    if (matchesKnownRoute(candidate)) {
      return candidate;
    }
  }

  return null;
};

const RouteFallback: React.FC = () => {
  const location = useLocation();
  const sanitizedPathname = getSanitizedPathname(location.pathname);

  if (sanitizedPathname) {
    return <Navigate to={`${sanitizedPathname}${location.search}${location.hash}`} replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <p className="text-sm font-semibold text-indigo-600 mb-3">404</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">页面不存在</h1>
        <p className="text-gray-600 mb-6">
          当前链接可能包含多余字符，或页面地址已经变更。你可以返回首页后重新进入目标页面。
        </p>
        <div className="flex justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors duration-200"
          >
            返回首页
          </Link>
          <Link
            to="/activities"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            查看活动
          </Link>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<AIChat />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/landscape" element={<AstronLandscape />} />
          <Route path="/astron-landscape" element={<AstronLandscape />} />
          <Route path="/stats" element={<ContributionStats />} />
          <Route path="/stats/admin" element={<RedemptionManage />} />
          <Route path="/activities" element={<ActivityList />} />
          <Route path="/activities/lucky_draw" element={<LuckyDraw />} />
          <Route path="/activities/lucky_draw/admin" element={<LuckyDrawAdmin />} />
          <Route path="/activities/admin" element={<AdminDashboard />} />
          <Route path="/activities/:activityKey" element={<ActivityDetail />} />
          <Route path="/register/:activityKey" element={<RegistrationForm />} />
          <Route path="/success" element={<RegistrationSuccess />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<RouteFallback />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
