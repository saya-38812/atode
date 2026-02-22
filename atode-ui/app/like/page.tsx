"use client"

import { useEffect, useState } from "react"
import PageContainer from "../components/PageContainer"

type FavoriteItem = {
  id: string
  title: string
  url: string
  thumbnail_url?: string
  description?: string
  created_at: string
}

type GroupedItems = {
  folder: { id: string; name: string }
  items: FavoriteItem[]
}

const API = process.env.NEXT_PUBLIC_API_URL

export default function LikePage() {
  const [groupedFolders, setGroupedFolders] = useState<GroupedItems[]>([])

  useEffect(() => {
    fetch(`${API}/api/favorites`)
      .then((res) => res.json())
      .then((data) => setGroupedFolders(data))
  }, [])

  const handleRemove = async (id: string, folderId: string) => {
    await fetch(`${API}/favorite/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ remove: true }),
    })

    setGroupedFolders((prev) =>
      prev.map(group => {
        if (group.folder.id === folderId) {
          return {
            ...group,
            items: group.items.filter(item => item.id !== id)
          }
        }
        return group
      })
    )
  }

  const isEmpty = groupedFolders.every(g => g.items.length === 0)

  return (
    <div className="flex flex-col min-h-screen">

      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-6 py-4 border-b border-primary/10">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <span className="text-pink-500 text-xl">♥</span>
            <h1 className="text-xl font-bold tracking-tight">
              お気に入り
            </h1>
          </div>
          <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            🔍
          </button>
        </div>
      </header>

      <PageContainer>
        <div className="mb-6 text-center">
          <h2 className="text-slate-500 dark:text-slate-400 text-sm font-medium tracking-wide uppercase">
            Your Collection
          </h2>
        </div>

        <div className="space-y-10">
          {isEmpty && (
            <div className="text-center text-slate-400 mt-10">
              まだお気に入りはありません 🌿
            </div>
          )}

          {groupedFolders.map((group) => {
            if (group.items.length === 0) return null

            return (
              <div key={group.folder.id} className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                  <span className="text-slate-400">📁</span> {group.folder.name}
                </h3>

                <div className="grid gap-4">
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      className="group bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-transparent hover:border-pink-200 dark:hover:border-pink-900 transition-all duration-300"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          {item.thumbnail_url && (
                            <div className="mb-3 rounded-lg overflow-hidden border border-slate-100 dark:border-slate-700 aspect-video bg-slate-100 dark:bg-slate-900 w-full max-w-sm">
                              <img src={item.thumbnail_url} alt="thumbnail" className="w-full h-full object-cover" />
                            </div>
                          )}
                          <h4 className="text-base font-semibold leading-relaxed mb-1 text-slate-900 dark:text-slate-100">
                            {item.title}
                          </h4>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs truncate max-w-[200px] md:max-w-xs block mb-2"
                          >
                            {item.url}
                          </a>

                          {item.description && (
                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg">
                              {item.description}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => handleRemove(item.id, group.folder.id)}
                          className="text-pink-400 hover:text-pink-600 hover:scale-110 transition-transform text-2xl h-10 w-10 flex items-center justify-center rounded-full hover:bg-pink-50 dark:hover:bg-pink-900/20"
                          aria-label="お気に入り解除"
                        >
                          ♥
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
        <div className="h-20" />
      </PageContainer>
    </div>
  )
}
