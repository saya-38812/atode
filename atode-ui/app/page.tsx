"use client"

import { useEffect, useState } from "react"
import PageContainer from "./components/PageContainer"

type Card = {
  id: string
  url: string
  title: string
  thumbnail_url?: string
  description?: string
  viewed: boolean
}

const API = process.env.NEXT_PUBLIC_API_URL

export default function Home() {
  const [cards, setCards] = useState<Card[]>([])

  const fetchCards = async () => {
    try {
      const res = await fetch(`${API}/api/home`)
      const data = await res.json()
      setCards(data)
    } catch (e) {
      console.error("fetch error", e)
    }
  }

  const [folders, setFolders] = useState<any[]>([])
  const [selectedCard, setSelectedCard] = useState<any | null>(null)
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")


  useEffect(() => {
    fetch(`${API}/api/folders`)
      .then((res) => res.json())
      .then((data) => setFolders(data))
  }, [])


  useEffect(() => {
    fetchCards()
  }, [])

  const handleFavorite = async (bookmarkId: string, folderId: string) => {
    await fetch(`${API}/favorite/${bookmarkId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folder_id: folderId }),
    })

    setCards((prev) => prev.filter((c) => c.id !== bookmarkId))
    setSelectedCard(null)
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return

    const res = await fetch(`${API}/folders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newFolderName.trim() }),
    })

    const data = await res.json()

    if (data?.[0]) {
      setFolders((prev) => [...prev, data[0]])
    }

    setNewFolderName("")
    setIsCreatingFolder(false)
  }



  const handleViewed = async (id: string) => {
    await fetch(`${API}/viewed/${id}`, { method: "POST" })
    await fetchCards()
    // 即UIから消す
    setCards((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div className="flex flex-col min-h-screen">

      {/* Header */}
      <header className="pt-10 pb-6 flex flex-col items-center">
        <h1 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
          今日はこれだけ
        </h1>

        <div className="bg-primary/10 text-primary px-4 py-1.5 rounded-full">
          <span className="text-sm font-semibold tracking-wide">
            あと{cards.length}件
          </span>
        </div>
      </header>

      {/* Main */}
      <PageContainer>
        <div className="space-y-4">

          {cards.length === 0 && (
            <div className="text-center text-slate-400 mt-10">
              今日はもうありません 🌿
            </div>
          )}

          {cards.map((card) => {
            let hostname = card.url
            try {
              hostname = new URL(card.url).hostname
            } catch (e) { }

            return (
              <div
                key={card.id}
                className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 shadow-sm"
              >
                {card.thumbnail_url && (
                  <div className="mb-3 rounded-lg overflow-hidden border border-slate-100 dark:border-slate-700 aspect-video bg-slate-100 dark:bg-slate-900">
                    <img src={card.thumbnail_url} alt="thumbnail" className="w-full h-full object-cover" />
                  </div>
                )}

                <a
                  href={card.url}
                  target="_blank"
                  className="text-[11px] text-slate-400 hover:text-primary mb-1 inline-block"
                >
                  {hostname}
                </a>

                <h2 className="text-base md:text-lg font-bold leading-snug mb-3 text-slate-900 dark:text-white line-clamp-2">
                  {card.title}
                </h2>

                {card.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 line-clamp-3 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
                    {card.description}
                  </p>
                )}

                <div className="flex gap-2 mt-auto pt-2">
                  <button
                    onClick={() => handleViewed(card.id)}
                    className="flex-1 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-semibold py-2.5 rounded-lg transition text-sm shadow-sm"
                  >
                    見た
                  </button>

                  <button
                    onClick={() => setSelectedCard(card)}
                    className="w-12 flex items-center justify-center bg-pink-50 text-pink-500 hover:bg-pink-100 rounded-lg hover:scale-105 transition shadow-sm h-full"
                    aria-label="お気に入り"
                  >
                    ♥
                  </button>
                </div>

              </div>
            )
          })}

        </div>


        {selectedCard && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-[90%] max-w-sm">

              <h2 className="text-lg font-semibold mb-4">
                フォルダを選択
              </h2>

              <div className="space-y-2 mb-4">

                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => handleFavorite(selectedCard.id, folder.id)}
                    className="w-full py-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-primary/10 transition"
                  >
                    {folder.name}
                  </button>
                ))}

              </div>

              {!isCreatingFolder && (
                <button
                  onClick={() => setIsCreatingFolder(true)}
                  className="w-full py-2 rounded-lg border border-dashed border-primary text-primary hover:bg-primary/5 transition"
                >
                  ＋ 新しいフォルダを作る
                </button>
              )}

              {isCreatingFolder && (
                <div className="space-y-2 mt-2">
                  <input
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="フォルダ名"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent"
                  />

                  <button
                    onClick={handleCreateFolder}
                    className="w-full py-2 rounded-lg bg-primary text-white"
                  >
                    作成
                  </button>
                </div>
              )}

              <button
                onClick={() => {
                  setSelectedCard(null)
                  setIsCreatingFolder(false)
                }}
                className="mt-4 w-full text-sm text-slate-400"
              >
                キャンセル
              </button>

            </div>
          </div>
        )}



      </PageContainer>


    </div>
  )
}
