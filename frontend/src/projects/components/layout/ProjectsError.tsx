export function ProjectsError({ message }: { message: string }) {
  return (
    <p role="alert" className="mb-3 text-sm text-danger">
      {message}
    </p>
  );
}
