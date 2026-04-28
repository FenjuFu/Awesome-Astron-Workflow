import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import { getActivityPath, getActivitySlug } from '../../utils/activityRoute';
import { Gift, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface Activity {
  id: string;
  title: string;
  description: string;
  start_time: string;
  location: string;
  cover_image: string;
  status: string;
  category: string;
  link_slug?: string | null;
  additional_fields?: {
    link_slug?: string | null;
  };
}

const ActivityList: React.FC = () => {
  const { language, t } = useLanguage();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            {t('nav.activities')}
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            {language === 'zh-CN' ? '探索并报名参加精彩的活动' : 'Explore and register for exciting activities'}
          </p>
        </div>

        {/* Lucky Draw Banner */}
        <div className="mb-12">
          <Link 
            to="/activities/lucky_draw"
            className="group relative bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl overflow-hidden flex flex-col md:flex-row items-center justify-between transition-all hover:shadow-2xl hover:scale-[1.01]"
          >
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm group-hover:scale-110 transition-transform">
                <Gift className="h-10 w-10 text-white" />
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold mb-2">{t('lucky.title')}</h2>
                <p className="text-indigo-100">{t('lucky.subtitle')}</p>
              </div>
            </div>
            <div className="relative z-10 mt-6 md:mt-0 flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold group-hover:gap-4 transition-all">
              {t('lucky.start')}
              <ArrowRight className="h-5 w-5" />
            </div>
            
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : activities.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {activities.map((activity) => (
              <div key={activity.id} className="flex flex-col rounded-lg shadow-lg overflow-hidden bg-white hover:shadow-xl transition-shadow duration-300">
                <div className="flex-shrink-0">
                  <img
                    className="h-48 w-full object-cover"
                    src={activity.cover_image || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'}
                    alt={activity.title}
                  />
                </div>
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-600">
                      {activity.category}
                    </p>
                    <Link to={getActivityPath(activity.id, getActivitySlug(activity))} className="block mt-2">
                      <p className="text-xl font-semibold text-gray-900">{activity.title}</p>
                      <p className="mt-3 text-base text-gray-500 line-clamp-3">
                        {activity.description}
                      </p>
                    </Link>
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      <p>{format(new Date(activity.start_time), 'yyyy-MM-dd HH:mm')}</p>
                      <p>{activity.location}</p>
                    </div>
                    <Link
                      to={getActivityPath(activity.id, getActivitySlug(activity))}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                      查看详情
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg">暂无可用活动</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ActivityList;
