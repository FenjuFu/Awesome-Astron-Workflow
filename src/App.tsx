import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ContributionStats from './pages/ContributionStats';
import { LanguageProvider } from './contexts/LanguageContext';
import ActivityList from './pages/activities/ActivityList';
import ActivityDetail from './pages/activities/ActivityDetail';
import RegistrationForm from './pages/activities/RegistrationForm';
import RegistrationSuccess from './pages/activities/RegistrationSuccess';
import AdminDashboard from './pages/admin/AdminDashboard';
import RedemptionManage from './pages/admin/RedemptionManage';
import AIChat from './pages/AIChat';
import AstronLandscape from './pages/AstronLandscape';

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<AIChat />} />
          <Route path="/landscape" element={<AstronLandscape />} />
          <Route path="/astron-landscape" element={<AstronLandscape />} />
          <Route path="/stats" element={<ContributionStats />} />
          <Route path="/stats/admin" element={<RedemptionManage />} />
          <Route path="/activities" element={<ActivityList />} />
          <Route path="/activities/admin" element={<AdminDashboard />} />
          <Route path="/activities/:activityKey" element={<ActivityDetail />} />
          <Route path="/register/:activityKey" element={<RegistrationForm />} />
          <Route path="/success" element={<RegistrationSuccess />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
