'use client'

import { useState } from 'react'
import AuthLayout from '@/components/AuthLayout'
import { useMenuCategories, useMenuItems, useCreateMenuItem, useUpdateMenuItem, useDeleteMenuItem } from '@/hooks/useApi'
import { Plus, Edit2, Trash2, BookOpen, Search, ToggleLeft, ToggleRight } from 'lucide-react'
import api from '@/lib/api'
import { useQueryClient } from '@tanstack/react-query'

const RESTAURANT_ID = '00000000-0000-0000-0000-000000000001'

interface MenuItem { id: string; name: string; price: number; imageUrl?: string; unit: string; isAvailable: boolean; categoryId: string; categoryName: string; description: string; sortOrder: number }
interface MenuCategory { id: string; name: string; sortOrder: number }

export default function MenuPage() {
  const { data: categories = [] } = useMenuCategories(RESTAURANT_ID)
  const { data: items = [], isLoading } = useMenuItems(RESTAURANT_ID)
  const createItem = useCreateMenuItem()
  const updateItem = useUpdateMenuItem()
  const deleteItem = useDeleteMenuItem()
  const queryClient = useQueryClient()

  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [showItemForm, setShowItemForm] = useState(false)
  const [showCatForm, setShowCatForm] = useState(false)
  const [editItem, setEditItem] = useState<MenuItem | null>(null)
  const [catForm, setCatForm] = useState({ name: '', sortOrder: '0' })
  const [itemForm, setItemForm] = useState({
    name: '', price: '', description: '', unit: 'phần', categoryId: '', sortOrder: '0'
  })
  const [saving, setSaving] = useState(false)

  const filteredItems = items.filter((item: MenuItem) => {
    const matchCat = activeCategory === 'all' || item.categoryId === activeCategory
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/api/menu/categories', { restaurantId: RESTAURANT_ID, ...catForm, sortOrder: parseInt(catForm.sortOrder) })
      queryClient.invalidateQueries({ queryKey: ['menu-categories'] })
      setShowCatForm(false)
      setCatForm({ name: '', sortOrder: '0' })
    } finally { setSaving(false) }
  }

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...itemForm,
        price: parseFloat(itemForm.price),
        sortOrder: parseInt(itemForm.sortOrder),
      }
      if (editItem) {
        await updateItem.mutateAsync({ id: editItem.id, ...payload })
      } else {
        await createItem.mutateAsync(payload)
      }
      setShowItemForm(false)
      setEditItem(null)
      setItemForm({ name: '', price: '', description: '', unit: 'phần', categoryId: '', sortOrder: '0' })
    } finally { setSaving(false) }
  }

  const handleEditItem = (item: MenuItem) => {
    setEditItem(item)
    setItemForm({
      name: item.name, price: item.price.toString(), description: item.description,
      unit: item.unit, categoryId: item.categoryId, sortOrder: item.sortOrder.toString()
    })
    setShowItemForm(true)
  }

  const handleToggleAvailable = async (item: MenuItem) => {
    await updateItem.mutateAsync({ id: item.id, isAvailable: !item.isAvailable })
  }

  return (
    <AuthLayout>
      <div className="animate-fade-in">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
              <BookOpen size={22} color="#2563eb" />
              Quản lý thực đơn
            </h1>
            <p style={{ color: '#64748b', fontSize: 13 }}>{items.length} món · {categories.length} danh mục</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" onClick={() => setShowCatForm(true)} id="add-category-btn">
              <Plus size={15} />
              Thêm danh mục
            </button>
            <button className="btn btn-primary" onClick={() => { setShowItemForm(true); setEditItem(null); setItemForm({ name: '', price: '', description: '', unit: 'phần', categoryId: categories[0]?.id || '', sortOrder: '0' }) }} id="add-item-btn">
              <Plus size={15} />
              Thêm món
            </button>
          </div>
        </div>

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', marginRight: 8 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              className="input"
              style={{ paddingLeft: 32, width: 200, height: 36 }}
              placeholder="Tìm món..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className={`btn btn-sm ${activeCategory === 'all' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveCategory('all')}>
            Tất cả ({items.length})
          </button>
          {categories.map((cat: MenuCategory) => {
            const count = items.filter((i: MenuItem) => i.categoryId === cat.id).length
            return (
              <button key={cat.id} className={`btn btn-sm ${activeCategory === cat.id ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveCategory(cat.id)}>
                {cat.name} ({count})
              </button>
            )
          })}
        </div>

        {/* Items Table */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {['Tên món', 'Danh mục', 'Đơn vị', 'Giá', 'Trạng thái', 'Thao tác'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item: MenuItem, idx: number) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? 'white' : '#fafafa' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 14 }}>{item.name}</div>
                      {item.description && (
                        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{item.description}</div>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#475569' }}>{item.categoryName}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#475569' }}>{item.unit}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#2563eb', fontSize: 14 }}>
                      {item.price.toLocaleString('vi-VN')}đ
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={() => handleToggleAvailable(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {item.isAvailable ? (
                          <><ToggleRight size={22} color="#16a34a" /><span style={{ fontSize: 12, color: '#16a34a' }}>Đang bán</span></>
                        ) : (
                          <><ToggleLeft size={22} color="#94a3b8" /><span style={{ fontSize: 12, color: '#94a3b8' }}>Tạm ngừng</span></>
                        )}
                      </button>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleEditItem(item)}>
                          <Edit2 size={13} />
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => {
                          if (confirm('Xóa món này?')) deleteItem.mutate(item.id)
                        }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredItems.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                {isLoading ? 'Đang tải...' : 'Không có món nào'}
              </div>
            )}
          </div>
        </div>

        {/* Category Form Modal */}
        {showCatForm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <div className="card animate-fade-in" style={{ padding: 32, width: 360 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Thêm danh mục</h2>
              <form onSubmit={handleSaveCategory}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Tên danh mục *</label>
                  <input className="input" required value={catForm.name} onChange={e => setCatForm(p => ({ ...p, name: e.target.value }))} placeholder="VD: Món chính" />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Thứ tự</label>
                  <input className="input" type="number" value={catForm.sortOrder} onChange={e => setCatForm(p => ({ ...p, sortOrder: e.target.value }))} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowCatForm(false)}>Hủy</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>Lưu</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Item Form Modal */}
        {showItemForm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <div className="card animate-fade-in" style={{ padding: 32, width: 460, maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto' }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>{editItem ? 'Sửa món' : 'Thêm món mới'}</h2>
              <form onSubmit={handleSaveItem}>
                {[
                  { key: 'name', label: 'Tên món *', type: 'text', required: true, placeholder: 'VD: Phở bò tái' },
                  { key: 'price', label: 'Giá (VNĐ) *', type: 'number', required: true, placeholder: '85000' },
                  { key: 'description', label: 'Mô tả', type: 'text', required: false, placeholder: 'Mô tả ngắn về món' },
                  { key: 'unit', label: 'Đơn vị', type: 'text', required: false, placeholder: 'phần, ly, đĩa...' },
                ].map(f => (
                  <div key={f.key} style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{f.label}</label>
                    <input
                      className="input" type={f.type} required={f.required} placeholder={f.placeholder}
                      value={itemForm[f.key as keyof typeof itemForm]}
                      onChange={e => setItemForm(p => ({ ...p, [f.key]: e.target.value }))}
                    />
                  </div>
                ))}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Danh mục *</label>
                  <select
                    className="input" required
                    value={itemForm.categoryId}
                    onChange={e => setItemForm(p => ({ ...p, categoryId: e.target.value }))}
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((cat: MenuCategory) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setShowItemForm(false); setEditItem(null) }}>Hủy</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving} id="save-item-btn">
                    {saving ? 'Đang lưu...' : 'Lưu'}
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
