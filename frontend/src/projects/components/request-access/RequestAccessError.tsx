import { CreateProjectError } from "../../Projects.styles";

export function RequestAccessError({ message }: { message: string }) {
  return <CreateProjectError role="alert">{message}</CreateProjectError>;
}
