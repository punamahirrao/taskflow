import type { CapacityMember } from "../../entities/capacity";

export function AbsenceIdentityFields({
  members,
  user,
  absenceKind,
  onUser,
  onKind,
}: {
  members: CapacityMember[];
  user: string;
  absenceKind: "vacation" | "absence";
  onUser: (value: string) => void;
  onKind: (value: "vacation" | "absence") => void;
}) {
  return (
    <>
      <label>
        Team member
        <select value={user} onChange={(event) => onUser(event.target.value)} required>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Time off type
        <select
          value={absenceKind}
          onChange={(event) => onKind(event.target.value as "vacation" | "absence")}
        >
          <option value="vacation">Vacation</option>
          <option value="absence">Absence</option>
        </select>
      </label>
    </>
  );
}
