"use client"

import { useEffect, useState } from "react"
import PageContainer from "../components/PageContainer"

type FavoriteItem = {
  id: string
  title: string
  url: string
  created_at: string
}

const API = process.env.NEXT_PUBLIC_API_URL

export default function LikePage() {
  const [items, setItems] = useState<FavoriteItem[]>([])

  useEffect(() => {
    fetch(`${API}/api/favorites`)
      .then((res) => res.json())
      .then((data) => setItems(data))
  }, [])

  const handleRemove = async (id: string) => {
    await fetch(`${API}/favorite/${id}`, {
      method: "POST",
      body: JSON.stringify({ remove: true }),
    })

    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <div className="flex flex-col min-h-screen">

      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-6 py-4 border-b border-primary/10">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <span className="text-primary text-xl">★</span>
            <h1 className="text-xl font-bold tracking-tight">
              お気に入り
            </h1>
          </div>
          <button className="p-2 rounded-full hover:bg-primary/10 transition">
            🔍
          </button>
        </div>
      </header>

      <PageContainer>

        <div className="mb-8 text-center">
          <h2 className="text-slate-500 dark:text-slate-400 text-sm font-medium tracking-wide uppercase">
            Your Collection
          </h2>
        </div>

        <div className="space-y-8">

          {items.length === 0 && (
            <div className="text-center text-slate-400 mt-10">
              まだお気に入りはありません 🌿
            </div>
          )}

          {items.map((item) => (
            <div
              key={item.id}
              className="group bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-transparent hover:border-primary/20 transition-all duration-300"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">

                  <span className="text-xs font-bold text-primary/70 tracking-widest uppercase mb-2 block">
                    Favorite
                  </span>

                  <h3 className="text-lg font-semibold leading-relaxed mb-2">
                    {item.title}
                  </h3>

                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed break-all">
                    {item.url}
                  </p>

                </div>

                <button
                  onClick={() => handleRemove(item.id)}
                  className="text-primary hover:scale-110 transition-transform text-2xl"
                >
                  ♥
                </button>
              </div>
            </div>
          ))}

        </div>

        

      </PageContainer>

    </div>
  )
}
