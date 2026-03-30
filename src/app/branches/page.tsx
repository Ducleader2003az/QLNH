'use client'

import { useState } from 'react'
import AuthLayout from '@/components/AuthLayout'
import { useBranches, useRestaurants } from '@/hooks/useApi'
import { GitBranch, Plus, MapPin, Phone, Edit3, Trash2, CheckCircle2, XCircle } from 'lucide-react'
import api from '@/lib/api'

const RESTAURANT_ID = '00000000-0000-0000-0000-000000000001'

export default function BranchesPage() {
  const { data: branches, isLoading, refetch } = useBranches(RESTAURANT_ID)
  const [showModal, setShowModal] = useState(false)
  const [editingBranch, setEditingBranch] = useState<any>(null)
  const [formData, setFormData] = useState({ name: '', address: '', phone: '', isActive: true })

  const openAddModal = () => {
    setEditingBranch(null)
    setFormData({ name: '', address: '', phone: '', isActive: true })
    setShowModal(true)
  }

  const openEditModal = (branch: any) => {
    setEditingBranch(branch)
    setFormData({ name: branch.name, address: branch.address, phone: branch.phone, isActive: branch.isActive })
    setShowModal(true)
  }

  const handleSave = async () => {
    try {
      if (editingBranch) {
        await api.put(`/api/branch/${editingBranch.id}`, { ...formData, restaurantId: RESTAURANT_ID })
      } else {
        await api.post('/api/branch', { ...formData, restaurantId: RESTAURANT_ID })
      }
      refetch()
      setShowModal(false)
    } catch (err) {
      alert('Lỗi khi lưu chi nhánh')
    }
  }

  if (isLoading) return <AuthLayout><div className="p-8 text-center">Đang tải...</div></AuthLayout>

  return (
    <AuthLayout>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4">
              <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-100">
                <GitBranch size={32} />
              </div>
              Quản lý Chi nhánh
            </h1>
            <p className="text-gray-500 mt-2 text-lg">Thiết lập các cơ sở kinh doanh trong hệ thống chuỗi nhà hàng</p>
          </div>
          <button 
            onClick={openAddModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-2xl shadow-indigo-100 transition-all hover:scale-105"
          >
            <Plus size={20} />
            Thêm chi nhánh mới
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {branches?.map((branch: any) => (
            <div key={branch.id} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 transition-all hover:shadow-xl hover:shadow-indigo-50/50 group relative overflow-hidden">
               <div className={`absolute top-0 right-0 p-6 opacity-20 transition-opacity group-hover:opacity-100`}>
                 {branch.isActive ? <CheckCircle2 className="text-green-500" size={48} /> : <XCircle className="text-red-500" size={48} />}
               </div>
               
               <h3 className="text-2xl font-black text-gray-900 mb-6 pr-12 line-clamp-1">{branch.name}</h3>
               
               <div className="space-y-4 mb-8">
                 <div className="flex items-start gap-3">
                   <MapPin className="text-gray-400 mt-1 shrink-0" size={18} />
                   <p className="text-gray-600 font-medium leading-relaxed">{branch.address}</p>
                 </div>
                 <div className="flex items-center gap-3">
                   <Phone className="text-gray-400 shrink-0" size={18} />
                   <p className="text-gray-600 font-medium">{branch.phone}</p>
                 </div>
               </div>

               <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-50">
                 <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${branch.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                   {branch.isActive ? 'Hoạt động' : 'Tạm ngưng'}
                 </span>
                 <button 
                  onClick={() => openEditModal(branch)}
                  className="bg-gray-50 hover:bg-indigo-50 text-indigo-600 p-3 rounded-xl transition-all"
                 >
                   <Edit3 size={18} />
                 </button>
               </div>
            </div>
          ))}

          {branches?.length === 0 && (
            <div className="col-span-full py-20 text-center bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
               <GitBranch className="mx-auto text-gray-300 mb-4" size={64} />
               <p className="text-gray-500 font-bold text-xl">Chưa có chi nhánh nào được tạo</p>
               <button onClick={openAddModal} className="text-indigo-600 font-bold mt-2 hover:underline">Hãy thêm chi nhánh đầu tiên của bạn</button>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                  {editingBranch ? 'Chỉnh sửa chi nhánh' : 'Thêm chi nhánh mới'}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-black transition-colors">
                  <XCircle size={24} />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Tên chi nhánh</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="VD: Chi nhánh Quận 1"
                    className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-medium text-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Địa chỉ cụ thể</label>
                  <input 
                    type="text" 
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                    className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Số điện thoại liên hệ</label>
                  <input 
                    type="text" 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-medium"
                  />
                </div>
                <div className="flex items-center gap-3 py-2">
                  <input 
                    type="checkbox" 
                    id="isActive"
                    checked={formData.isActive}
                    onChange={e => setFormData({...formData, isActive: e.target.checked})}
                    className="w-6 h-6 rounded-lg text-indigo-600 focus:ring-indigo-600"
                  />
                  <label htmlFor="isActive" className="font-bold text-gray-700 cursor-pointer">Trạng thái hoạt động</label>
                </div>
              </div>
              <div className="p-8 border-t border-gray-50 flex gap-4">
                <button 
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-bold transition-all"
                >
                  Hủy bỏ
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-1 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-100"
                >
                  Xác nhận lưu
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  )
}
