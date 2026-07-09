import { ChatWidget } from "@/components/ChatWidget";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <div className="text-center px-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          One partner across the entire stack.
        </h1>
        <p className="mt-4 text-lg text-zinc-400">
          CareTel — placeholder homepage. Full site coming in a later milestone.
        </p>
      </div>

      <ChatWidget />
    </div>
  );
}