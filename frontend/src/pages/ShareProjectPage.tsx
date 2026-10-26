import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useProjectSharing } from "../features/sharing/hooks/useProjectSharing";
import { AddProjectMemberForm } from "../sections/sharing/AddProjectMemberForm";
import { ProjectMembersTable } from "../sections/sharing/ProjectMembersTable";

export default function ShareProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const state = useProjectSharing(id);
  const { project, roles, choices, setChoices, query, setQuery, picked, setPicked, newRole, setNewRole, listOpen, setListOpen, loading, error, actionError, busyId, candidates, memberRows, userName, remove, commitRole, addPicked } = state;

  if (loading) return <main role="status" className="p-8 text-sm text-gray-500">Loading...</main>;
  if (error || !project) return <main className="p-8"><p role="alert" className="text-sm text-red-600">{error || "Project not found."}</p></main>;

  return <main className="min-h-screen min-w-0 bg-white p-6 md:p-8"><div className="mx-auto max-w-7xl">
    <button type="button" onClick={() => navigate(`/project/${project.id}`)} className="mb-4 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"><ArrowLeft size={16} aria-hidden="true" />Back to {project.name}</button>
    <header className="mb-6"><h1 className="text-2xl font-semibold text-purple-400">Share “{project.name}”</h1><p className="mt-1 text-sm text-gray-500">Choose a user and give them a role on this project.</p></header>
    {roles.length === 0 ? <p role="alert" className="text-sm text-red-600">Only the project owner or an admin can share this project.</p> : <>
      <AddProjectMemberForm roles={roles} query={query} setQuery={setQuery} picked={picked} setPicked={setPicked} listOpen={listOpen} setListOpen={setListOpen} candidates={candidates} newRole={newRole} setNewRole={setNewRole} busy={busyId !== null} onAdd={() => void addPicked()} userName={userName} />
      {actionError && <p role="alert" className="mb-3 text-sm text-red-600">{actionError}</p>}
      <ProjectMembersTable rows={memberRows} roles={roles} choices={choices} setChoices={setChoices} busyId={busyId} onCommit={(user, current, selected) => void commitRole(user, current, selected)} onRemove={(user) => void remove(user)} userName={userName} />
    </>}
  </div></main>;
}
