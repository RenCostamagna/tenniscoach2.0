import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  ChatMessageSchema,
  ChatSessionSchema,
  type ChatMessage,
  type ChatSession,
  type CoachFeedback,
} from "@/types/pose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

/**
 * POST /api/chat
 * Chat with the AI coach based on previous analysis and feedback
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const session = ChatSessionSchema.parse(body.session);
    const userMessage = body.message as string;

    if (!userMessage || userMessage.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.warn("OpenAI API key not configured, returning mock response");
      return NextResponse.json({
        success: true,
        data: {
          message: generateMockChatResponse(userMessage),
        },
        warning: "OpenAI not configured, using mock responses",
      });
    }

    // Build context from session
    const systemPrompt = buildSystemPrompt(session);
    const conversationHistory = session.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        ...conversationHistory,
        {
          role: "user",
          content: userMessage,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const responseText = completion.choices[0].message.content;

    if (!responseText) {
      throw new Error("No response from OpenAI");
    }

    // Create response message
    const responseMessage = ChatMessageSchema.parse({
      id: crypto.randomUUID(),
      role: "assistant",
      content: responseText,
      timestamp: Date.now(),
    });

    return NextResponse.json({
      success: true,
      data: {
        message: responseMessage,
      },
    });
  } catch (error) {
    console.error("Error in chat:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: "Failed to process chat message" }, { status: 500 });
  }
}

/**
 * Build system prompt with context from previous analysis
 */
function buildSystemPrompt(session: ChatSession): string {
  let prompt = `Sos un entrenador profesional de tenis experto en biomecánica y técnica. Tu nombre es Coach AI.

Tu estilo de comunicación es:
- Motivador y positivo
- Técnicamente preciso
- Conciso y directo
- Enfocado en acciones prácticas

`;

  // Add context from previous analysis if available
  if (session.context?.lastAnalysis) {
    const { avgAngles } = session.context.lastAnalysis.summary;
    prompt += `\n**Contexto del análisis reciente:**
- Ángulo brazo derecho promedio: ${avgAngles.rightArmAngle.toFixed(1)}°
- Rotación del torso: ${avgAngles.torsoRotation.toFixed(1)}°
- Flexión de rodillas: ${avgAngles.leftKneeFlex.toFixed(1)}°

`;
  }

  // Add context from previous feedback if available
  if (session.context?.lastFeedback) {
    const { summary, tips } = session.context.lastFeedback;
    const tipTitles = tips.map((tip: CoachFeedback["tips"][number]) => `- ${tip.title}`).join("\n");
    prompt += `\n**Feedback que ya diste:**
${summary}

Puntos clave mencionados:
${tipTitles}

`;
  }

  prompt += `\nRespondé las preguntas del usuario basándote en este contexto y tu expertise en tenis. Mantené las respuestas breves (máximo 150 palabras).`;

  return prompt;
}

/**
 * Generate mock chat response for testing
 */
function generateMockChatResponse(userMessage: string): ChatMessage {
  const lowerMessage = userMessage.toLowerCase();

  let response = "";

  if (lowerMessage.includes("rodilla") || lowerMessage.includes("pierna")) {
    response =
      "Excelente pregunta sobre las piernas. La flexión de rodillas es fundamental para generar potencia. Te recomiendo practicar el ejercicio de sentadillas con golpe simulado que mencioné antes. Empezá con 3 series de 10 repeticiones y aumentá gradualmente. ¿Tenés alguna duda sobre la técnica?";
  } else if (lowerMessage.includes("brazo") || lowerMessage.includes("extensión")) {
    response =
      "La extensión del brazo es clave para el control y la potencia. Asegurate de seguir la pelota con la vista y extender completamente al momento del impacto. El ejercicio con banda elástica te va a ayudar mucho a desarrollar esta memoria muscular.";
  } else if (lowerMessage.includes("torso") || lowerMessage.includes("rotación")) {
    response =
      "Tu rotación de torso está muy bien. Mantené ese movimiento fluido iniciando desde las caderas. La rotación genera la potencia que luego se transfiere al brazo. Practicá el golpe sin pelota enfocándote solo en la rotación.";
  } else {
    response =
      "Entiendo tu consulta. Recordá que la técnica del tenis se construye con práctica consistente. Enfocate primero en la postura y el balance, luego en la rotación, y finalmente en el contacto. ¿Hay algún aspecto específico en el que quieras profundizar?";
  }

  return {
    id: crypto.randomUUID(),
    role: "assistant",
    content: response,
    timestamp: Date.now(),
  };
}
