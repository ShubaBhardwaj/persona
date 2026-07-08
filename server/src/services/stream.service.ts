import { serverClient } from "../config/serverClient";

/**
 * StreamService — encapsulates all interactions with the GetStream Chat SDK.
 * Uses the shared `serverClient` from config.
 */
class StreamService {
  /**
   * Upsert a user in Stream Chat.
   * Creates the user if they don't exist; updates profile fields if they do.
   */
  async upsertUser(
    clerkId: string,
    username: string,
    imageUrl: string
  ): Promise<void> {
    await serverClient.upsertUser({
      id: clerkId,
      name: username,
      image: imageUrl,
    });
  }

  /**
   * Generate a signed Stream user token (1 hour expiry).
   */
  generateUserToken(clerkId: string): string {
    const issuedAt = Math.floor(Date.now() / 1000);
    const expiration = issuedAt + 60 * 60;
    return serverClient.createToken(clerkId, expiration, issuedAt);
  }

  /**
   * Upsert the user in Stream then issue a token in a single operation.
   * This is the correct place for this orchestration — not the controller.
   */
  async syncAndGenerateToken(
    clerkId: string,
    username: string,
    imageUrl: string
  ): Promise<string> {
    await this.upsertUser(clerkId, username, imageUrl);
    return this.generateUserToken(clerkId);
  }

  /**
   * Create a messaging channel or return the existing one (idempotent).
   */
  async createChannel(
    channelId: string,
    members: string[]
  ): Promise<Record<string, unknown>> {
    const channel = serverClient.channel("messaging", channelId, {
      members,
      created_by_id: members[0],
    });
    const response = await channel.create();
    return response.channel as Record<string, unknown>;
  }

  /**
   * Fetch an existing channel by its ID.
   */
  async getChannel(channelId: string): Promise<Record<string, unknown>> {
    const channel = serverClient.channel("messaging", channelId);
    const response = await channel.query({});
    return response.channel as Record<string, unknown>;
  }

  /**
   * Permanently delete a Stream channel.
   */
  async deleteChannel(channelId: string): Promise<void> {
    const channel = serverClient.channel("messaging", channelId);
    await channel.delete();
  }

  /**
   * Add members to an existing channel.
   */
  async addMembers(channelId: string, members: string[]): Promise<void> {
    const channel = serverClient.channel("messaging", channelId);
    await channel.addMembers(members);
  }

  /**
   * Remove members from an existing channel.
   */
  async removeMembers(channelId: string, members: string[]): Promise<void> {
    const channel = serverClient.channel("messaging", channelId);
    await channel.removeMembers(members);
  }
}

export default new StreamService();
