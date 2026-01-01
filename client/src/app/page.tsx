import UrlInput from "@/components/UrlInput";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-8 pb-20 gap-16 sm:p-20 font-sans bg-white dark:bg-gray-950 transition-colors duration-300">
      <main className="flex flex-col gap-12 items-center w-full max-w-4xl animate-in fade-in duration-1000">
        <div className="text-center space-y-4">
          <h1 className="text-6xl md:text-7xl font-black bg-linear-to-r from-blue-600 via-purple-600 to-rose-600 bg-clip-text text-transparent tracking-tight">
            Analyze Any YouTube Video
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 font-medium">
            Deep sentiment analysis powered by AI. Just paste the URL below.
          </p>
        </div>

        <UrlInput />
      </main>
      <footer className="fixed bottom-8 flex gap-6 flex-wrap items-center justify-center opacity-50">
        <p className="text-sm text-gray-500">Powered by YouTube Data API & AI ML Models</p>
      </footer>
    </div>
  );
}
