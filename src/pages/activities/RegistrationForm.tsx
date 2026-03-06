import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';

interface RegistrationFormField {
  id: string;
  label: string;
  placeholder?: string;
  required: boolean;
}

interface RegistrationInput {
  name: string;
  phone: string;
  email: string;
  wechat: string;
  company: string;
  position: string;
  custom_fields: Record<string, string>;
}

interface Activity {
  id: string;
  title: string;
  max_participants: number;
  registered_count: number;
  additional_fields?: {
    registration_form_fields?: RegistrationFormField[];
  };
}

const parseRegistrationFields = (activity: Activity | null): RegistrationFormField[] => {
  const rawFields = activity?.additional_fields?.registration_form_fields;
  if (!Array.isArray(rawFields)) {
    return [];
  }

  return rawFields
    .map((field, index) => ({
      id: field.id || `field_${index}`,
      label: (field.label || '').trim(),
      placeholder: field.placeholder || '',
      required: Boolean(field.required),
    }))
    .filter((field) => field.label);
};

const RegistrationForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationInput>({
    defaultValues: {
      custom_fields: {},
    },
  });

  const extraFields = parseRegistrationFields(activity);

  useEffect(() => {
    if (id) {
      fetchActivity(id);
    }
  }, [id]);

  const fetchActivity = async (activityId: string) => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('id, title, max_participants, registered_count, additional_fields')
        .eq('id', activityId)
        .single();

      if (error) throw error;
      setActivity(data as Activity);
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
      const { error: registrationError } = await supabase.from('registrations').insert([
        {
          activity_id: id,
          name: data.name,
          phone: data.phone,
          email: data.email,
          company: data.company,
          position: data.position,
          custom_fields: {
            ...(data.custom_fields || {}),
            wechat: data.wechat,
          },
          status: 'submitted',
        },
      ]);

      if (registrationError) throw registrationError;

      const { error: updateError } = await supabase
        .from('activities')
        .update({ registered_count: activity.registered_count + 1 })
        .eq('id', id);

      if (updateError) throw updateError;

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
        <Link to="/activities" className="text-blue-600 hover:underline">
          返回列表
        </Link>
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
                {...register('name', { required: '请输入姓名' })}
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
                {...register('phone', {
                  required: '请输入手机号',
                  pattern: {
                    value: /^1[3-9]\d{9}$/,
                    message: '请输入正确的手机号',
                  },
                })}
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
                {...register('email', {
                  required: '请输入邮箱',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: '请输入正确的邮箱地址',
                  },
                })}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.email ? 'border-red-300' : ''
                }`}
                placeholder="请输入常用邮箱地址"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="wechat" className="block text-sm font-medium text-gray-700">
                微信号 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="wechat"
                {...register('wechat', { required: '请输入微信号' })}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.wechat ? 'border-red-300' : ''
                }`}
                placeholder="请输入微信号"
              />
              {errors.wechat && <p className="mt-1 text-sm text-red-600">{errors.wechat.message}</p>}
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                公司/学校 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="company"
                {...register('company', { required: '请输入公司或学校名称' })}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.company ? 'border-red-300' : ''
                }`}
                placeholder="请输入公司或学校名称"
              />
              {errors.company && <p className="mt-1 text-sm text-red-600">{errors.company.message}</p>}
            </div>

            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                职位/专业 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="position"
                {...register('position', { required: '请输入当前职位或所学专业' })}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.position ? 'border-red-300' : ''
                }`}
                placeholder="请输入当前职位或所学专业"
              />
              {errors.position && <p className="mt-1 text-sm text-red-600">{errors.position.message}</p>}
            </div>

            {extraFields.length > 0 && (
              <div className="pt-2 border-t border-gray-200">
                <h2 className="text-sm font-semibold text-gray-800 mb-3">附加信息</h2>
                <div className="space-y-4">
                  {extraFields.map((field) => (
                    <div key={field.id}>
                      <label className="block text-sm font-medium text-gray-700">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <input
                        type="text"
                        {...register(`custom_fields.${field.label}` as const, {
                          required: field.required ? `请输入${field.label}` : false,
                        })}
                        placeholder={field.placeholder || `请输入${field.label}`}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                      {errors.custom_fields?.[field.label] && (
                        <p className="mt-1 text-sm text-red-600">{errors.custom_fields[field.label]?.message}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

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
