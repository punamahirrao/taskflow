export function StoryActivityError({ message }: { message: string }) {
  return (
    <p role="alert" className="mx-5 mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
      {message}
    </p>
  );
}
