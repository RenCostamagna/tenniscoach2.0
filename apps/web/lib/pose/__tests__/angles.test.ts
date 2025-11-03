import { describe, it, expect } from "vitest";
import { angle, torsoRotation, kneeFlex, calculateBiomechanicalAngles } from "../angles";
import type { Keypoint, PoseLandmarks } from "@/types/pose";

describe("angle", () => {
  it("should calculate 90 degree angle correctly", () => {
    const a: Keypoint = { x: 0, y: 1 };
    const b: Keypoint = { x: 0, y: 0 };
    const c: Keypoint = { x: 1, y: 0 };

    const result = angle(a, b, c);
    expect(result).toBeCloseTo(90, 1);
  });

  it("should calculate 180 degree angle (straight line)", () => {
    const a: Keypoint = { x: 0, y: 0 };
    const b: Keypoint = { x: 1, y: 0 };
    const c: Keypoint = { x: 2, y: 0 };

    const result = angle(a, b, c);
    expect(result).toBeCloseTo(180, 1);
  });

  it("should calculate 45 degree angle correctly", () => {
    const a: Keypoint = { x: 0, y: 1 };
    const b: Keypoint = { x: 0, y: 0 };
    const c: Keypoint = { x: 1, y: 1 };

    const result = angle(a, b, c);
    expect(result).toBeCloseTo(45, 1);
  });
});

describe("torsoRotation", () => {
  it("should return 0 for aligned shoulders and hips", () => {
    const leftShoulder: Keypoint = { x: 0.4, y: 0.3 };
    const rightShoulder: Keypoint = { x: 0.6, y: 0.3 };
    const leftHip: Keypoint = { x: 0.4, y: 0.6 };
    const rightHip: Keypoint = { x: 0.6, y: 0.6 };

    const result = torsoRotation(leftShoulder, rightShoulder, leftHip, rightHip);
    expect(result).toBeCloseTo(0, 1);
  });

  it("should return positive value for right rotation", () => {
    const leftShoulder: Keypoint = { x: 0.4, y: 0.35 };
    const rightShoulder: Keypoint = { x: 0.6, y: 0.25 };
    const leftHip: Keypoint = { x: 0.4, y: 0.6 };
    const rightHip: Keypoint = { x: 0.6, y: 0.6 };

    const result = torsoRotation(leftShoulder, rightShoulder, leftHip, rightHip);
    expect(result).toBeGreaterThan(0);
  });
});

describe("kneeFlex", () => {
  it("should calculate knee flexion angle", () => {
    const hip: Keypoint = { x: 0.5, y: 0.6 };
    const knee: Keypoint = { x: 0.5, y: 0.8 };
    const ankle: Keypoint = { x: 0.5, y: 1.0 };

    const result = kneeFlex(hip, knee, ankle);
    expect(result).toBeCloseTo(180, 1); // Straight leg
  });
});

describe("calculateBiomechanicalAngles", () => {
  it("should calculate all angles from landmarks", () => {
    const landmarks: PoseLandmarks = {
      nose: { x: 0.5, y: 0.1 },
      leftEye: { x: 0.48, y: 0.08 },
      rightEye: { x: 0.52, y: 0.08 },
      leftEar: { x: 0.46, y: 0.1 },
      rightEar: { x: 0.54, y: 0.1 },
      leftShoulder: { x: 0.4, y: 0.3 },
      rightShoulder: { x: 0.6, y: 0.3 },
      leftElbow: { x: 0.35, y: 0.5 },
      rightElbow: { x: 0.65, y: 0.5 },
      leftWrist: { x: 0.3, y: 0.7 },
      rightWrist: { x: 0.7, y: 0.7 },
      leftHip: { x: 0.42, y: 0.6 },
      rightHip: { x: 0.58, y: 0.6 },
      leftKnee: { x: 0.4, y: 0.8 },
      rightKnee: { x: 0.6, y: 0.8 },
      leftAnkle: { x: 0.38, y: 1.0 },
      rightAnkle: { x: 0.62, y: 1.0 },
    };

    const result = calculateBiomechanicalAngles(landmarks);

    expect(result).toHaveProperty("leftArmAngle");
    expect(result).toHaveProperty("rightArmAngle");
    expect(result).toHaveProperty("leftLegAngle");
    expect(result).toHaveProperty("rightLegAngle");
    expect(result).toHaveProperty("torsoRotation");
    expect(result).toHaveProperty("leftKneeFlex");
    expect(result).toHaveProperty("rightKneeFlex");

    // All angles should be valid numbers
    expect(result.leftArmAngle).toBeGreaterThan(0);
    expect(result.leftArmAngle).toBeLessThan(180);
    expect(result.rightArmAngle).toBeGreaterThan(0);
    expect(result.rightArmAngle).toBeLessThan(180);
  });
});
