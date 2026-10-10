export default function ComingSoon() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="coming-soon-fade text-xs tracking-[0.3em] text-ink/40" style={{ animationDelay: "0ms" }}>
        COMING SOON
      </p>

      <h1
        className="coming-soon-fade mt-6 font-logo text-7xl leading-none text-brand sm:text-8xl"
        style={{ animationDelay: "150ms" }}
      >
        ooro.
      </h1>

      <p
        className="coming-soon-fade mt-10 max-w-sm text-sm leading-relaxed text-ink/50"
        style={{ animationDelay: "300ms" }}
      >
        하루의 리듬을 되찾는 시간,
        <br />
        천천히 준비하고 있어요.
      </p>
    </main>
  )
}
