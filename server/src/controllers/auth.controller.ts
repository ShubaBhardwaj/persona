import { Request, Response } from "express";
import authService from "../services/auth.service";

/**
 * AuthController — thin controller layer for auth-related routes.
 * Delegates all business logic to AuthService and returns structured JSON.
 */
class AuthController {
  /**
   * POST /auth/sync
   *
   * Syncs the authenticated Clerk user with the MongoDB database.
   * On success, returns the user profile together with subscription and usage data.
   *
   * Relies on `req.auth.clerkUserId` being set by the clerkAuth middleware.
   */
  async syncUser(req: Request, res: Response): Promise<void> {
    try {
      // `req.auth` is guaranteed to be set because clerkAuth middleware runs first.
      const clerkUserId = req.auth!.clerkUserId;

      const { user, subscription, usage } = await authService.syncUser(clerkUserId);

      res.status(200).json({
        success: true,
        message: "User synced successfully.",
        user,
        subscription,
        usage,
      });
    } catch (error) {
      const message = (error as Error).message ?? "Internal server error.";
      console.error("[AuthController.syncUser] Error:", message);

      res.status(500).json({
        success: false,
        message,
      });
    }
  }
}

export default new AuthController();
