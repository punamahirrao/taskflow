export function canWriteWork(role?: string | null) {
  return role === "owner" || role === "admin" || role === "member";
}
