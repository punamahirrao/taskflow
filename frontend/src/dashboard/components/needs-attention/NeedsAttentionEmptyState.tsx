export function NeedsAttentionEmptyState({ message }: { message?: string }) {
  return <p className="delivery-empty">{message}</p>;
}
