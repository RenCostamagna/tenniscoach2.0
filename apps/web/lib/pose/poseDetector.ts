import * as poseDetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs";
import { createCanvas, loadImage } from "canvas";
import type { PoseLandmarks } from "@/types/pose";

// MoveNet keypoint mapping to our landmark names
const KEYPOINT_MAP: Record<string, keyof PoseLandmarks> = {
  nose: "nose",
  left_eye: "leftEye",
  right_eye: "rightEye",
  left_ear: "leftEar",
  right_ear: "rightEar",
  left_shoulder: "leftShoulder",
  right_shoulder: "rightShoulder",
  left_elbow: "leftElbow",
  right_elbow: "rightElbow",
  left_wrist: "leftWrist",
  right_wrist: "rightWrist",
  left_hip: "leftHip",
  right_hip: "rightHip",
  left_knee: "leftKnee",
  right_knee: "rightKnee",
  left_ankle: "leftAnkle",
  right_ankle: "rightAnkle",
};

let detectorInstance: poseDetection.PoseDetector | null = null;

/**
 * Get or create a MoveNet pose detector instance (singleton)
 */
async function getDetector(): Promise<poseDetection.PoseDetector> {
  if (detectorInstance) {
    return detectorInstance;
  }

  // Create MoveNet detector with Lightning model (faster, good for real-time)
  detectorInstance = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, {
    modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
  });

  return detectorInstance;
}

/**
 * Convert MoveNet keypoints to our PoseLandmarks format
 */
function convertToPoseLandmarks(
  keypoints: poseDetection.Keypoint[],
  imageWidth: number,
  imageHeight: number
): PoseLandmarks {
  const landmarks: Partial<PoseLandmarks> = {};

  for (const kp of keypoints) {
    const landmarkName = KEYPOINT_MAP[kp.name || ""];
    if (landmarkName) {
      landmarks[landmarkName] = {
        x: kp.x / imageWidth, // Normalize to 0-1
        y: kp.y / imageHeight,
        score: kp.score || 0,
      };
    }
  }

  // Ensure all required landmarks exist (use defaults if missing)
  const defaultLandmark = { x: 0, y: 0, score: 0 };

  return {
    nose: landmarks.nose || defaultLandmark,
    leftEye: landmarks.leftEye || defaultLandmark,
    rightEye: landmarks.rightEye || defaultLandmark,
    leftEar: landmarks.leftEar || defaultLandmark,
    rightEar: landmarks.rightEar || defaultLandmark,
    leftShoulder: landmarks.leftShoulder || defaultLandmark,
    rightShoulder: landmarks.rightShoulder || defaultLandmark,
    leftElbow: landmarks.leftElbow || defaultLandmark,
    rightElbow: landmarks.rightElbow || defaultLandmark,
    leftWrist: landmarks.leftWrist || defaultLandmark,
    rightWrist: landmarks.rightWrist || defaultLandmark,
    leftHip: landmarks.leftHip || defaultLandmark,
    rightHip: landmarks.rightHip || defaultLandmark,
    leftKnee: landmarks.leftKnee || defaultLandmark,
    rightKnee: landmarks.rightKnee || defaultLandmark,
    leftAnkle: landmarks.leftAnkle || defaultLandmark,
    rightAnkle: landmarks.rightAnkle || defaultLandmark,
  };
}

/**
 * Detect pose landmarks in a single image frame
 */
export async function detectPoseInFrame(framePath: string): Promise<PoseLandmarks | null> {
  try {
    const detector = await getDetector();

    // Load image
    const image = await loadImage(framePath);

    // Create canvas for processing
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0);

    // Detect poses
    const poses = await detector.estimatePoses(canvas as unknown as HTMLCanvasElement);

    if (poses.length === 0) {
      return null;
    }

    // Use the first detected pose
    const pose = poses[0];

    if (!pose.keypoints) {
      return null;
    }

    return convertToPoseLandmarks(pose.keypoints, image.width, image.height);
  } catch (error) {
    console.error("Error detecting pose in frame:", error);
    return null;
  }
}

/**
 * Cleanup detector instance
 */
export function disposeDetector(): void {
  if (detectorInstance) {
    detectorInstance.dispose();
    detectorInstance = null;
  }
}
