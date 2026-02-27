import React from 'react';
import Hero from '../components/Hero';
import WorkflowShowcase from '../components/WorkflowShowcase';
import GitHubContributionInsights from '../components/GitHubContributionInsights';

export default function Home() {
  return (
    <main>
      <Hero />
      <div className="container mx-auto px-4 py-8">
        <GitHubContributionInsights />
      </div>
      <WorkflowShowcase />
    </main>
  );
}
