import { MagnifyText } from "@/components/MagnifyText";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-5">
        <span className="text-lg font-medium text-black tracking-tight">LP</span>
        <span className="text-sm text-black">works</span>
        <span className="text-sm text-black">about</span>
      </nav>

      {/* Main content */}
      <main className="flex flex-1 items-center justify-center overflow-hidden">
        {/* The reference renders at ~48% of viewport width, regular weight. */}
        <MagnifyText
          text="-hello."
          className="text-[19vw] font-normal tracking-tight text-black"
        />
      </main>
    </div>
  );
}
