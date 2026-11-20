import { SendHorizontal, Smile } from 'lucide-react'
import { useState, type KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'

interface MessageComposerProps {
  onSend: (text: string) => void
}

export default function MessageComposer({ onSend }: MessageComposerProps) {
  const [text, setText] = useState('')
  const canSend = text.trim().length > 0

  const send = () => {
    if (!canSend) return
    onSend(text.trim())
    setText('')
  }

  // Enter sends, Shift+Enter adds a new line.
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      send()
    }
  }

  return (
    <form
      className="flex items-end gap-2 border-t bg-muted/40 px-2 py-2 md:px-4"
      onSubmit={(e) => {
        e.preventDefault()
        send()
      }}
    >
      <Button type="button" variant="ghost" size="icon-lg" aria-label="Emoji" title="Emoji">
        <Smile className="size-5" />
      </Button>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Type a message"
        rows={1}
        className="field-sizing-content max-h-32 min-h-9 flex-1 resize-none rounded-2xl border border-input bg-background px-3.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      />
      <Button type="submit" size="icon-lg" className="rounded-full" disabled={!canSend} aria-label="Send">
        <SendHorizontal className="size-5" />
      </Button>
    </form>
  )
}
