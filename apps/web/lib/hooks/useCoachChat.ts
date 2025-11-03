import { useState, useCallback } from "react";
import type { ChatMessage, ChatSession, VideoAnalysis, CoachFeedback } from "@/types/pose";

interface UseCoachChatOptions {
  initialContext?: {
    lastAnalysis?: VideoAnalysis;
    lastFeedback?: CoachFeedback;
  };
}

export function useCoachChat(options?: UseCoachChatOptions) {
  const [session, setSession] = useState<ChatSession>(() => ({
    sessionId: crypto.randomUUID(),
    messages: [
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "¡Hola! Soy tu Coach AI. ¿En qué puedo ayudarte con tu técnica de tenis?",
        timestamp: Date.now(),
      },
    ],
    context: options?.initialContext,
  }));

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: content.trim(),
        timestamp: Date.now(),
      };

      // Add user message immediately
      const updatedSession = {
        ...session,
        messages: [...session.messages, userMessage],
      };
      setSession(updatedSession);
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            session: updatedSession,
            message: content,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to send message");
        }

        const data = await response.json();
        const assistantMessage: ChatMessage = data.data.message;

        // Add assistant message
        setSession({
          ...updatedSession,
          messages: [...updatedSession.messages, assistantMessage],
        });

        return assistantMessage;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        setError(error);

        // Add error message to chat
        const errorMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.",
          timestamp: Date.now(),
        };

        setSession({
          ...updatedSession,
          messages: [...updatedSession.messages, errorMessage],
        });

        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [session, isLoading]
  );

  const clearHistory = useCallback(() => {
    setSession({
      sessionId: crypto.randomUUID(),
      messages: [
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "¡Hola! Soy tu Coach AI. ¿En qué puedo ayudarte con tu técnica de tenis?",
          timestamp: Date.now(),
        },
      ],
      context: options?.initialContext,
    });
    setError(null);
  }, [options?.initialContext]);

  return {
    session,
    sendMessage,
    clearHistory,
    isLoading,
    error,
  };
}
