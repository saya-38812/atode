"use client"

import { useEffect, useState } from "react"
import PageContainer from "../components/PageContainer"

type Item = {
  id: string
  url: string
  title: string
  thumbnail_url?: string
  description?: string
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
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
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

          {items.map((item) => {
            let hostname = item.url
            try {
              hostname = new URL(item.url).hostname
            } catch (e) { }

            return (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition"
              >
                {item.thumbnail_url && (
                  <div className="mb-3 rounded-lg overflow-hidden border border-slate-100 dark:border-slate-700 aspect-video bg-slate-100 dark:bg-slate-900">
                    <img src={item.thumbnail_url} alt="thumbnail" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="flex justify-between items-center text-[11px] text-slate-400 mb-2">
                  <span>{hostname}</span>
                  <span>{formatTime(item.created_at)}</span>
                </div>

                <h3 className="text-base font-medium text-slate-800 dark:text-slate-200 line-clamp-2">
                  {item.title}
                </h3>

                {item.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 line-clamp-3 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
                    {item.description}
                  </p>
                )}
              </a>
            )
          })}

        </div>

        <div className="h-20" />
      </PageContainer>

    </div>
  )
}
