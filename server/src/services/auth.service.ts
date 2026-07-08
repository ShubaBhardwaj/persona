import { clerkClient } from "../config/clerk";
import UserModel from "../models/User";
import SubscriptionModel from "../models/Subscription";
import UsageModel from "../models/Usage";

/**
 * Shape of the data returned by syncUser.
 * Intentionally does not include any Stream token — that is handled separately.
 */
interface SyncUserResult {
  user: typeof UserModel.prototype;
  subscription: typeof SubscriptionModel.prototype;
  usage: typeof UsageModel.prototype;
}

/**
 * AuthService — handles all user synchronization logic between Clerk and MongoDB.
 *
 * Responsibilities:
 * - Fetch the latest profile from Clerk.
 * - Find or create a MongoDB User document.
 * - Create default Subscription and Usage documents for new users.
 * - Keep existing users up to date with Clerk profile changes.
 */
class AuthService {
  /**
   * Main entry point.
   * Receives the authenticated Clerk User ID, fetches fresh Clerk data,
   * and either creates or updates the corresponding MongoDB user.
   *
   * @param clerkUserId - The Clerk user ID extracted from the verified JWT.
   * @returns The synced user document together with its subscription and usage.
   */
  async syncUser(clerkUserId: string): Promise<SyncUserResult> {
    // Step 1: Fetch the latest profile information from Clerk.
    const clerkUser = await this.fetchClerkUser(clerkUserId);

    // Step 2: Attempt to find an existing MongoDB user by clerkId.
    const existingUser = await UserModel.findOne({ clerkId: clerkUserId });

    if (existingUser) {
      // Step 3a: User already exists — update profile fields from Clerk and return.
      return this.updateExistingUser(existingUser, clerkUser);
    }

    // Step 3b: New user — create User, Subscription, and Usage, then link them.
    return this.createNewUser(clerkUser);
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Fetch a Clerk user object and extract the fields we care about.
   */
  private async fetchClerkUser(clerkUserId: string) {
    const user = await clerkClient.users.getUser(clerkUserId);

    // Prefer the primary email address; fall back gracefully.
    const email =
      user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
        ?.emailAddress ?? user.emailAddresses[0]?.emailAddress;

    if (!email) {
      throw new Error(`Clerk user ${clerkUserId} has no email address.`);
    }

    // Use Clerk's username if set; fall back to the part before the @ in the email.
    const username = user.username ?? email.split("@")[0];

    return {
      clerkId: user.id,
      email,
      username,
      imageUrl: user.imageUrl ?? "",
    };
  }

  /**
   * Update an existing user's profile fields with the latest data from Clerk.
   * Returns the updated user alongside its linked subscription and usage.
   */
  private async updateExistingUser(
    existingUser: typeof UserModel.prototype,
    clerkUser: {
      clerkId: string;
      email: string;
      username: string;
      imageUrl: string;
    },
  ): Promise<SyncUserResult> {
    existingUser.email = clerkUser.email;
    existingUser.username = clerkUser.username;
    existingUser.imageUrl = clerkUser.imageUrl;
    await existingUser.save();

    // Fetch the related subscription and usage documents.
    const [subscription, usage] = await Promise.all([
      SubscriptionModel.findById(existingUser.subscriptionId),
      UsageModel.findById(existingUser.usageId),
    ]);

    return { user: existingUser, subscription, usage };
  }

  /**
   * Create a brand-new User document along with default Subscription and Usage.
   * Then link the generated IDs back to the user.
   */
  private async createNewUser(clerkUser: {
    clerkId: string;
    email: string;
    username: string;
    imageUrl: string;
  }): Promise<SyncUserResult> {
    // Step A: Persist the base user (subscriptionId/usageId are null until linked).
    const newUser = await UserModel.create({
      clerkId: clerkUser.clerkId,
      email: clerkUser.email,
      username: clerkUser.username,
      imageUrl: clerkUser.imageUrl,
    });

    // Step B: Create the default subscription for this user.
    const subscription = await this.createDefaultSubscription(newUser._id);

    // Step C: Create the default usage record for this user.
    const usage = await this.createDefaultUsage(newUser._id);

    // Step D: Link the subscription and usage IDs back to the user document.
    const updatedUser = await this.updateUserReferences(
      newUser._id,
      subscription._id,
      usage._id,
    );

    return { user: updatedUser, subscription, usage };
  }

  /**
   * Create a default free-tier Subscription for the given user.
   */
  private async createDefaultSubscription(
    userId: typeof UserModel.prototype._id,
  ) {
    return SubscriptionModel.create({
      userId,
      plan: "free",
      status: "active",
      expiresAt: null,
    });
  }

  /**
   * Create a default Usage record for the given user.
   */
  private async createDefaultUsage(userId: typeof UserModel.prototype._id) {
    return UsageModel.create({
      userId,
      messagesToday: 0,
      totalMessages: 0,
      tokensUsed: 0,
      lastReset: new Date(),
    });
  }

  /**
   * Write the subscription and usage ObjectIds back onto the User document.
   * Returns the fully updated user.
   */
  private async updateUserReferences(
    userId: typeof UserModel.prototype._id,
    subscriptionId: typeof SubscriptionModel.prototype._id,
    usageId: typeof UsageModel.prototype._id,
  ) {
    const updated = await UserModel.findByIdAndUpdate(
      userId,
      { subscriptionId, usageId },
      { new: true },
    );

    if (!updated) {
      throw new Error(`Failed to update user references for userId: ${userId}`);
    }

    return updated;
  }
}

export default new AuthService();
