import { Zap, Shield, Users } from "lucide-react";

export const EmptyState = () => {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center animate-fade-in max-w-md mx-auto px-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-6">
          <span className="text-4xl">👋</span>
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">
          Welcome to SocketChat Pro
        </h3>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          This room is shared by all connected users. Start the conversation by
          sending the first message.
        </p>
        <div className="flex items-center justify-center gap-6 text-slate-400">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-400" />
            <span className="text-xs">Real-time</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-400" />
            <span className="text-xs">Persistent</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span className="text-xs">Multi-user</span>
          </div>
        </div>
      </div>
    </div>
  );
};
