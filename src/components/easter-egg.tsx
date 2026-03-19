"use client";
import { useState, useEffect } from "react";

const CONFETTI_COLORS = ["#FF6B6B", "#4ECDC4", "#FFE66D", "#A8E6CF", "#FF8B94", "#88D8B0", "#FFAAA5", "#DDA0DD", "#98D8C8", "#F7DC6F"];
const EMOJIS = ["🧮", "💰", "📊", "⭐", "🎉", "💎", "🏆", "✨"];

function Confetti() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[9998] overflow-hidden">
      {Array.from({ length: 60 }).map((_, i) => {
        const isEmoji = i % 5 === 0;
        const left = Math.random() * 100;
        const delay = Math.random() * 3;
        const duration = 2.5 + Math.random() * 3;
        const size = isEmoji ? 20 + Math.random() * 16 : 6 + Math.random() * 8;
        const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
        const rotation = Math.random() * 360;
        const drift = -30 + Math.random() * 60;

        return (
          <div
            key={i}
            className="absolute animate-confetti-fall"
            style={{
              left: `${left}%`,
              top: -20,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              // @ts-expect-error -- CSS custom properties
              "--drift": `${drift}px`,
            }}
          >
            {isEmoji ? (
              <span style={{ fontSize: size }}>{EMOJIS[i % EMOJIS.length]}</span>
            ) : (
              <div
                style={{
                  width: size,
                  height: size * (0.4 + Math.random() * 0.6),
                  backgroundColor: color,
                  transform: `rotate(${rotation}deg)`,
                  borderRadius: Math.random() > 0.5 ? "50%" : "2px",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function EasterEgg() {
  const [show, setShow] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("esep-easter-egg-seen");
    if (!seen) {
      const timer = setTimeout(() => setShow(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  function handleClose() {
    setFadeOut(true);
    setTimeout(() => {
      setShow(false);
      localStorage.setItem("esep-easter-egg-seen", "true");
    }, 500);
  }

  if (!show) return null;

  return (
    <>
      <Confetti />
      <div
        className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-opacity duration-500 ${fadeOut ? "opacity-0" : "opacity-100"}`}
        onClick={handleClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        {/* Card */}
        <div
          className={`relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center transform transition-all duration-500 ${fadeOut ? "scale-90 opacity-0" : "scale-100 opacity-100 animate-bounce-in"}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 rounded-3xl blur-lg opacity-30 animate-pulse" />
          <div className="relative bg-white rounded-3xl p-8">
            <div className="text-6xl mb-4 animate-bounce">🏆</div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Жана, спасибо вам!
            </h2>

            <p className="text-gray-600 leading-relaxed mb-4">
              За вашу помощь и экспертизу этот проект становится по-настоящему полезным для предпринимателей Казахстана.
            </p>

            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-4 mb-6">
              <p className="text-amber-800 font-medium text-lg">
                &laquo;Лучший бухгалтер — тот, кто делает сложное простым&raquo;
              </p>
              <p className="text-amber-600 text-sm mt-1">Это про вас! ✨</p>
            </div>

            <button
              onClick={handleClose}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl transition-all transform hover:scale-105 active:scale-95"
            >
              Спасибо, приятно! 😊
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
