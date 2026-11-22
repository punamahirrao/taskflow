export function canRemoveMember(
  actorRole: string | null | undefined,
  memberRoles: string[],
  removalDate?: string | null,
): boolean {
  if (removalDate) return false;
  if (actorRole === "owner") return !memberRoles.includes("owner");
  if (actorRole === "admin")
    return memberRoles.some((role) => role === "member" || role === "viewer");
  return false;
}
