import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ContributionStats from './pages/ContributionStats';
import FloatingVideo from './components/FloatingVideo';
import { LanguageProvider } from './contexts/LanguageContext';

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/stats" element={<ContributionStats />} />
        </Routes>
        <FloatingVideo />
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
