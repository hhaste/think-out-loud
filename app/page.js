"use client"
import { useEffect, useState } from "react";
import { Edit2, ArrowRight, MessageCircle } from "lucide-react";
import { getCookie, setCookie } from "cookies-next";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    setCookie("prompt", prompt);
  }, [prompt]);

  useEffect(() => {
    const p = getCookie("prompt");
    if (p) {
      setPrompt(p);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 pt-40">
      <div className="w-full max-w-xl text-center space-y-16">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
          <MessageCircle size={30} /> Think Out Loud
        </h1>

        <p className="text-lg text-gray-700">
          Practice your oral exam or interview by entering a prompt. The AI will
          ask you questions and you respond by voice—no typing needed.
        </p>

        <div className="space-y-6">
          <div className="relative">
            <Edit2 className="absolute left-4 top-1/2 -translate-y-1/2 text-black" size={20} />
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt here..."
              className="w-full pl-12 px-6 py-4 border text-black border-gray-300 placeholder-black/50 rounded-lg text-lg focus:outline-none focus:ring-4 focus:ring-blue-400 focus:border-blue-400"
            />
          </div>

          <button
            onClick={() => router.push("/exam")}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 text-lg rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            Continue <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
