"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CoachFeedbackCard } from "@/components/CoachFeedbackCard";
import { PoseOverlay } from "@/components/PoseOverlay";
import { ArrowLeft, MessageSquare, Upload } from "lucide-react";
import type { VideoAnalysis, CoachFeedback } from "@/types/pose";

export default function ResultsPage() {
  const router = useRouter();
  const [analysis, setAnalysis] = useState<VideoAnalysis | null>(null);
  const [feedback, setFeedback] = useState<CoachFeedback | null>(null);
  const [selectedFrameIndex, setSelectedFrameIndex] = useState(0);

  useEffect(() => {
    // Load results from sessionStorage
    const analysisData = sessionStorage.getItem("analysis");
    const feedbackData = sessionStorage.getItem("feedback");

    if (!analysisData || !feedbackData) {
      router.push("/upload");
      return;
    }

    setAnalysis(JSON.parse(analysisData));
    setFeedback(JSON.parse(feedbackData));
  }, [router]);

  if (!analysis || !feedback) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando resultados...</p>
      </div>
    );
  }

  const selectedFrame = analysis.frames[selectedFrameIndex];
  const { avgAngles, rangeOfMotion } = analysis.summary;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/upload">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
          <Link href="/chat">
            <Button>
              <MessageSquare className="w-4 h-4 mr-2" />
              Chatear con Coach
            </Button>
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Análisis completado</h1>
          <p className="text-lg text-gray-600">Aquí están los resultados de tu golpe</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Pose visualization */}
          <Card>
            <CardHeader>
              <CardTitle>Análisis de pose</CardTitle>
            </CardHeader>
            <CardContent>
              <PoseOverlay landmarks={selectedFrame.landmarks} width={640} height={480} />
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-700">
                  Frame: {selectedFrameIndex + 1} / {analysis.frames.length}
                </label>
                <input
                  type="range"
                  min="0"
                  max={analysis.frames.length - 1}
                  value={selectedFrameIndex}
                  onChange={(e) => setSelectedFrameIndex(Number(e.target.value))}
                  className="w-full mt-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Biomechanical metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Métricas biomecánicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <MetricItem
                  label="Brazo derecho"
                  value={`${avgAngles.rightArmAngle.toFixed(1)}°`}
                  range={rangeOfMotion.rightArmRange}
                />
                <MetricItem
                  label="Brazo izquierdo"
                  value={`${avgAngles.leftArmAngle.toFixed(1)}°`}
                  range={rangeOfMotion.leftArmRange}
                />
                <MetricItem
                  label="Pierna derecha"
                  value={`${avgAngles.rightLegAngle.toFixed(1)}°`}
                  range={rangeOfMotion.rightLegRange}
                />
                <MetricItem
                  label="Pierna izquierda"
                  value={`${avgAngles.leftLegAngle.toFixed(1)}°`}
                  range={rangeOfMotion.leftLegRange}
                />
                <MetricItem
                  label="Rotación torso"
                  value={`${avgAngles.torsoRotation.toFixed(1)}°`}
                  range={rangeOfMotion.torsoRotationRange}
                />
                <MetricItem
                  label="Rodilla derecha"
                  value={`${avgAngles.rightKneeFlex.toFixed(1)}°`}
                />
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Duración:</span> {analysis.metadata.duration}s
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Frames analizados:</span>{" "}
                  {analysis.metadata.totalFrames}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coach feedback */}
        <CoachFeedbackCard feedback={feedback} />

        <div className="mt-8 text-center">
          <Link href="/upload">
            <Button variant="outline" size="lg">
              <Upload className="w-4 h-4 mr-2" />
              Analizar otro golpe
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function MetricItem({
  label,
  value,
  range,
}: {
  label: string;
  value: string;
  range?: [number, number];
}) {
  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <p className="text-lg font-semibold text-gray-900">{value}</p>
      {range && (
        <p className="text-xs text-gray-500 mt-1">
          Rango: {range[0].toFixed(0)}° - {range[1].toFixed(0)}°
        </p>
      )}
    </div>
  );
}
