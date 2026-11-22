import { useState } from "react";
import { useTranslation } from "../common/shared/i18n/hooks/useTranslation";
import type { TeamRosterMember } from "./entities/team";
import { TeamMemberProfileDialog } from "./components/TeamMemberProfileDialog";
import { TeamMemberRemovalDialog } from "./components/TeamMemberRemovalDialog";
import { useTeam } from "./features/hooks/useTeam";
import EmptyTeam from "./components/EmptyTeam";
import { canRemoveMember } from "./utils/teamPermissions";
import { AddTeamMemberForm } from "./sections/AddTeamMemberForm";
import { TeamMemberCard } from "./sections/TeamMemberCard";

export default function TeamPage({
  projectId,
  embedded = false,
}: { projectId?: number; embedded?: boolean } = {}) {
  const team = useTeam(projectId);
  const { t } = useTranslation();
  const [detailsMember, setDetailsMember] = useState<TeamRosterMember | null>(null);
  const [removingMember, setRemovingMember] = useState<TeamRosterMember | null>(null);
  const canManageMembers = team.roles.length > 0;

  const Container = embedded ? "section" : "main";
  return (
    <Container className={embedded ? "min-w-0 p-2" : "min-h-screen min-w-0 bg-slate-50 p-6 md:p-8"}>
      <div className={embedded ? "w-full" : "mx-auto max-w-7xl"}>
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">{t("team.subtitle")}</p>
            <p className="mt-1 text-sm font-medium text-slate-700">
              {t(team.members.length === 1 ? "team.memberCountOne" : "team.memberCountOther", {
                count: team.members.length,
              })}
            </p>
          </div>
        </header>

        {team.loading ? (
          <p role="status" className="text-sm text-gray-500">
            {t("team.loading")}
          </p>
        ) : team.error ? (
          <p role="alert" className="text-sm text-red-600">
            {team.error}
          </p>
        ) : team.projects.length === 0 ? (
          <EmptyTeam title={t("team.noProjectsTitle")} message={t("team.noProjectsMessage")} />
        ) : (
          <div className="space-y-6">
            {team.allProjectsSelected ? (
              <p className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-800">
                {t("team.chooseProjectHint")}
              </p>
            ) : canManageMembers ? (
              <AddTeamMemberForm
                candidates={team.candidates}
                roles={team.roles}
                selectedUserId={team.selectedUserId}
                setSelectedUserId={team.setSelectedUserId}
                role={team.newRole}
                setRole={team.setNewRole}
                busy={team.busy}
                onAdd={() => void team.addMember()}
              />
            ) : (
              <p className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-800">
                {t("team.onlyOwnersAdd")}
              </p>
            )}
            {team.actionError && (
              <p role="alert" className="text-sm text-red-600">
                {team.actionError}
              </p>
            )}
            {team.members.length === 0 ? (
              <EmptyTeam title={t("team.noMembersTitle")} message={t("team.noMembersMessage")} />
            ) : (
              <section
                aria-label={t("team.membersAria")}
                className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
              >
                {team.members.map((member) => (
                  <TeamMemberCard
                    key={member.id}
                    member={member}
                    onViewProfile={
                      member.can_view_profile ? () => setDetailsMember(member) : undefined
                    }
                    onViewMore={
                      member.projects.length > 1 ? () => setDetailsMember(member) : undefined
                    }
                    onRemove={
                      team.project &&
                      canRemoveMember(team.project.my_role, member.roles, member.removal_date)
                        ? () => setRemovingMember(member)
                        : undefined
                    }
                    removing={team.busyMemberId === member.id}
                  />
                ))}
              </section>
            )}
          </div>
        )}
      </div>
      {detailsMember && (
        <TeamMemberProfileDialog
          member={detailsMember}
          canViewFullProfile={detailsMember.can_view_profile}
          onClose={() => setDetailsMember(null)}
        />
      )}
      {removingMember && team.project && (
        <TeamMemberRemovalDialog
          member={removingMember}
          projectName={team.project.name}
          busy={team.busyMemberId === removingMember.id}
          error={team.removalError}
          onClose={() => setRemovingMember(null)}
          onConfirm={(date) => {
            void team.removeMember(removingMember, date).then((removed) => {
              if (removed) setRemovingMember(null);
            });
          }}
        />
      )}
    </Container>
  );
}
