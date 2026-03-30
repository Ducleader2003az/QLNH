'use client'

import { useState, useEffect } from 'react'
import AuthLayout from '@/components/AuthLayout'
import api from '@/lib/api'
import { Building2, Save, Globe, Phone, Mail, MapPin, FileText, Share2 } from 'lucide-react'
import { useRestaurant } from '@/hooks/useApi'

const RESTAURANT_ID = '00000000-0000-0000-0000-000000000001'

export default function RestaurantPage() {
  const { data: restaurant, isLoading, refetch } = useRestaurant(RESTAURANT_ID)
  const [formData, setFormData] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (restaurant) setFormData(restaurant)
  }, [restaurant])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put(`/api/restaurant/${RESTAURANT_ID}`, formData)
      refetch()
      alert('Cập nhật thông tin thành công!')
    } catch (err) {
      alert('Lỗi khi cập nhật thông tin')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading || !formData) return <AuthLayout><div className="p-8 text-center">Đang tải...</div></AuthLayout>

  return (
    <AuthLayout>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-200">
                <Building2 size={32} />
              </div>
              Hồ sơ Nhà hàng
            </h1>
            <p className="text-gray-500 mt-2 text-lg">Quản lý thông tin doanh nghiệp và nhận diện thương hiệu</p>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-2xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <Save size={20} />
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Logo & Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <FileText className="text-blue-600" size={20} />
                Thông tin cơ bản
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Tên nhà hàng</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium text-lg"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Mã số thuế</label>
                    <input 
                      type="text" 
                      value={formData.taxCode || ''}
                      onChange={e => setFormData({...formData, taxCode: e.target.value})}
                      className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Website</label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                      <input 
                        type="text" 
                        value={formData.website || ''}
                        onChange={e => setFormData({...formData, website: e.target.value})}
                        className="w-full bg-gray-50 border-0 rounded-2xl pl-12 pr-6 py-4 outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Share2 className="text-blue-600" size={20} />
                Thông tin liên hệ
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Số điện thoại</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input 
                      type="text" 
                      value={formData.phone || ''}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-gray-50 border-0 rounded-2xl pl-12 pr-6 py-4 outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input 
                      type="email" 
                      value={formData.email || ''}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-gray-50 border-0 rounded-2xl pl-12 pr-6 py-4 outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Địa chỉ trụ sở</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input 
                      type="text" 
                      value={formData.address || ''}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                      className="w-full bg-gray-50 border-0 rounded-2xl pl-12 pr-6 py-4 outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Logo Preview */}
          <div className="space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 text-center">
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Logo nhà hàng</label>
              <div className="w-48 h-48 bg-gray-50 rounded-[2rem] mx-auto mb-6 flex items-center justify-center border-4 border-dashed border-gray-200 overflow-hidden group relative">
                {formData.logoUrl ? (
                  <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-contain p-4 transition-transform group-hover:scale-110" />
                ) : (
                  <Building2 size={64} className="text-gray-200" />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <span className="text-white text-xs font-bold">Thay đổi ảnh</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 px-4 leading-relaxed">Khuyến nghị ảnh kích thước 512x512, định dạng PNG hoặc JPG.</p>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-100">
               <h3 className="text-xl font-bold mb-4">Trạng thái hệ thống</h3>
               <div className="space-y-4">
                 <div className="flex justify-between items-center text-sm">
                   <span className="opacity-70">Ngày tạo:</span>
                   <span className="font-medium">{new Date(formData.createdAt).toLocaleDateString()}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                   <span className="opacity-70">Số chi nhánh:</span>
                   <span className="font-bold underline text-lg">{restaurant.branches?.length || 0}</span>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}
