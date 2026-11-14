export type AccountType = "private" | "organization";

export interface LoginState {
  loading: boolean;
  error: string;
  setError: (message: string) => void;
  submit: (email: string, password: string, accountType?: AccountType) => Promise<string | false>;
}
