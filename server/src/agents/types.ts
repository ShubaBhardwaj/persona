import type { StreamChat, Channel, User } from "stream-chat";

export interface AIAgent {
  user?: User;
  channel: Channel;
  chatClient: StreamChat;
  getLastInteraction: () => number;
  init: () => Promise<void>;
  dispose: () => Promise<void>;
}

export enum AgentPlatform {
  OPENAI = "openai",
  WRITING_ASSISTANT = "writing_assistant"
}

export interface WritingMessage {
  custom?: {
    suggestion?: string[];
    writingTask?: string;
    messagingType?: "user" | "assistant" | "ai_response" | "system";
  };
}
