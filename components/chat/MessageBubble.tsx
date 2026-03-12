"use client";

interface MessageBubbleProps {
  content: string;
  sender?: string;
  avatar?: string;
  isOwn?: boolean;
  /** Chỉ tin đầu trong block hiển thị tên ở trên */
  showSenderName?: boolean;
  /** Chỉ tin cuối trong block mới hiển thị avatar bên trái (tin nhận) */
  showAvatar?: boolean;
}

export function MessageBubble({
  content,
  sender,
  avatar,
  isOwn,
  showSenderName,
  showAvatar,
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
        {/* Cột avatar bên trái cho tin nhận: luôn chiếm chỗ để các bubble thẳng hàng */}
        {!isOwn && (
          <div className="w-8 flex justify-center items-end pb-1">
            {showAvatar && (
              <div className="h-8 w-8 rounded-full bg-cover bg-center shrink-0 flex items-center justify-center bg-slate-700 text-white text-xs">
                {avatar ? (
                  <div
                    className="h-8 w-8 rounded-full bg-cover bg-center"
                    style={{ backgroundImage: `url('${avatar}')` }}
                    role="img"
                    aria-label={`${sender} avatar`}
                  />
                ) : (
                  <span>{(sender ?? "?").charAt(0).toUpperCase()}</span>
                )}
              </div>
            )}
          </div>
        )}

        <div className={`flex flex-col gap-0.5 ${isOwn ? "items-end" : ""}`}>
          {/* Tên sender chỉ ở trên đầu block (tin đầu tiên của người đó) */}
          {!isOwn && showSenderName && sender && (
            <span className="text-xs font-semibold text-slate-400 mb-0.5 block">
              {sender}
            </span>
          )}

          <div className="relative group">
            <div
              className={`px-4 py-2.5 rounded-3xl text-sm shadow-sm transition-colors break-words whitespace-pre-wrap ${
                isOwn
                  ? "bg-gradient-to-br from-[#FF8A4A] to-[#FF5C5C] text-white rounded-br-md shadow-lg shadow-orange-500/30"
                  : "bg-gradient-to-br from-[#E0F2FF] to-[#C7E0FF] text-slate-900 rounded-bl-md shadow-sm shadow-slate-300/40 border border-[#C4DCFF] dark:from-[#1F2937] dark:to-[#0F172A] dark:text-slate-50 dark:shadow-slate-900/50 dark:border-slate-700"
              }`}
            >
              {content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
