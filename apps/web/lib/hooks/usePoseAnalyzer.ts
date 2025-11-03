import { useState } from "react";
import type { VideoAnalysis } from "@/types/pose";

interface UsePoseAnalyzerOptions {
  onSuccess?: (analysis: VideoAnalysis) => void;
  onError?: (error: Error) => void;
}

export function usePoseAnalyzer(options?: UsePoseAnalyzerOptions) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [analysis, setAnalysis] = useState<VideoAnalysis | null>(null);

  const analyzeVideo = async (file: File) => {
    setIsAnalyzing(true);
    setProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("video", file);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error("Failed to analyze video");
      }

      const data = await response.json();
      const videoAnalysis: VideoAnalysis = data.data;

      setProgress(100);
      setAnalysis(videoAnalysis);
      options?.onSuccess?.(videoAnalysis);

      return videoAnalysis;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      options?.onError?.(error);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setIsAnalyzing(false);
    setProgress(0);
    setError(null);
    setAnalysis(null);
  };

  return {
    analyzeVideo,
    isAnalyzing,
    progress,
    error,
    analysis,
    reset,
  };
}
