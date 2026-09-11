export type Role = "user" | "assistant";

export interface ChatMessageData {
  id: string;
  role: Role;
  content: string;
  error?: boolean;
}
