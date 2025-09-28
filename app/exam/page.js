"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { getCookie } from "cookies-next";
import { ArrowRight, MessageCircle, Mic, Play, StopCircle, Bot, User, Ellipsis } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

export default function Home() {
  const [currentQ, setCurrentQ] = useState(0);
  const [recording, setRecording] = useState(false);
  const [listening, setListening] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [conversation, setConversation] = useState([]);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const conversationEndRef = useRef(null);

  const readText = (text) => {
    if (typeof window === "undefined") return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 1;
    synth.speak(u);
  };

  const { data: questions } = useQuery({
    staleTime: Infinity,
    retry: false,
    queryKey: ["questions"],
    queryFn: async () => {
      const res = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: getCookie("prompt"),
        }),
      });
      if (!res.ok) throw new Error("Questions request failed");
      return res.json();
    },
  });

  const { mutate: transcribe } = useMutation({
    mutationFn: async (blob) => {
      const formData = new FormData();
      formData.append("audio", blob, "recording.wav");

      const res = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/transcribe", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Transcription failed");
      return res.json();
    },
    onSuccess: (d) => {
      setListening(false);

      const text = d.results?.channels?.[0]?.alternatives?.[0]?.transcript;
      if (!text) {
        readText("Sorry, I couldn't hear what you said. Try again.");
        setConversation((prev) => [...prev, {
          type: "user",
          text: "*Inaudible*",
        }]);
        return;
      }

      setAnswered(true);
      setConversation((prev) => [...prev, {
        type: "user",
        text: text,
      }]);

      setThinking(true);
      evaluate({
        prompt: getCookie("prompt"),
        question: questions[currentQ],
        answer: text,
      });
    }
  });

  const { mutate: evaluate } = useMutation({
    mutationFn: async (body) => {
      const res = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Evaluation failed");
      return res.json();
    },
    onSettled: (d) => {
      setThinking(false);
      readText(d.evaluation);
      setConversation((prev) => [...prev, { type: "ai", text: d.evaluation }]);

      if (d.evaluation.toLowerCase().includes("incorrect")) {
        setFeedback("❌ Incorrect!");
      } else {
        setFeedback("✅ Good job!");
        setScore((prev) => prev + 1);
      }
    }
  });

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation, listening, thinking]);

  if (!questions) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">

        {/* Loading Animation */}
        <div className="flex flex-col items-center space-y-8">
          <p className="text-lg font-medium text-gray-700">
            Preparing questions, please wait...
          </p>
          <div className="flex space-x-2">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-3 h-3 bg-blue-500 rounded-full"
                animate={{ y: [0, -8, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 0.6,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 pt-12 px-4" >
      <div className="w-full max-w-xl flex flex-col space-y-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
          <MessageCircle size={30} /> Think Out Loud
        </h1>

        {/* Progress */}
        <div>
          <div className="flex items-center justify-between text-sm font-medium text-gray-600 mb-1">
            <span>Question {currentQ + 1} / {questions.length}</span>
            {feedback && (<div className={`text-center text-sm font-semibold ${feedback.startsWith("✅") ? "text-green-700" : feedback.startsWith("⚠️") ? "text-yellow-700" : feedback.startsWith("❌") ? "text-red-700" : "text-blue-700"}`}>
              {feedback}
            </div>
            )}
          </div>
          <div className="w-full bg-gray-200 h-4 rounded-full">
            <div
              className="bg-blue-500 h-4 rounded-full transition-all"
              style={{
                width: `${((currentQ) / questions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Conversation */}
        <div className="flex flex-col space-y-4 bg-white p-6 rounded-xl ring-1 h-[60vh] overflow-y-auto no-scrollbar">
          {conversation.map((msg, i) => (
            <div key={i} className={`flex items-start ${msg.type === "ai" ? "justify-start" : "justify-end"}`}>
              {msg.type === "ai" && (
                <div className="mr-2 mt-auto">
                  <Bot size={24} className="text-blue-500" />
                </div>
              )}
              <div
                className={`px-4 py-3 rounded-2xl max-w-xs break-words shadow 
          ${msg.type === "ai"
                    ? "bg-blue-100 text-gray-900 rounded-bl-none"
                    : "bg-green-100 text-gray-900 rounded-br-none"
                  }`}
              >
                {msg.text}
              </div>
              {msg.type === "user" && (
                <div className="ml-2 mt-auto">
                  <User size={24} className="text-green-500" />
                </div>
              )}
            </div>
          ))}

          {/* Show loading / AI thinking */}
          {thinking && (
            <div className="flex items-center justify-start gap-2">
              <div className="mr-2 mt-auto">
                <Bot size={24} className="text-blue-500" />
              </div>
              <div className="flex items-center px-4 py-3 animate-pulse rounded-2xl max-w-xs shadow bg-blue-100 text-gray-700 rounded-bl-none">
                <Ellipsis size={24} />
                <span className="ml-2 italic">Thinking...</span>
              </div>
            </div>
          )}

          {listening && (
            <div className="flex items-center justify-end gap-2">
              <div className="flex items-center px-4 py-3 animate-pulse rounded-2xl max-w-xs shadow bg-green-100 text-gray-700 rounded-br-none">
                <Ellipsis size={24} />
                <span className="ml-2 italic">Speaking...</span>
              </div>
              <div className="ml-2">
                <User size={24} className="text-green-500" />
              </div>
            </div>
          )}

          <div ref={conversationEndRef} />
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 pt-4 border-t">
          <button
            className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-lg transition
    ${conversation.length === 0
                ? "bg-green-500 hover:bg-green-600 text-white"
                : answered
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-yellow-400 hover:bg-yellow-500 text-white"
              }`}
            disabled={conversation.length > 0 && answered}
            onClick={() => {
              readText(questions[currentQ]);
              setConversation((prev) => [...prev, { type: "ai", text: questions[currentQ] }]);
            }}
          >
            <Play size={20} /> {conversation.length === 0 ? "Start" : "Ask"}
          </button>


          {!recording ? (
            <button
              className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-lg transition
                ${answered || conversation.length == 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600 text-white"
                }`}
              disabled={answered || conversation.length == 0}
              onClick={async () => {
                if (typeof window !== "undefined") {
                  window.speechSynthesis.cancel();
                }

                setListening(true);
                setFeedback("");

                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorderRef.current = mediaRecorder;
                audioChunksRef.current = [];

                mediaRecorder.ondataavailable = (e) => {
                  audioChunksRef.current.push(e.data);
                };

                mediaRecorder.onstop = async () => {
                  const blob = new Blob(audioChunksRef.current, { type: "audio/wav" });
                  transcribe(blob);
                };

                mediaRecorder.start();
                setRecording(true);
              }}
            >
              <Mic size={20} /> Answer
            </button>
          ) : (
            <button
              className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition"
              onClick={() => {
                if (mediaRecorderRef.current) {
                  mediaRecorderRef.current.stop();
                  setRecording(false);
                }
              }}
            >
              <StopCircle size={20} /> Stop
            </button>
          )}

          <button
            className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-lg transition
              ${feedback
                ? "bg-blue-500 hover:bg-blue-600 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            disabled={!feedback}
            onClick={() => {
              if (currentQ < questions.length - 1) {
                const next = currentQ + 1;
                setCurrentQ(next);
                setFeedback("");
                setAnswered(false);
                readText(questions[next]);
                setConversation((prev) => [...prev, { type: "ai", text: questions[next] }]);
              } else {
                const percentage = Math.round((score / questions.length) * 100);
                setFeedback(`🎉 Exam complete! You scored ${score}/${questions.length} (${percentage}%).`);
                readText(`Exam complete! You answered ${score} out of ${questions.length} questions correctly.`);
              }
            }}
          >
            Next <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div >
  );
}
