import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { supabase } from '../../lib/supabase';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';

const schema = yup.object().shape({
  name: yup.string().required('请输入姓名'),
  phone: yup.string().matches(/^1[3-9]\d{9}$/, '请输入正确的手机号').required('请输入手机号'),
  email: yup.string().email('请输入正确的邮箱地址').required('请输入邮箱'),
  company: yup.string(),
  position: yup.string(),
  custom_fields: yup.object(),
});

interface RegistrationInput {
  name: string;
  phone: string;
  email: string;
  company?: string;
  position?: string;
}

interface Activity {
  id: string;
  title: string;
  max_participants: number;
  registered_count: number;
}

const RegistrationForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegistrationInput>({
    resolver: yupResolver(schema) as any,
  });

  useEffect(() => {
    if (id) {
      fetchActivity(id);
    }
  }, [id]);

  const fetchActivity = async (activityId: string) => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('id, title, max_participants, registered_count')
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

  const onSubmit = async (data: RegistrationInput) => {
    if (!id || !activity) return;

    setSubmitting(true);
    try {
      // 1. 提交报名信息
      const { error: registrationError } = await supabase
        .from('registrations')
        .insert([
          {
            activity_id: id,
            ...data,
            status: 'submitted',
          },
        ]);

      if (registrationError) throw registrationError;

      // 2. 更新活动已报名人数 (在实际生产中，建议使用数据库函数或 RPC 来处理以保证事务性)
      const { error: updateError } = await supabase
        .from('activities')
        .update({ registered_count: activity.registered_count + 1 })
        .eq('id', id);

      if (updateError) throw updateError;

      // 3. 报名成功跳转
      navigate('/success', { state: { activityTitle: activity.title } });
    } catch (error) {
      console.error('Error submitting registration:', error);
      alert('提交报名失败，请稍后重试');
    } finally {
      setSubmitting(false);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="bg-white shadow sm:rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-blue-600">
            <h1 className="text-2xl font-bold text-white">活动报名</h1>
            <p className="mt-1 text-blue-100">{activity.title}</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="px-4 py-6 sm:p-8 space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                姓名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                {...register('name')}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.name ? 'border-red-300' : ''
                }`}
                placeholder="请输入真实姓名"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                手机号 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                {...register('phone')}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.phone ? 'border-red-300' : ''
                }`}
                placeholder="请输入11位手机号"
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                邮箱 <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                {...register('email')}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.email ? 'border-red-300' : ''
                }`}
                placeholder="请输入常用邮箱地址"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                公司/学校
              </label>
              <input
                type="text"
                id="company"
                {...register('company')}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="请输入公司或学校名称"
              />
            </div>

            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                职位/专业
              </label>
              <input
                type="text"
                id="position"
                {...register('position')}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="请输入当前职位或所学专业"
              />
            </div>

            <div className="pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={submitting}
                className={`w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  submitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {submitting ? '提交中...' : '提交报名'}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RegistrationForm;
