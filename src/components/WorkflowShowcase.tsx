import React, { useState } from 'react';
import { ExternalLink, Github, ArrowRight, Zap, PenTool, GraduationCap, Code, Film, Heart, Layers, Calendar } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { workflows } from '../types/workflow';
import { getIcon } from '../utils/icons';

const WorkflowShowcase: React.FC = () => {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeEvent, setActiveEvent] = useState<string>('all');

  const categories = [
    { id: 'all', icon: Layers, label: 'All' }, // Fallback label, will use translation
    { id: 'productivity', icon: Zap, color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-200' },
    { id: 'creative', icon: PenTool, color: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-200' },
    { id: 'learning', icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' },
    { id: 'coding', icon: Code, color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' },
    { id: 'entertainment', icon: Film, color: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-200' },
    { id: 'health', icon: Heart, color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' },
  ];

  // Extract unique events
  const events = ['all', ...Array.from(new Set(workflows.map(w => w.event).filter(Boolean)))];

  const filteredWorkflows = workflows.filter(w => {
    const matchesCategory = activeCategory === 'all' || w.category === activeCategory;
    const matchesEvent = activeEvent === 'all' || w.event === activeEvent;
    return matchesCategory && matchesEvent;
  });

  return (
    <section id="workflows" className="py-20 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-4 animate-fade-in-up">
            {t('workflows.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('workflows.subtitle')}
          </p>
        </div>

        {/* Category Tabs (Gamified) */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            
            // Dynamic translation for "All" and categories
            const label = category.id === 'all' ? (t('categories.all') || 'All') : t(`categories.${category.id}`);

            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`
                  flex items-center space-x-2 px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 transform
                  ${isActive 
                    ? 'bg-white shadow-lg scale-110 ring-2 ring-indigo-500 text-indigo-700' 
                    : 'bg-white/50 hover:bg-white hover:shadow-md text-gray-600 hover:scale-105'
                  }
                `}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-600' : (category.color || 'text-gray-500')}`} />
                <span>{label}</span>
                {isActive && (
                  <span className="ml-2 bg-indigo-100 text-indigo-600 py-0.5 px-2 rounded-full text-xs">
                    {activeCategory === 'all' ? workflows.length : workflows.filter(w => w.category === activeCategory).length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Event Filter */}
        {events.length > 1 && (
          <div className="flex flex-wrap justify-center items-center gap-3 mb-12 animate-fade-in">
             <div className="flex items-center space-x-2 mr-2 bg-white/50 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Events</span>
             </div>
             {events.map((event) => {
                const isActive = activeEvent === (event as string);
                const label = event === 'all' ? 'All Events' : event;
                
                // Calculate count for this event based on active category
                const relevantWorkflows = activeCategory === 'all'
                   ? workflows
                   : workflows.filter(w => w.category === activeCategory);
                
                const count = event === 'all'
                   ? relevantWorkflows.length
                   : relevantWorkflows.filter(w => w.event === event).length;
                
                return (
                  <button
                    key={event as string}
                    onClick={() => setActiveEvent(event as string)}
                    className={`
                      px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border flex items-center
                      ${isActive 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                        : 'bg-white text-gray-600 hover:bg-indigo-50 border-gray-200 hover:border-indigo-200'
                      }
                    `}
                  >
                    <span>{label}</span>
                    {isActive && (
                      <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${isActive ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
             })}
          </div>
        )}

        {/* Workflow Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredWorkflows.map((workflow) => {
            const Icon = getIcon(workflow.icon);
            const cat = categories.find(c => c.id === workflow.category);
            
            return (
              <div
                key={workflow.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group border border-transparent hover:border-indigo-100 relative"
              >
                {/* Decorative background element */}
                <div className={`absolute top-0 right-0 -mt-8 -mr-8 w-24 h-24 rounded-full opacity-10 ${cat?.bg || 'bg-gray-100'}`}></div>

                {/* Card Header */}
                <div className="p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 rounded-xl shadow-sm ${cat?.bg || 'bg-gray-100'}`}>
                        {Icon && <Icon className={`h-6 w-6 ${cat?.color || 'text-gray-600'}`} />}
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-xs font-bold uppercase tracking-wider ${cat?.color || 'text-gray-500'}`}>
                           {t(`categories.${workflow.category}`)}
                        </span>
                        <span className="text-xs text-gray-400">ID: {workflow.id}</span>
                      </div>
                    </div>
                    {/* Event Badge */}
                    {workflow.event && (
                        <div className="flex items-center bg-indigo-50 px-2 py-1 rounded-md text-[10px] font-medium text-indigo-600 border border-indigo-100 max-w-[120px]" title={workflow.event}>
                           <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                           <span className="truncate">{workflow.event}</span>
                        </div>
                    )}
                  </div>

                  {/* Title and Description */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors duration-200">
                    {t(workflow.title)}
                  </h3>
                  <p className="text-gray-600 mb-6 line-clamp-3 text-sm leading-relaxed">
                    {t(workflow.description)}
                  </p>

                  {/* Features (Mini Tags) */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {workflow.features.slice(0, 3).map((feature, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md border border-gray-100">
                        {t(feature).length > 20 ? t(feature).substring(0, 20) + '...' : t(feature)}
                      </span>
                    ))}
                    {workflow.features.length > 3 && (
                      <span className="px-2 py-1 bg-gray-50 text-gray-400 text-xs rounded-md border border-gray-100">
                        +{workflow.features.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-auto">
                    <a
                      href={workflow.userCaseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex-1 inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                        !workflow.userCaseUrl 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md'
                      }`}
                      onClick={(e) => !workflow.userCaseUrl && e.preventDefault()}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {t('workflows.viewCase')}
                    </a>
                    <a
                      href={workflow.workflowUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center px-4 py-2.5 border-2 border-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:border-indigo-100 hover:bg-indigo-50 transition-all duration-200"
                    >
                      <Github className="h-4 w-4 mr-2" />
                      {t('workflows.viewWorkflow')}
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredWorkflows.length === 0 && (
          <div className="text-center py-20">
             <div className="inline-block p-6 bg-gray-100 rounded-full mb-4">
               <Layers className="h-10 w-10 text-gray-400" />
             </div>
             <h3 className="text-lg font-medium text-gray-900">No workflows found</h3>
             <p className="text-gray-500">Try selecting a different category.</p>
          </div>
        )}

        {/* CTA Section */}
        <div className="text-center mt-20">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-xl p-10 max-w-3xl mx-auto text-white transform hover:scale-[1.01] transition-transform duration-300">
            <h3 className="text-3xl font-bold mb-4">
              {t('workflows.ctaTitle')}
            </h3>
            <p className="text-indigo-100 mb-8 text-lg opacity-90">
              {t('workflows.ctaDescription')}
            </p>
            <a
              href="#contribute"
              className="inline-flex items-center px-8 py-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors duration-200 shadow-lg"
            >
              {t('workflows.contribute')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkflowShowcase;
