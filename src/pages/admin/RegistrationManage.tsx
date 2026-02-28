import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { Search, Download, Trash2, CheckCircle, XCircle } from 'lucide-react';

interface Registration {
  id: string;
  activity_id: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  position: string;
  status: string;
  created_at: string;
  activities: {
    title: string;
  };
}

const RegistrationManage: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('registrations')
      .select(`
        *,
        activities (
          title
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching registrations:', error);
    } else {
      setRegistrations(data || []);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('registrations')
      .update({ status })
      .eq('id', id);

    if (error) alert(error.message);
    else fetchRegistrations();
  };

  const deleteRegistration = async (id: string, activityId: string) => {
    if (window.confirm('确定要删除这条报名信息吗？')) {
      const { error } = await supabase
        .from('registrations')
        .delete()
        .eq('id', id);

      if (error) {
        alert(error.message);
      } else {
        // 更新已报名人数 (同样建议使用 RPC)
        const { data: activity } = await supabase
          .from('activities')
          .select('registered_count')
          .eq('id', activityId)
          .single();
        
        if (activity) {
          await supabase
            .from('activities')
            .update({ registered_count: Math.max(0, activity.registered_count - 1) })
            .eq('id', activityId);
        }
        fetchRegistrations();
      }
    }
  };

  const filteredRegistrations = registrations.filter(reg => 
    reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.activities.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.phone.includes(searchTerm)
  );

  const exportToCSV = () => {
    const headers = ['活动名称', '姓名', '电话', '邮箱', '公司', '职位', '状态', '报名时间'];
    const csvData = filteredRegistrations.map(reg => [
      reg.activities.title,
      reg.name,
      reg.phone,
      reg.email,
      reg.company || '',
      reg.position || '',
      reg.status,
      format(new Date(reg.created_at), 'yyyy-MM-dd HH:mm')
    ]);

    const csvContent = [headers, ...csvData].map(e => e.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `registrations_${format(new Date(), 'yyyyMMdd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">报名管理</h1>
        <div className="flex w-full md:w-auto gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索姓名、活动、电话..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={fetchRegistrations}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
          >
            <Search className="w-4 h-4 mr-2" />
            刷新列表
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700"
          >
            <Download className="w-4 h-4 mr-2" />
            导出 CSV
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">活动名称</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">姓名/电话</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">报名时间</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center">加载中...</td></tr>
            ) : filteredRegistrations.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center">未找到相关数据</td></tr>
            ) : (
              filteredRegistrations.map((reg) => (
                <tr key={reg.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 truncate max-w-xs">{reg.activities.title}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{reg.name}</div>
                    <div className="text-xs text-gray-500">{reg.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      reg.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                      reg.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {reg.status === 'submitted' ? '已提交' : 
                       reg.status === 'confirmed' ? '已确认' : '已取消'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {format(new Date(reg.created_at), 'MM-dd HH:mm')}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                    {reg.status === 'submitted' && (
                      <>
                        <button onClick={() => updateStatus(reg.id, 'confirmed')} className="text-green-600 hover:text-green-900" title="确认">
                          <CheckCircle className="w-4 h-4 inline" />
                        </button>
                        <button onClick={() => updateStatus(reg.id, 'cancelled')} className="text-red-600 hover:text-red-900" title="取消">
                          <XCircle className="w-4 h-4 inline" />
                        </button>
                      </>
                    )}
                    <button onClick={() => deleteRegistration(reg.id, reg.activity_id)} className="text-gray-400 hover:text-red-600" title="删除">
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RegistrationManage;
