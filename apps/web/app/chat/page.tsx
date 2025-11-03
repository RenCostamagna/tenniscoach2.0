"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Send } from "lucide-react";
import type { ChatMessage, ChatSession, VideoAnalysis, CoachFeedback } from "@/types/pose";

export default function ChatPage() {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat session
    const analysisData = sessionStorage.getItem("analysis");
    const feedbackData = sessionStorage.getItem("feedback");

    let analysis: VideoAnalysis | undefined;
    let feedback: CoachFeedback | undefined;

    if (analysisData) analysis = JSON.parse(analysisData);
    if (feedbackData) feedback = JSON.parse(feedbackData);

    const initialSession: ChatSession = {
      sessionId: crypto.randomUUID(),
      messages: [
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "¡Hola! Soy tu Coach AI. Ya analicé tu golpe y tengo el feedback técnico. ¿Tenés alguna pregunta sobre la técnica, los ejercicios que te recomendé, o querés profundizar en algún aspecto específico?",
          timestamp: Date.now(),
        },
      ],
      context: {
        lastAnalysis: analysis,
        lastFeedback: feedback,
      },
    };

    setSession(initialSession);
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session?.messages]);

  const handleSend = async () => {
    if (!input.trim() || !session || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    };

    // Add user message to session
    const updatedSession = {
      ...session,
      messages: [...session.messages, userMessage],
    };
    setSession(updatedSession);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session: updatedSession,
          message: userMessage.content,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      const assistantMessage: ChatMessage = data.data.message;

      // Add assistant message
      setSession({
        ...updatedSession,
        messages: [...updatedSession.messages, assistantMessage],
      });
    } catch (error) {
      console.error("Error sending message:", error);
      // Add error message
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Disculpa, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.",
        timestamp: Date.now(),
      };
      setSession({
        ...updatedSession,
        messages: [...updatedSession.messages, errorMessage],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando chat...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/results">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a resultados
            </Button>
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Chat con Coach AI</h1>
          <p className="text-lg text-gray-600">Pregunta lo que necesites sobre tu técnica</p>
        </div>

        <Card className="h-[600px] flex flex-col">
          <CardHeader className="border-b">
            <CardTitle>Conversación</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
            {session.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p
                    className={`text-xs mt-2 ${
                      message.role === "user" ? "text-primary-foreground/70" : "text-gray-500"
                    }`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Coach está escribiendo...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>
          <div className="border-t p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu pregunta..."
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
