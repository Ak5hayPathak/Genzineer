function App() {
  return (
    <main className="min-h-screen bg-[#08090b] text-gray-100 flex items-center justify-center p-6">
      <section className="max-w-xl text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.3em] text-violet-400">
          Your knowledge, beautifully published
        </p>

        <h1 className="text-5xl font-bold tracking-tight">
          GenZineer<span className="text-violet-400">.</span>
        </h1>

        <p className="mt-4 text-gray-400">
          A home for technical notes, ideas, and explorations.
        </p>

        <button className="mt-8 rounded-lg bg-violet-500 px-5 py-3 font-medium text-white transition hover:bg-violet-400">
          Foundation ready
        </button>
      </section>
    </main>
  );
}

export default App;
