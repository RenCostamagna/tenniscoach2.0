import type { Keypoint, PoseLandmarks, BiomechanicalAngles } from "@/types/pose";

/**
 * Calculate the angle between three points (a -> b -> c)
 * Returns angle in degrees (0-180)
 */
export function angle(a: Keypoint, b: Keypoint, c: Keypoint): number {
  // Vector from b to a
  const ba = { x: a.x - b.x, y: a.y - b.y };
  // Vector from b to c
  const bc = { x: c.x - b.x, y: c.y - b.y };

  // Dot product
  const dotProduct = ba.x * bc.x + ba.y * bc.y;

  // Magnitudes
  const magBA = Math.sqrt(ba.x ** 2 + ba.y ** 2);
  const magBC = Math.sqrt(bc.x ** 2 + bc.y ** 2);

  // Angle in radians
  const angleRad = Math.acos(dotProduct / (magBA * magBC));

  // Convert to degrees
  const angleDeg = (angleRad * 180) / Math.PI;

  return angleDeg;
}

/**
 * Calculate torso rotation angle based on shoulder and hip positions
 * Positive = rotated to the right, Negative = rotated to the left
 */
export function torsoRotation(
  leftShoulder: Keypoint,
  rightShoulder: Keypoint,
  leftHip: Keypoint,
  rightHip: Keypoint
): number {
  // Calculate shoulder line angle
  const shoulderAngle = Math.atan2(
    rightShoulder.y - leftShoulder.y,
    rightShoulder.x - leftShoulder.x
  );

  // Calculate hip line angle
  const hipAngle = Math.atan2(rightHip.y - leftHip.y, rightHip.x - leftHip.x);

  // Difference in angles (rotation)
  const rotation = ((shoulderAngle - hipAngle) * 180) / Math.PI;

  // Normalize to -180 to 180
  if (rotation > 180) return rotation - 360;
  if (rotation < -180) return rotation + 360;

  return rotation;
}

/**
 * Calculate knee flexion angle
 * 0 degrees = fully extended, 180 degrees = fully flexed
 */
export function kneeFlex(hip: Keypoint, knee: Keypoint, ankle: Keypoint): number {
  return angle(hip, knee, ankle);
}

/**
 * Calculate all biomechanical angles from pose landmarks
 */
export function calculateBiomechanicalAngles(landmarks: PoseLandmarks): BiomechanicalAngles {
  return {
    // Arm angles (shoulder-elbow-wrist)
    leftArmAngle: angle(landmarks.leftShoulder, landmarks.leftElbow, landmarks.leftWrist),
    rightArmAngle: angle(landmarks.rightShoulder, landmarks.rightElbow, landmarks.rightWrist),

    // Leg angles (hip-knee-ankle)
    leftLegAngle: angle(landmarks.leftHip, landmarks.leftKnee, landmarks.leftAnkle),
    rightLegAngle: angle(landmarks.rightHip, landmarks.rightKnee, landmarks.rightAnkle),

    // Torso rotation
    torsoRotation: torsoRotation(
      landmarks.leftShoulder,
      landmarks.rightShoulder,
      landmarks.leftHip,
      landmarks.rightHip
    ),

    // Knee flexion
    leftKneeFlex: kneeFlex(landmarks.leftHip, landmarks.leftKnee, landmarks.leftAnkle),
    rightKneeFlex: kneeFlex(landmarks.rightHip, landmarks.rightKnee, landmarks.rightAnkle),
  };
}

/**
 * Calculate average angles from multiple frames
 */
export function averageAngles(anglesArray: BiomechanicalAngles[]): BiomechanicalAngles {
  if (anglesArray.length === 0) {
    throw new Error("Cannot calculate average of empty array");
  }

  const sum = anglesArray.reduce(
    (acc, angles) => ({
      leftArmAngle: acc.leftArmAngle + angles.leftArmAngle,
      rightArmAngle: acc.rightArmAngle + angles.rightArmAngle,
      leftLegAngle: acc.leftLegAngle + angles.leftLegAngle,
      rightLegAngle: acc.rightLegAngle + angles.rightLegAngle,
      torsoRotation: acc.torsoRotation + angles.torsoRotation,
      leftKneeFlex: acc.leftKneeFlex + angles.leftKneeFlex,
      rightKneeFlex: acc.rightKneeFlex + angles.rightKneeFlex,
    }),
    {
      leftArmAngle: 0,
      rightArmAngle: 0,
      leftLegAngle: 0,
      rightLegAngle: 0,
      torsoRotation: 0,
      leftKneeFlex: 0,
      rightKneeFlex: 0,
    }
  );

  const count = anglesArray.length;

  return {
    leftArmAngle: sum.leftArmAngle / count,
    rightArmAngle: sum.rightArmAngle / count,
    leftLegAngle: sum.leftLegAngle / count,
    rightLegAngle: sum.rightLegAngle / count,
    torsoRotation: sum.torsoRotation / count,
    leftKneeFlex: sum.leftKneeFlex / count,
    rightKneeFlex: sum.rightKneeFlex / count,
  };
}

/**
 * Calculate range of motion for each angle
 */
export function calculateRangeOfMotion(anglesArray: BiomechanicalAngles[]) {
  if (anglesArray.length === 0) {
    throw new Error("Cannot calculate range of motion of empty array");
  }

  const getMinMax = (values: number[]): [number, number] => {
    return [Math.min(...values), Math.max(...values)];
  };

  return {
    leftArmRange: getMinMax(anglesArray.map((a) => a.leftArmAngle)),
    rightArmRange: getMinMax(anglesArray.map((a) => a.rightArmAngle)),
    leftLegRange: getMinMax(anglesArray.map((a) => a.leftLegAngle)),
    rightLegRange: getMinMax(anglesArray.map((a) => a.rightLegAngle)),
    torsoRotationRange: getMinMax(anglesArray.map((a) => a.torsoRotation)),
  };
}
