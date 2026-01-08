import { createServerFn } from "@tanstack/react-start";
import { adminMiddleware } from "~/lib/auth";
import { z } from "zod";
import { ragChatUseCase } from "~/use-cases/rag-chat";

const videoSourceSchema = z.object({
  segmentId: z.number(),
  segmentTitle: z.string(),
  segmentSlug: z.string(),
  moduleTitle: z.string(),
  chunkText: z.string(),
  similarity: z.number(),
});

const conversationMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  timestamp: z.string(),
  sources: z.array(videoSourceSchema).optional(),
});

const ragChatInputSchema = z.object({
  userMessage: z.string().min(1, "Message cannot be empty").max(2000, "Message too long"),
  conversationHistory: z.array(conversationMessageSchema).max(20, "Too many messages in history"),
});

export const ragChatFn = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(ragChatInputSchema)
  .handler(async ({ data }) => {
    return ragChatUseCase({
      userMessage: data.userMessage,
      conversationHistory: data.conversationHistory,
    });
  });
