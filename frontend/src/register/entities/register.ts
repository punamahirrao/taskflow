export interface RegisterState {
  loading: boolean;
  error: string;
  submit: (email: string, jobTitle: string, password: string, confirmPassword: string) => Promise<boolean>;
}
