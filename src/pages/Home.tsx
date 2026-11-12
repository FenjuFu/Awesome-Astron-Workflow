import React from 'react';
import Navigation from '../components/Navigation';
import Hero from '../components/Hero';
import WorkflowShowcase from '../components/WorkflowShowcase';
import About from '../components/About';
import CommunityVibeVault from '../components/CommunityVibeVault';
import WayToSuperAgent from '../components/WayToSuperAgent';
import Footer from '../components/Footer';
import GalaxyEntry from '../components/GalaxyEntry';

const Home: React.FC = () => {
  return (
    <div className="spark-home min-h-screen bg-white">
      <Navigation />
      <main>
        <Hero />
        <GalaxyEntry />
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
