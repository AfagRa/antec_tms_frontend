import { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { teacherPortalApi } from '../../api/teacherPortal'
import type { TeacherDetailResponse } from '../../types'
import Spinner from '../../components/ui/Spinner'

export default function TeacherProfile() {
  const [profile, setProfile] = useState<TeacherDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const [current, setCurrent] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)
  const [saving, setSaving] = useState(false)

  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const me = await teacherPortalApi.getMe()
        setProfile(me)
      } catch {
        console.warn('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleChangePassword = async () => {
    if (current.length < 1) { setPwError('Mövcud şifrəni daxil edin'); return }
    if (newPw.length < 8) { setPwError('Yeni şifrə minimum 8 simvol olmalıdır'); return }
    if (newPw !== confirm) { setPwError('Şifrələr uyğun gəlmir'); return }
    setPwError('')
    setSaving(true)
    try {
      await teacherPortalApi.changePassword({ current_password: current, new_password: newPw })
      setPwSuccess(true)
      setCurrent('')
      setNewPw('')
      setConfirm('')
      setTimeout(() => setPwSuccess(false), 3000)
    } catch (err: any) {
      setPwError(err?.response?.data?.message || 'Şifrə dəyişdirilə bilmədi')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="rounded-neu bg-surface shadow-neu-sm p-6">
        <h2 className="text-lg font-semibold text-text-base mb-5">Profil Məlumatları</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-text-base/50 mb-1">Ad</label>
            <input type="text" value={profile?.name ?? ''} readOnly className="border border-surface-dark/20 rounded-lg px-3 py-2 text-sm w-full bg-gray-50 text-gray-500 cursor-not-allowed outline-none" />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-text-base/50 mb-1">Soyad</label>
            <input type="text" value={profile?.surname ?? ''} readOnly className="border border-surface-dark/20 rounded-lg px-3 py-2 text-sm w-full bg-gray-50 text-gray-500 cursor-not-allowed outline-none" />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-text-base/50 mb-1">Email</label>
            <input type="email" value={profile?.email ?? ''} readOnly className="border border-surface-dark/20 rounded-lg px-3 py-2 text-sm w-full bg-gray-50 text-gray-500 cursor-not-allowed outline-none" />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-text-base/50 mb-1">Telefon</label>
            <input type="text" value={profile?.phone ?? ''} readOnly className="border border-surface-dark/20 rounded-lg px-3 py-2 text-sm w-full bg-gray-50 text-gray-500 cursor-not-allowed outline-none" />
          </div>
          <div className="flex flex-col md:col-span-2">
            <label className="text-xs font-semibold text-text-base/50 mb-1">İxtisas</label>
            <input type="text" value={profile?.specialization ?? ''} readOnly className="border border-surface-dark/20 rounded-lg px-3 py-2 text-sm w-full bg-gray-50 text-gray-500 cursor-not-allowed outline-none" />
          </div>
          <div className="flex flex-col md:col-span-2">
            <label className="text-xs font-semibold text-text-base/50 mb-1">Bio</label>
            <textarea rows={3} value={profile?.bio ?? ''} readOnly className="border border-surface-dark/20 rounded-lg px-3 py-2 text-sm w-full bg-gray-50 text-gray-500 cursor-not-allowed outline-none resize-none" />
          </div>
        </div>
      </div>

      <div className="rounded-neu bg-surface shadow-neu-sm p-6">
        <h2 className="text-lg font-semibold text-text-base mb-5">Şifrəni Dəyiş</h2>
        <p className="text-sm text-text-base/50 mb-4">Şifrənizi yeniləmək üçün mövcud şifrənizi daxil edin.</p>
        <div className="space-y-4">
          {[
            { label: 'Mövcud Şifrə', show: showCurrent, setShow: setShowCurrent, val: current, setVal: setCurrent },
            { label: 'Yeni Şifrə', show: showNew, setShow: setShowNew, val: newPw, setVal: setNewPw },
            { label: 'Yeni Şifrəni Təsdiqlə', show: showConfirm, setShow: setShowConfirm, val: confirm, setVal: setConfirm },
          ].map((f) => (
            <div key={f.label} className="flex flex-col">
              <label className="text-xs font-semibold text-text-base/50 mb-1">{f.label}</label>
              <div className="relative">
                <input
                  type={f.show ? 'text' : 'password'}
                  value={f.val}
                  onChange={(e) => f.setVal(e.target.value)}
                  className="border border-surface-dark/20 bg-white rounded-lg px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-success/30 focus:border-success pr-10 transition-all"
                />
                <span onClick={() => f.setShow(!f.show)} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-text-base/50 hover:text-text-base">
                  {f.show ? <EyeOff size={16} /> : <Eye size={16} />}
                </span>
              </div>
            </div>
          ))}
        </div>
        {pwError && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><AlertCircle size={14} /> {pwError}</p>}
        {pwSuccess && <p className="text-green-600 text-sm mt-2 flex items-center gap-1"><CheckCircle size={14} /> Şifrə uğurla yeniləndi</p>}
        <div className="flex justify-end mt-4">
          <button onClick={handleChangePassword} disabled={saving} className="bg-success text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer hover:bg-success/90 transition-colors disabled:opacity-60">
            {saving ? 'Yenilənir...' : 'Şifrəni Yenilə'}
          </button>
        </div>
      </div>
    </div>
  )
}
