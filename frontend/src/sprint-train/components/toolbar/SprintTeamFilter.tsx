import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

export function SprintTeamFilter({
  teams,
  team,
  onTeam,
}: {
  teams: string[];
  team: string;
  onTeam: (team: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <select
      aria-label={t("sprintTrain.filterByTeam")}
      value={team}
      onChange={(event) => onTeam(event.target.value)}
      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
    >
      <option value="all">{t("sprintTrain.allTeams")}</option>
      {teams.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
