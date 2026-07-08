import { Router } from "express";
import clerkAuth from "../middleware/clerkAuth";
import streamController from "../controllers/stream.controller";

const router = Router();

/**
 * All Stream routes are protected — clerkAuth middleware must run first.
 *
 * POST   /stream/token          → Generate Stream user token
 * POST   /stream/channel        → Create a messaging channel
 * GET    /stream/channel/:id    → Fetch an existing channel
 * DELETE /stream/channel/:id    → Delete a channel
 */

// Generate Stream user token for the authenticated user
router.post(
  "/token",
  clerkAuth,
  streamController.generateToken.bind(streamController)
);

// Create a new messaging channel (idempotent)
router.post(
  "/channel",
  clerkAuth,
  streamController.createChannel.bind(streamController)
);

// Fetch an existing channel by ID
router.get(
  "/channel/:id",
  clerkAuth,
  streamController.getChannel.bind(streamController)
);

// Delete a channel by ID
router.delete(
  "/channel/:id",
  clerkAuth,
  streamController.deleteChannel.bind(streamController)
);

export default router;
