export const LoadingSkeleton = () => {
  return (
    <div className="flex-1 p-4 space-y-4 overflow-hidden">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
        >
          <div
            className={`flex ${
              i % 2 === 0 ? "flex-row" : "flex-row-reverse"
            } items-end gap-2 max-w-[60%]`}
          >
            {i % 2 === 0 && (
              <div className="w-8 h-8 rounded-full bg-[#1e293b] animate-pulse" />
            )}
            <div className="space-y-1.5">
              <div
                className={`h-3 w-16 bg-[#1e293b] rounded animate-pulse ${
                  i % 2 === 0 ? "ml-1" : "mr-1"
                }`}
              />
              <div
                className={`px-[18px] py-3 rounded-2xl bg-[#1e293b] animate-pulse ${
                  i % 2 === 0 ? "rounded-bl-md" : "rounded-br-md"
                }`}
                style={{ width: `${140 + Math.random() * 160}px` }}
              />
              <div
                className={`h-2 w-12 bg-[#1e293b] rounded animate-pulse ${
                  i % 2 === 0 ? "ml-1" : "mr-1"
                }`}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
