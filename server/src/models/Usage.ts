import mongoose from "mongoose";

const { Schema } = mongoose;

const usageSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    messagesToday: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalMessages: {
      type: Number,
      default: 0,
      min: 0,
    },

    tokensUsed: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastReset: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Usage", usageSchema);