import { ArrowDown } from "lucide-react";

interface ScrollToBottomProps {
  onClick: () => void;
}

export const ScrollToBottom = ({ onClick }: ScrollToBottomProps) => {
  return (
    <button
      onClick={onClick}
      className="absolute bottom-24 right-6 p-2.5 bg-[#1e293b] border border-[#334155] rounded-full shadow-lg text-white hover:bg-[#334155] transition-all duration-200 hover:scale-110 z-10 animate-fade-in"
    >
      <ArrowDown className="w-4 h-4" />
    </button>
  );
};
