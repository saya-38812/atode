"use client"

import { useEffect, useState } from "react"
import PageContainer from "../components/PageContainer"
import { useAuth } from "@/components/AuthProvider"
import { fetchApi, supabase } from "@/lib/apiClient"

export default function SettingsPage() {
  const { session } = useAuth()
  const user = session?.user
  const [dark, setDark] = useState(false)
  const [fontSize, setFontSize] = useState(40)
  const [notify, setNotify] = useState(true)
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    fetchApi('/api/me/api-key')
      .then(res => res.json())
      .then(data => setApiKey(data.api_key))
      .catch(err => console.error('fetch api-key error', err))
  }, [])

  const handleCopySetup = () => {
    if (!apiKey) return
    const setupData = {
      atode_v1: true,
      url: process.env.NEXT_PUBLIC_API_URL + '/bookmark',
      key: apiKey
    }
    navigator.clipboard.writeText(JSON.stringify(setupData))
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  // ダークモード反映
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [dark])

  // フォントサイズ反映
  useEffect(() => {
    document.documentElement.style.fontSize = `${14 + fontSize / 10}px`
  }, [fontSize])

  return (
    <div className="flex flex-col min-h-screen">

      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-6 py-4 border-b border-primary/10 text-center">
        <h1 className="text-xl font-semibold tracking-tight">
          設定
        </h1>
      </header>

      <PageContainer>

        <div className="space-y-10">

          {/* Account */}
          <section>
            <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">
              アカウント
            </h2>

            <div className="bg-white dark:bg-slate-800/50 rounded-xl p-5 shadow-sm border border-primary/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="size-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center overflow-hidden">
                  {user?.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="" className="size-full object-cover" />
                  ) : (
                    <span className="text-xl">👤</span>
                  )}
                </div>
                <div>
                  <p className="text-lg font-bold">{user?.user_metadata?.full_name || 'ユーザー'}</p>
                  <p className="text-xs text-slate-500 truncate max-w-[150px]">
                    {user?.email}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              >
                ログアウト
              </button>
            </div>
          </section>

          {/* iOS Shortcut Setup */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                iPhone からの保存
              </h2>
              {apiKey && (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold">
                  <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
                  連携準備完了
                </span>
              )}
            </div>

            <div className="bg-white dark:bg-slate-800/50 rounded-xl p-6 shadow-sm border border-primary/5">
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                YouTubeやXアプリから一瞬で保存できる「ショートカット」を準備しました。
              </p>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-400 mb-2">STEP 1: ショートカットを入手</p>
                  <a
                    href="https://www.icloud.com/shortcuts/01deac9da5ef4badbae039e1bc96f97e"
                    target="_blank"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-blue-500 hover:text-blue-600"
                  >
                    <span>📥</span> atode ショートカットをダウンロード
                  </a>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-400 mb-2">STEP 2: 自動セットアップ</p>
                  <button
                    onClick={handleCopySetup}
                    disabled={!apiKey}
                    className="w-full py-2.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  >
                    {isCopied ? "✅ コピーしました！" : "設定情報をコピーする"}
                  </button>
                  <p className="text-[10px] text-slate-400 mt-2 text-center">
                    コピー後、ショートカットを実行すると自動で設定が完了します。
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Display */}
          <section>
            <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">
              表示設定
            </h2>

            <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-sm border border-primary/5 overflow-hidden">

              {/* Dark Mode */}
              <div className="flex items-center justify-between p-5 border-b border-primary/5">
                <span className="font-medium">ダークモード</span>

                <input
                  type="checkbox"
                  checked={dark}
                  onChange={() => setDark(!dark)}
                  className="accent-primary w-5 h-5"
                />
              </div>

              {/* Font Size */}
              <div className="p-5">
                <div className="mb-3 font-medium">文字サイズ</div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full accent-primary"
                />

                <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  <span>小</span>
                  <span>標準</span>
                  <span>大</span>
                </div>
              </div>

            </div>
          </section>

          {/* Notifications */}
          <section>
            <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">
              通知
            </h2>

            <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-sm border border-primary/5 p-5 flex items-center justify-between">
              <div>
                <p className="font-medium">今日の提案</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  優しくお知らせします
                </p>
              </div>

              <input
                type="checkbox"
                checked={notify}
                onChange={() => setNotify(!notify)}
                className="accent-primary w-5 h-5"
              />
            </div>
          </section>

          {/* About */}
          <section>
            <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">
              アプリについて
            </h2>

            <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-sm border border-primary/5 overflow-hidden">

              <button className="w-full text-left p-4 border-b border-primary/5 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                利用規約
              </button>

              <button className="w-full text-left p-4 border-b border-primary/5 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                プライバシーポリシー
              </button>

              <div className="flex justify-between p-4 text-sm text-slate-400">
                <span>バージョン</span>
                <span>1.0.0</span>
              </div>

            </div>
          </section>

          {/* Encouragement */}
          <div className="pt-6 pb-10 text-center">
            <p className="text-slate-400 dark:text-slate-500 text-sm">
              無理せず、自分のペースで。
            </p>
          </div>

        </div>

      </PageContainer >
    </div >
  )
}
