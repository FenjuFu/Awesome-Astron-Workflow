import React from 'react';
import Navigation from '../components/Navigation';
import Hero from '../components/Hero';
import WorkflowShowcase from '../components/WorkflowShowcase';
import About from '../components/About';
import CommunityVibeVault from '../components/CommunityVibeVault';
import WayToSuperAgent from '../components/WayToSuperAgent';
import Footer from '../components/Footer';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main>
        <Hero />
        <WorkflowShowcase />
        <WayToSuperAgent />
        <CommunityVibeVault />
        <About />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
