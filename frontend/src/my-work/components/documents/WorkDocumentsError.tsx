export function WorkDocumentsError({ message }: { message: string }) {
  return (
    <p className="my-work-empty" role="alert">
      {message}
    </p>
  );
}
