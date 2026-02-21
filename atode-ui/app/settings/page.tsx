"use client"

import { useEffect, useState } from "react"
import PageContainer from "../components/PageContainer"

export default function SettingsPage() {
  const [dark, setDark] = useState(false)
  const [fontSize, setFontSize] = useState(40)
  const [notify, setNotify] = useState(true)

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

            <div className="bg-white dark:bg-slate-800/50 rounded-xl p-5 shadow-sm border border-primary/5 flex items-center gap-4">
              <div className="size-16 rounded-full bg-primary/10 border-2 border-primary/20" />
              <div>
                <p className="text-lg font-bold">大学 太郎</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  ADHD思考リセット中
                </p>
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

      </PageContainer>
    </div>
  )
}
