import React, { useState } from 'react'
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'

export default function TeacherProfile() {
  // Şifrəni Dəyiş state
  const [pwForm, setPwForm] = useState({
    current: '',
    newPw: '',
    confirm: '',
  })
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)

  // Password visibility states
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // Password fields change handler
  const handlePwChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPwForm((prev) => ({ ...prev, [name]: value }))
  }

  // Change password validation
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
      {/* SECTION 1 — Profil Məlumatları */}
      <div className="lms-card rounded-neu bg-surface shadow-neu-sm p-6">
        <h2 className="text-lg font-semibold text-lms-heading mb-5">
          Profil Məlumatları
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-lms-muted mb-1">Ad</label>
            <input type="text" value="Müəllim" readOnly className="border border-lms-border rounded-lg px-3 py-2 text-sm w-full bg-gray-50 text-gray-500 cursor-not-allowed outline-none" />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-lms-muted mb-1">Soyad</label>
            <input type="text" value="Adı" readOnly className="border border-lms-border rounded-lg px-3 py-2 text-sm w-full bg-gray-50 text-gray-500 cursor-not-allowed outline-none" />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-lms-muted mb-1">Email</label>
            <input type="email" value="muellim@example.com" readOnly className="border border-lms-border rounded-lg px-3 py-2 text-sm w-full bg-gray-50 text-gray-500 cursor-not-allowed outline-none" />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-lms-muted mb-1">Telefon</label>
            <input type="text" value="+994501234567" readOnly className="border border-lms-border rounded-lg px-3 py-2 text-sm w-full bg-gray-50 text-gray-500 cursor-not-allowed outline-none" />
          </div>
          <div className="flex flex-col md:col-span-2">
            <label className="text-xs font-semibold text-lms-muted mb-1">İxtisas</label>
            <input type="text" value="Proqramlaşdırma" readOnly className="border border-lms-border rounded-lg px-3 py-2 text-sm w-full bg-gray-50 text-gray-500 cursor-not-allowed outline-none" />
          </div>
          <div className="flex flex-col md:col-span-2">
            <label className="text-xs font-semibold text-lms-muted mb-1">Bio</label>
            <textarea rows={3} readOnly className="border border-lms-border rounded-lg px-3 py-2 text-sm w-full bg-gray-50 text-gray-500 cursor-not-allowed outline-none resize-none">Müəllim haqqında məlumat</textarea>
          </div>
        </div>
      </div>

      {/* SECTION 2 — Şifrəni Dəyiş */}
      <div className="lms-card rounded-neu bg-surface shadow-neu-sm p-6">
        <h2 className="text-lg font-semibold text-lms-heading mb-5">
          Şifrəni Dəyiş
        </h2>
        <p className="text-sm text-lms-muted mb-4">
          Şifrənizi yeniləmək üçün mövcud şifrənizi daxil edin.
        </p>

        <div className="space-y-4">
          {/* Mövcud Şifrə */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-lms-muted mb-1">
              Mövcud Şifrə
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                name="current"
                value={pwForm.current}
                onChange={handlePwChange}
                className="border border-lms-border bg-white rounded-lg px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-lms-green/30 focus:border-lms-green pr-10 transition-all"
              />
              <span
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-lms-muted hover:text-lms-heading"
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </span>
            </div>
          </div>

          {/* Yeni Şifrə */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-lms-muted mb-1">
              Yeni Şifrə
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                name="newPw"
                value={pwForm.newPw}
                onChange={handlePwChange}
                className="border border-lms-border bg-white rounded-lg px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-lms-green/30 focus:border-lms-green pr-10 transition-all"
              />
              <span
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-lms-muted hover:text-lms-heading"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </span>
            </div>
            <span className="text-xs text-lms-muted mt-1">
              Minimum 8 simvol
            </span>
          </div>

          {/* Yeni Şifrəni Təsdiqlə */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-lms-muted mb-1">
              Yeni Şifrəni Təsdiqlə
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                name="confirm"
                value={pwForm.confirm}
                onChange={handlePwChange}
                className="border border-lms-border bg-white rounded-lg px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-lms-green/30 focus:border-lms-green pr-10 transition-all"
              />
              <span
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-lms-muted hover:text-lms-heading"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </span>
            </div>
          </div>
        </div>

        {/* Error notification */}
        {pwError && (
          <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
            <AlertCircle size={14} /> {pwError}
          </p>
        )}

        {/* Success notification */}
        {pwSuccess && (
          <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
            <CheckCircle size={14} /> Şifrə uğurla yeniləndi
          </p>
        )}

        {/* Bottom submit */}
        <div className="flex justify-end mt-4">
          <button
            onClick={handleChangePassword}
            className="bg-lms-green text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer hover:bg-lms-green-dark transition-colors"
          >
            Şifrəni Yenilə
          </button>
        </div>
      </div>
    </div>
  )
}
