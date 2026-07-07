import type { StreamChat, Channel, User } from "stream-chat";

export interface AIAgent {
  chatClient: StreamChat;
  channel: Channel;
  user: User;
  init: () => Promise<void>;
  getLastInteraction: () => Number;
  dispose: () => Promise<void>;
}

export interface AgentPlatform {
  OPENAI: "openai";
  WRITING_ASSISTANT: "writing_assistant";
}

export interface WritingMessage {
  custom?: {
    suggestion?: string[];
    writingTask?: string;
    messagingType?: "user" | "assistant" | "ai_response" | "system";
  };
}
