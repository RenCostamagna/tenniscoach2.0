"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { VideoUploader } from "@/components/VideoUploader";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { VideoAnalysis, CoachFeedback } from "@/types/pose";

export default function UploadPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setProgress(0);
    setError(null);

    try {
      // Step 1: Analyze video
      setProgress(25);
      const formData = new FormData();
      formData.append("video", selectedFile);

      const analyzeResponse = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!analyzeResponse.ok) {
        throw new Error("Failed to analyze video");
      }

      const analyzeData = await analyzeResponse.json();
      const analysis: VideoAnalysis = analyzeData.data;

      // Step 2: Get coach feedback
      setProgress(60);
      const coachResponse = await fetch("/api/coach", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ analysis }),
      });

      if (!coachResponse.ok) {
        throw new Error("Failed to get coach feedback");
      }

      const coachData = await coachResponse.json();
      const feedback: CoachFeedback = coachData.data;

      setProgress(100);

      // Store results in sessionStorage and navigate
      sessionStorage.setItem("analysis", JSON.stringify(analysis));
      sessionStorage.setItem("feedback", JSON.stringify(feedback));

      setTimeout(() => {
        router.push("/results");
      }, 500);
    } catch (err) {
      console.error("Error during analysis:", err);
      setError(err instanceof Error ? err.message : "Error al analizar el video");
      setIsAnalyzing(false);
      setProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Analiza tu golpe</h1>
          <p className="text-lg text-gray-600">
            Sube un video corto de tu golpe de tenis (máximo 15 segundos)
          </p>
        </div>

        <VideoUploader
          onVideoSelect={setSelectedFile}
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
          progress={progress}
        />

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="mt-12 text-center text-sm text-gray-500">
          <p>
            💡 Tip: Graba el video desde un ángulo lateral para mejor visibilidad del movimiento
          </p>
        </div>
      </div>
    </div>
  );
}
