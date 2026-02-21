"use client"

import { useEffect, useState } from "react"
import PageContainer from "../components/PageContainer"

type Item = {
  id: string
  title: string
  created_at: string
}

export default function StockPage() {
  const [items, setItems] = useState<Item[]>([])
  const API = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    fetch(`${API}/api/stock`)
      .then((res) => res.json())
      .then((data) => setItems(data))
  }, [])

  const formatTime = (date: string) => {
    const d = new Date(date)
    return d.toLocaleDateString("ja-JP")
  }

  return (
    <div className="flex flex-col min-h-screen">

      <header className="pt-10 pb-6 px-4 max-w-md mx-auto w-full">
        <h1 className="text-2xl font-semibold tracking-tight">
          ストック
        </h1>
      </header>

      <PageContainer>

        <div className="space-y-4">

          {items.length === 0 && (
            <div className="text-center text-slate-400 mt-10">
              まだ保存されたものはありません 🌿
            </div>
          )}

          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700"
            >
              <div className="text-[11px] text-slate-400 mb-2">
                {formatTime(item.created_at)}
              </div>

              <h3 className="text-base font-medium text-slate-800 dark:text-slate-200">
                {item.title}
              </h3>
            </div>
          ))}

        </div>

        <div className="h-20" />
      </PageContainer>

    </div>
  )
}
