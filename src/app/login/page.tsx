'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Mail, Lock, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${location.origin}/auth/callback`,
          },
        })

        if (error) {
          setError(error.message)
        } else {
          setSuccess('บัญชีสร้างสำเร็จ! กรุณาตรวจสอบอีเมลของคุณเพื่อยืนยันตัวตน')
          setEmail('')
          setPassword('')
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          setError(error.message)
        } else {
          setSuccess('เข้าสู่ระบบสำเร็จ!')
          // Router push after a short delay to allow session to update
          setTimeout(() => {
            router.push('/')
          }, 500)
        }
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 shadow-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {isSignUp ? 'สร้างบัญชี' : 'เข้าสู่ระบบ'}
            </h1>
            <p className="text-zinc-400 text-sm">
              {isSignUp
                ? 'สร้างบัญชีใหม่เพื่อเริ่มต้น'
                : 'เข้าสู่ระบบเพื่อดำเนินการต่อ'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-950 border border-red-800 rounded-lg p-4 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-950 border border-green-800 rounded-lg p-4 mb-6">
              <p className="text-green-400 text-sm">{success}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-4">
            {/* Email Input */}
            <div className="relative">
              <label className="block text-sm font-medium text-zinc-200 mb-2">
                อีเมล
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="relative">
              <label className="block text-sm font-medium text-zinc-200 mb-2">
                รหัสผ่าน
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-5 h-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition flex items-center justify-center gap-2 mt-6"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading
                ? 'กำลังประมวลผล...'
                : isSignUp
                  ? 'สร้างบัญชี'
                  : 'เข้าสู่ระบบ'}
            </button>
          </form>

          {/* Toggle Sign Up / Login */}
          <div className="mt-6 text-center border-t border-zinc-800 pt-6">
            <p className="text-zinc-400 text-sm">
              {isSignUp ? 'มีบัญชีอยู่แล้ว?' : 'ยังไม่มีบัญชี?'}{' '}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError('')
                  setSuccess('')
                }}
                className="text-blue-500 hover:text-blue-400 font-medium transition"
              >
                {isSignUp ? 'เข้าสู่ระบบ' : 'สร้างบัญชี'}
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-zinc-500 text-xs mt-6">
          โดยการเข้าสู่ระบบ คุณยอมรับเงื่อนไขการใช้บริการของเรา
        </p>
      </div>
    </div>
  )
}
