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
          <div className="min-w-8 flex justify-center items-end pb-1">
            {showAvatar && (
              <div
                className="h-8 w-8 rounded-full bg-cover bg-center shrink-0 flex items-center justify-center text-xs"
                style={{
                  backgroundColor: "var(--avatar-bg)",
                  color: "var(--avatar-text)",
                }}
              >
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
            <span
              className="text-xs font-semibold mb-0.5 block"
              style={{ color: "var(--sidebar-sender-name)" }}
            >
              {sender}
            </span>
          )}

          <div className="relative group">
            <div
              className={`px-4 py-2.5 rounded-3xl text-sm shadow-sm transition-colors break-words whitespace-pre-wrap ${
                isOwn
                  ? "bubble-own rounded-br-md shadow-lg"
                  : "bubble-other rounded-bl-md"
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
