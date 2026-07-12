import { useState, useRef, useCallback } from "react";

interface LoginProps {
  onLogin: (username: string) => void;
}

export const LoginPage = ({ onLogin }: LoginProps) => {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = username.trim();
      if (!trimmed) {
        setError("Please enter a username");
        return;
      }
      if (trimmed.length < 2) {
        setError("Username must be at least 2 characters");
        return;
      }
      if (trimmed.length > 30) {
        setError("Username cannot exceed 30 characters");
        return;
      }
      setError("");
      onLogin(trimmed);
    },
    [username, onLogin]
  );

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: `
          radial-gradient(circle at top left, #6366f1 0%, transparent 40%),
          radial-gradient(circle at bottom right, #2563eb 0%, transparent 40%),
          #0f172a
        `,
      }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500 mb-4 shadow-lg shadow-indigo-500/25">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" />
              <path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">SocketChat Pro</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Real-time group chat powered by{" "}
            <span className="text-indigo-400 font-medium">Socket.io</span>,{" "}
            <span className="text-emerald-400 font-medium">Express</span> and{" "}
            <span className="text-purple-400 font-medium">MongoDB</span>
          </p>
        </div>

        <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
                Choose your username
              </label>
              <input
                ref={inputRef}
                id="username"
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(""); }}
                placeholder="Enter username..."
                className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-200"
                maxLength={30}
                autoFocus
              />
              {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
            </div>
            <button
              type="submit"
              className="w-full py-3 px-4 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Join Chat
            </button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          No registration required — just pick a name and start chatting
        </p>
      </div>
    </div>
  );
};
