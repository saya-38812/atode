export default function PageContainer({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <main className="flex-1 w-full max-w-md md:max-w-2xl lg:max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>
    )
  }
  