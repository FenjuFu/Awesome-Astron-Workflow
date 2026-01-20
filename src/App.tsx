import React from 'react';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import WorkflowShowcase from './components/WorkflowShowcase';
import About from './components/About';
import CommunityVibeVault from './components/CommunityVibeVault';
import WayToSuperAgent from './components/WayToSuperAgent';
import Contribute from './components/Contribute';
import Footer from './components/Footer';
import FloatingVideo from './components/FloatingVideo';
import { LanguageProvider } from './contexts/LanguageContext';

function App() {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-white">
        <Navigation />
        <main>
          <Hero />
          <WorkflowShowcase />
          <WayToSuperAgent />
          <CommunityVibeVault />
          <About />
          <Contribute />
        </main>
        <Footer />
        <FloatingVideo />
      </div>
    </LanguageProvider>
  );
}

export default App;
