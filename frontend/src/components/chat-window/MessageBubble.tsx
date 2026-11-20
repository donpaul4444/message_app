import { cn } from '@/lib/utils'
import type { Message } from '@/types/chat'
import { formatMessageTime } from '@/utils/chat'

interface MessageBubbleProps {
  message: Message
  mine: boolean
  firstInRun: boolean
}

export default function MessageBubble({ message, mine, firstInRun }: MessageBubbleProps) {
  return (
    <div className={cn('flex', mine ? 'justify-end' : 'justify-start', firstInRun ? 'mt-2' : 'mt-0.5')}>
      <div
        className={cn(
          'relative max-w-[85%] rounded-2xl px-3 py-1.5 shadow-xs sm:max-w-[70%]',
          mine ? 'bg-message-mine text-message-mine-foreground' : 'bg-background text-foreground',
          firstInRun && (mine ? 'rounded-tr-sm' : 'rounded-tl-sm'),
        )}
      >
        <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
          {message.text}
          {/* Spacer so the timestamp never overlaps the last line of text */}
          <span className="inline-block w-14" aria-hidden />
        </p>
        <span
          className={cn(
            'absolute right-2.5 bottom-1 text-[0.65rem]',
            mine ? 'text-message-mine-foreground/60' : 'text-muted-foreground',
          )}
        >
          {formatMessageTime(message.createdAt)}
        </span>
      </div>
    </div>
  )
}
