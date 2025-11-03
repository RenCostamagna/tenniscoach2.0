"use client";

import { useEffect, useRef } from "react";
import type { PoseLandmarks } from "@/types/pose";

interface PoseOverlayProps {
  landmarks: PoseLandmarks;
  width?: number;
  height?: number;
  imageUrl?: string;
}

// Connections between landmarks
const POSE_CONNECTIONS = [
  // Face
  ["nose", "leftEye"],
  ["nose", "rightEye"],
  ["leftEye", "leftEar"],
  ["rightEye", "rightEar"],

  // Torso
  ["leftShoulder", "rightShoulder"],
  ["leftShoulder", "leftHip"],
  ["rightShoulder", "rightHip"],
  ["leftHip", "rightHip"],

  // Left arm
  ["leftShoulder", "leftElbow"],
  ["leftElbow", "leftWrist"],

  // Right arm
  ["rightShoulder", "rightElbow"],
  ["rightElbow", "rightWrist"],

  // Left leg
  ["leftHip", "leftKnee"],
  ["leftKnee", "leftAnkle"],

  // Right leg
  ["rightHip", "rightKnee"],
  ["rightKnee", "rightAnkle"],
] as const;

export function PoseOverlay({ landmarks, width = 640, height = 480, imageUrl }: PoseOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background image if provided
    if (imageUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        drawPose(ctx);
      };
      img.src = imageUrl;
    } else {
      drawPose(ctx);
    }

    function drawPose(ctx: CanvasRenderingContext2D) {
      // Draw connections
      ctx.strokeStyle = "#10b981"; // green-500
      ctx.lineWidth = 3;

      POSE_CONNECTIONS.forEach(([keyA, keyB]) => {
        const pointA = landmarks[keyA];
        const pointB = landmarks[keyB];

        if (pointA && pointB) {
          const confidence = Math.min(pointA.score || 1, pointB.score || 1);
          if (confidence > 0.5) {
            ctx.globalAlpha = confidence;
            ctx.beginPath();
            ctx.moveTo(pointA.x * width, pointA.y * height);
            ctx.lineTo(pointB.x * width, pointB.y * height);
            ctx.stroke();
          }
        }
      });

      // Draw keypoints
      ctx.fillStyle = "#10b981"; // green-500
      ctx.globalAlpha = 1;

      Object.values(landmarks).forEach((point) => {
        if (point && (point.score || 1) > 0.5) {
          ctx.beginPath();
          ctx.arc(point.x * width, point.y * height, 5, 0, 2 * Math.PI);
          ctx.fill();
        }
      });
    }
  }, [landmarks, width, height, imageUrl]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded-lg border border-gray-200"
    />
  );
}
