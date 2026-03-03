"use client";
interface MessageBubbleProps {
  content: string;
  sender?: string;
  avatar?: string;
  isOwn?: boolean;
}

export function MessageBubble({
  content,
  sender,
  avatar,
  isOwn,
}: MessageBubbleProps) {
  const wrapperClasses = isOwn
    ? "w-full flex justify-end mb-2"
    : "w-full flex justify-start mb-2";

  const innerClasses = isOwn
    ? "flex max-w-[70%] items-end gap-2 flex-row-reverse"
    : "flex max-w-[70%] items-end gap-2";

  return (
    <div className={wrapperClasses}>
      <div className={innerClasses}>
        <div
          className="h-8 w-8 rounded-full bg-cover bg-center shrink-0 mb-1"
          style={avatar ? { backgroundImage: `url('${avatar}')` } : undefined}
          role="img"
          aria-label={`${sender} avatar`}
        />
        <div className={`flex flex-col gap-1 ${isOwn ? "items-end" : ""}`}>
          {sender && (
            <span className="text-[10px] font-semibold text-slate-400">
              {sender}
            </span>
          )}
          <div className="relative group">
            <div
              className={`px-4 py-2.5 rounded-3xl text-sm shadow-sm ${isOwn
                ? "bg-primary text-white rounded-br-md shadow-lg shadow-primary/20 glow-primary"
                : "bg-white dark:bg-slate-800 rounded-bl-md border border-slate-200 dark:border-slate-700/50"
                }`}
              style={{
                wordBreak: "break-all",
                whiteSpace: "pre-wrap",
              }}
            >
              {content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
