export const DateSeparator = ({ dateString }: { dateString: string }) => {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  let label: string;
  if (msgDate.getTime() === today.getTime()) {
    label = "Today";
  } else if (msgDate.getTime() === yesterday.getTime()) {
    label = "Yesterday";
  } else {
    label = date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }

  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-[#334155]" />
      <span className="text-[11px] text-slate-500 font-medium px-2">
        {label}
      </span>
      <div className="flex-1 h-px bg-[#334155]" />
    </div>
  );
};
