import { CreateProjectError } from "../../Projects.styles";

export function CreateProjectFormError({ message }: { message: string }) {
  return <CreateProjectError>{message}</CreateProjectError>;
}
