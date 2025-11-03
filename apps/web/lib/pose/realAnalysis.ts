import type { VideoAnalysis, FrameAnalysis } from "@/types/pose";
import { extractFrames, cleanupFrames, getVideoMetadata } from "./videoProcessor";
import { detectPoseInFrame } from "./poseDetector";
import { calculateBiomechanicalAngles, averageAngles, calculateRangeOfMotion } from "./angles";

/**
 * Analyze a video file and return pose landmarks and biomechanical data
 * This is the real implementation using MoveNet pose detection
 */
export async function analyzeVideoWithPoseDetection(
  videoBuffer: Buffer,
  fps: number = 10
): Promise<VideoAnalysis> {
  let framePaths: string[] = [];

  try {
    // Get video metadata
    const metadata = await getVideoMetadata(videoBuffer);

    // Extract frames from video
    framePaths = await extractFrames(videoBuffer, fps);

    // Process each frame
    const frames: FrameAnalysis[] = [];

    for (let i = 0; i < framePaths.length; i++) {
      const framePath = framePaths[i];
      const timestamp = i / fps;

      // Detect pose in frame
      const landmarks = await detectPoseInFrame(framePath);

      if (!landmarks) {
        console.warn(`No pose detected in frame ${i}, skipping...`);
        continue;
      }

      // Calculate biomechanical angles
      const angles = calculateBiomechanicalAngles(landmarks);

      frames.push({
        frameIndex: i,
        timestamp,
        landmarks,
        angles,
      });
    }

    if (frames.length === 0) {
      throw new Error("No poses detected in any frame");
    }

    // Calculate summary statistics
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
        duration: metadata.duration,
        fps,
        totalFrames: frames.length,
      },
    };
  } finally {
    // Cleanup
    if (framePaths.length > 0) {
      await cleanupFrames(framePaths);
    }
    // Don't dispose detector here to reuse it across requests
    // disposeDetector();
  }
}
