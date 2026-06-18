export function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(date).toLocaleDateString('en-IE', { day: 'numeric', month: 'short' })
}

export function firstName(fullName: string | null | undefined): string {
  return fullName?.split(' ')[0] ?? 'Anonymous'
}
