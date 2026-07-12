import { useState, useRef, useEffect } from "react";

const STICKER_PACKS = [
  {
    name: "Reactions",
    stickers: [
      "👍", "👎", "❤️", "🔥", "😂", "😮", "😢", "😡",
      "🎉", "🚀", "💯", "✨", "👀", "🙏", "💪", "🤔",
      "😍", "🥳", "😎", "🤯", "💀", "🤡", "👻", "🎃",
    ],
  },
  {
    name: "Animals",
    stickers: [
      "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼",
      "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🐔",
      "🐧", "🐦", "🦆", "🦅", "🦉", "🦇", "🐺", "🐗",
    ],
  },
  {
    name: "Food",
    stickers: [
      "🍎", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐",
      "🍔", "🍕", "🌮", "🍣", "🍜", "🍦", "🍩", "🍪",
      "🎂", "🍰", "🧁", "☕", "🍵", "🧃", "🥤", "🍺",
    ],
  },
  {
    name: "Travel",
    stickers: [
      "✈️", "🚗", "🚀", "🏠", "🏔️", "🌊", "🌅", "🌈",
      "⭐", "🌙", "☀️", "⛅", "🌸", "🌺", "🌻", "🌍",
      "🗺️", "⛰️", "🏖️", "🏕️", "🛤️", "🚂", "⛵", "🎈",
    ],
  },
];

interface StickerPickerProps {
  onSelect: (sticker: string) => void;
  onClose: () => void;
}

export const StickerPicker = ({ onSelect, onClose }: StickerPickerProps) => {
  const [activePack, setActivePack] = useState(0);
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
      <div className="flex gap-1 px-2 py-2 border-b border-[#334155]">
        {STICKER_PACKS.map((pack, i) => (
          <button
            key={pack.name}
            onClick={() => setActivePack(i)}
            className={`px-2 py-1 text-[10px] font-medium rounded transition-colors ${
              activePack === i
                ? "bg-indigo-500/20 text-indigo-400"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {pack.name}
          </button>
        ))}
      </div>

      <div className="p-3 h-52 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
        <div className="grid grid-cols-6 gap-1">
          {STICKER_PACKS[activePack].stickers.map((sticker, i) => (
            <button
              key={`${sticker}-${i}`}
              onClick={() => {
                onSelect(sticker);
                onClose();
              }}
              className="w-11 h-11 flex items-center justify-center text-2xl hover:bg-white/10 rounded-lg transition-all duration-150 hover:scale-110"
            >
              {sticker}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
