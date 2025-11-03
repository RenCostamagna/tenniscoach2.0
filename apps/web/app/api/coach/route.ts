import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  VideoAnalysisSchema,
  CoachFeedbackSchema,
  type VideoAnalysis,
  type CoachFeedback,
} from "@/types/pose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

/**
 * POST /api/coach
 * Generates AI coaching feedback based on biomechanical analysis
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const analysis = VideoAnalysisSchema.parse(body.analysis);

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.warn("OpenAI API key not configured, returning mock feedback");
      return NextResponse.json({
        success: true,
        data: generateMockFeedback(analysis),
        message: "Mock feedback generated (OpenAI not configured)",
      });
    }

    // Prepare biomechanical data for the prompt
    const { avgAngles, rangeOfMotion } = analysis.summary;

    const prompt = `Actuá como entrenador profesional de tenis. Analiza los siguientes datos biomecánicos de un golpe:

**Ángulos promedio:**
- Brazo izquierdo: ${avgAngles.leftArmAngle.toFixed(1)}°
- Brazo derecho: ${avgAngles.rightArmAngle.toFixed(1)}°
- Pierna izquierda: ${avgAngles.leftLegAngle.toFixed(1)}°
- Pierna derecha: ${avgAngles.rightLegAngle.toFixed(1)}°
- Rotación del torso: ${avgAngles.torsoRotation.toFixed(1)}°
- Flexión rodilla izquierda: ${avgAngles.leftKneeFlex.toFixed(1)}°
- Flexión rodilla derecha: ${avgAngles.rightKneeFlex.toFixed(1)}°

**Rango de movimiento:**
- Brazo derecho: ${rangeOfMotion.rightArmRange[0].toFixed(1)}° - ${rangeOfMotion.rightArmRange[1].toFixed(1)}°
- Rotación del torso: ${rangeOfMotion.torsoRotationRange[0].toFixed(1)}° - ${rangeOfMotion.torsoRotationRange[1].toFixed(1)}°

**Tu tarea:**
1. Genera un resumen breve (2-3 oraciones) del golpe
2. Identifica las tres observaciones más importantes priorizadas (high/medium/low)
3. Sugiere dos ejercicios prácticos para mejorar

Responde SOLO con un objeto JSON válido con esta estructura:
{
  "summary": "string",
  "tips": [
    {"title": "string", "description": "string", "priority": "high|medium|low"}
  ],
  "drills": [
    {"name": "string", "description": "string", "repetitions": "string (opcional)"}
  ]
}

Usá tono motivador y conciso. Máximo 200 palabras en total.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "Sos un entrenador profesional de tenis experto en biomecánica. Respondés SOLO con JSON válido.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0].message.content;

    if (!responseText) {
      throw new Error("No response from OpenAI");
    }

    // Parse and validate response
    const feedback = JSON.parse(responseText);
    const validatedFeedback = CoachFeedbackSchema.parse(feedback);

    return NextResponse.json({
      success: true,
      data: validatedFeedback,
    });
  } catch (error) {
    console.error("Error generating coach feedback:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: "Failed to generate feedback" }, { status: 500 });
  }
}

/**
 * Generate mock feedback for testing when OpenAI is not available
 */
function generateMockFeedback(_analysis: VideoAnalysis): CoachFeedback {
  return {
    summary:
      "Buen trabajo en general. Tu técnica muestra una rotación de torso adecuada y una extensión del brazo consistente. Hay oportunidades de mejora en la flexión de rodillas para generar más potencia.",
    tips: [
      {
        title: "Mejorar flexión de rodillas",
        description:
          "Tus rodillas muestran poca flexión durante el golpe. Intenta bajar más el centro de gravedad para generar potencia desde las piernas.",
        priority: "high",
      },
      {
        title: "Extensión del brazo dominante",
        description:
          "La extensión de tu brazo es buena pero puede ser más completa al momento del impacto. Esto te dará mayor alcance y control.",
        priority: "medium",
      },
      {
        title: "Rotación del torso",
        description:
          "Tu rotación de torso está en buen rango. Mantené este movimiento fluido en todos tus golpes.",
        priority: "low",
      },
    ],
    drills: [
      {
        name: "Sentadillas con golpe simulado",
        description:
          "Realizá sentadillas mientras simulás el movimiento del golpe. Esto te ayudará a desarrollar memoria muscular para la flexión de rodillas.",
        repetitions: "3 series de 15 repeticiones",
      },
      {
        name: "Ejercicio de extensión con banda elástica",
        description:
          "Usá una banda elástica atada a un punto fijo. Practicá el movimiento del golpe enfocándote en la extensión completa del brazo.",
        repetitions: "3 series de 20 repeticiones por brazo",
      },
    ],
  };
}
