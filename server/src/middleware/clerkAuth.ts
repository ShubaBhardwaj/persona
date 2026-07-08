import { Request, Response, NextFunction } from "express";
import { clerkClient } from "../config/clerk";

/**
 * Extend Express's Request interface to carry the authenticated Clerk User ID.
 * This ensures TypeScript knows `req.auth` is populated after this middleware runs.
 */
declare global {
  namespace Express {
    interface Request {
      auth?: {
        clerkUserId: string;
      };
    }
  }
}

/**
 * Clerk JWT Authentication Middleware.
 *
 * Workflow:
 * 1. Extract the Bearer token from the Authorization header.
 * 2. Verify the token using Clerk's Backend SDK (authenticateRequest).
 * 3. If invalid or missing, reject with 401 Unauthorized.
 * 4. If valid, attach the resolved Clerk User ID to `req.auth` and proceed.
 */
const clerkAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Unauthorized: Missing or malformed Authorization header.",
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    // Use Clerk's authenticateRequest to verify the token.
    // We construct a minimal Request-like object that Clerk's SDK accepts.
    const requestState = await clerkClient.authenticateRequest(req as any, {
      jwtKey: process.env.CLERK_JWT_KEY,
    });

    if (!requestState.isAuthenticated) {
      res.status(401).json({
        success: false,
        message: "Unauthorized: Invalid or expired token.",
      });
      return;
    }

    // Attach the verified Clerk User ID to the request for downstream handlers.
    req.auth = {
      clerkUserId: requestState.toAuth().userId,
    };

    next();
  } catch (error) {
    const message = (error as Error).message ?? "Authentication failed.";
    res.status(401).json({
      success: false,
      message: `Unauthorized: ${message}`,
    });
  }
};

export default clerkAuth;
