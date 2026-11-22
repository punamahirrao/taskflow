import { http, HttpResponse } from "msw";
import type { DocumentLibrary } from "../../common/entities/document";
import { mockUser } from "../users";

const commonFileFields = {
  project: null,
  project_name: null,
  folder: null,
  folder_name: null,
  owner: mockUser.id,
  owner_name: "Avery Morgan",
  created_at: "2026-11-16T09:00:00Z",
  updated_at: "2026-11-20T09:00:00Z",
};
const library: DocumentLibrary = {
  folders: [],
  documents: [
    {
      ...commonFileFields,
      id: 801,
      name: "Release acceptance notes.txt",
      size: 2048,
      content_type: "text/plain",
    },
  ],
  links: [],
};

export const documentHandlers = [http.get("*/documents/", () => HttpResponse.json(library))];
