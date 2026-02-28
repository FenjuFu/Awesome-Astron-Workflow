import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import { Calendar, MapPin, Users, DollarSign } from 'lucide-react';

interface Activity {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  fee: number;
  max_participants: number;
  registered_count: number;
  registration_start: string;
  registration_end: string;
  cover_image: string;
  category: string;
}

const ActivityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchActivity(id);
    }
  }, [id]);

  const fetchActivity = async (activityId: string) => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('id', activityId)
        .single();

      if (error) throw error;
      setActivity(data);
    } catch (error) {
      console.error('Error fetching activity:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-xl text-gray-500 mb-4">找不到该活动</p>
        <Link to="/activities" className="text-blue-600 hover:underline">返回列表</Link>
      </div>
    );
  }

  const isRegistrationOpen = 
    new Date() >= new Date(activity.registration_start) && 
    new Date() <= new Date(activity.registration_end);
  
  const isFull = activity.max_participants > 0 && activity.registered_count >= activity.max_participants;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="relative h-64 sm:h-96">
            <img
              className="w-full h-full object-cover"
              src={activity.cover_image || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'}
              alt={activity.title}
            />
            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {activity.category}
              </span>
            </div>
          </div>
          
          <div className="px-4 py-5 sm:px-6">
            <h1 className="text-3xl font-bold text-gray-900">{activity.title}</h1>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-600">
              <div className="flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-gray-400" />
                <span>{format(new Date(activity.start_time), 'yyyy-MM-dd HH:mm')} - {format(new Date(activity.end_time), 'HH:mm')}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="mr-2 h-5 w-5 text-gray-400" />
                <span>{activity.location}</span>
              </div>
              <div className="flex items-center">
                <Users className="mr-2 h-5 w-5 text-gray-400" />
                <span>名额: {activity.max_participants > 0 ? `${activity.registered_count}/${activity.max_participants}` : '无限制'}</span>
              </div>
              <div className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5 text-gray-400" />
                <span>费用: {activity.fee > 0 ? `￥${activity.fee}` : '免费'}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">活动详情</h2>
            <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
              {activity.description}
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-6 sm:px-6 flex flex-col sm:flex-row items-center justify-between">
            <div className="mb-4 sm:mb-0">
              <p className="text-sm text-gray-500">
                报名截止时间: {format(new Date(activity.registration_end), 'yyyy-MM-dd HH:mm')}
              </p>
            </div>
            {isRegistrationOpen && !isFull ? (
              <Link
                to={`/register/${activity.id}`}
                className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                立即报名
              </Link>
            ) : (
              <button
                disabled
                className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gray-400 cursor-not-allowed"
              >
                {isFull ? '名额已满' : '报名已关闭'}
              </button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ActivityDetail;
