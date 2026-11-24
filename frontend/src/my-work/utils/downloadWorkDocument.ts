import { downloadDocument } from "../../documents/api/documents";
export async function downloadWorkDocument(id: number, filename: string) {
  const url = URL.createObjectURL(await downloadDocument(id));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
