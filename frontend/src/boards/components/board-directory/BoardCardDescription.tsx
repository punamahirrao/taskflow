export function BoardCardDescription({ description }: { description: string }) {
  return <span className="mt-4 line-clamp-2 min-h-10 text-sm text-muted">{description}</span>;
}
