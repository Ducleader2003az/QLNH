'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { UtensilsCrossed, Loader2 } from 'lucide-react'

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', fullName: '', restaurantName: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      setSuccess(true)
      setTimeout(() => router.push('/login'), 2000)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message || 'Đăng ký thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div className="animate-fade-in" style={{ width: '100%', maxWidth: 420 }}>
        <div className="card" style={{ padding: 40 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 64, height: 64, background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', boxShadow: '0 8px 20px rgba(37,99,235,0.3)'
            }}>
              <UtensilsCrossed size={32} color="white" />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Tạo tài khoản</h1>
            <p style={{ color: '#64748b', fontSize: 14 }}>Đăng ký tài khoản quản lý nhà hàng (Owner)</p>
          </div>

          {success && (
            <div style={{
              background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8,
              padding: '10px 14px', marginBottom: 20, color: '#15803d', fontSize: 14
            }}>
              ✅ Đăng ký thành công! Đang chuyển đến trang đăng nhập...
            </div>
          )}
          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8,
              padding: '10px 14px', marginBottom: 20, color: '#b91c1c', fontSize: 14
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {[
              { name: 'restaurantName', label: 'Tên nhà hàng/chuỗi', type: 'text', placeholder: 'VD: Pfxsoft Restaurant' },
              { name: 'fullName', label: 'Họ và tên chủ sở hữu', type: 'text', placeholder: 'Nguyễn Văn A' },
              { name: 'username', label: 'Tên đăng nhập', type: 'text', placeholder: 'username' },
              { name: 'email', label: 'Email liên hệ', type: 'email', placeholder: 'email@example.com' },
              { name: 'password', label: 'Mật khẩu', type: 'password', placeholder: '••••••••' },
            ].map(field => (
              <div key={field.name} style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  {field.label}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  className="input"
                  placeholder={field.placeholder}
                  value={form[field.name as keyof typeof form]}
                  onChange={handleChange}
                  required
                  id={field.name}
                />
              </div>
            ))}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: 15, marginTop: 8 }}
              disabled={loading}
              id="register-btn"
            >
              {loading && <Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} />}
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#64748b' }}>
            Đã có tài khoản?{' '}
            <Link href="/login" style={{ color: '#2563eb', fontWeight: 600 }}>Đăng nhập</Link>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
