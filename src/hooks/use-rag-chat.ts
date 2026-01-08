import { useState, useCallback, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { ragChatFn } from "~/fn/rag-chat";
import type { VideoSource, ConversationMessage } from "~/use-cases/rag-chat";

export type { VideoSource, ConversationMessage };

const STORAGE_KEY = "rag-chat-history";
const SOURCES_STORAGE_KEY = "rag-chat-sources";

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = sessionStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored) as T;
    }
  } catch (error) {
    console.error(`[RAG Chat] Failed to load from sessionStorage:`, error);
  }
  return fallback;
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`[RAG Chat] Failed to save to sessionStorage:`, error);
  }
}

function clearStorage(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(SOURCES_STORAGE_KEY);
  } catch (error) {
    console.error(`[RAG Chat] Failed to clear sessionStorage:`, error);
  }
}

export interface UseRagChatReturn {
  messages: ConversationMessage[];
  isLoading: boolean;
  error: Error | null;
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
  currentSources: VideoSource[];
}

export function useRagChat(): UseRagChatReturn {
  const [messages, setMessages] = useState<ConversationMessage[]>(() =>
    loadFromStorage<ConversationMessage[]>(STORAGE_KEY, [])
  );
  const [currentSources, setCurrentSources] = useState<VideoSource[]>(() =>
    loadFromStorage<VideoSource[]>(SOURCES_STORAGE_KEY, [])
  );

  useEffect(() => {
    saveToStorage(STORAGE_KEY, messages);
  }, [messages]);

  useEffect(() => {
    saveToStorage(SOURCES_STORAGE_KEY, currentSources);
  }, [currentSources]);

  const mutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const result = await ragChatFn({
        data: {
          userMessage,
          conversationHistory: messages,
        },
      });
      return result;
    },
    onMutate: (userMessage) => {
      const userMsg: ConversationMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: userMessage,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setCurrentSources([]);
    },
    onSuccess: (result) => {
      const assistantMsg: ConversationMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: result.response,
        timestamp: new Date().toISOString(),
        sources: result.sources,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setCurrentSources(result.sources);
    },
    onError: (error) => {
      setMessages((prev) => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage?.role === "user") {
          return prev.slice(0, -1);
        }
        return prev;
      });
      console.error("[RAG Chat] Error:", error);
    },
  });

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || mutation.isPending) return;
      await mutation.mutateAsync(content.trim());
    },
    [mutation]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setCurrentSources([]);
    clearStorage();
    mutation.reset();
  }, [mutation]);

  return {
    messages,
    isLoading: mutation.isPending,
    error: mutation.error,
    sendMessage,
    clearChat,
    currentSources,
  };
}
