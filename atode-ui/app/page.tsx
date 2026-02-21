import PageContainer from "./components/PageContainer"

const cards = [
  {
    label: "読む",
    title: "朝のルーティンのヒント",
    color: "blue",
  },
  {
    label: "試す",
    title: "5分間のマインドフルネス",
    color: "emerald",
  },
  {
    label: "考える",
    title: "次にやりたい小さなこと",
    color: "orange",
  },
]

const colorMap = {
  blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  emerald:
    "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  orange:
    "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">

      {/* Header */}
      <header className="pt-10 pb-6 flex flex-col items-center">
        <h1 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
          今日はこれだけ
        </h1>

        <div className="bg-primary/10 text-primary px-4 py-1.5 rounded-full flex items-center gap-2">
          <span className="text-sm font-semibold tracking-wide">
            あと3件
          </span>
        </div>
      </header>

      {/* Main */}
      <PageContainer>
        <div className="space-y-6">

          {cards.map((card, index) => (
            <div
              key={index}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex justify-between items-start">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${colorMap[card.color]}`}
                >
                  {card.label}
                </span>

                <button className="text-slate-400 hover:text-primary text-xs transition">
                  Safariで開く
                </button>
              </div>

              <h2 className="text-xl md:text-2xl font-bold leading-tight mt-4 text-slate-900 dark:text-white">
                {card.title}
              </h2>

              <button className="w-full mt-6 bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-lg transition">
                見た
              </button>
            </div>
          ))}
        </div>
      </PageContainer>

    </div>
  )
}
