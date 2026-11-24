import type { AttentionKind } from "./delivery";

export interface AttentionFilterOption {
  id: AttentionKind;
  label: string;
  count: number;
}
