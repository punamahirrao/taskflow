import { queryApi, queryError, type DataScope } from "../../common/api/queryApi";
import { getDocumentLibrary } from "./documents";
import type { DocumentLibrary, DocumentLocation } from "../../common/entities/document";

export const documentsQuery = queryApi.injectEndpoints({
  endpoints: (builder) => ({
    documents: builder.query<
      DocumentLibrary,
      DataScope & { location: DocumentLocation; folderId: number | null }
    >({
      async queryFn(args, api) {
        try {
          return { data: await getDocumentLibrary(args.location, args.folderId, api.signal) };
        } catch (cause) {
          return queryError(cause);
        }
      },
      providesTags: ["Documents"],
    }),
  }),
});

export const { useDocumentsQuery } = documentsQuery;
