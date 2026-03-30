'use client'

import { useState, useEffect } from 'react'
import AuthLayout from '@/components/AuthLayout'
import api from '@/lib/api'

const BRANCH_ID = '00000000-0000-0000-0000-000000000001'

interface Employee {
  id: string
  branchId: string
  fullName: string
  phone?: string
  email?: string
  role: string
  hourlyRate: number
  hiredAt?: string
  avatarUrl?: string
  createdAt: string
}

interface Shift {
  id: string
  employeeId: string
  employeeName: string
  shiftDate: string
  startTime: string
  endTime: string
  actualStart?: string
  actualEnd?: string
  status: string
  note?: string
}

const roleConfig: Record<string, { label: string; color: string }> = {
  owner:    { label: 'Chủ nhà hàng', color: 'bg-purple-100 text-purple-700' },
  manager:  { label: 'Quản lý', color: 'bg-blue-100 text-blue-700' },
  cashier:  { label: 'Thu ngân', color: 'bg-green-100 text-green-700' },
  waiter:   { label: 'Phục vụ', color: 'bg-yellow-100 text-yellow-700' },
  chef:     { label: 'Bếp trưởng', color: 'bg-orange-100 text-orange-700' },
  bartender:{ label: 'Bartender', color: 'bg-pink-100 text-pink-700' },
}

const shiftStatusConfig: Record<string, { label: string; color: string }> = {
  scheduled: { label: 'Lịch', color: 'bg-blue-100 text-blue-600' },
  active:    { label: 'Đang làm', color: 'bg-green-100 text-green-600' },
  completed: { label: 'Hoàn thành', color: 'bg-gray-100 text-gray-600' },
  absent:    { label: 'Vắng mặt', color: 'bg-red-100 text-red-600' },
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])
  const [tab, setTab] = useState<'employees' | 'shifts'>('employees')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [shiftDate, setShiftDate] = useState(() => new Date().toISOString().split('T')[0])
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', role: 'waiter', hourlyRate: 0 })

  const loadEmployees = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/api/employees/branch/${BRANCH_ID}`)
      setEmployees(data)
    } catch { setEmployees([]) } finally { setLoading(false) }
  }

  const loadShifts = async (date: string) => {
    setLoading(true)
    try {
      const { data } = await api.get(`/api/employees/shifts/branch/${BRANCH_ID}`, { params: { date } })
      setShifts(data)
    } catch { setShifts([]) } finally { setLoading(false) }
  }

  useEffect(() => { loadEmployees() }, [])
  useEffect(() => { if (tab === 'shifts') loadShifts(shiftDate) }, [tab, shiftDate])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    await api.post('/api/employees', { branchId: BRANCH_ID, ...form })
    setShowModal(false)
    setForm({ fullName: '', phone: '', email: '', role: 'waiter', hourlyRate: 0 })
    loadEmployees()
  }

  const checkIn = async (shiftId: string) => {
    await api.post(`/api/employees/shifts/${shiftId}/checkin`)
    loadShifts(shiftDate)
  }

  const checkOut = async (shiftId: string) => {
    await api.post(`/api/employees/shifts/${shiftId}/checkout`)
    loadShifts(shiftDate)
  }

  return (
    <AuthLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nhân viên</h1>
            <p className="text-gray-500 text-sm mt-1">Quản lý nhân viên và ca làm việc</p>
          </div>
          {tab === 'employees' && (
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Thêm nhân viên
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
          {[{ key: 'employees', label: '👥 Nhân viên' }, { key: 'shifts', label: '🕐 Ca làm việc' }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Employees Tab */}
        {tab === 'employees' && (
          loading ? (
            <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"/></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {employees.map(emp => {
                const cfg = roleConfig[emp.role] || { label: emp.role, color: 'bg-gray-100 text-gray-600' }
                return (
                  <div key={emp.id} className="bg-white rounded-xl p-5 shadow-sm border hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {emp.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{emp.fullName}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>{cfg.label}</span>
                      </div>
                    </div>
                    <div className="mt-4 space-y-1 text-sm text-gray-600">
                      {emp.phone && <div className="flex items-center gap-2"><span>📱</span><span>{emp.phone}</span></div>}
                      {emp.email && <div className="flex items-center gap-2"><span>✉️</span><span className="truncate">{emp.email}</span></div>}
                      <div className="flex items-center gap-2"><span>💰</span><span>{emp.hourlyRate.toLocaleString()}đ/giờ</span></div>
                      {emp.hiredAt && <div className="flex items-center gap-2"><span>📅</span><span>Từ {emp.hiredAt}</span></div>}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}

        {/* Shifts Tab */}
        {tab === 'shifts' && (
          <div>
            <div className="bg-white rounded-xl shadow-sm border p-4 mb-4 flex items-center gap-4">
              <input type="date" value={shiftDate} onChange={e => setShiftDate(e.target.value)}
                className="border-none outline-none text-gray-700 font-medium" />
              <span className="text-gray-400">|</span>
              <span className="text-gray-500">{shifts.length} ca</span>
            </div>

            {loading ? (
              <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"/></div>
            ) : shifts.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center border">
                <div className="text-4xl mb-3">⏰</div>
                <p className="text-gray-500">Không có ca làm việc nào</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Nhân viên</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Ca</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Thực tế</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Trạng thái</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {shifts.map(s => {
                      const cfg = shiftStatusConfig[s.status] || { label: s.status, color: 'bg-gray-100 text-gray-600' }
                      return (
                        <tr key={s.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{s.employeeName}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{s.startTime.substring(0, 5)} - {s.endTime.substring(0, 5)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {s.actualStart ? `${new Date(s.actualStart).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}` : '—'}
                            {s.actualEnd ? ` → ${new Date(s.actualEnd).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}` : ''}
                          </td>
                          <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${cfg.color}`}>{cfg.label}</span></td>
                          <td className="px-4 py-3">
                            {s.status === 'scheduled' && <button onClick={() => checkIn(s.id)} className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100">Vào ca</button>}
                            {s.status === 'active' && <button onClick={() => checkOut(s.id)} className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100">Kết thúc</button>}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Create Employee Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md">
              <div className="p-6">
                <h2 className="text-lg font-bold mb-4">Thêm nhân viên</h2>
                <form onSubmit={create} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Họ tên *</label>
                    <input required value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })}
                      className="w-full mt-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Điện thoại</label>
                      <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                        className="w-full mt-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Vai trò</label>
                      <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                        className="w-full mt-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        {Object.entries(roleConfig).map(([key, cfg]) => (
                          <option key={key} value={key}>{cfg.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                      className="w-full mt-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Lương giờ (VNĐ)</label>
                    <input type="number" min={0} value={form.hourlyRate} onChange={e => setForm({ ...form, hourlyRate: Number(e.target.value) })}
                      className="w-full mt-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">Hủy</button>
                    <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Thêm</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  )
}
