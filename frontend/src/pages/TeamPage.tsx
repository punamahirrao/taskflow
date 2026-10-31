import { UsersRound } from "lucide-react";
import { useState } from "react";
import type { TeamRosterMember } from "../entities/team";
import { TeamMemberProfileDialog } from "../features/team/components/TeamMemberProfileDialog";
import { TeamMemberRemovalDialog } from "../features/team/components/TeamMemberRemovalDialog";
import { useTeam } from "../features/team/hooks/useTeam";
import { AddTeamMemberForm } from "../sections/team/AddTeamMemberForm";
import { TeamMemberCard } from "../sections/team/TeamMemberCard";

export default function TeamPage() {
  const team = useTeam();
  const [detailsMember, setDetailsMember] = useState<TeamRosterMember | null>(null);
  const [removingMember, setRemovingMember] = useState<TeamRosterMember | null>(null);
  const canManageMembers = team.roles.length > 0;

  return <main className="min-h-screen min-w-0 bg-slate-50 p-6 md:p-8">
    <div className="mx-auto max-w-7xl">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">See your team across projects or focus on one project.</p>
          <p className="mt-1 text-sm font-medium text-slate-700">{team.members.length} {team.members.length === 1 ? "team member" : "team members"}</p>
        </div>
        {team.projects.length > 0 && <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Team view
          <select aria-label="Team project filter" value={team.allProjectsSelected ? "all" : team.projectId ?? ""} onChange={(event) => team.selectProject(event.target.value === "all" ? null : Number(event.target.value))} className="min-w-52 rounded-lg border border-gray-300 bg-white px-3 py-2">
            <option value="all">All Projects</option>
            {team.projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
          </select>
        </label>}
      </header>

      {team.loading ? <p role="status" className="text-sm text-gray-500">Loading team…</p> : team.error ? <p role="alert" className="text-sm text-red-600">{team.error}</p> : team.projects.length === 0 ? <EmptyTeam title="No projects available" message="Create or join a project to start building your team." /> : <div className="space-y-6">
        {team.allProjectsSelected ? <p className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-800">To add a member, choose a project so their project role can be assigned.</p> : canManageMembers ? <AddTeamMemberForm
          candidates={team.candidates}
          roles={team.roles}
          selectedUserId={team.selectedUserId}
          setSelectedUserId={team.setSelectedUserId}
          role={team.newRole}
          setRole={team.setNewRole}
          busy={team.busy}
          onAdd={() => void team.addMember()}
        /> : <p className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-800">Only project owners and managers can add team members.</p>}
        {team.actionError && <p role="alert" className="text-sm text-red-600">{team.actionError}</p>}
        {team.members.length === 0 ? <EmptyTeam title="No team members in this view" message="Add an active system user to the selected project to get started." /> : <section aria-label="Team members" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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

function EmptyTeam({ title, message }: { title: string; message: string }) {
  return <section className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
    <UsersRound size={32} aria-hidden="true" className="mx-auto text-gray-400" />
    <h2 className="mt-3 text-base font-semibold text-gray-900">{title}</h2>
    <p className="mt-1 text-sm text-gray-500">{message}</p>
  </section>;
}
