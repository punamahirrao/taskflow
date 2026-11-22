import { queryApi, queryResult, type DataScope } from "../../common/api/queryApi";
import type { DefaultProjectResponse, Project } from "../../common/entities/project";
import { getProjects, setDefaultProject } from "./projects";

export const projectsApi = queryApi.injectEndpoints({
  endpoints: (builder) => ({
    accessibleProjects: builder.query<Project[], DataScope>({
      queryFn: (_scope, { signal }) => queryResult(getProjects(signal)),
      providesTags: ["Projects"],
    }),
    setDefaultProject: builder.mutation<DefaultProjectResponse, number | null>({
      queryFn: (projectId) => queryResult(setDefaultProject(projectId)),
      invalidatesTags: ["Projects"],
    }),
  }),
});

export const { useAccessibleProjectsQuery, useSetDefaultProjectMutation } = projectsApi;
