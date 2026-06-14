import React, { useState } from 'react'
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export default function StudentProfile() {
  const { user } = useAuth()
  const [pwForm, setPwForm] = useState({
    current: '',
    newPw: '',
    confirm: '',
  })
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)

  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handlePwChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPwForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleChangePassword = () => {
    if (pwForm.current.length < 1) {
      setPwError('Mövcud şifrəni daxil edin')
    } else if (pwForm.newPw.length < 8) {
      setPwError('Yeni şifrə minimum 8 simvol olmalıdır')
    } else if (pwForm.newPw !== pwForm.confirm) {
      setPwError('Şifrələr uyğun gəlmir')
    } else {
      setPwError('')
      setPwSuccess(true)
      setPwForm({ current: '', newPw: '', confirm: '' })
      console.log('Password change requested')
      setTimeout(() => setPwSuccess(false), 3000)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="rounded-neu bg-surface shadow-neu-sm p-6">
        <h2 className="text-lg font-semibold text-text-base mb-5">
          Profil Məlumatları
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-text-base/50 mb-1">Ad</label>
            <input type="text" value={user?.name ?? 'Tələbə'} readOnly className="rounded-neu-sm border border-surface-dark/20 bg-surface px-3 py-2 text-sm text-text-base opacity-60 cursor-not-allowed outline-none" />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-text-base/50 mb-1">Soyad</label>
            <input type="text" value={user?.surname ?? 'Adı'} readOnly className="rounded-neu-sm border border-surface-dark/20 bg-surface px-3 py-2 text-sm text-text-base opacity-60 cursor-not-allowed outline-none" />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-text-base/50 mb-1">Email</label>
            <input type="email" value={user?.email ?? 'telebe@example.com'} readOnly className="rounded-neu-sm border border-surface-dark/20 bg-surface px-3 py-2 text-sm text-text-base opacity-60 cursor-not-allowed outline-none" />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-text-base/50 mb-1">Telefon</label>
            <input type="text" value="+994501234567" readOnly className="rounded-neu-sm border border-surface-dark/20 bg-surface px-3 py-2 text-sm text-text-base opacity-60 cursor-not-allowed outline-none" />
          </div>
          <div className="flex flex-col md:col-span-2">
            <label className="text-xs font-semibold text-text-base/50 mb-1">Doğum tarixi</label>
            <input type="date" value="2000-01-01" readOnly className="rounded-neu-sm border border-surface-dark/20 bg-surface px-3 py-2 text-sm text-text-base opacity-60 cursor-not-allowed outline-none" />
          </div>
          <div className="flex flex-col md:col-span-2">
            <label className="text-xs font-semibold text-text-base/50 mb-1">Qeyd</label>
            <textarea rows={3} readOnly className="rounded-neu-sm border border-surface-dark/20 bg-surface px-3 py-2 text-sm text-text-base opacity-60 cursor-not-allowed resize-none outline-none">Tələbə haqqında qeyd</textarea>
          </div>
        </div>
      </div>

      <div className="rounded-neu bg-surface shadow-neu-sm p-6">
        <h2 className="text-lg font-semibold text-text-base mb-5">
          Şifrəni Dəyiş
        </h2>
        <p className="text-sm text-text-base/50 mb-4">
          Şifrənizi yeniləmək üçün mövcud şifrənizi daxil edin.
        </p>

        <div className="space-y-4">
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-text-base/50 mb-1">
              Mövcud Şifrə
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                name="current"
                value={pwForm.current}
                onChange={handlePwChange}
                className="rounded-neu-sm border border-surface-dark/20 bg-surface px-3 py-2 text-sm text-text-base outline-none focus:ring-2 focus:ring-primary/30 w-full pr-10"
              />
              <span
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-text-base/50 hover:text-text-base"
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </span>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-semibold text-text-base/50 mb-1">
              Yeni Şifrə
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                name="newPw"
                value={pwForm.newPw}
                onChange={handlePwChange}
                className="rounded-neu-sm border border-surface-dark/20 bg-surface px-3 py-2 text-sm text-text-base outline-none focus:ring-2 focus:ring-primary/30 w-full pr-10"
              />
              <span
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-text-base/50 hover:text-text-base"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </span>
            </div>
            <span className="text-xs text-text-base/50 mt-1">
              Minimum 8 simvol
            </span>
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-semibold text-text-base/50 mb-1">
              Yeni Şifrəni Təsdiqlə
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                name="confirm"
                value={pwForm.confirm}
                onChange={handlePwChange}
                className="rounded-neu-sm border border-surface-dark/20 bg-surface px-3 py-2 text-sm text-text-base outline-none focus:ring-2 focus:ring-primary/30 w-full pr-10"
              />
              <span
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-text-base/50 hover:text-text-base"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </span>
            </div>
          </div>
        </div>

        {pwError && (
          <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
            <AlertCircle size={14} /> {pwError}
          </p>
        )}

        {pwSuccess && (
          <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
            <CheckCircle size={14} /> Şifrə uğurla yeniləndi
          </p>
        )}

        <div className="flex justify-end mt-4">
          <button
            onClick={handleChangePassword}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors cursor-pointer"
          >
            Şifrəni Yenilə
          </button>
        </div>
      </div>
    </div>
  )
}