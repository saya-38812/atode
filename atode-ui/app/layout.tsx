import './globals.css'
import BottomNav from './components/BottomNav'
import { AuthProvider } from '@/components/AuthProvider'

export const metadata = {
  title: '今日はこれだけ',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
        <AuthProvider>
          <div className="flex-1">{children}</div>
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  )
}
