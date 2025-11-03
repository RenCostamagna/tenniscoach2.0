"use client";

import type { CoachFeedback } from "@/types/pose";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

interface CoachFeedbackCardProps {
  feedback: CoachFeedback;
}

export function CoachFeedbackCard({ feedback }: CoachFeedbackCardProps) {
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "medium":
        return <Info className="w-5 h-5 text-yellow-500" />;
      case "low":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      default:
        return null;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "Alta prioridad";
      case "medium":
        return "Prioridad media";
      case "low":
        return "Prioridad baja";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen del análisis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{feedback.summary}</p>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Observaciones técnicas</CardTitle>
          <CardDescription>Aspectos clave para mejorar tu técnica</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {feedback.tips.map((tip, index) => (
            <div
              key={index}
              className="flex gap-3 p-4 rounded-lg border border-gray-200 bg-gray-50"
            >
              <div className="flex-shrink-0 mt-0.5">{getPriorityIcon(tip.priority)}</div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">{tip.title}</h4>
                  <span className="text-xs text-gray-500">{getPriorityLabel(tip.priority)}</span>
                </div>
                <p className="text-sm text-gray-600">{tip.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Drills */}
      <Card>
        <CardHeader>
          <CardTitle>Ejercicios prácticos</CardTitle>
          <CardDescription>Rutinas recomendadas para mejorar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {feedback.drills.map((drill, index) => (
            <div key={index} className="p-4 rounded-lg border border-green-200 bg-green-50">
              <h4 className="font-semibold text-gray-900 mb-2">
                {index + 1}. {drill.name}
              </h4>
              <p className="text-sm text-gray-700 mb-2">{drill.description}</p>
              {drill.repetitions && (
                <p className="text-xs font-medium text-green-700">📊 {drill.repetitions}</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
