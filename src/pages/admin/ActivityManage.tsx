import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { Plus, Edit, Trash2, Eye, Share2 } from 'lucide-react';
import { getActivityPath, normalizeSlug } from '../../utils/activityRoute';

interface RegistrationFormField {
  id: string;
  label: string;
  placeholder?: string;
  required: boolean;
}

interface Activity {
  id: string;
  title: string;
  status: string;
  registered_count: number;
  max_participants: number;
  created_at: string;
  description?: string;
  location?: string;
  category?: string;
  start_time?: string;
  end_time?: string;
  registration_start?: string;
  registration_end?: string;
  fee?: number;
  cover_image?: string;
  link_slug?: string | null;
  additional_fields?: {
    registration_form_fields?: RegistrationFormField[];
  };
}

const createEmptyField = (): RegistrationFormField => ({
  id: `field_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  label: '',
  placeholder: '',
  required: false,
});

const parseRegistrationFormFields = (activity?: Activity | null): RegistrationFormField[] => {
  const rawFields = activity?.additional_fields?.registration_form_fields;
  if (!Array.isArray(rawFields)) {
    return [];
  }

  return rawFields.map((field, index) => ({
    id: field.id || `field_${index}`,
    label: field.label || '',
    placeholder: field.placeholder || '',
    required: Boolean(field.required),
  }));
};

const ActivityManage: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [registrationFields, setRegistrationFields] = useState<RegistrationFormField[]>([]);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching activities:', error);
    } else {
      setActivities((data as Activity[]) || []);
    }
    setLoading(false);
  };

  const openCreateModal = () => {
    setEditingActivity(null);
    setRegistrationFields([]);
    setShowModal(true);
  };

  const openEditModal = (activity: Activity) => {
    setEditingActivity(activity);
    setRegistrationFields(parseRegistrationFormFields(activity));
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingActivity(null);
    setRegistrationFields([]);
  };

  const addRegistrationField = () => {
    setRegistrationFields((prev) => [...prev, createEmptyField()]);
  };

  const removeRegistrationField = (fieldId: string) => {
    setRegistrationFields((prev) => prev.filter((field) => field.id !== fieldId));
  };

  const updateRegistrationField = (
    fieldId: string,
    key: keyof Omit<RegistrationFormField, 'id'>,
    value: string | boolean,
  ) => {
    setRegistrationFields((prev) =>
      prev.map((field) =>
        field.id === fieldId
          ? {
              ...field,
              [key]: value,
            }
          : field,
      ),
    );
  };

  const handleCreateOrUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const sanitizedRegistrationFields = registrationFields
      .map((field) => ({
        ...field,
        label: field.label.trim(),
        placeholder: (field.placeholder || '').trim(),
      }))
      .filter((field) => field.label);

    const linkSlugInput = (formData.get('link_slug') as string) || '';
    const slug = normalizeSlug(linkSlugInput);

    if (linkSlugInput && !slug) {
      alert('链接名称仅支持英文字母、数字和连字符（-）');
      return;
    }

    const activityData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      location: formData.get('location') as string,
      category: formData.get('category') as string,
      start_time: new Date(formData.get('start_time') as string).toISOString(),
      end_time: new Date(formData.get('end_time') as string).toISOString(),
      registration_start: new Date(formData.get('registration_start') as string).toISOString(),
      registration_end: new Date(formData.get('registration_end') as string).toISOString(),
      max_participants: parseInt(formData.get('max_participants') as string, 10) || 0,
      fee: parseFloat(formData.get('fee') as string) || 0,
      status: formData.get('status') as string,
      cover_image: formData.get('cover_image') as string,
      link_slug: slug || null,
      additional_fields: {
        registration_form_fields: sanitizedRegistrationFields,
      },
    };

    if (editingActivity) {
      const { error } = await supabase.from('activities').update(activityData).eq('id', editingActivity.id);
      if (error) alert(error.message);
    } else {
      const { error } = await supabase.from('activities').insert([activityData]);
      if (error) alert(error.message);
    }

    closeModal();
    fetchActivities();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除这个活动吗？')) {
      const { error } = await supabase.from('activities').delete().eq('id', id);
      if (error) alert(error.message);
      else fetchActivities();
    }
  };

  const handleShare = (id: string, linkSlug?: string | null) => {
    const url = `${window.location.origin}${getActivityPath(id, linkSlug)}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        alert(`活动链接已复制到剪贴板！\n${url}`);
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
        alert('复制失败，请手动复制');
      });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">活动管理</h1>
        <button onClick={openCreateModal} className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          创建活动
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">活动名称</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">报名人数</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建时间</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center">
                  加载中...
                </td>
              </tr>
            ) : activities.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center">
                  暂无活动
                </td>
              </tr>
            ) : (
              activities.map((activity) => (
                <tr key={activity.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{activity.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        activity.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {activity.status === 'published' ? '已发布' : '草稿'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {activity.registered_count} / {activity.max_participants || '∞'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(activity.created_at), 'yyyy-MM-dd')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={getActivityPath(activity.id, activity.link_slug)} className="text-indigo-600 hover:text-indigo-900 mr-3">
                      <Eye className="w-4 h-4 inline" />
                    </Link>
                    <button onClick={() => handleShare(activity.id, activity.link_slug)} className="text-gray-600 hover:text-gray-900 mr-3">
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => openEditModal(activity)} className="text-blue-600 hover:text-blue-900 mr-3">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(activity.id)} className="text-red-600 hover:text-red-900">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8">
            <h2 className="text-xl font-bold mb-4">{editingActivity ? '编辑活动' : '创建活动'}</h2>
            <form onSubmit={handleCreateOrUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">标题</label>
                  <input name="title" defaultValue={editingActivity?.title} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">描述</label>
                  <textarea name="description" defaultValue={editingActivity?.description} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">地点</label>
                  <input name="location" defaultValue={editingActivity?.location} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">分类</label>
                  <input name="category" defaultValue={editingActivity?.category} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">活动开始时间</label>
                  <input
                    type="datetime-local"
                    name="start_time"
                    defaultValue={editingActivity?.start_time ? format(new Date(editingActivity.start_time), "yyyy-MM-dd'T'HH:mm") : ''}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">活动结束时间</label>
                  <input
                    type="datetime-local"
                    name="end_time"
                    defaultValue={editingActivity?.end_time ? format(new Date(editingActivity.end_time), "yyyy-MM-dd'T'HH:mm") : ''}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">报名开始时间</label>
                  <input
                    type="datetime-local"
                    name="registration_start"
                    defaultValue={editingActivity?.registration_start ? format(new Date(editingActivity.registration_start), "yyyy-MM-dd'T'HH:mm") : ''}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">报名截止时间</label>
                  <input
                    type="datetime-local"
                    name="registration_end"
                    defaultValue={editingActivity?.registration_end ? format(new Date(editingActivity.registration_end), "yyyy-MM-dd'T'HH:mm") : ''}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">最大人数 (0为无限制)</label>
                  <input type="number" name="max_participants" defaultValue={editingActivity?.max_participants || 0} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">费用 (0为免费)</label>
                  <input type="number" step="0.01" name="fee" defaultValue={editingActivity?.fee || 0} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">状态</label>
                  <select name="status" defaultValue={editingActivity?.status || 'draft'} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                    <option value="draft">草稿</option>
                    <option value="published">发布</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">封面图 URL</label>
                  <input name="cover_image" defaultValue={editingActivity?.cover_image} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">链接名称（可选）</label>
                  <input
                    name="link_slug"
                    defaultValue={editingActivity?.link_slug || ''}
                    placeholder="例如 spring-meetup-2026"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                  <p className="mt-1 text-xs text-gray-500">仅支持小写字母、数字和连字符（-）。留空则使用系统ID。</p>
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">报名表单自定义字段</h3>
                    <p className="text-xs text-gray-500">可添加额外字段，例如：微信号、饮食偏好、城市等</p>
                  </div>
                  <button type="button" onClick={addRegistrationField} className="inline-flex items-center px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-100">
                    <Plus className="w-4 h-4 mr-1" /> 添加字段
                  </button>
                </div>

                {registrationFields.length === 0 ? (
                  <p className="text-sm text-gray-500">当前没有自定义字段，报名页将仅展示默认字段。</p>
                ) : (
                  <div className="space-y-3">
                    {registrationFields.map((field) => (
                      <div key={field.id} className="border border-gray-200 bg-white rounded-md p-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600">字段名称</label>
                            <input
                              value={field.label}
                              onChange={(e) => updateRegistrationField(field.id, 'label', e.target.value)}
                              placeholder="例如：微信号"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600">占位提示</label>
                            <input
                              value={field.placeholder || ''}
                              onChange={(e) => updateRegistrationField(field.id, 'placeholder', e.target.value)}
                              placeholder="例如：请输入微信号"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                            />
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <label className="inline-flex items-center text-sm text-gray-700">
                            <input
                              type="checkbox"
                              checked={field.required}
                              onChange={(e) => updateRegistrationField(field.id, 'required', e.target.checked)}
                              className="mr-2"
                            />
                            必填
                          </label>
                          <button type="button" onClick={() => removeRegistrationField(field.id)} className="text-sm text-red-600 hover:text-red-700">
                            删除
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700">
                  取消
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityManage;
