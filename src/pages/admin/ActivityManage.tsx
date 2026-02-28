import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';

interface Activity {
  id: string;
  title: string;
  status: string;
  registered_count: number;
  max_participants: number;
  created_at: string;
}

const ActivityManage: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<any>(null);

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
      setActivities(data || []);
    }
    setLoading(false);
  };

  const handleCreateOrUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const activityData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      location: formData.get('location') as string,
      category: formData.get('category') as string,
      start_time: new Date(formData.get('start_time') as string).toISOString(),
      end_time: new Date(formData.get('end_time') as string).toISOString(),
      registration_start: new Date(formData.get('registration_start') as string).toISOString(),
      registration_end: new Date(formData.get('registration_end') as string).toISOString(),
      max_participants: parseInt(formData.get('max_participants') as string) || 0,
      fee: parseFloat(formData.get('fee') as string) || 0,
      status: formData.get('status') as string,
      cover_image: formData.get('cover_image') as string,
    };

    if (editingActivity) {
      const { error } = await supabase
        .from('activities')
        .update(activityData)
        .eq('id', editingActivity.id);
      if (error) alert(error.message);
    } else {
      const { error } = await supabase
        .from('activities')
        .insert([activityData]);
      if (error) alert(error.message);
    }

    setShowModal(false);
    setEditingActivity(null);
    fetchActivities();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除这个活动吗？')) {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id);
      if (error) alert(error.message);
      else fetchActivities();
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">活动管理</h1>
        <button
          onClick={() => {
            setEditingActivity(null);
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
        >
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
              <tr><td colSpan={5} className="px-6 py-4 text-center">加载中...</td></tr>
            ) : activities.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center">暂无活动</td></tr>
            ) : (
              activities.map((activity) => (
                <tr key={activity.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{activity.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      activity.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
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
                    <button onClick={() => { setEditingActivity(activity); setShowModal(true); }} className="text-blue-600 hover:text-blue-900 mr-3">
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
                  <input type="datetime-local" name="start_time" defaultValue={editingActivity?.start_time ? format(new Date(editingActivity.start_time), "yyyy-MM-dd'T'HH:mm") : ''} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">活动结束时间</label>
                  <input type="datetime-local" name="end_time" defaultValue={editingActivity?.end_time ? format(new Date(editingActivity.end_time), "yyyy-MM-dd'T'HH:mm") : ''} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">报名开始时间</label>
                  <input type="datetime-local" name="registration_start" defaultValue={editingActivity?.registration_start ? format(new Date(editingActivity.registration_start), "yyyy-MM-dd'T'HH:mm") : ''} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">报名截止时间</label>
                  <input type="datetime-local" name="registration_end" defaultValue={editingActivity?.registration_end ? format(new Date(editingActivity.registration_end), "yyyy-MM-dd'T'HH:mm") : ''} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
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
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700">取消</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">保存</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityManage;
