export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 shadow-xl">
          <h1 className="text-2xl font-bold text-white mb-4">ข้อผิดพลาด</h1>
          <p className="text-zinc-400 mb-6">
            เกิดข้อผิดพลาดในการยืนยันอีเมล กรุณาลองสร้างบัญชีใหม่
          </p>
          <a
            href="/login"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition"
          >
            กลับไปเข้าสู่ระบบ
          </a>
        </div>
      </div>
    </div>
  )
}
