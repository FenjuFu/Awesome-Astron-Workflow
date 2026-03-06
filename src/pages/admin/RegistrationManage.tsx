import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { Search, Download, Trash2, CheckCircle, XCircle, Pencil, Save, X } from 'lucide-react';

interface Registration {
  id: string;
  activity_id: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  position: string;
  custom_fields?: Record<string, string>;
  status: string;
  created_at: string;
  updated_at?: string;
  activities: {
    title: string;
  } | null;
}

interface EditableRegistrationFields {
  name: string;
  phone: string;
  email: string;
  company: string;
  position: string;
  custom_fields: Record<string, string>;
}

const RegistrationManage: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingRegistration, setEditingRegistration] = useState<Registration | null>(null);
  const [editForm, setEditForm] = useState<EditableRegistrationFields | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

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
    (reg.activities?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.phone.includes(searchTerm)
  );

  const getDisplayFields = (reg: Registration) => {
    const basicFields: Array<{ label: string; value: string }> = [
      { label: '姓名', value: reg.name || '-' },
      { label: '电话', value: reg.phone || '-' },
      { label: '邮箱', value: reg.email || '-' },
      { label: '公司/学校', value: reg.company || '-' },
      { label: '职位/专业', value: reg.position || '-' },
    ];

    const customFields = Object.entries(reg.custom_fields || {}).map(([key, value]) => ({
      label: key,
      value: value || '-',
    }));

    return [...basicFields, ...customFields];
  };

  const startEditRegistration = (reg: Registration) => {
    setEditingRegistration(reg);
    setEditForm({
      name: reg.name || '',
      phone: reg.phone || '',
      email: reg.email || '',
      company: reg.company || '',
      position: reg.position || '',
      custom_fields: { ...(reg.custom_fields || {}) },
    });
  };

  const closeEditModal = () => {
    setEditingRegistration(null);
    setEditForm(null);
  };

  const handleEditFieldChange = (field: keyof EditableRegistrationFields, value: string) => {
    if (!editForm) return;

    setEditForm({
      ...editForm,
      [field]: value,
    });
  };

  const saveRegistrationEdit = async () => {
    if (!editingRegistration || !editForm) return;

    setSavingEdit(true);
    const { error } = await supabase
      .from('registrations')
      .update({
        name: editForm.name,
        phone: editForm.phone,
        email: editForm.email,
        company: editForm.company || null,
        position: editForm.position || null,
        custom_fields: editForm.custom_fields,
      })
      .eq('id', editingRegistration.id);

    setSavingEdit(false);

    if (error) {
      alert(error.message);
      return;
    }

    closeEditModal();
    fetchRegistrations();
  };

  const exportToCSV = () => {
    const headers = ['活动名称', '姓名', '电话', '邮箱', '公司', '职位', '状态', '报名时间'];
    const csvData = filteredRegistrations.map(reg => [
      reg.activities?.title || '-',
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">报名信息（全部字段）</th>
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
                    <div className="text-sm font-medium text-gray-900 truncate max-w-xs">{reg.activities?.title || '活动已删除'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="grid grid-cols-1 gap-1 text-xs">
                      {getDisplayFields(reg).map((field) => (
                        <div key={`${reg.id}-${field.label}`} className="flex gap-1 text-gray-600">
                          <span className="font-medium text-gray-700 min-w-[72px]">{field.label}:</span>
                          <span className="break-all">{field.value}</span>
                        </div>
                      ))}
                    </div>
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
                    <button onClick={() => startEditRegistration(reg)} className="text-blue-600 hover:text-blue-900" title="编辑报名信息">
                      <Pencil className="w-4 h-4 inline" />
                    </button>
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

      {editingRegistration && editForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">编辑报名信息</h2>
              <button onClick={closeEditModal} className="text-gray-400 hover:text-gray-600" title="关闭">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm text-gray-700 mb-1">姓名</label>
                <input
                  value={editForm.name}
                  onChange={(e) => handleEditFieldChange('name', e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">电话</label>
                <input
                  value={editForm.phone}
                  onChange={(e) => handleEditFieldChange('phone', e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">邮箱</label>
                <input
                  value={editForm.email}
                  onChange={(e) => handleEditFieldChange('email', e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">公司/学校</label>
                <input
                  value={editForm.company}
                  onChange={(e) => handleEditFieldChange('company', e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">职位/专业</label>
                <input
                  value={editForm.position}
                  onChange={(e) => handleEditFieldChange('position', e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                />
              </div>

              {Object.keys(editForm.custom_fields).length > 0 && (
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-800 mb-3">自定义字段</p>
                  <div className="space-y-3">
                    {Object.entries(editForm.custom_fields).map(([key, value]) => (
                      <div key={key}>
                        <label className="block text-sm text-gray-700 mb-1">{key}</label>
                        <input
                          value={value || ''}
                          onChange={(e) => {
                            setEditForm({
                              ...editForm,
                              custom_fields: {
                                ...editForm.custom_fields,
                                [key]: e.target.value,
                              },
                            });
                          }}
                          className="w-full border border-gray-300 rounded-md p-2 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-2">
              <button onClick={closeEditModal} className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 text-sm hover:bg-gray-100">
                取消
              </button>
              <button
                onClick={saveRegistrationEdit}
                disabled={savingEdit}
                className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-60"
              >
                <Save className="w-4 h-4 inline mr-1" />
                {savingEdit ? '保存中...' : '保存修改'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationManage;
