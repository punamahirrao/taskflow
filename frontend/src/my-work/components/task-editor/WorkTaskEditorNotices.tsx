export function WorkTaskEditorNotices({
  editing,
  workflowError,
  error,
}: {
  editing: boolean;
  workflowError: boolean;
  error: string;
}) {
  return (
    <>
      {workflowError && (
        <p className="my-work-muted">
          The workflow could not be loaded. You can still edit the task details.
        </p>
      )}
      {!editing && <p className="my-work-muted">The task will be assigned to you.</p>}
      {error && (
        <p role="alert" className="text-danger">
          {error}
        </p>
      )}
    </>
  );
}
