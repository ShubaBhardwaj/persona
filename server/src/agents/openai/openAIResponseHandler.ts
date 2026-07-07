import OpenAI from "openai";
import type { AssistantStream } from "openai/lib/AssistantStream";
import type { Channel, StreamChat, Event, MessageResponse } from "stream-chat";
import axios from "axios";

export class OpenAIResponseHandler {
  private message_text = "";
  private chunk_count = 0;
  private run_id = "";
  private is_done = false;
  private last_update_time = 0;

  constructor(
    private readonly openai: OpenAI,
    private readonly openAIThread: OpenAI.Beta.Threads.Thread,
    private readonly assistantStream: AssistantStream,
    private readonly chatClient: StreamChat,
    private readonly channel: Channel,
    private readonly messageResponse: MessageResponse,
    private readonly onDispose: () => void,
  ) {
    this.chatClient.on("ai_indicator.stop", this.handleStopGeneration);
  }

  private handleStopGeneration = async (event: Event) => {
    if (this.is_done || event.message_id !== this.messageResponse.id) {
      return;
    }
    console.log(`Stopping generation for message ${event.message_id}`);
    if (!this.openAIThread || !this.run_id || !this.openai) {
      return;
    }
    try {
      await this.openai.beta.threads.runs.cancel(this.run_id, {
        thread_id: this.openAIThread.id,
      });
    } catch (error) {
      console.error(`Failed to cancel run ${this.run_id}:`, error);
    }

    await this.channel.sendEvent({
      type: "ai_indicator.clear",
      cid: this.messageResponse.cid,
      message_id: this.messageResponse.id,
    })

    await this.dispose();
  };
  private handleStreamEvent = async (event: Event) => {};
  private handleError = async (error: Error) => {
    if (this.is_done) {
      return;
    }
    await this.channel.sendEvent({
      type: "ai_indicator.update",
      ai_state: "AI_STATE_ERROR",
      cid: this.channel.cid,
      message_id: this.messageResponse.id,
    });

    await this.chatClient.partialUpdateMessage(this.messageResponse.id, {
      set: {
        text:
          error.message ?? "An error occurred while generating the response.",
        message: error.toString(),
      },
    });

    await this.dispose();
  };

  private performWebSearch = async (query: string): Promise<string> => {
    const TAVILY_API_KEY = process.env.TAVILY_API_KEY || "";

    if (!TAVILY_API_KEY) {
      throw new Error(
        "TAVILY_API_KEY must be set in the environment variables.",
      );
    }

    console.log(`Performing web search for query: ${query}`);

    try {
      const response = await axios.post(
        "https://api.tavily.com/search",
        {
          query: query,
          search_depth: "advanced",
          max_results: 5,
          include_answer: true,
          include_raw_content: false,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TAVILY_API_KEY}`,
          },
        },
      );

      if (response.status !== 200) {
        throw new Error("Failed to perform web search.");
      }

      const data = await response.data;
      console.log(`Web search successful for query "${query}"`);
      const jsonData = JSON.stringify(data);
      return jsonData;
    } catch (error: any) {
      console.error(
        `Tavily search failed for query "${query}":`,
        error.response?.data || error.message,
      );

      return JSON.stringify({
        error: `Search failed with status: ${error.response?.status ?? "Unknown"}`,
        details: error.response?.data || error.message,
      });
    }
  };

  run = async () => {};
  dispose = async () => {
    if (this.is_done) {
      return;
    }

    this.is_done = true;
    this.chatClient.off("ai_indicator.stop", this.handleStopGeneration);
    this.onDispose();
  };
}
