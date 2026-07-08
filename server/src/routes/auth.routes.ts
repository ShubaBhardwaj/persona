import { Router } from "express";
import clerkAuth from "../middleware/clerkAuth";
import authController from "../controllers/auth.controller";

const router = Router();

/**
 * POST /auth/sync
 *
 * Protected route — requires a valid Clerk JWT in the Authorization header.
 *
 * Flow:
 *   1. clerkAuth middleware verifies the Bearer token and sets req.auth.clerkUserId.
 *   2. authController.syncUser fetches/creates the MongoDB user via AuthService.
 *   3. Returns { success, message, user, subscription, usage }.
 */
router.post(
  "/sync",
  clerkAuth,
  authController.syncUser.bind(authController)
);

export default router;
