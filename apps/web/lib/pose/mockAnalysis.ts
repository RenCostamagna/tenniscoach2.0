import type { VideoAnalysis, PoseLandmarks } from "@/types/pose";
import { calculateBiomechanicalAngles, averageAngles, calculateRangeOfMotion } from "./angles";

/**
 * Generate mock pose landmarks for testing
 * Simulates a forehand stroke motion
 */
export function generateMockLandmarks(frameIndex: number, totalFrames: number): PoseLandmarks {
  // Simulate progression through stroke (0 = start, 1 = end)
  const progress = frameIndex / totalFrames;

  // Simulate arm extension during stroke
  const armExtension = Math.sin(progress * Math.PI);

  return {
    nose: { x: 0.5, y: 0.2, score: 0.95 },
    leftEye: { x: 0.48, y: 0.18, score: 0.95 },
    rightEye: { x: 0.52, y: 0.18, score: 0.95 },
    leftEar: { x: 0.46, y: 0.2, score: 0.9 },
    rightEar: { x: 0.54, y: 0.2, score: 0.9 },

    // Shoulders - simulate rotation
    leftShoulder: { x: 0.4 + armExtension * 0.05, y: 0.35, score: 0.98 },
    rightShoulder: { x: 0.6 - armExtension * 0.05, y: 0.35, score: 0.98 },

    // Right arm (dominant arm for forehand)
    leftElbow: { x: 0.35, y: 0.5, score: 0.95 },
    rightElbow: { x: 0.65 + armExtension * 0.1, y: 0.45 - armExtension * 0.05, score: 0.95 },

    leftWrist: { x: 0.3, y: 0.6, score: 0.9 },
    rightWrist: {
      x: 0.7 + armExtension * 0.15,
      y: 0.5 - armExtension * 0.1,
      score: 0.9,
    },

    // Hips
    leftHip: { x: 0.42, y: 0.6, score: 0.95 },
    rightHip: { x: 0.58, y: 0.6, score: 0.95 },

    // Legs - simulate knee bend
    leftKnee: { x: 0.4, y: 0.8 + Math.sin(progress * Math.PI) * 0.02, score: 0.95 },
    rightKnee: { x: 0.6, y: 0.8 + Math.sin(progress * Math.PI) * 0.02, score: 0.95 },

    leftAnkle: { x: 0.38, y: 0.95, score: 0.9 },
    rightAnkle: { x: 0.62, y: 0.95, score: 0.9 },
  };
}

/**
 * Generate a complete mock video analysis
 * Used for testing and demo purposes
 */
export function generateMockVideoAnalysis(durationSec: number = 3): VideoAnalysis {
  const fps = 10; // Analyze 10 frames per second
  const totalFrames = Math.floor(durationSec * fps);

  const frames = [];

  for (let i = 0; i < totalFrames; i++) {
    const timestamp = i / fps;
    const landmarks = generateMockLandmarks(i, totalFrames);
    const angles = calculateBiomechanicalAngles(landmarks);

    frames.push({
      frameIndex: i,
      timestamp,
      landmarks,
      angles,
    });
  }

  const allAngles = frames.map((f) => f.angles);
  const avgAngles = averageAngles(allAngles);
  const rangeOfMotion = calculateRangeOfMotion(allAngles);

  return {
    frames,
    summary: {
      avgAngles,
      rangeOfMotion,
    },
    metadata: {
      duration: durationSec,
      fps,
      totalFrames,
    },
  };
}
