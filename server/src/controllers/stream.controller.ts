import { Request, Response } from "express";
import streamService from "../services/stream.service";

class StreamController {
  // POST /stream/token
  async generateToken(req: Request, res: Response): Promise<void> {
    try {
      const { clerkUserId } = req.auth!;
      const { username, imageUrl = "" } = req.body;

      const token = await streamService.syncAndGenerateToken(clerkUserId, username, imageUrl);

      res.status(200).json({ success: true, message: "Stream token generated.", data: { token } });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }

  // POST /stream/channel
  async createChannel(req: Request, res: Response): Promise<void> {
    try {
      const { channelId, members } = req.body;

      const channel = await streamService.createChannel(channelId, members);

      res.status(201).json({ success: true, message: "Channel created.", data: { channel } });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }

  // GET /stream/channel/:id
  async getChannel(req: Request, res: Response): Promise<void> {
    try {
      const channel = await streamService.getChannel(req.params.id);

      res.status(200).json({ success: true, message: "Channel fetched.", data: { channel } });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }

  // DELETE /stream/channel/:id
  async deleteChannel(req: Request, res: Response): Promise<void> {
    try {
      await streamService.deleteChannel(req.params.id);

      res.status(200).json({ success: true, message: "Channel deleted.", data: null });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }
}

export default new StreamController();
