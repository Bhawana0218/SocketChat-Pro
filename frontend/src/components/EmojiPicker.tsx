import { useState, useRef, useEffect } from "react";

const EMOJI_CATEGORIES = [
  {
    name: "Smileys",
    emojis: [
      "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃",
      "😉", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😙",
      "🥲", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🫢",
      "🤫", "🤔", "🫡", "🤐", "🤨", "😐", "😑", "😶", "🫥", "😏",
      "😒", "🙄", "😬", "🤥", "😌", "😔", "😪", "🤤", "😴", "😷",
    ],
  },
  {
    name: "Gestures",
    emojis: [
      "👍", "👎", "👊", "✊", "🤛", "🤜", "👏", "🙌", "🫶", "👐",
      "🤲", "🤝", "🙏", "✌️", "🤟", "🤘", "👌", "🤌", "🤏", "👈",
      "👉", "👆", "👇", "☝️", "✋", "🤚", "🖐️", "🖖", "🫱", "🫲",
    ],
  },
  {
    name: "Hearts",
    emojis: [
      "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔",
      "❤️‍🔥", "❤️‍🩹", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝",
    ],
  },
  {
    name: "Objects",
    emojis: [
      "🔥", "⭐", "🌟", "✨", "💫", "🎉", "🎊", "🏆", "🥇", "🎵",
      "🎶", "📱", "💻", "🖥️", "📧", "📝", "📌", "🔗", "📁", "🗂️",
    ],
  },
];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export const EmojiPicker = ({ onSelect, onClose }: EmojiPickerProps) => {
  const [activeCategory, setActiveCategory] = useState(0);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute bottom-full left-0 mb-2 w-80 bg-[#1e293b] border border-[#334155] rounded-xl shadow-2xl overflow-hidden animate-slide-up z-50"
    >
      <div className="p-2 border-b border-[#334155]">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search emoji..."
          className="w-full px-3 py-1.5 bg-[#0f172a] border border-[#334155] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
        />
      </div>

      <div className="flex gap-1 px-2 py-1.5 border-b border-[#334155]">
        {EMOJI_CATEGORIES.map((cat, i) => (
          <button
            key={cat.name}
            onClick={() => setActiveCategory(i)}
            className={`px-2 py-1 text-[10px] font-medium rounded transition-colors ${
              activeCategory === i
                ? "bg-indigo-500/20 text-indigo-400"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="p-2 h-48 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
        <div className="grid grid-cols-8 gap-0.5">
          {(search
            ? EMOJI_CATEGORIES.flatMap((c) => c.emojis)
            : EMOJI_CATEGORIES[activeCategory].emojis
          )
            .filter((e) => !search || e.includes(search))
            .map((emoji, i) => (
              <button
                key={`${emoji}-${i}`}
                onClick={() => onSelect(emoji)}
                className="w-8 h-8 flex items-center justify-center text-lg hover:bg-white/10 rounded transition-all duration-150 hover:scale-125"
              >
                {emoji}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
};
