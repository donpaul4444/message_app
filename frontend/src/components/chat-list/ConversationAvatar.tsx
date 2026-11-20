import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { getInitials } from '@/utils/chat'

interface ConversationAvatarProps {
  name: string
  src?: string
  className?: string
}

export default function ConversationAvatar({ name, src, className }: ConversationAvatarProps) {
  return (
    <Avatar className={cn('size-11', className)}>
      {src ? <AvatarImage src={src} alt="" referrerPolicy="no-referrer" /> : null}
      <AvatarFallback className="bg-secondary font-medium text-secondary-foreground">{getInitials(name)}</AvatarFallback>
    </Avatar>
  )
}
