import type { useDocumentLibraryPageModel } from "../../features/library/useDocumentLibraryPageModel";
import { DocumentLibraryWorkspace } from "./DocumentLibraryWorkspace";
export function DocumentLibraryPageView({
  model,
}: {
  model: ReturnType<typeof useDocumentLibraryPageModel>;
}) {
  const { projectId } = model;
  return (
    <main
      className={
        projectId === undefined ? "min-h-screen bg-[#f7f7fb] p-5 md:p-8" : "w-full bg-[#f7f7fb] p-2"
      }
    >
      <DocumentLibraryWorkspace model={model} />
    </main>
  );
}
