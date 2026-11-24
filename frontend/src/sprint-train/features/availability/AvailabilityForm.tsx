import { useState } from "react";
import type { AbsenceInput, CapacityMember, HolidayInput } from "../../entities/capacity";
import { AvailabilityFormFrame } from "../../components/availability/AvailabilityFormFrame";
import { AbsenceIdentityFields } from "../../components/availability/AbsenceIdentityFields";
import { HolidayNameField } from "../../components/availability/HolidayNameField";
import { AvailabilityDateFields } from "../../components/availability/AvailabilityDateFields";
import { AbsenceDurationFields } from "../../components/availability/AbsenceDurationFields";
import { AvailabilityFormActions } from "../../components/availability/AvailabilityFormActions";
export default function AvailabilityForm({
  kind,
  members,
  start,
  end,
  busy,
  onSave,
  onCancel,
}: {
  kind: "absence" | "holiday";
  members: CapacityMember[];
  start: string;
  end: string;
  busy: boolean;
  onSave: (input: AbsenceInput | HolidayInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [user, setUser] = useState(String(members[0]?.id ?? ""));
  const [absenceKind, setAbsenceKind] = useState<"vacation" | "absence">("vacation");
  const [from, setFrom] = useState(start);
  const [to, setTo] = useState(end);
  const [fraction, setFraction] = useState("1");
  const [name, setName] = useState("");
  const [note, setNote] = useState("");

  async function submit() {
    await onSave(
      kind === "holiday"
        ? { name: name.trim(), start_date: from, end_date: to }
        : {
            user_id: Number(user),
            kind: absenceKind,
            start_date: from,
            end_date: to,
            day_fraction: Number(fraction),
            note: note.trim(),
          },
    );
  }
  return (
    <AvailabilityFormFrame kind={kind} busy={busy} onSubmit={submit}>
      {kind === "absence" ? (
        <AbsenceIdentityFields
          members={members}
          user={user}
          absenceKind={absenceKind}
          onUser={setUser}
          onKind={setAbsenceKind}
        />
      ) : (
        <HolidayNameField name={name} onName={setName} />
      )}
      <AvailabilityDateFields from={from} to={to} onFrom={setFrom} onTo={setTo} />
      {kind === "absence" && (
        <AbsenceDurationFields
          fraction={fraction}
          note={note}
          onFraction={setFraction}
          onNote={setNote}
        />
      )}
      <AvailabilityFormActions kind={kind} busy={busy} onCancel={onCancel} />
    </AvailabilityFormFrame>
  );
}
