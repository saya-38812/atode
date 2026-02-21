"use client"

import { useState } from "react"
import PageContainer from "../components/PageContainer"

const categories = ["すべて", "仕事", "アイデア", "個人"]

const items = [
  { category: "仕事", title: "プロジェクトの企画書作成", time: "2時間前" },
  { category: "アイデア", title: "週末のキャンプ場リサーチ", time: "5時間前" },
  { category: "個人", title: "新しいスニーカーをチェック", time: "昨日" },
  { category: "仕事", title: "メールの返信（5件）", time: "昨日" },
  { category: "アイデア", title: "ブログのネタ：ADHDのライフハック", time: "2日前" },
  { category: "個人", title: "加湿器の掃除", time: "3日前" },
  { category: "仕事", title: "次週のスケジュール確認", time: "3日前" },
  { category: "個人", title: "図書館に本を返す", time: "4日前" },
  { category: "アイデア", title: "スマートホーム化の検討", time: "1週間前" },
]

const badgeColorMap = {
  仕事: "bg-slate-100 text-slate-500 dark:bg-slate-800/30 dark:text-slate-400",
  アイデア:
    "bg-amber-50/50 text-amber-600/60 dark:bg-amber-900/10 dark:text-amber-500/50",
  個人:
    "bg-emerald-50/50 text-emerald-600/60 dark:bg-emerald-900/10 dark:text-emerald-500/50",
}

export default function StockPage() {
  const [active, setActive] = useState("すべて")

  const filtered =
    active === "すべて"
      ? items
      : items.filter((item) => item.category === active)

  return (
    <div className="flex flex-col min-h-screen">

      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-6 pt-8 pb-4 border-b border-primary/10">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <h1 className="text-2xl font-semibold tracking-tight">
            ストック
          </h1>

          <button className="size-10 bg-primary text-white rounded-full shadow-lg shadow-primary/20 active:scale-95 transition">
            ＋
          </button>
        </div>
      </header>

      <PageContainer>

        {/* Category Filter */}
        <div className="flex gap-3 overflow-x-auto pb-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
                active === cat
                  ? "bg-primary text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-3">

          {filtered.map((item, index) => (
            <div
              key={index}
              className="flex flex-col gap-2 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-center">
                <span
                  className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    badgeColorMap[item.category]
                  }`}
                >
                  {item.category}
                </span>

                <span className="text-[10px] text-slate-400">
                  {item.time}
                </span>
              </div>

              <h3 className="text-base font-medium leading-relaxed text-slate-800 dark:text-slate-200">
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
