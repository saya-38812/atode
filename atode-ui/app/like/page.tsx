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

import { fetchApi } from "@/lib/apiClient"

export default function LikePage() {
  const [groupedFolders, setGroupedFolders] = useState<GroupedItems[]>([])
  const [selectedFolder, setSelectedFolder] = useState<GroupedItems | null>(null)

  useEffect(() => {
    fetchApi(`/api/favorites`)
      .then((res) => res.json())
      .then((data) => setGroupedFolders(data))
  }, [])

  const handleRemove = async (id: string, folderId: string) => {
    await fetchApi(`/favorite/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ remove: true }),
    })

    setGroupedFolders((prev) =>
      prev.map(group => {
        if (group.folder.id === folderId) {
          const updated = {
            ...group,
            items: group.items.filter(item => item.id !== id)
          }
          // 現在開いてるフォルダも更新
          if (selectedFolder?.folder.id === folderId) {
            setSelectedFolder(updated)
          }
          return updated
        }
        return group
      })
    )
  }

  const foldersWithItems = groupedFolders.filter(g => g.items.length > 0)
  const totalItems = groupedFolders.reduce((sum, g) => sum + g.items.length, 0)

  // ============================================
  // フォルダの中身を表示
  // ============================================
  if (selectedFolder) {
    return (
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md px-6 py-4 border-b border-pink-100 dark:border-slate-800">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedFolder(null)}
                className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="戻る"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5" />
                  <path d="M12 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-lg font-bold tracking-tight flex items-center gap-2">
                  <span className="text-pink-400">📁</span>
                  {selectedFolder.folder.name}
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedFolder.items.length}件のアイテム
                </p>
              </div>
            </div>
          </div>
        </header>

        <PageContainer>
          {selectedFolder.items.length === 0 ? (
            <div className="text-center text-slate-400 mt-16">
              <div className="text-4xl mb-3">📭</div>
              <p>このフォルダは空です</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {selectedFolder.items.map((item) => {
                let hostname = item.url
                try {
                  hostname = new URL(item.url).hostname
                } catch (e) { }

                return (
                  <div
                    key={item.id}
                    className="group bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-transparent hover:border-pink-200 dark:hover:border-pink-900 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
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
                          {hostname}
                        </a>

                        {item.description && (
                          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg">
                            {item.description}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => handleRemove(item.id, selectedFolder.folder.id)}
                        className="text-pink-400 hover:text-pink-600 hover:scale-110 transition-transform text-2xl h-10 w-10 flex items-center justify-center rounded-full hover:bg-pink-50 dark:hover:bg-pink-900/20 flex-shrink-0"
                        aria-label="お気に入り解除"
                      >
                        ♥
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          <div className="h-20" />
        </PageContainer>
      </div>
    )
  }

  // ============================================
  // フォルダ一覧を表示
  // ============================================
  return (
    <div className="flex flex-col min-h-screen">

      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md px-6 py-4 border-b border-pink-100 dark:border-slate-800">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <span className="text-pink-500 text-xl">♥</span>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                お気に入り
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {totalItems}件 · {foldersWithItems.length}フォルダ
              </p>
            </div>
          </div>
        </div>
      </header>

      <PageContainer>
        {foldersWithItems.length === 0 ? (
          <div className="text-center text-slate-400 mt-16">
            <div className="text-4xl mb-3">🌿</div>
            <p>まだお気に入りはありません</p>
          </div>
        ) : (
          <div className="space-y-3">
            {foldersWithItems.map((group) => (
              <button
                key={group.folder.id}
                onClick={() => setSelectedFolder(group)}
                className="w-full text-left bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-transparent hover:border-pink-200 dark:hover:border-pink-900 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                      📁
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                        {group.folder.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {group.items.length}件
                      </p>
                    </div>
                  </div>
                  <svg
                    className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-pink-400 transition-colors"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}
        <div className="h-20" />
      </PageContainer>
    </div>
  )
}
