import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ContributionStats from './pages/ContributionStats';
import FloatingVideo from './components/FloatingVideo';
import { LanguageProvider } from './contexts/LanguageContext';
import ActivityList from './pages/activities/ActivityList';
import ActivityDetail from './pages/activities/ActivityDetail';
import RegistrationForm from './pages/activities/RegistrationForm';
import RegistrationSuccess from './pages/activities/RegistrationSuccess';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/stats" element={<ContributionStats />} />
          <Route path="/activities" element={<ActivityList />} />
          <Route path="/activities/admin" element={<AdminDashboard />} />
          <Route path="/activities/:id" element={<ActivityDetail />} />
          <Route path="/register/:id" element={<RegistrationForm />} />
          <Route path="/success" element={<RegistrationSuccess />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
        <FloatingVideo />
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
