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
  const [folders, setFolders] = useState<any[]>([])
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [confirmCard, setConfirmCard] = useState<Card | null>(null) // 見た後の確認用

  const fetchCards = async () => {
    try {
      const res = await fetch(`${API}/api/home`)
      const data = await res.json()
      setCards(data)
    } catch (e) {
      console.error("fetch error", e)
    }
  }

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
    setConfirmCard(null)
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

  // 「見た」→ 確認モーダルを表示
  const handleViewedClick = (card: Card) => {
    setConfirmCard(card)
  }

  // 確認モーダルで「見た（お気に入りしない）」
  const handleConfirmViewed = async () => {
    if (!confirmCard) return
    await fetch(`${API}/viewed/${confirmCard.id}`, { method: "POST" })
    setCards((prev) => prev.filter((c) => c.id !== confirmCard.id))
    setConfirmCard(null)
    fetchCards()
  }

  // 確認モーダルで「お気に入りする」→ フォルダ選択へ
  const handleConfirmFavorite = () => {
    if (!confirmCard) return
    setSelectedCard(confirmCard)
    setConfirmCard(null)
  }

  return (
    <div className="flex flex-col min-h-screen">

      {/* Header */}
      <header className="pt-10 pb-6 flex flex-col items-center">
        <h1 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
          今日はこれだけ
        </h1>

        <div className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-1.5 rounded-full">
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
                className="flex flex-col bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 shadow-sm"
              >
                {/* サムネイル（小さめ） */}
                {card.thumbnail_url && (
                  <div className="mb-3 flex items-start gap-3">
                    <div className="w-20 h-14 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600 flex-shrink-0 bg-slate-100 dark:bg-slate-900">
                      <img src={card.thumbnail_url} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <a
                        href={card.url}
                        target="_blank"
                        className="text-[11px] text-slate-400 hover:text-slate-600 mb-0.5 inline-block"
                      >
                        {hostname}
                      </a>
                      <h2 className="text-base font-bold leading-snug text-slate-900 dark:text-white line-clamp-2">
                        {card.title}
                      </h2>
                    </div>
                  </div>
                )}

                {/* サムネなし */}
                {!card.thumbnail_url && (
                  <>
                    <a
                      href={card.url}
                      target="_blank"
                      className="text-[11px] text-slate-400 hover:text-slate-600 mb-1 inline-block"
                    >
                      {hostname}
                    </a>

                    <h2 className="text-base font-bold leading-snug mb-1 text-slate-900 dark:text-white line-clamp-2">
                      {card.title}
                    </h2>
                  </>
                )}

                {/* 説明文（Xなど） */}
                {card.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-2 line-clamp-3 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
                    {card.description}
                  </p>
                )}

                {/* アクションボタン */}
                <div className="flex gap-2 mt-auto pt-2">
                  <button
                    onClick={() => handleViewedClick(card)}
                    className="flex-1 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-semibold py-2.5 rounded-lg transition text-sm shadow-sm"
                  >
                    見た
                  </button>

                  <button
                    onClick={() => setSelectedCard(card)}
                    className="w-12 flex items-center justify-center bg-pink-50 dark:bg-pink-900/20 text-pink-500 hover:bg-pink-100 dark:hover:bg-pink-900/40 rounded-lg hover:scale-105 transition shadow-sm"
                    aria-label="お気に入り"
                  >
                    ♥
                  </button>
                </div>

              </div>
            )
          })}

        </div>

        {/* ========== 確認モーダル（見た → お気に入りする？） ========== */}
        {confirmCard && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-[90%] max-w-sm shadow-xl">

              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                お気に入りに追加する？
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 line-clamp-1">
                {confirmCard.title}
              </p>

              <div className="space-y-2">
                <button
                  onClick={handleConfirmFavorite}
                  className="w-full py-2.5 rounded-lg bg-pink-500 hover:bg-pink-600 text-white font-semibold transition text-sm"
                >
                  ♥ お気に入りにする
                </button>

                <button
                  onClick={handleConfirmViewed}
                  className="w-full py-2.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium transition text-sm"
                >
                  見ただけ（スキップ）
                </button>

                <button
                  onClick={() => setConfirmCard(null)}
                  className="w-full pt-2 text-sm text-slate-400 hover:text-slate-600 transition"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========== フォルダ選択モーダル ========== */}
        {selectedCard && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-[90%] max-w-sm shadow-xl max-h-[80vh] overflow-y-auto">

              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                フォルダを選択
              </h2>

              <div className="space-y-2 mb-4">
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => handleFavorite(selectedCard.id, folder.id)}
                    className="w-full py-2.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:text-pink-600 transition text-sm font-medium text-left px-4"
                  >
                    📁 {folder.name}
                  </button>
                ))}
              </div>

              {/* 新しいフォルダを作るボタン */}
              {!isCreatingFolder && (
                <button
                  onClick={() => setIsCreatingFolder(true)}
                  className="w-full py-2.5 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-pink-400 hover:text-pink-500 transition text-sm font-medium"
                >
                  ＋ 新しいフォルダを作る
                </button>
              )}

              {/* フォルダ作成フォーム */}
              {isCreatingFolder && (
                <div className="space-y-2 mt-2">
                  <input
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="フォルダ名"
                    autoFocus
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent text-slate-900 dark:text-white text-sm"
                  />

                  <button
                    onClick={handleCreateFolder}
                    className="w-full py-2.5 rounded-lg bg-pink-500 hover:bg-pink-600 text-white font-semibold text-sm transition"
                  >
                    作成
                  </button>
                </div>
              )}

              <button
                onClick={() => {
                  setSelectedCard(null)
                  setIsCreatingFolder(false)
                  setNewFolderName("")
                }}
                className="mt-4 w-full text-sm text-slate-400 hover:text-slate-600 transition"
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
