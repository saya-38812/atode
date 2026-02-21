import PageContainer from "../components/PageContainer"

const items = [
  {
    category: "Mindfulness",
    title: "深呼吸はいつでも助けになる",
    text: "焦りを感じたら、まずは3回ゆっくり深呼吸。それだけで脳はリラックスモードに切り替わります。",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBR25ZDKsyWg2ct8clTGhiZcV082YdKox3Jk3-7z9eirZqIXYUbwfvM7phGk0_6zSijods6XuJbWpj-I6I8MearawzC8JX6d3pOLsbFwtAfnLcQPCYvB75i9zhe9aSSBYoxY0CK_K5Uj5_unvCBGpihClUaLMhdNAx27vGo0OueFBQ2J6tYLDA5tBgDk9P2qqFMTTf3MCB2xHdwvZG9VQH03EIgPJPAf3qZ_utog-GmZaWQs0_xdn0ifGJL2Y4t1NKoCgJ5-FrdKFo",
  },
  {
    category: "Affirmation",
    title: "「私は、私のペースで大丈夫」",
    text: "他人のスピードと比べる必要はありません。一歩ずつ、着実に進んでいる自分を認めてあげよう。",
  },
  {
    category: "Action Tip",
    title: "タスクを小さく分解する",
    text: "「掃除」ではなく「机の上のペンを片付ける」。5分で終わる単位に分けるのがコツです。",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB9XBbkzayFpSy9AqhFZ3wDlmfoLyoS1s9WtwCkSSdVLOHP4sVH0AGmh2K22N0DjYc-w2jESNE9HIXSi54Hcbqp4PL4f3UlySpKQLYqQoyuYRREOXjJxn9vgYt3GZyihCPW2ZaSwmnhB-vuF4sWJ3W8bOqlIj8A0ijaI13RLHqThojsoQRB6hM_7xPdG_AwsZrNiMWq9Yngrd4T8D4eU5d_pJCIznfF25HrPY9m7L6JfMNziezsaJ-PYPCSn_aqgZ74Wq-g2C9ni-I",
  },
  {
    category: "Reminder",
    title: "完璧じゃなくていい、完了させよう",
    text: "「Done is better than perfect.」80点の出来栄えで、まずは終わらせる勇気を。",
  },
]

export default function LikePage() {
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
          <p className="mt-2 text-lg font-medium">
            心を整える、あなただけの大切な言葉
          </p>
        </div>

        <div className="space-y-8">

          {items.map((item, index) => (
            <div
              key={index}
              className="group bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-transparent hover:border-primary/20 transition-all duration-300"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <span className="text-xs font-bold text-primary/70 tracking-widest uppercase mb-2 block">
                    {item.category}
                  </span>

                  <h3 className="text-lg font-semibold leading-relaxed mb-2">
                    {item.title}
                  </h3>

                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                    {item.text}
                  </p>
                </div>

                <button className="text-primary hover:scale-110 transition-transform text-2xl">
                  ♥
                </button>
              </div>

              {item.image && (
                <div className="mt-4 rounded-lg overflow-hidden bg-primary/5">
                  <img
                    src={item.image}
                    alt=""
                    className="w-full h-40 md:h-48 object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
              )}
            </div>
          ))}

        </div>

        {/* Floating Reset */}
        <div className="mt-14 mb-24 flex justify-center">
          <button className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-full shadow-lg shadow-primary/20 hover:bg-primary/90 transition active:scale-95">
            🔄
            <span className="font-medium">思考をリセットする</span>
          </button>
        </div>

      </PageContainer>

    </div>
  )
}
