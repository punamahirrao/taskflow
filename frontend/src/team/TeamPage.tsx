import "./team.css";
import { UsersRound } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "../common/shared/i18n/hooks/useTranslation";
import type { TeamRosterMember } from "./entities/team";
import { TeamMemberProfileDialog } from "./features/components/TeamMemberProfileDialog";
import { TeamMemberRemovalDialog } from "./features/components/TeamMemberRemovalDialog";
import { useTeam } from "./features/hooks/useTeam";
import { AddTeamMemberForm } from "./sections/AddTeamMemberForm";
import { TeamMemberCard } from "./sections/TeamMemberCard";

export default function TeamPage() {
  const team = useTeam();
  const { t } = useTranslation();
  const [detailsMember, setDetailsMember] = useState<TeamRosterMember | null>(null);
  const [removingMember, setRemovingMember] = useState<TeamRosterMember | null>(null);
  const canManageMembers = team.roles.length > 0;

  return <main className="min-h-screen min-w-0 bg-slate-50 p-6 md:p-8">
    <div className="mx-auto max-w-7xl">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{t("team.subtitle")}</p>
          <p className="mt-1 text-sm font-medium text-slate-700">{t(team.members.length === 1 ? "team.memberCountOne" : "team.memberCountOther", { count: team.members.length })}</p>
        </div>
        {team.projects.length > 0 && <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          {t("team.viewLabel")}
          <select aria-label={t("team.projectFilterAria")} value={team.allProjectsSelected ? "all" : team.projectId ?? ""} onChange={(event) => team.selectProject(event.target.value === "all" ? null : Number(event.target.value))} className="min-w-52 rounded-lg border border-gray-300 bg-white px-3 py-2">
            <option value="all">{t("team.allProjects")}</option>
            {team.projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
          </select>
        </label>}
      </header>

      {team.loading ? <p role="status" className="text-sm text-gray-500">{t("team.loading")}</p> : team.error ? <p role="alert" className="text-sm text-red-600">{team.error}</p> : team.projects.length === 0 ? <EmptyTeam title={t("team.noProjectsTitle")} message={t("team.noProjectsMessage")} /> : <div className="space-y-6">
        {team.allProjectsSelected ? <p className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-800">{t("team.chooseProjectHint")}</p> : canManageMembers ? <AddTeamMemberForm
          candidates={team.candidates}
          roles={team.roles}
          selectedUserId={team.selectedUserId}
          setSelectedUserId={team.setSelectedUserId}
          role={team.newRole}
          setRole={team.setNewRole}
          busy={team.busy}
          onAdd={() => void team.addMember()}
        /> : <p className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-800">{t("team.onlyOwnersAdd")}</p>}
        {team.actionError && <p role="alert" className="text-sm text-red-600">{team.actionError}</p>}
        {team.members.length === 0 ? <EmptyTeam title={t("team.noMembersTitle")} message={t("team.noMembersMessage")} /> : <section aria-label={t("team.membersAria")} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {team.members.map((member) => <TeamMemberCard
            key={member.id}
            member={member}
            onViewProfile={member.can_view_profile ? () => setDetailsMember(member) : undefined}
            onViewMore={member.projects.length > 1 ? () => setDetailsMember(member) : undefined}
            onRemove={team.project && canRemoveMember(team.project.my_role, member.roles, member.removal_date) ? () => setRemovingMember(member) : undefined}
            removing={team.busyMemberId === member.id}
          />)}
        </section>}
      </div>}
    </div>
    {detailsMember && <TeamMemberProfileDialog member={detailsMember} canViewFullProfile={detailsMember.can_view_profile} onClose={() => setDetailsMember(null)} />}
    {removingMember && team.project && <TeamMemberRemovalDialog
      member={removingMember}
      projectName={team.project.name}
      busy={team.busyMemberId === removingMember.id}
      error={team.removalError}
      onClose={() => setRemovingMember(null)}
      onConfirm={(date) => { void team.removeMember(removingMember, date).then((removed) => { if (removed) setRemovingMember(null); }); }}
    />}
  </main>;
}

function canRemoveMember(actorRole: string | null | undefined, memberRoles: string[], removalDate?: string | null) {
  if (removalDate) return false;
  if (actorRole === "owner") return !memberRoles.includes("owner");
  if (actorRole === "admin") return memberRoles.some((role) => role === "member" || role === "viewer");
  return false;
}

interface EmptyTeamProps {
  title: string;
  message: string;
}

function EmptyTeam({ title, message }: EmptyTeamProps) {
  return <section className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
    <UsersRound size={32} aria-hidden="true" className="mx-auto text-gray-400" />
    <h2 className="mt-3 text-base font-semibold text-gray-900">{title}</h2>
    <p className="mt-1 text-sm text-gray-500">{message}</p>
  </section>;
}
