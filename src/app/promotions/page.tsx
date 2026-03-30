'use client'

import { useState, useEffect } from 'react'
import AuthLayout from '@/components/AuthLayout'
import api from '@/lib/api'
import { 
  TicketPercent, 
  Plus, 
  Search, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Calendar,
  Gift,
  Tag
} from 'lucide-react'

const RESTAURANT_ID = '00000000-0000-0000-0000-000000000001'

interface Promotion {
  id: string
  name: string
  description?: string
  discountType: 'percentage' | 'fixed_amount'
  discountValue: number
  minOrderAmount?: number
  maxDiscountAmount?: number
  startDate: string
  endDate: string
  isActive: boolean
  voucherCodes?: VoucherCode[]
}

interface VoucherCode {
  id: string
  code: string
  maxUsage?: number
  currentUsage: number
  isUsed: boolean
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null)
  
  const [form, setForm] = useState({
    name: '',
    description: '',
    discountType: 'percentage',
    discountValue: 0,
    minOrderAmount: 0,
    maxDiscountAmount: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isVoucherRequired: false,
    voucherCode: ''
  })

  const loadPromotions = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/api/promotions/restaurant/${RESTAURANT_ID}`) // Adjust endpoint if needed
      setPromotions(data)
    } catch (err) {
      console.error(err)
      setPromotions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPromotions()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/api/promotions', {
        restaurantId: RESTAURANT_ID,
        ...form
      })
      setShowModal(false)
      loadPromotions()
    } catch (err) {
      console.error(err)
    }
  }

  const toggleStatus = async (promo: Promotion) => {
    try {
      await api.patch(`/api/promotions/${promo.id}/toggle`)
      loadPromotions()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <AuthLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <TicketPercent className="text-blue-600" size={32} />
              Khuyến mãi & Vouchers
            </h1>
            <p className="text-gray-500 mt-1">Quản lý các chương trình giảm giá và mã quà tặng</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-200"
          >
            <Plus size={20} />
            Tạo khuyến mãi mới
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Đang hoạt động</p>
                <p className="text-2xl font-bold">{promotions.filter(p => p.isActive).length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                <Calendar size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Sắp diễn ra</p>
                <p className="text-2xl font-bold">{promotions.filter(p => new Date(p.startDate) > new Date()).length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                <Gift size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Mã Voucher đã tạo</p>
                <p className="text-2xl font-bold">128</p> 
              </div>
            </div>
          </div>
        </div>

        {/* Promotions Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 animate-pulse">Đang tải danh sách khuyến mãi...</p>
          </div>
        ) : promotions.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <TicketPercent className="text-gray-300" size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có chương trình khuyến mãi nào</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-8">Hãy tạo chương trình đầu tiên để thu hút khách hàng đến với nhà hàng của bạn.</p>
            <button 
              onClick={() => setShowModal(true)}
              className="text-blue-600 font-bold hover:underline"
            >
              + Tạo khuyến mãi ngay
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {promotions.map((promo) => (
              <div key={promo.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all group">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-2xl ${promo.isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                        <Tag size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{promo.name}</h3>
                        <p className="text-sm text-gray-500 line-clamp-1">{promo.description}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                       <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={promo.isActive}
                          onChange={() => toggleStatus(promo)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                      <span className={`text-xs font-bold uppercase tracking-wider ${promo.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                        {promo.isActive ? 'ĐANG CHẠY' : 'DỪNG'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4 mb-6 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Mức giảm</p>
                      <p className="text-2xl font-black text-blue-600">
                        {promo.discountType === 'percentage' ? `${promo.discountValue}%` : `${promo.discountValue.toLocaleString()}đ`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Đơn tối thiểu</p>
                      <p className="text-lg font-bold text-gray-900">
                        {promo.minOrderAmount ? `${promo.minOrderAmount.toLocaleString()}đ` : 'Không có'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-gray-400" />
                      <span>{new Date(promo.startDate).toLocaleDateString('vi-VN')} - {new Date(promo.endDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="flex items-center gap-1 font-bold text-gray-900">
                      <Plus size={14} />
                      {promo.voucherCodes?.length || 0} mã
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <button className="text-blue-600 text-sm font-bold hover:underline">Xem chi tiết & Mã Voucher</button>
                   <button className="text-red-500 text-sm font-bold hover:underline">Xóa</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Promotion Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Tạo chương trình khuyến mãi</h2>
                <button onClick={() => setShowModal(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-500 w-10 h-10 rounded-full flex items-center justify-center transition-colors">
                  <XCircle size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 overflow-y-auto max-h-[80vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Tên chương trình *</label>
                    <input 
                      required 
                      type="text"
                      value={form.name} 
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                      placeholder="VD: Mừng khai trương, Giảm giá cuối tuần..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả chi tiết</label>
                    <textarea 
                      value={form.description} 
                      onChange={e => setForm({ ...form, description: e.target.value })}
                      rows={3}
                      className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-600 outline-none transition-all resize-none"
                      placeholder="Mô tả các điều kiện áp dụng..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Loại giảm giá</label>
                    <select 
                      value={form.discountType} 
                      onChange={e => setForm({ ...form, discountType: e.target.value as any })}
                      className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-600 outline-none transition-all appearance-none"
                    >
                      <option value="percentage">Phần trăm (%)</option>
                      <option value="fixed_amount">Số tiền cố định (đ)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Giá trị giảm *</label>
                    <div className="relative">
                      <input 
                        required 
                        type="number"
                        value={form.discountValue} 
                        onChange={e => setForm({ ...form, discountValue: Number(e.target.value) })}
                        className="w-full bg-gray-50 border-0 rounded-2xl pl-5 pr-12 py-4 focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                      />
                      <span className="absolute right-5 top-1/2 -translate-y-1/2 font-bold text-gray-400">
                        {form.discountType === 'percentage' ? '%' : 'đ'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Ngày bắt đầu</label>
                    <input 
                      type="date"
                      value={form.startDate} 
                      onChange={e => setForm({ ...form, startDate: e.target.value })}
                      className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Ngày kết thúc</label>
                    <input 
                      type="date"
                      value={form.endDate} 
                      onChange={e => setForm({ ...form, endDate: e.target.value })}
                      className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                    />
                  </div>

                   <div className="md:col-span-1">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Đơn tối thiểu (đ)</label>
                    <input 
                      type="number"
                      value={form.minOrderAmount} 
                      onChange={e => setForm({ ...form, minOrderAmount: Number(e.target.value) })}
                      className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                    />
                  </div>

                  <div className="md:col-span-1">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Giảm tối đa (đ)</label>
                    <input 
                      type="number"
                      disabled={form.discountType === 'fixed_amount'}
                      value={form.maxDiscountAmount} 
                      onChange={e => setForm({ ...form, maxDiscountAmount: Number(e.target.value) })}
                      className={`w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-600 outline-none transition-all ${form.discountType === 'fixed_amount' ? 'opacity-50' : ''}`}
                    />
                  </div>
                </div>

                <div className="mt-8 flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)} 
                    className="flex-1 py-4 border-2 border-gray-100 rounded-2xl text-gray-600 font-bold hover:bg-gray-50 transition-all"
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    type="submit" 
                    className="flex-[2] py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 transition-all"
                  >
                    Xác nhận & Lưu
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  )
}
