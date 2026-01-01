import UrlInput from "@/components/UrlInput";
import StatsDisplay from "@/components/StatsDisplay";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-sans">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start w-full">
        <h1 className="text-5xl font-black text-center w-full mb-8 bg-linear-to-r from-blue-600 to-rose-600 bg-clip-text text-transparent">YouTube Stats Analyzer</h1>
        <UrlInput />
        <StatsDisplay />
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <p className="text-sm text-gray-500">Powered by YouTube Data API & AI</p>
      </footer>
    </div>
  );
}
