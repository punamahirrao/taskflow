import { UsersRound } from "lucide-react";

interface EmptyTeamProps {
  title: string;
  message: string;
}

export default function EmptyTeam({ title, message }: EmptyTeamProps) {
  return (
    <section className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
      <UsersRound size={32} aria-hidden="true" className="mx-auto text-gray-400" />
      <h2 className="mt-3 text-base font-semibold text-gray-900">{title}</h2>
      <p className="mt-1 text-sm text-gray-500">{message}</p>
    </section>
  );
}
